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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#121316] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#27272a] text-sky-400 border border-[#3f3f46]">
              <span className="material-symbols-outlined text-xl">dns</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Ingestion Pipeline & Data Freshness
              </h2>
              <p className="text-xs text-neutral-400">
                Multi-cadence data pipeline tracking real physical latency per source
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Informative Note */}
        <div className="px-6 py-3 bg-[#18181b] border-b border-[#27272a] text-xs text-neutral-300 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-sky-400 text-base shrink-0 mt-0.5">verified_user</span>
          <p>
            <strong className="text-white font-semibold">Honest Multi-Cadence Architecture:</strong> CAMS Copernicus updates once daily (00 UTC) with ~6h global assimilation latency, while ground stations and NASA FIRMS fire detections refresh hourly.
          </p>
        </div>

        {/* Sources List */}
        <div className="px-6 py-4 overflow-y-auto space-y-3 flex-1">
          {sources.map((src) => (
            <div 
              key={src.id}
              className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-neutral-100">{src.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#27272a] text-neutral-300 font-mono">
                    {src.type}
                  </span>
                </div>
                <div className="text-xs text-neutral-400">
                  {src.source_org} • <span className="text-sky-300 font-medium">{src.frequency}</span>
                </div>
                <div className="text-xs text-neutral-500 italic">
                  <span>{src.latency_note}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-[#27272a]">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400">
                  <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                  <span>{src.last_updated}</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  {src.records_processed}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#27272a] bg-[#18181b] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Last Live Ingestion Trigger: <strong className="text-white">{lastFastRefresh}</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-[#27272a] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onTriggerRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-all disabled:opacity-60"
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
