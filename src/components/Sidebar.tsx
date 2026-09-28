import React, { useState } from 'react';
import { AuthorityTab, Alert } from '../types';
import { 
  X, 
  Menu,
  HelpCircle,
  RotateCw,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  user: {
    role: string;
    identifier: string;
  };
  onLogout: () => void;
  activeTab: AuthorityTab;
  onTabChange: (tab: AuthorityTab) => void;
  onOpenSystemStatus: () => void;
  onTriggerRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: string;
  alerts: Alert[];
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
  alerts,
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
      subtitle: 'Live Telemetry Grid',
    },
    {
      id: 'map',
      label: 'Spatial Map & Graph',
      subtitle: 'Stations & Wind Vectors',
    },
    {
      id: 'inversion-fire',
      label: 'Inversion & Fire',
      subtitle: 'Inversion & Satellite Fires',
      badge: 'Active Stubble',
    },
    {
      id: 'comparison',
      label: 'CAMS vs GNN',
      subtitle: 'Model Calibration',
    },
    {
      id: 'track-record',
      label: 'Track Record',
      subtitle: 'Historical Audit',
    },
    {
      id: 'portal',
      label: 'VAAYU Glyph Portal',
      subtitle: 'Interactive Preview',
      badge: 'Interactive',
    },
  ];

  return (
    <>
      {/* Mobile Top Bar with Hamburger (only visible on mobile screens) */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#072118] border-b border-[#134e38] text-white sticky top-0 z-40">
        <div>
          <span className="font-vaayu text-2xl tracking-wider text-white">VAAYU</span>
          <span className="text-xs text-[#a7d0bf] block font-sans">Air Quality Portal</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-[#0e3d2c] border border-emerald-700/60 text-white hover:bg-[#14533c]"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop fixed left, Mobile drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#072118] border-r border-[#134e38] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section: Branding - No icon to the left of VAAYU */}
        <div className="p-5 border-b border-[#134e38] bg-[#072118]">
          <div>
            <h1 className="font-vaayu text-3xl text-white tracking-wider">VAAYU</h1>
            <p className="text-xs text-[#a7d0bf] font-sans mt-0.5 font-medium">
              Air Quality Portal
            </p>
          </div>
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
                        ? 'bg-[#0e3d2c] text-white shadow-sm border border-emerald-500/50'
                        : 'text-white/85 hover:text-white hover:bg-[#0a2e21] border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-white/95'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : item.badge === 'Interactive'
                              ? 'bg-emerald-950/80 text-[#86efac] border-emerald-700/60'
                              : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs block truncate mt-0.5 ${isActive ? 'text-[#86efac]' : 'text-[#a7d0bf]'}`}>
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
              <div className="p-2 rounded-xl bg-[#0a2e21] border border-[#134e38] flex items-center justify-around gap-2">
                {/* ? Logo */}
                <button
                  type="button"
                  onClick={() => setExpandedCard('advisory')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-rose-300 transition-all group"
                  title="Open Active Advisory & Causal Drivers"
                >
                  <HelpCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold font-sans">Advisory</span>
                </button>

                {/* Refresh Logo */}
                <button
                  type="button"
                  onClick={() => setExpandedCard('telemetry')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0e3d2c] hover:bg-[#14533c] border border-emerald-500/50 text-white transition-all group"
                  title="Open Live Telemetry & Pipeline Sync"
                >
                  <RotateCw className={`w-4 h-4 text-[#86efac] group-hover:scale-110 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold font-sans">Telemetry</span>
                </button>
              </div>
            )}

            {/* 2. Expanded Advisory Card */}
            {expandedCard === 'advisory' && (
              <div className="relative p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={() => setExpandedCard(null)}
                  className="absolute top-2 right-2 p-1 rounded-md text-rose-300 hover:text-white hover:bg-rose-900/60 transition-colors"
                  title="Close and return to icons"
                  aria-label="Close Advisory"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between pr-6">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                    Active Advisory
                  </span>
                  {activeAlert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold border border-rose-700">
                      {activeAlert.grap_stage}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white font-semibold line-clamp-2 leading-tight">
                  {activeAlert ? activeAlert.subtitle : 'No active critical alerts.'}
                </p>
                {activeAlert && onSelectAlert && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAlert(activeAlert);
                      setIsMobileOpen(false);
                    }}
                    className="w-full text-left text-xs text-[#86efac] hover:text-white font-bold flex items-center justify-between pt-1 border-t border-rose-800/80 cursor-pointer"
                  >
                    <span>Investigate "The Why"</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. Expanded Telemetry Card */}
            {expandedCard === 'telemetry' && (
              <div className="relative p-3 rounded-xl bg-[#0a2e21] border border-[#134e38] space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={() => setExpandedCard(null)}
                  className="absolute top-2 right-2 p-1 rounded-md text-[#a7d0bf] hover:text-white hover:bg-[#0e3d2c] transition-colors"
                  title="Close and return to icons"
                  aria-label="Close Telemetry"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-xs pr-6">
                  <span className="text-[10px] uppercase text-[#a7d0bf] font-bold">Live Telemetry</span>
                  <span className="text-xs text-[#86efac] font-bold font-numbers">
                    56 / 56 CPCB
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#a7d0bf]">
                  <div className="flex justify-between">
                    <span>Sync:</span>
                    <span className="text-white font-semibold font-numbers">{lastRefreshTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Met Baseline:</span>
                    <span className="text-white font-semibold">CAMS 00 UTC</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#134e38]">
                  <button
                    type="button"
                    onClick={handleRefreshClick}
                    disabled={isRefreshing}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all border cursor-pointer ${
                      isRefreshing
                        ? 'bg-[#061d15] border-[#134e38] text-white/40 cursor-wait'
                        : justRefreshed
                        ? 'bg-[#0e3d2c] border-emerald-500 text-white'
                        : 'bg-[#0e3d2c] hover:bg-[#14533c] border-emerald-500/50 text-white'
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
                    className="w-full py-1.5 px-2 rounded-lg text-xs font-bold bg-[#061d15] hover:bg-[#0e3d2c] border border-[#134e38] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span>Health</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-3.5 border-t border-[#134e38] bg-[#061d15]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight font-numbers">
                {user.identifier}
              </div>
              <div className="text-xs text-[#a7d0bf] truncate mt-0.5">
                {user.role === 'authority' ? 'Authority CAQM' : 'Civilian Citizen'}
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-lg bg-[#0e3d2c] hover:bg-rose-950/60 border border-emerald-700/60 hover:border-rose-700 text-white hover:text-rose-300 text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
