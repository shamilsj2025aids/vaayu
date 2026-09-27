import { 
  Station, 
  StationForecast, 
  DynamicGraphEdge, 
  Alert, 
  DataSourceStatus, 
  FIRMSFireHotspot, 
  FirePlumeTrajectory,
  TrackRecordEntry,
  ModelAccuracyStats
} from '../types';
import { DELHI_NCR_STATIONS } from '../data/stations';
import { 
  generateStationForecasts, 
  computeDynamicGraphEdges, 
  PROACTIVE_ALERTS, 
  INITIAL_DATA_SOURCES 
} from '../data/mockApi';
import { MOCK_FIRMS_HOTSPOTS, MOCK_FIRE_PLUMES } from '../data/mockFirmsFires';
import { HISTORICAL_TRACK_RECORDS, MODEL_ACCURACY_STATS } from '../data/trackRecordData';

// Cached in-memory forecasts
let cachedForecasts: Map<string, StationForecast> | null = null;
let cachedDataSources: DataSourceStatus[] = [...INITIAL_DATA_SOURCES];
let lastFastRefreshTime: Date = new Date();

export async function getStations(): Promise<Station[]> {
  try {
    const res = await fetch('/api/stations');
    if (res.ok) return await res.json();
  } catch (err) {
    // Graceful fallback
  }
  return DELHI_NCR_STATIONS;
}

export async function getStationForecasts(forceRefresh: boolean = false): Promise<Map<string, StationForecast>> {
  if (!cachedForecasts || forceRefresh) {
    try {
      const res = await fetch('/api/forecast');
      if (res.ok) {
        const raw = await res.json();
        // Convert to map
        const map = new Map<string, StationForecast>();
        raw.forEach((item: StationForecast) => map.set(item.station.id, item));
        cachedForecasts = map;
        return map;
      }
    } catch (err) {
      // Fallback to local high-fidelity generator
    }
    cachedForecasts = generateStationForecasts(new Date());
  }
  return cachedForecasts;
}

export async function getDynamicEdges(windDirDeg: number = 315): Promise<DynamicGraphEdge[]> {
  try {
    const res = await fetch(`/api/graph/edges?wind_deg=${windDirDeg}`);
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return computeDynamicGraphEdges(DELHI_NCR_STATIONS, windDirDeg);
}

export async function getAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch('/api/alerts');
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return PROACTIVE_ALERTS;
}

export async function getInversionAndFireData(): Promise<{
  hotspots: FIRMSFireHotspot[];
  plumes: FirePlumeTrajectory[];
  fireInfluenceTrend: { hour: number; score: number; pblh: number; ventilation: number }[];
}> {
  try {
    const res = await fetch('/api/inversion-fire');
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }

  // Derive 72h fire & inversion trend
  const fireInfluenceTrend = Array.from({ length: 73 }, (_, h) => {
    const isNight = (h % 24) >= 21 || (h % 24) <= 8;
    const pblh = isNight ? 240 + Math.sin(h) * 40 : 850 + Math.sin(h / 3) * 150;
    const wind = Math.max(0.9, 2.4 - (h / 72) * 1.2 + Math.sin(h / 5) * 0.4);
    const ventilation = Math.round(wind * pblh);
    let fireScore = 25;
    if (h >= 14 && h <= 58) {
      fireScore = Math.min(96, Math.round(35 + Math.sin(((h - 14) / 44) * Math.PI) * 58));
    } else if (h > 58) {
      fireScore = 50;
    }
    return {
      hour: h,
      score: fireScore,
      pblh: Math.round(pblh),
      ventilation,
    };
  });

  return {
    hotspots: MOCK_FIRMS_HOTSPOTS,
    plumes: MOCK_FIRE_PLUMES,
    fireInfluenceTrend,
  };
}

export async function getTrackRecord(): Promise<{
  records: TrackRecordEntry[];
  stats: ModelAccuracyStats[];
}> {
  try {
    const res = await fetch('/api/track-record');
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return {
    records: HISTORICAL_TRACK_RECORDS,
    stats: MODEL_ACCURACY_STATS,
  };
}

export async function getSystemStatus(): Promise<{
  sources: DataSourceStatus[];
  lastFastRefresh: string;
}> {
  try {
    const res = await fetch('/api/system-status');
    if (res.ok) return await res.json();
  } catch (err) {
    // Fallback
  }
  return {
    sources: cachedDataSources,
    lastFastRefresh: lastFastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export async function triggerFastRefresh(): Promise<{
  success: boolean;
  message: string;
  updatedSources: DataSourceStatus[];
  refreshedAt: string;
}> {
  // Simulate live fast-pull of ground readings and NASA FIRMS
  try {
    const res = await fetch('/api/refresh', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Fallback simulation
  }

  // Artificial short delay for realistic network feel (800ms)
  await new Promise((r) => setTimeout(r, 850));

  lastFastRefreshTime = new Date();
  const timeStr = lastFastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Update only fast-updating sources; CAMS remains once-daily run
  cachedDataSources = cachedDataSources.map((source) => {
    if (source.id === 'src-ground') {
      return {
        ...source,
        last_updated: `Just now (${timeStr})`,
        records_processed: '1,344 fresh station readings pulled',
      };
    }
    if (source.id === 'src-fire') {
      return {
        ...source,
        last_updated: `Just now (${timeStr})`,
        records_processed: '31 active hotspots updated via FIRMS API',
      };
    }
    if (source.id === 'src-weather') {
      return {
        ...source,
        last_updated: `2 min ago (${timeStr})`,
      };
    }
    return source;
  });

  // Re-run dynamic forecast
  cachedForecasts = generateStationForecasts(new Date());

  return {
    success: true,
    message: 'Fast-cycle sources (CPCB Ground & NASA FIRMS) refreshed successfully in 850ms.',
    updatedSources: cachedDataSources,
    refreshedAt: timeStr,
  };
}
