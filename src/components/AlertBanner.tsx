import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Flame, Wind, Clock } from 'lucide-react';
import { Alert } from '../types';

interface AlertBannerProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onSelectAlert }) => {
  if (!alerts || alerts.length === 0) return null;

  // Primary critical alert
  const primaryAlert = alerts[0];

  return (
    <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-b border-rose-900/40 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-rose-200">
                PROACTIVE ADVISORY ({primaryAlert.grap_stage}):
              </span>
              <span className="text-white font-medium">
                {primaryAlert.title}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 font-mono">
                {primaryAlert.start_time}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] line-clamp-1 mt-0.5">
              {primaryAlert.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectAlert(primaryAlert)}
          className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-rose-100 border border-rose-700/60 font-medium transition-all shadow-sm group"
        >
          <span>Investigate Causal Drivers ("The Why")</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
