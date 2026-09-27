import React from 'react';
import { 
  X, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-elevated/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ingestion Pipeline & Data Freshness
              </h2>
              <p className="text-xs text-slate-400">
                Transparent multi-cadence pipeline tracking real latency per source
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Trust-Building Note */}
        <div className="px-6 py-3 bg-sky-950/30 border-b border-sky-800/30 text-xs text-sky-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-white font-semibold">Honest Latency Architecture:</strong> Unlike naive dashboards that pretend all streams update every second, VAAYU respects authentic physical constraints. CAMS Copernicus updates once daily (00 UTC) with ~6h global assimilation latency, while ground stations and NASA FIRMS fire detections refresh hourly.
          </p>
        </div>

        {/* Sources List */}
        <div className="px-6 py-4 overflow-y-auto space-y-3 flex-1">
          {sources.map((src) => (
            <div 
              key={src.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-100">{src.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {src.type}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {src.source_org} • <span className="text-sky-300 font-medium">{src.frequency}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 italic">
                  <span>{src.latency_note}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{src.last_updated}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {src.records_processed}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer with Live Demo Action */}
        <div className="px-6 py-4 border-t border-border bg-surface-elevated/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Fast-Cycle Sync Active. Last Trigger: <strong className="text-slate-200">{lastFastRefresh}</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onTriggerRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md shadow-sky-600/30 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing Fast Sources...' : 'Trigger Fast Ingest (Demo)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
