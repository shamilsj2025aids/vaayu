import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Wind, 
  Flame, 
  Layers, 
  TrendingDown, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { Alert } from '../types';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  const { causal_drivers } = alert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface border border-rose-900/60 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-rose-950/80 via-surface to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-900/70 text-rose-300 border border-rose-700/50">
                  {alert.grap_stage}
                </span>
                <span className="text-xs text-slate-400 font-mono">Lead Time: +{alert.lead_time_hours}h</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {alert.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Executive Diagnostic Summary */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-sky-400" />
              The "Why": Physical & GNN Residual Explanation
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs">
              {causal_drivers.narrative}
            </p>
          </div>

          {/* Coupled Physics Feature Diagnostics (The 4 core model features) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* PBLH Drop */}
            <div className="p-3 rounded-xl bg-surface border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between mb-1">
                <span>PBL Height Drop</span>
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-lg font-bold font-mono text-rose-400">
                -{causal_drivers.pblh_drop}m
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Trapping particles below 220m
              </div>
            </div>

            {/* Wind Deceleration */}
            <div className="p-3 rounded-xl bg-surface border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between mb-1">
                <span>Surface Wind</span>
                <Wind className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-bold font-mono text-amber-400">
                {causal_drivers.wind_speed} m/s
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Calm ventilation collapse
              </div>
            </div>

            {/* Inversion Strength Index */}
            <div className="p-3 rounded-xl bg-surface border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between mb-1">
                <span>Inversion Index</span>
                <Layers className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-lg font-bold font-mono text-purple-400">
                {causal_drivers.inversion_index}/100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Severe thermal ceiling
              </div>
            </div>

            {/* Fire Plume Influx */}
            <div className="p-3 rounded-xl bg-surface border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between mb-1">
                <span>Upwind Fire Flux</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="text-lg font-bold font-mono text-orange-400">
                {causal_drivers.fire_influence}/100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                NASA FIRMS Sangrur cluster
              </div>
            </div>
          </div>

          {/* Chemical & Meteorological Mechanism Breakdown */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">Coupled Head Inferences</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-medium text-sky-400 block mb-1">Chemical Head:</span>
                <p className="text-slate-300 leading-normal">
                  {causal_drivers.chemical_factor}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-medium text-amber-400 block mb-1">Meteorology Head:</span>
                <p className="text-slate-300 leading-normal">
                  {causal_drivers.meteorological_factor}
                </p>
              </div>
            </div>
          </div>

          {/* Highest Accumulation Stations */}
          <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-slate-800">
            <span className="font-semibold text-slate-300 block mb-1.5">
              Focal Entrapment Monitoring Stations (Highest GNN Node Weight):
            </span>
            <div className="flex flex-wrap gap-2">
              {causal_drivers.accumulation_stations.map((st) => (
                <span 
                  key={st}
                  className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-rose-300 font-medium"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>

          {/* Actionable Regulatory Mandate */}
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-2">
            <h4 className="font-bold text-rose-200 flex items-center gap-1.5">
              <span>Required Pre-emptive Regulatory Interventions:</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {alert.action_recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-elevated/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Dismiss Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
