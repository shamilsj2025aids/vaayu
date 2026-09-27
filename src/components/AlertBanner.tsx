import React from 'react';
import { Alert } from '../types';

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
      <div className="bg-[#121316] border border-[#27272a] rounded-2xl p-2 sm:p-3 shadow-xl flex flex-col md:flex-row items-stretch">
        {/* Partition 1: Roman Numeral Stage (BIG with "STAGE" on top) */}
        <div className="md:w-32 shrink-0 flex flex-col items-center justify-center py-2 px-3 text-center">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
            STAGE
          </span>
          <span className="font-numbers text-3xl sm:text-4xl text-rose-300 font-extrabold leading-none my-1 tracking-tight">
            {roman}
          </span>
          <span className="text-[10px] font-bold text-rose-400/90 uppercase tracking-wider">
            {stageSub}
          </span>
        </div>

        {/* Partition 2: The Event and Event Alone */}
        <div className="flex-1 min-w-0 px-3 sm:px-4 py-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#27272a]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Event
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
            {primaryAlert.title}
          </h3>
        </div>

        {/* Partition 3: Expected Onset and Projected Impact */}
        <div className="flex-[1.5] min-w-0 px-3 sm:px-4 py-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#27272a]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Expected Onset:
            </span>
            <span className="font-numbers text-xs text-amber-300 font-bold">
              {primaryAlert.start_time}
            </span>
          </div>
          <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
            {primaryAlert.subtitle}
          </p>
        </div>

        {/* Partition 4: AI Gradient Circle Agent (Click to open causal diagnostics & chatbot) */}
        <div className="md:w-28 shrink-0 flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-[#27272a]">
          <button
            type="button"
            onClick={() => onSelectAlert(primaryAlert)}
            className="group relative flex flex-col items-center justify-center p-1"
            title="Open VAAYU AI Causal Agent & Investigation Chatbot"
          >
            {/* Glowing animated atmospheric aura */}
            <span className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 via-purple-500 to-rose-500 opacity-60 blur-md group-hover:opacity-100 group-hover:scale-110 transition-all animate-pulse" />

            {/* The single gradient circle */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-rose-400 p-[2px] shadow-lg group-hover:scale-105 active:scale-95 transition-all">
              <div className="w-full h-full rounded-full bg-[#121316]/50 backdrop-blur-xs flex items-center justify-center">
                {/* Inner white glow core */}
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white/95 to-sky-200/60 shadow-inner group-hover:scale-125 transition-transform" />
              </div>
            </div>

            <span className="text-[9px] font-bold text-sky-400 group-hover:text-white uppercase tracking-wider transition-colors mt-1.5">
              Ask AI
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
