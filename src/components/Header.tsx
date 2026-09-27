import React, { useState } from 'react';
import { 
  Wind, 
  Activity, 
  Flame, 
  GitCompare, 
  Award, 
  RefreshCw, 
  Database, 
  Users, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { ViewMode, AuthorityTab } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeTab: AuthorityTab;
  onTabChange: (tab: AuthorityTab) => void;
  onOpenSystemStatus: () => void;
  onTriggerRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: string;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  activeTab,
  onTabChange,
  onOpenSystemStatus,
  onTriggerRefresh,
  isRefreshing,
  lastRefreshTime,
  activeAlertCount,
}) => {
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefreshClick = async () => {
    await onTriggerRefresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-md shadow-sky-500/20">
              <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  VAAYU
                  <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono font-medium">
                    SIH26082
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <span>Coupled Physics + GNN</span>
                <span className="text-slate-600">•</span>
                <span className="text-sky-300">72h Delhi-NCR Forecast</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onViewModeChange('authority')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'authority'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Authority / GRAP</span>
              <span className="sm:hidden">Authority</span>
            </button>
            <button
              onClick={() => onViewModeChange('public')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'public'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen View</span>
              <span className="sm:hidden">Public</span>
            </button>
          </div>
        </div>

        {/* Authority Navigation Tabs */}
        {viewMode === 'authority' && (
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => onTabChange('map')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-surface-elevated text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Map & Telemetry
            </button>
            <button
              onClick={() => onTabChange('inversion-fire')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'inversion-fire'
                  ? 'bg-surface-elevated text-amber-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Inversion & Fire
            </button>
            <button
              onClick={() => onTabChange('comparison')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-surface-elevated text-purple-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-purple-400" />
              CAMS vs GNN Residual
            </button>
            <button
              onClick={() => onTabChange('track-record')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'track-record'
                  ? 'bg-surface-elevated text-emerald-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Track Record (MAE/Recall)
            </button>
          </nav>
        )}

        {/* Right Actions: System Status & Live Demo Refresh Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Data Freshness Indicator Trigger */}
          <button
            onClick={onOpenSystemStatus}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors group"
            title="Inspect Data Sources & Ingestion Schedule"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
            <span className="hidden xl:inline text-slate-400">Data Sources:</span>
            <span className="font-mono text-slate-200 text-[11px]">CPCB Live · CAMS 00Z</span>
          </button>

          {/* Refresh Now (Live Demo interaction) */}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all border ${
              isRefreshing
                ? 'bg-sky-950/60 border-sky-700 text-sky-300 cursor-wait'
                : justRefreshed
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white border-sky-500/40 shadow-sm hover:shadow-sky-500/20 active:scale-95'
            }`}
            title="Trigger fast-cycle live pull of ground sensors and NASA FIRMS fire detections"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Pulling Telemetry...' : justRefreshed ? 'Updated Live!' : 'Refresh Now'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
