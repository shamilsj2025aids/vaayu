import React from 'react';
import { Alert } from '../types';
import { AgentAvatar } from '@/components/ui/agent-avatar';

interface AlertBannerProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onSelectAlert }) => {
  if (!alerts || alerts.length === 0) return null;

  const primaryAlert = alerts[0];

  // Extract Roman numeral and stage subtitle (e.g., Stage IV (Severe+) -> "IV", "Severe+")
  const romanMatch = primaryAlert.grap_stage.match(/(IV|III|II|I)/i);
  const roman = romanMatch ? romanMatch[1].toUpperCase() : 'IV';

  const subMatch = primaryAlert.grap_stage.match(/\(([^)]+)\)/);
  const stageSub = subMatch ? subMatch[1] : 'Severe+';

  return (
    <div className="w-full px-3 sm:px-5 pt-4 pb-0 max-w-[1600px] mx-auto font-sans">
      {/* One unified box with 4 distinct partitions */}
      <div className="bg-[#0a2e21] border-2 border-emerald-600/40 rounded-2xl p-2 sm:p-3 shadow-lg text-white flex flex-col md:flex-row items-stretch">
        {/* Partition 1: Roman Numeral Stage */}
        <div className="md:w-36 shrink-0 flex flex-col items-center justify-center py-2.5 px-3 text-center bg-rose-950/50 rounded-xl md:rounded-r-none border border-rose-800/60">
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            STAGE
          </span>
          <span className="font-numbers text-4xl sm:text-5xl text-rose-400 font-black leading-none my-1 tracking-tight">
            {roman}
          </span>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
            {stageSub}
          </span>
        </div>

        {/* Partition 2: The Event */}
        <div className="flex-1 min-w-0 px-3 sm:px-4 py-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-emerald-800/60">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a7d0bf]">
            Event
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
            {primaryAlert.title}
          </h3>
        </div>

        {/* Partition 3: Expected Onset and Projected Impact */}
        <div className="flex-[1.5] min-w-0 px-3 sm:px-4 py-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-emerald-800/60">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a7d0bf]">
              Expected Onset:
            </span>
            <span className="font-numbers text-xs sm:text-sm text-amber-300 font-black bg-amber-950/70 px-2.5 py-0.5 rounded-lg border border-amber-600/50">
              {primaryAlert.start_time}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#d1fae5]/90 mt-1.5 line-clamp-2 leading-relaxed">
            {primaryAlert.subtitle}
          </p>
        </div>

        {/* Partition 4: AI Researcher Agent */}
        <div className="md:w-32 shrink-0 flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-emerald-800/60">
          <button
            type="button"
            onClick={() => onSelectAlert(primaryAlert)}
            className="group relative flex flex-col items-center justify-center p-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title="Open VAAYU AI Researcher & Investigation Chatbot"
          >
            {/* The Pixelated Researcher Avatar */}
            <AgentAvatar name="researcher" size={44} pulse showBadge />

            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-xs font-bold text-white group-hover:text-[#86efac] uppercase tracking-wider transition-colors">
                Ask AI
              </span>
            </div>
            <span className="text-[10px] text-[#a7d0bf] font-medium">
              researcher
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default AlertBanner;
