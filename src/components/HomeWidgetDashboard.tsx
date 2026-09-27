import React, { useState, useRef } from 'react';
import DraggableWidgetGrid, { WidgetItem, WidgetSize } from './ui/draggable-widget-grid';
import { 
  StationForecast, 
  Alert, 
  FIRMSFireHotspot, 
  FirePlumeTrajectory,
  TrackRecordEntry,
  ModelAccuracyStats,
  DataSourceStatus
} from '../types';
import { formatVentilation, formatInversionLevel } from '../utils/formatters';

interface HomeWidgetDashboardProps {
  forecasts: Map<string, StationForecast>;
  selectedHour: number;
  alerts: Alert[];
  fireHotspots: FIRMSFireHotspot[];
  firePlumes: FirePlumeTrajectory[];
  inversionTrend: any[];
  trackRecords: TrackRecordEntry[];
  modelStats: ModelAccuracyStats[];
  dataSources: DataSourceStatus[];
  onNavigateTab: (tab: 'map' | 'inversion-fire' | 'comparison' | 'track-record') => void;
  onOpenAlert: (alert: Alert) => void;
  onSelectStation: (stationId: string) => void;
}

interface CustomWidget extends WidgetItem {
  type: 
    | 'map-overview'
    | 'inversion-gauge'
    | 'ventilation-card'
    | 'firms-fires'
    | 'cams-vs-gnn'
    | 'track-record'
    | 'proactive-alert'
    | 'high-risk-stations'
    | 'system-freshness'
    | 'plume-trajectory';
}

const MAX_WIDGETS = 10;

const DEFAULT_HOME_WIDGETS: CustomWidget[] = [
  { id: 'w-alert', type: 'proactive-alert', size: 'wide', label: 'Proactive Advisory' },
  { id: 'w-inversion', type: 'inversion-gauge', size: 'sm', label: 'Inversion Index' },
  { id: 'w-ventilation', type: 'ventilation-card', size: 'sm', label: 'Ventilation Capacity' },
  { id: 'w-map', type: 'map-overview', size: 'lg', label: 'Spatial Telemetry Grid' },
  { id: 'w-firms', type: 'firms-fires', size: 'wide', label: 'NASA FIRMS Fires' },
  { id: 'w-cams', type: 'cams-vs-gnn', size: 'wide', label: 'CAMS vs GNN Residual' },
  { id: 'w-accuracy', type: 'track-record', size: 'sm', label: 'Severe Event Recall' },
  { id: 'w-stations', type: 'high-risk-stations', size: 'wide', label: 'Focal CAAQMS Stations' },
];

const AVAILABLE_WIDGET_CATALOG: { 
  type: CustomWidget['type']; 
  label: string; 
  description: string;
  defaultSize: WidgetSize; 
  tab: string;
}[] = [
  { 
    type: 'proactive-alert', 
    label: 'GRAP Proactive Advisory', 
    description: 'Advance warning banner before severe AQI threshold breach',
    defaultSize: 'wide', 
    tab: 'Alerts',
  },
  { 
    type: 'map-overview', 
    label: 'Spatial Telemetry Summary Grid', 
    description: 'Live sensor network overview with wind direction and connectivity',
    defaultSize: 'lg', 
    tab: 'Spatial Map',
  },
  { 
    type: 'inversion-gauge', 
    label: 'Atmospheric Inversion Index (0-100)', 
    description: 'Diurnal thermal cap strength trapping particulates near ground',
    defaultSize: 'sm', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'ventilation-card', 
    label: 'Ventilation Dispersion Capacity (Vc)', 
    description: 'Mixing height × wind speed horizontal dispersion potential',
    defaultSize: 'sm', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'firms-fires', 
    label: 'NASA FIRMS Stubble Fires & MW Power', 
    description: 'Real-time satellite detections in Punjab and Haryana upwind corridor',
    defaultSize: 'wide', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'plume-trajectory', 
    label: 'Stubble Plume Wind Corridor & ETA', 
    description: 'Atmospheric transport vectors entering North-West Delhi',
    defaultSize: 'wide', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'cams-vs-gnn', 
    label: 'GNN Residual vs CAMS Baseline', 
    description: 'Day-2 & Day-3 correction delta resolving physics collapse',
    defaultSize: 'wide', 
    tab: 'CAMS vs GNN',
  },
  { 
    type: 'track-record', 
    label: 'Verification & Severe Event Recall', 
    description: 'Empirical audit track record against CPCB ground truth',
    defaultSize: 'sm', 
    tab: 'Track Record',
  },
  { 
    type: 'high-risk-stations', 
    label: 'Top 3 Entrapment Stations (Anand Vihar)', 
    description: 'Critical hotspot stations facing immediate stagnation',
    defaultSize: 'wide', 
    tab: 'Spatial Map',
  },
  { 
    type: 'system-freshness', 
    label: 'Telemetry Ingestion & Pipeline Health', 
    description: 'CPCB CAAQMS, CAMS, Open-Meteo sync freshness',
    defaultSize: 'sm', 
    tab: 'System Status',
  },
];

