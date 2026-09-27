import React, { useState } from 'react';
import { HelpCircle, RotateCw, X } from 'lucide-react';
import { AuthorityTab, Alert } from '../types';
import { AuthUser } from './LoginPage';

interface SidebarProps {
  user: AuthUser;
  onLogout: () => void;
  activeTab: AuthorityTab;
  onTabChange: (tab: AuthorityTab) => void;
  onOpenSystemStatus: () => void;
  onTriggerRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: string;
  alerts?: Alert[];
  onSelectAlert?: (alert: Alert) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  activeTab,
  onTabChange,
  onOpenSystemStatus,
  onTriggerRefresh,
  isRefreshing,
  lastRefreshTime,
  alerts = [],
  onSelectAlert,
}) => {
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<'advisory' | 'telemetry' | null>(null);

  const activeAlert = alerts[0];

  const handleRefreshClick = async () => {
    await onTriggerRefresh();
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 2500);
  };

  const navItems: { id: AuthorityTab; label: string; subtitle: string; badge?: string }[] = [
    {
      id: 'home',
      label: 'Home Overview',
      subtitle: 'Customizable Telemetry Grid',
    },
    {
      id: 'map',
      label: 'Spatial Map & Graph',
      subtitle: '56 CAAQMS + Wind Vectors',
    },
    {
      id: 'inversion-fire',
      label: 'Inversion & Fire',
      subtitle: 'Thermal Cap & NASA FIRMS',
      badge: 'Active Stubble',
    },
    {
      id: 'comparison',
      label: 'CAMS vs GNN',
      subtitle: 'Learned Residual Correction',
    },
    {
      id: 'track-record',
      label: 'Track Record',
      subtitle: 'Historical Verification Audit',
    },
  ];

  return (
    <>
      {/* Mobile Top Bar with Hamburger (only visible on mobile screens) */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#121316] border-b border-[#27272a] text-white sticky top-0 z-40">
        <div>
          <span className="font-heading text-xl tracking-wide text-white">VAAYU</span>
          <span className="text-xs text-neutral-400 block font-sans">Air Quality Intelligence</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-neutral-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          <span className="text-sm font-bold font-sans">{isMobileOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop fixed left, Mobile drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#121316] border-r border-[#27272a] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section: Branding */}
        <div className="p-5 border-b border-[#27272a]">
          <h1 className="font-heading text-2xl text-white tracking-wide">VAAYU</h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Air Quality Intelligence
          </p>
        </div>

        {/* Scrollable Middle Section: Nav items, Alert, and Telemetry */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 font-sans">
          {/* Navigation Section */}
          <div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-sky-500/15 border border-sky-500/30 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-[#18181b] border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 block truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dual Toggle Logos & Expanding Cards */}
          <div className="mt-auto pt-2">
            {/* 1. Default State: Both '?' and 'refresh' logos visible */}
            {expandedCard === null && (
              <div className="p-2 rounded-xl bg-[#141518] border border-[#27272a] flex items-center justify-around gap-2">
                {/* ? Logo */}
                <button
                  type="button"
                  onClick={() => setExpandedCard('advisory')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/25 hover:bg-rose-950/50 border border-rose-900/40 text-rose-300 hover:text-white transition-all group"
                  title="Open Active Advisory & Causal Drivers"
                >
                  <HelpCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold font-sans">Advisory</span>
                </button>

                {/* Refresh Logo */}
                <button
                  type="button"
                  onClick={() => setExpandedCard('telemetry')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#18181b] hover:bg-[#222329] border border-[#27272a] text-neutral-300 hover:text-white transition-all group"
                  title="Open Live Telemetry & Pipeline Sync"
                >
                  <RotateCw className={`w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold font-sans">Telemetry</span>
                </button>
              </div>
            )}

            {/* 2. Expanded Advisory Card (refresh logo vanishes, '×' on top-right to collapse back) */}
            {expandedCard === 'advisory' && (
              <div className="relative p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={() => setExpandedCard(null)}
                  className="absolute top-2 right-2 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-rose-900/40 transition-colors"
                  title="Close and return to icons"
                  aria-label="Close Advisory"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between pr-6">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Active Advisory
                  </span>
                  {activeAlert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-200 font-bold">
                      {activeAlert.grap_stage}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white font-bold line-clamp-2 leading-tight">
                  {activeAlert ? activeAlert.subtitle : 'No active critical alerts.'}
                </p>
                {activeAlert && onSelectAlert && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAlert(activeAlert);
                      setIsMobileOpen(false);
                    }}
                    className="w-full text-left text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center justify-between pt-1 border-t border-rose-900/30"
                  >
                    <span>Investigate "The Why"</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. Expanded Telemetry Card ('?' logo vanishes, '×' on top-right to collapse back) */}
            {expandedCard === 'telemetry' && (
              <div className="relative p-3 rounded-xl bg-[#141518] border border-[#27272a] space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={() => setExpandedCard(null)}
                  className="absolute top-2 right-2 p-1 rounded-md text-neutral-400 hover:text-white hover:bg-[#27272a] transition-colors"
                  title="Close and return to icons"
                  aria-label="Close Telemetry"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-xs pr-6">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold">Live Telemetry</span>
                  <span className="text-[10px] text-emerald-400 font-bold font-numbers">
                    56 / 56 CPCB
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-neutral-400">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Sync:</span>
                    <span className="text-neutral-300 font-numbers">{lastRefreshTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Physics:</span>
                    <span className="text-purple-300">CAMS Cycle</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#27272a]">
                  <button
                    type="button"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all border ${
                      isRefreshing
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-wait'
                        : justRefreshed
                        ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                        : 'bg-[#18181b] hover:bg-[#27272a] border-[#27272a] text-neutral-200'
                    }`}
                    title="Pull ground sensors & NASA FIRMS"
                  >
                    <span>{isRefreshing ? 'Syncing...' : justRefreshed ? 'Updated' : 'Refresh'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenSystemStatus();
                      setIsMobileOpen(false);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-[11px] font-bold bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-neutral-300 flex items-center justify-center transition-colors"
                  >
                    <span>Health</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-3.5 border-t border-[#27272a] bg-[#141518]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight font-numbers">
                {user.identifier}
              </div>
              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                {user.role === 'authority' ? 'Authority CAQM' : 'Civilian Citizen'}
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-rose-950/60 border border-[#27272a] hover:border-rose-800/50 text-neutral-400 hover:text-rose-300 text-xs font-bold transition-colors shrink-0"
              title="Sign Out"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
