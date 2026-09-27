import React, { useState } from 'react';
import { AuthorityTab } from '../types';
import { AuthUser } from './LoginPage';

interface HeaderProps {
  user: AuthUser;
  onLogout: () => void;
  activeTab: AuthorityTab;
  onTabChange: (tab: AuthorityTab) => void;
  onOpenSystemStatus: () => void;
  onTriggerRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  activeTab,
  onTabChange,
  onOpenSystemStatus,
  onTriggerRefresh,
  isRefreshing,
  lastRefreshTime,
}) => {
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefreshClick = async () => {
    await onTriggerRefresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

  return (
    <header className="bg-[#121316] border-b border-[#27272a] sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center font-bold text-sky-400">
              <span className="material-symbols-outlined text-xl">air</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl text-white">
                  VAAYU
                </h1>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Air Quality Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Authority Navigation Tabs (Only in Authority Role) */}
        {user.role === 'authority' && (
          <nav className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a] text-xs w-full md:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => onTabChange('home')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Home Overview</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('map')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">map</span>
              <span>Spatial Map</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('inversion-fire')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'inversion-fire'
                  ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-amber-500">local_fire_department</span>
              <span>Inversion & Fire</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('comparison')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">compare_arrows</span>
              <span>CAMS vs GNN</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('track-record')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'track-record'
                  ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
              <span>Track Record</span>
            </button>
          </nav>
        )}

        {/* Right Actions: System Status, Live Refresh, & User Logout */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Data Freshness Status Button */}
          <button
            type="button"
            onClick={onOpenSystemStatus}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-neutral-700 text-xs text-neutral-300 transition-colors"
            title="Inspect Data Sources & Ingestion Schedule"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="hidden xl:inline text-neutral-400">Telemetry:</span>
            <span className="font-mono text-[11px] text-neutral-200">CPCB Live · CAMS 00Z</span>
          </button>

          {/* Refresh Now Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isRefreshing
                ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-wait'
                : justRefreshed
                ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-600 shadow-sm'
            }`}
            title="Trigger fast-cycle live pull of ground sensors and NASA FIRMS fire detections"
          >
            <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
            <span>{isRefreshing ? 'Pulling...' : justRefreshed ? 'Updated Live' : 'Refresh Now'}</span>
          </button>

          {/* Logged In User Pill & Logout Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#27272a]">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-white leading-none">
                {user.identifier}
              </div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                {user.role === 'authority' ? 'CAQM Officer' : 'Public Citizen'}
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-neutral-400 hover:text-rose-400 transition-colors"
              title="Sign Out / Change User Role"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