/**
 * iOS Control Center style Corner Resize Handle
 * Allows dragging outward to expand or inward to shrink, or clicking to toggle
 */
const ResizeCornerHandle: React.FC<{
  currentSize: WidgetSize;
  onResize: (newSize: WidgetSize) => void;
}> = ({ currentSize, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; size: WidgetSize; hasMoved: boolean } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      size: currentSize,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      dragStartRef.current.hasMoved = true;
    }

    const startSize = dragStartRef.current.size;

    // Drag outward (expanding)
    if (startSize === 'sm') {
      if (dx > 45 && dy > 45) {
        onResize('lg');
      } else if (dx > 40) {
        onResize('wide');
      } else if (dy > 40) {
        onResize('tall');
      }
    } else if (startSize === 'wide') {
      if (dy > 40) {
        onResize('lg');
      } else if (dx < -35) {
        onResize('sm');
      }
    } else if (startSize === 'tall') {
      if (dx > 40) {
        onResize('lg');
      } else if (dy < -35) {
        onResize('sm');
      }
    } else if (startSize === 'lg') {
      // Drag inward (shrinking)
      if (dx < -45 && dy < -45) {
        onResize('sm');
      } else if (dx < -35) {
        onResize('tall');
      } else if (dy < -35) {
        onResize('wide');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    // If simply tapped/clicked without substantial drag, cycle to next size
    if (!dragStartRef.current.hasMoved) {
      const cycleMap: Record<WidgetSize, WidgetSize> = {
        sm: 'wide',
        wide: 'lg',
        lg: 'tall',
        tall: 'sm',
      };
      onResize(cycleMap[currentSize]);
    }

    dragStartRef.current = null;
    setIsDragging(false);
  };

  return (
    <div
      data-no-drag
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Drag outward to enlarge, inward to shrink (or click to toggle size)"
      className={`absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-1.5 z-30 group touch-none select-none transition-all ${
        isDragging ? 'scale-125' : 'hover:scale-110'
      }`}
    >
      {/* iOS style curved corner resize arc */}
      <div className={`w-3 h-3 rounded-br-sm border-r-2 border-b-2 transition-all ${
        isDragging
          ? 'border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
          : 'border-white/30 group-hover:border-white'
      }`} />
    </div>
  );
};

