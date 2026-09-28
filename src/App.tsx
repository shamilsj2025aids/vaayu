import React, { useState, useEffect } from 'react';
import { 
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
import { LoginPage, AuthUser } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { HomeWidgetDashboard } from './components/HomeWidgetDashboard';
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
import Demo from '@/components/ui/demo';
import { Wind, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('aeris_auth_user') || localStorage.getItem('vaayu_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Active Authority Tab (defaults to 'home' central widget organizer)
  const [activeTab, setActiveTab] = useState<AuthorityTab>('home');

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
    const sampleForecast = forecasts.values().next().value;
    const windDir = sampleForecast?.hours[selectedHour]?.weather.wind_direction || 315;
    getDynamicEdges(windDir).then(setEdges);
  }, [selectedHour, forecasts]);

  const handleLogin = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem('aeris_auth_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aeris_auth_user');
    localStorage.removeItem('vaayu_auth_user');
  };

  // Handle "Refresh Now" action
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

  // If not logged in, display the Login Portal
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#0c1212] flex flex-col lg:flex-row font-sans">
      {/* Sleek Vertical Sidebar in White & Green */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSystemStatus={() => setIsSystemStatusOpen(true)}
        onTriggerRefresh={handleTriggerRefresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
        alerts={alerts}
        onSelectAlert={(a) => setActiveAlertForWhy(a)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 min-h-screen">
        {/* Proactive Alert Banner (Visible only in Authority Mode) */}
        {user.role === 'authority' && alerts.length > 0 && activeTab !== 'portal' && (
          <AlertBanner
            alerts={alerts}
            onSelectAlert={(a) => setActiveAlertForWhy(a)}
          />
        )}

        {/* Dynamic Operational Content */}
        <main className="flex-1 p-3 sm:p-5 max-w-[1600px] w-full mx-auto flex flex-col">
          {isLoadingInitial ? (
            <div className="flex-1 min-h-[500px] bg-[#0a2e21] rounded-2xl border-2 border-emerald-600/40 p-6 shadow-xl flex flex-col items-center justify-center space-y-4 text-white">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-800 border-t-white animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-white font-sans">
                  Synchronizing VAAYU Atmosphere Network...
                </p>
                <p className="text-xs text-[#a7d0bf]">
                  Coupling 56 ground CAAQMS stations with NASA FIRMS active fire telemetry
                </p>
              </div>
            </div>
          ) : user.role === 'civilian' ? (
            /* Simplified Public Citizen Experience */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0a2e21] px-4 py-2.5 rounded-xl border border-emerald-600/40 shadow-sm text-white">
                <div className="flex items-center gap-2 text-xs text-white font-bold">
                  <span className="flex items-center gap-2"><span className="font-vaayu text-xl tracking-wider text-white">VAAYU</span><span className="font-heading text-xs font-bold text-emerald-200">Live Citizen Portal</span></span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'portal' ? 'home' : 'portal')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-[#072118] text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>{activeTab === 'portal' ? 'Return to Citizen Advisory' : 'Explore VAAYU Glyph Portal'}</span>
                </button>
              </div>

              {activeTab === 'portal' ? (
                <div className="bg-[#0a2e21] rounded-2xl border-2 border-emerald-600/40 shadow-md overflow-hidden">
                  <Demo word="VAAYU" onEnterDashboard={() => setActiveTab('home')} />
                </div>
              ) : (
                <PublicView forecasts={forecasts} />
              )}
            </div>
          ) : (
            /* Authority / Decision-Maker Experience */
            <div className="flex-1 flex flex-col">
              {/* 0. INTERACTIVE GLYPH PORTAL TAB */}
              {activeTab === 'portal' && (
                <div className="flex-1 bg-[#0a2e21] rounded-2xl border-2 border-emerald-600/40 shadow-md overflow-hidden min-h-[750px]">
                  <Demo word="VAAYU" onEnterDashboard={() => setActiveTab('home')} />
                </div>
              )}

              {/* 1. CENTRAL HOME TAB (Draggable Widget Organizer) */}
              {activeTab === 'home' && (
                <HomeWidgetDashboard
                  forecasts={forecasts}
                  selectedHour={selectedHour}
                  alerts={alerts}
                  fireHotspots={fireHotspots}
                  firePlumes={firePlumes}
                  inversionTrend={inversionTrend}
                  trackRecords={trackRecords}
                  modelStats={modelStats}
                  dataSources={dataSources}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAlert={(alert) => setActiveAlertForWhy(alert)}
                  onSelectStation={(stId) => setSelectedStationId(stId)}
                />
              )}

              {/* 2. SPATIAL MAP TAB */}
              {activeTab === 'map' && (
                <div className="flex-1 flex flex-col gap-4">
                  <TimeSlider
                    currentHour={selectedHour}
                    onHourChange={setSelectedHour}
                    maxHours={72}
                  />
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

              {/* 3. INVERSION & FIRE TAB */}
              {activeTab === 'inversion-fire' && (
                <InversionFirePanel
                  hotspots={fireHotspots}
                  plumes={firePlumes}
                  trendData={inversionTrend}
                  selectedHour={selectedHour}
                />
              )}

              {/* 4. MODEL COMPARISON TAB */}
              {activeTab === 'comparison' && (
                <ModelComparisonView forecasts={forecasts} />
              )}

              {/* 5. TRACK RECORD TAB */}
              {activeTab === 'track-record' && (
                <TrackRecordView
                  records={trackRecords}
                  stats={modelStats}
                />
              )}
            </div>
          )}
        </main>
      </div>

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
