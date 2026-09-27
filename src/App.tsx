import React, { useState, useEffect } from 'react';
import { 
  ViewMode, 
  AuthorityTab, 
  StationForecast, 
  DynamicGraphEdge, 
  Alert, 
  DataSourceStatus, 
  FIRMSFireHotspot, 
  FirePlumeTrajectory,
  TrackRecordEntry,
  ModelAccuracyStats
} from './types';
import { 
  getStationForecasts, 
  getDynamicEdges, 
  getAlerts, 
  getInversionAndFireData, 
  getTrackRecord, 
  getSystemStatus, 
  triggerFastRefresh 
} from './services/api';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { AlertDetailModal } from './components/AlertDetailModal';
import { TimeSlider } from './components/TimeSlider';
import { MapView } from './components/MapView';
import { StationDetailModal } from './components/StationDetailModal';
import { InversionFirePanel } from './components/InversionFirePanel';
import { ModelComparisonView } from './components/ModelComparisonView';
import { TrackRecordView } from './components/TrackRecordView';
import { SystemStatusPanel } from './components/SystemStatusPanel';
import { PublicView } from './components/PublicView';

export const App: React.FC = () => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('authority');
  const [activeTab, setActiveTab] = useState<AuthorityTab>('map');

  // Forecast & Telemetry State
  const [forecasts, setForecasts] = useState<Map<string, StationForecast>>(new Map());
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [edges, setEdges] = useState<DynamicGraphEdge[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Alerts & Modals
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlertForWhy, setActiveAlertForWhy] = useState<Alert | null>(null);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState<boolean>(false);

  // Inversion & Fire Data
  const [fireHotspots, setFireHotspots] = useState<FIRMSFireHotspot[]>([]);
  const [firePlumes, setFirePlumes] = useState<FirePlumeTrajectory[]>([]);
  const [inversionTrend, setInversionTrend] = useState<any[]>([]);

  // Track Record Data
  const [trackRecords, setTrackRecords] = useState<TrackRecordEntry[]>([]);
  const [modelStats, setModelStats] = useState<ModelAccuracyStats[]>([]);

  // System Status & Refresh
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Live (Hourly cycle)');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Initial Load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [
          forecastData,
          edgeData,
          alertData,
          invFireData,
          trackData,
          statusData
        ] = await Promise.all([
          getStationForecasts(),
          getDynamicEdges(315),
          getAlerts(),
          getInversionAndFireData(),
          getTrackRecord(),
          getSystemStatus(),
        ]);

        setForecasts(forecastData);
        setEdges(edgeData);
        setAlerts(alertData);
        setFireHotspots(invFireData.hotspots);
        setFirePlumes(invFireData.plumes);
        setInversionTrend(invFireData.fireInfluenceTrend);
        setTrackRecords(trackData.records);
        setModelStats(trackData.stats);
        setDataSources(statusData.sources);
        setLastRefreshTime(statusData.lastFastRefresh);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    }

    loadInitialData();
  }, []);

  // Update dynamic graph edges when selected hour changes
  useEffect(() => {
    // Determine prevailing wind direction at selected hour
    const sampleForecast = forecasts.values().next().value;
    const windDir = sampleForecast?.hours[selectedHour]?.weather.wind_direction || 315;
    getDynamicEdges(windDir).then(setEdges);
  }, [selectedHour, forecasts]);

  // Handle "Refresh Now" action (live demo interaction)
  const handleTriggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await triggerFastRefresh();
      setDataSources(res.updatedSources);
      setLastRefreshTime(res.refreshedAt);
      const freshForecasts = await getStationForecasts(true);
      setForecasts(freshForecasts);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectedForecast = selectedStationId ? forecasts.get(selectedStationId) || null : null;

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      {/* Persistent Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSystemStatus={() => setIsSystemStatusOpen(true)}
        onTriggerRefresh={handleTriggerRefresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
        activeAlertCount={alerts.length}
      />

      {/* Proactive Alert Banner (Visible in Authority Mode) */}
      {viewMode === 'authority' && (
        <AlertBanner
          alerts={alerts}
          onSelectAlert={(a) => setActiveAlertForWhy(a)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1600px] w-full mx-auto flex flex-col">
        {isLoadingInitial ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-400 font-mono">
              Initializing VAAYU Spatiotemporal Graph & Physics Baseline...
            </p>
          </div>
        ) : viewMode === 'public' ? (
          /* Simplified Public Citizen Experience */
          <PublicView forecasts={forecasts} />
        ) : (
          /* Authority / Decision-Maker Experience */
          <div className="flex-1 flex flex-col">
            {activeTab === 'map' && (
              <div className="flex-1 flex flex-col gap-4">
                {/* Time Slider Bar */}
                <TimeSlider
                  currentHour={selectedHour}
                  onHourChange={setSelectedHour}
                  maxHours={72}
                />

                {/* Map View */}
                <div className="flex-1 h-[68vh] min-h-[500px]">
                  <MapView
                    forecasts={forecasts}
                    selectedHour={selectedHour}
                    selectedStationId={selectedStationId}
                    onSelectStation={setSelectedStationId}
                    edges={edges}
                    fireHotspots={fireHotspots}
                    firePlumes={firePlumes}
                  />
                </div>
              </div>
            )}

            {activeTab === 'inversion-fire' && (
              <InversionFirePanel
                hotspots={fireHotspots}
                plumes={firePlumes}
                trendData={inversionTrend}
                selectedHour={selectedHour}
              />
            )}

            {activeTab === 'comparison' && (
              <ModelComparisonView forecasts={forecasts} />
            )}

            {activeTab === 'track-record' && (
              <TrackRecordView
                records={trackRecords}
                stats={modelStats}
              />
            )}
          </div>
        )}
      </main>

      {/* Station Forecast Deep-Dive Drawer Modal */}
      <StationDetailModal
        forecast={selectedForecast}
        selectedHour={selectedHour}
        onClose={() => setSelectedStationId(null)}
      />

      {/* The "Why" Causal Explanation Modal */}
      <AlertDetailModal
        alert={activeAlertForWhy}
        onClose={() => setActiveAlertForWhy(null)}
      />

      {/* System Status Ingestion Modal */}
      <SystemStatusPanel
        isOpen={isSystemStatusOpen}
        onClose={() => setIsSystemStatusOpen(false)}
        sources={dataSources}
        onTriggerRefresh={handleTriggerRefresh}
        isRefreshing={isRefreshing}
        lastFastRefresh={lastRefreshTime}
      />
    </div>
  );
};
export default App;
