import React from 'react';
import { DataSourceStatus } from '../types';

interface SystemStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: DataSourceStatus[];
  onTriggerRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastFastRefresh: string;
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({
  isOpen,
  onClose,
  sources,
  onTriggerRefresh,
  isRefreshing,
  lastFastRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div 
        className="bg-[#0a2e21] border-2 border-emerald-600/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#134e38] flex items-center justify-between bg-[#072118] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0e3d2c] border border-emerald-600/50 text-white shadow-xs">
              <span className="material-symbols-outlined text-xl text-[#86efac]">dns</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="font-vaayu text-xl font-normal tracking-wider">VAAYU</span> Ingestion Pipeline & Data Freshness
              </h2>
              <p className="text-xs text-[#a7d0bf]">
                Multi-cadence data pipeline tracking real physical latency per source
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#0e3d2c] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Informative Note */}
        <div className="px-6 py-3 bg-[#061d15] border-b border-[#134e38] text-xs text-emerald-200 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#0b3b2a] text-base shrink-0 mt-0.5">verified_user</span>
          <p>
            <strong className="text-white font-bold">Honest Multi-Cadence Architecture:</strong> CAMS Copernicus updates once daily (00 UTC) with ~6h global assimilation latency, while ground stations and NASA FIRMS fire detections refresh hourly.
          </p>
        </div>

        {/* Sources List */}
        <div className="px-6 py-4 overflow-y-auto space-y-3 flex-1 bg-[#0a2e21] text-white">
          {sources.map((src) => (
            <div 
              key={src.id}
              className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 hover:border-emerald-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{src.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e3d2c] border border-emerald-600/50 text-emerald-200 font-mono font-medium">
                    {src.type}
                  </span>
                </div>
                <div className="text-xs text-[#a7d0bf]">
                  {src.source_org} • <span className="text-emerald-300 font-bold">{src.frequency}</span>
                </div>
                <div className="text-xs text-slate-300 italic">
                  <span>{src.latency_note}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-[#134e38]">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#16a34a]">
                  <span className="material-symbols-outlined text-sm text-[#16a34a]">check_circle</span>
                  <span>{src.last_updated}</span>
                </div>
                <div className="text-[11px] text-[#a7d0bf] font-mono mt-0.5">
                  {src.records_processed}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#134e38] bg-[#f8faf9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#5c6e64] flex items-center gap-2 font-mono">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Last Live Ingestion Trigger: <strong className="text-white font-bold">{lastFastRefresh}</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white hover:bg-[#0e3d2c] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onTriggerRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-[#072118] font-bold text-xs transition-all disabled:opacity-60 cursor-pointer shadow-md"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
              <span>{isRefreshing ? 'Syncing...' : 'Trigger Fast Ingest (Live Demo)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SystemStatusPanel;