export const HomeWidgetDashboard: React.FC<HomeWidgetDashboardProps> = ({
  forecasts,
  selectedHour,
  alerts,
  fireHotspots,
  firePlumes,
  inversionTrend,
  trackRecords,
  modelStats,
  dataSources,
  onNavigateTab,
  onOpenAlert,
  onSelectStation,
}) => {
  const [widgets, setWidgets] = useState<CustomWidget[]>(() => {
    const saved = localStorage.getItem('vaayu_home_widgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, MAX_WIDGETS);
        }
      } catch (e) {}
    }
    return DEFAULT_HOME_WIDGETS;
  });

  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);

  const updateWidgets = (newWidgets: CustomWidget[]) => {
    const capped = newWidgets.slice(0, MAX_WIDGETS);
    setWidgets(capped);
    localStorage.setItem('vaayu_home_widgets', JSON.stringify(capped));
  };

  const activeAlert = alerts[0];
  const currentInv = inversionTrend[selectedHour] || inversionTrend[0];
  const invLevel = formatInversionLevel(currentInv?.score || 58);
  const vent = formatVentilation(currentInv?.ventilation || 2800);
  const stat48 = modelStats.find(s => s.lead_time === '48h') || modelStats[0];

  const totalFRP = Math.round(fireHotspots.reduce((acc, f) => acc + f.frp, 0));

  const addWidget = (cat: typeof AVAILABLE_WIDGET_CATALOG[0]) => {
    if (widgets.length >= MAX_WIDGETS) return;
    if (widgets.some(w => w.type === cat.type)) return;

    const newWidget: CustomWidget = {
      id: `w-${cat.type}-${Date.now()}`,
      type: cat.type,
      size: cat.defaultSize,
      label: cat.label,
    };
    updateWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    updateWidgets(widgets.filter(w => w.id !== id));
  };

  const setWidgetSize = (id: string, newSize: WidgetSize) => {
    updateWidgets(widgets.map(w => w.id === id ? { ...w, size: newSize } : w));
  };

  const applyPreset = (preset: 'balanced' | 'meteo' | 'taskforce') => {
    if (preset === 'balanced') {
      updateWidgets(DEFAULT_HOME_WIDGETS);
    } else if (preset === 'meteo') {
      updateWidgets([
        { id: 'w-inversion', type: 'inversion-gauge', size: 'sm', label: 'Inversion Index' },
        { id: 'w-ventilation', type: 'ventilation-card', size: 'sm', label: 'Ventilation Capacity' },
        { id: 'w-firms', type: 'firms-fires', size: 'wide', label: 'NASA FIRMS Fires' },
        { id: 'w-plumes', type: 'plume-trajectory', size: 'wide', label: 'Stubble Plume Wind Corridor' },
        { id: 'w-cams', type: 'cams-vs-gnn', size: 'wide', label: 'CAMS vs GNN Residual' },
      ]);
    } else if (preset === 'taskforce') {
      updateWidgets([
        { id: 'w-alert', type: 'proactive-alert', size: 'wide', label: 'Proactive Advisory' },
        { id: 'w-map', type: 'map-overview', size: 'lg', label: 'Spatial Telemetry Grid' },
        { id: 'w-stations', type: 'high-risk-stations', size: 'wide', label: 'Focal CAAQMS Stations' },
        { id: 'w-accuracy', type: 'track-record', size: 'sm', label: 'Severe Event Recall' },
      ]);
    }
  };

  const renderWidgetContent = (item: CustomWidget, size: WidgetSize) => {
    return (
      <div className="relative w-full h-full p-4 flex flex-col justify-between bg-[#121316] text-[#fafafa] select-none font-sans">
        {/* Widget Top Bar: Clean Title & Minimalist Close Button */}
        <div className="flex items-center justify-between gap-1.5 border-b border-[#27272a] pb-2 mb-2">
          <div className="min-w-0">
            <span className="text-xs font-bold tracking-wide text-neutral-200 uppercase truncate block">
              {item.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" data-no-drag>
            <span className="text-[9px] font-numbers text-neutral-500 uppercase px-1">
              {item.size}
            </span>
            <button
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                removeWidget(item.id);
              }}
              title="Remove widget"
              className="w-5 h-5 rounded-md bg-[#18181b] hover:bg-rose-950/60 border border-[#27272a] hover:border-rose-800/60 text-neutral-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Widget Body Content */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* 1. Proactive Alert */}
          {item.type === 'proactive-alert' && activeAlert && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800">
                  {activeAlert.grap_stage}
                </span>
                <span className="text-[11px] font-numbers text-neutral-400">{activeAlert.start_time}</span>
              </div>
              <p className="text-xs text-white line-clamp-2">
                {activeAlert.subtitle}
              </p>
              <button
                type="button"
                data-no-drag
                onClick={() => onOpenAlert(activeAlert)}
                className="text-[11px] text-sky-400 hover:underline font-bold pt-1 text-left"
              >
                View Causal Explanation ("The Why") &rarr;
              </button>
            </div>
          )}

          {/* 2. Inversion Gauge */}
          {item.type === 'inversion-gauge' && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-numbers text-amber-400">{currentInv?.score || 55}</span>
                <span className="text-xs text-neutral-400">/ 100</span>
              </div>
              <div className="text-xs font-bold text-neutral-200">
                {invLevel.label}
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('inversion-fire')}
                className="text-[11px] text-sky-400 hover:underline font-bold mt-auto text-left"
              >
                Open Inversion Telemetry &rarr;
              </button>
            </div>
          )}

          {/* 3. Ventilation Card */}
          {item.type === 'ventilation-card' && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-numbers text-white">{(currentInv?.ventilation || 2800).toLocaleString()}</span>
                <span className="text-xs text-neutral-400">m²/s</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${vent.badgeColor}`}>
                {vent.label}
              </span>
              <p className="text-[11px] text-neutral-400 mt-1">
                Ceiling: <span className="font-numbers text-white">{currentInv?.pblh || 320}</span>m
              </p>
            </div>
          )}

          {/* 4. Spatial Map Overview */}
          {item.type === 'map-overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Stations</span>
                  <span className="font-numbers text-emerald-400 text-sm">56 / 56 CPCB</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Fire Nodes</span>
                  <span className="font-numbers text-amber-400 text-sm">5 Clusters</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Vectors</span>
                  <span className="font-numbers text-sky-400 text-sm">315° NW</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold">Lead Horizon</span>
                  <span className="font-numbers text-white text-sm">0h to 72h</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-neutral-400">
                  Interactive spatiotemporal sensor grid with wind dispersion overlay.
                </p>
                <button
                  type="button"
                  data-no-drag
                  onClick={() => onNavigateTab('map')}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0"
                >
                  Open Map &rarr;
                </button>
              </div>
            </div>
          )}

          {/* 5. FIRMS Stubble Fires */}
          {item.type === 'firms-fires' && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-numbers text-orange-400">{totalFRP}</span>
                  <span className="text-xs text-neutral-400 ml-1">MW Fire Power</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-numbers text-white">{fireHotspots.length}</span>
                  <span className="text-xs text-neutral-400 ml-1">Hotspots</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 text-neutral-300">
                <span>Punjab: <strong className="font-numbers text-white">{fireHotspots.filter(f => f.state === 'Punjab').length}</strong></span>
                <span>Haryana: <strong className="font-numbers text-white">{fireHotspots.filter(f => f.state === 'Haryana').length}</strong></span>
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('inversion-fire')}
                className="text-[11px] text-sky-400 hover:underline font-bold pt-1 text-left"
              >
                Track Plume Trajectory &rarr;
              </button>
            </div>
          )}

          {/* 6. Plume Trajectory Corridor */}
          {item.type === 'plume-trajectory' && (
            <div className="space-y-2">
              {firePlumes[0] ? (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white font-bold">{firePlumes[0].source_name}</span>
                    <span className="text-amber-400 font-numbers">+{firePlumes[0].eta_delhi_hours}h ETA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                      <span className="text-[10px] text-neutral-400 block font-bold">Speed</span>
                      <span className="font-numbers text-white">{firePlumes[0].current_wind_speed_kmh} km/h</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a]">
                      <span className="text-[10px] text-neutral-400 block font-bold">Bearing</span>
                      <span className="font-numbers text-sky-300">{firePlumes[0].corridor_bearing_deg}° NW</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400">No active fire conduits detected currently.</p>
              )}
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('inversion-fire')}
                className="text-[11px] text-sky-400 hover:underline font-bold pt-1 text-left"
              >
                View Plume Vectors &rarr;
              </button>
            </div>
          )}

          {/* 7. CAMS vs GNN Residual */}
          {item.type === 'cams-vs-gnn' && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-300 font-bold">Anand Vihar (+48h)</span>
                <span className="text-purple-300 font-numbers">+68 µg/m³</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <span className="text-neutral-400 block text-[10px] font-bold">CAMS Baseline</span>
                  <span className="text-lg font-numbers text-rose-400 line-through">245</span>
                  <span className="text-[10px] text-rose-400 block">Underpredicts</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/40">
                  <span className="text-neutral-400 block text-[10px] font-bold">GNN Residual</span>
                  <span className="text-lg font-numbers text-sky-400">313</span>
                  <span className="text-[10px] text-sky-300 block">Fire Corrected</span>
                </div>
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('comparison')}
                className="text-[11px] text-purple-400 hover:underline font-bold pt-1 text-left"
              >
                Compare Model Curves &rarr;
              </button>
            </div>
          )}

          {/* 8. Track Record Accuracy */}
          {item.type === 'track-record' && (
            <div className="space-y-2">
              <div>
                <span className="text-3xl font-numbers text-emerald-400">{stat48?.extreme_event_recall || 92}%</span>
                <span className="text-xs text-neutral-400 block">Severe Event Recall (+48h)</span>
              </div>
              <div className="text-xs text-neutral-300 pt-1 border-t border-[#27272a]">
                MAE: <span className="font-numbers text-sky-400">{stat48?.gnn_mae || 14.2}</span> vs CAMS <span className="font-numbers text-rose-400">{stat48?.cams_mae || 38.6}</span>
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('track-record')}
                className="text-[11px] text-sky-400 hover:underline font-bold mt-auto text-left"
              >
                Inspect Audit Log &rarr;
              </button>
            </div>
          )}

          {/* 9. High-Risk Hotspot Stations */}
          {item.type === 'high-risk-stations' && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {[
                  { name: 'Anand Vihar', aqi: 442, change: '+45' },
                  { name: 'Wazirpur', aqi: 418, change: '+38' },
                  { name: 'Punjabi Bagh', aqi: 395, change: '+29' },
                ].map((st, i) => (
                  <div 
                    key={i} 
                    data-no-drag
                    onClick={() => onSelectStation('dl-anand-vihar')}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold text-white">{st.name}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-numbers text-rose-400">{st.aqi} AQI</span>
                      <span className="font-numbers text-[10px] text-amber-400">({st.change})</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-neutral-400 text-right">
                Click station to inspect details
              </p>
            </div>
          )}

          {/* 10. System Freshness */}
          {item.type === 'system-freshness' && (
            <div className="space-y-2">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">CPCB CAAQMS</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">NASA FIRMS</span>
                  <span className="text-emerald-400 font-bold">Hourly Poll</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">CAMS Met</span>
                  <span className="text-neutral-300 font-bold">Synchronized</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 pt-1 border-t border-[#27272a]">
                All spatiotemporal inputs validated.
              </p>
            </div>
          )}
        </div>

        {/* iPhone Control Center style Corner Resize Handle */}
        <ResizeCornerHandle
          currentSize={item.size}
          onResize={(newSize) => setWidgetSize(item.id, newSize)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Detached Separate Text Boxes Toolbar (replacing monolithic header) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Box 1: Title Box */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-[#121316] border border-[#27272a] flex flex-col justify-center">
          <h2 className="font-heading text-2xl text-white">Central Telemetry Overview</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Drag to rearrange. Pull bottom-right corner inward to shrink, outward to enlarge (iPhone style).
          </p>
        </div>

        {/* Box 2: Capacity & Presets Box */}
        <div className="p-4 rounded-2xl bg-[#121316] border border-[#27272a] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Capacity</span>
            <span className="font-numbers text-xs text-sky-400">{widgets.length} / {MAX_WIDGETS}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px] text-neutral-500 font-bold mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] font-bold text-neutral-300"
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => applyPreset('meteo')}
              className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] font-bold text-neutral-300"
            >
              Meteo
            </button>
            <button
              type="button"
              onClick={() => applyPreset('taskforce')}
              className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[10px] font-bold text-neutral-300"
            >
              Action
            </button>
          </div>
        </div>

        {/* Box 3: Manage Widgets Button Box */}
        <button
          type="button"
          onClick={() => setIsOrganizerOpen(true)}
          className="p-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex flex-col justify-center items-center gap-1 transition-all shadow-sm"
        >
          <span>Manage Widgets</span>
          <span className="text-[11px] font-normal text-sky-100">
            {MAX_WIDGETS - widgets.length} slots available
          </span>
        </button>
      </div>

      {/* Widget Catalog Modal / Drawer (when open) */}
      {isOrganizerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-[#27272a] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 font-sans">
            {/* Catalog Header */}
            <div className="p-5 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="font-heading text-2xl text-white">Manage Dashboard Widgets</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Choose widgets for your workspace. Maximum {MAX_WIDGETS} widgets allowed on the board.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-numbers font-bold bg-[#18181b] border border-[#27272a] text-sky-300">
                  {widgets.length} / {MAX_WIDGETS}
                </span>

                <button
                  type="button"
                  onClick={() => setIsOrganizerOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-neutral-300 hover:text-white border border-[#27272a] text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Capacity Alert if full */}
            {widgets.length >= MAX_WIDGETS && (
              <div className="bg-amber-950/30 border-b border-amber-900/40 px-5 py-2.5 text-xs text-amber-300 font-bold">
                Maximum capacity reached ({MAX_WIDGETS} / {MAX_WIDGETS} widgets). Remove an active widget before adding another.
              </div>
            )}

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_WIDGET_CATALOG.map((cat) => {
                const activeInstance = widgets.find(w => w.type === cat.type);
                const isAdded = Boolean(activeInstance);
                const isFull = widgets.length >= MAX_WIDGETS;

                return (
                  <div
                    key={cat.type}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                      isAdded
                        ? 'bg-[#18181b] border-sky-500/40'
                        : 'bg-[#141518] border-[#27272a] hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-white">
                          {cat.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-neutral-400 font-bold">
                          {cat.tab}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#27272a]/60">
                      <span className="text-[10px] text-neutral-500 font-numbers uppercase">
                        Default {cat.defaultSize}
                      </span>

                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => removeWidget(activeInstance!.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isFull}
                          onClick={() => addWidget(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isFull
                              ? 'bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed'
                              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
                          }`}
                        >
                          {isFull ? 'Limit Reached' : 'Add to Board'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#27272a] bg-[#141518] flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Tip: Pull bottom-right corner inward to shrink, outward to enlarge.
              </span>
              <button
                type="button"
                onClick={() => setIsOrganizerOpen(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Draggable Widget Grid */}
      <div className="min-h-[500px]">
        <DraggableWidgetGrid
          items={widgets}
          onChange={(newItems) => updateWidgets(newItems as CustomWidget[])}
          renderItem={(item, size) => renderWidgetContent(item as CustomWidget, size)}
          editable={true}
          maxColumns={4}
          cellSize={240}
          gap={12}
          radius={16}
        />
      </div>

      {/* Optional Add Widget Empty Slot at bottom if under max */}
      {widgets.length < MAX_WIDGETS && (
        <button
          type="button"
          onClick={() => setIsOrganizerOpen(true)}
          className="w-full py-4 border-2 border-dashed border-[#27272a] hover:border-sky-500/50 rounded-2xl flex items-center justify-center gap-2 text-neutral-400 hover:text-sky-300 bg-[#121316]/40 hover:bg-[#18181b] transition-all text-xs font-bold font-sans"
        >
          <span>Add Widget to Board ({MAX_WIDGETS - widgets.length} of {MAX_WIDGETS} slots remaining)</span>
        </button>
      )}
    </div>
  );
};
