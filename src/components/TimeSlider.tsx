import React, { useEffect, useState } from 'react';
import { formatHourLeadTime } from '../utils/formatters';

interface TimeSliderProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  maxHours?: number;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  currentHour,
  onHourChange,
  maxHours = 72,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onHourChange(currentHour >= maxHours ? 0 : currentHour + 1);
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentHour, maxHours, onHourChange]);

  const handleStepBack = () => {
    onHourChange(Math.max(0, currentHour - 1));
  };

  const handleStepForward = () => {
    onHourChange(Math.min(maxHours, currentHour + 1));
  };

  const jumpToHour = (h: number) => {
    onHourChange(h);
  };

  const uncertaintyWidth = Math.round(12 + (currentHour / maxHours) * 38);

  return (
    <div className="bg-[#0a2e21] border-2 border-emerald-600/40 rounded-2xl p-3.5 shadow-lg flex flex-col gap-3 text-white">
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-sky-400">schedule</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
              Forecast Horizon:
            </span>
            <span className="text-xs font-bold font-mono text-white bg-[#061d15] px-2.5 py-1 rounded-md border border-emerald-700/50 text-white">
              {formatHourLeadTime(currentHour)}
            </span>
          </div>

          {currentHour > 0 && (
            <span className="text-xs text-neutral-400 hidden sm:inline font-mono">
              (+{Math.floor(currentHour / 24)}d {currentHour % 24}h lead)
            </span>
          )}
        </div>

        {/* Confidence Range Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#061d15] border border-emerald-700/50 text-[11px] font-mono text-emerald-200">
            <span className="text-neutral-400">Uncertainty Margin:</span>
            <span className={`font-semibold ${currentHour > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ±{uncertaintyWidth} µg/m³
            </span>
          </div>

          <div className="hidden lg:flex items-center text-[11px] text-neutral-500 italic">
            <span>(Interval expands at +48h/72h to prevent false precision)</span>
          </div>
        </div>
      </div>

      {/* Main Slider & Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            isPlaying 
              ? 'bg-amber-950/80 text-amber-300 border border-amber-800' 
              : 'bg-white text-[#072118] hover:bg-emerald-100 shadow-sm font-bold'
          }`}
          title={isPlaying ? 'Pause 72h timelapse' : 'Play 72h continuous timelapse'}
        >
          <span className="material-symbols-outlined text-base">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Step Backward */}
        <button
          type="button"
          onClick={handleStepBack}
          disabled={currentHour === 0}
          className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#061d15] disabled:opacity-30 disabled:hover:bg-transparent"
          title="Step back 1 hour"
        >
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>

        {/* Range Slider Track */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={maxHours}
            step={1}
            value={currentHour}
            onChange={(e) => onHourChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#061d15] border border-emerald-700/50 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
          />
        </div>

        {/* Step Forward */}
        <button
          type="button"
          onClick={handleStepForward}
          disabled={currentHour === maxHours}
          className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#061d15] disabled:opacity-30 disabled:hover:bg-transparent"
          title="Step forward 1 hour"
        >
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>

      {/* Preset Jump Milestones */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-800/60 font-mono">
        {[0, 12, 24, 36, 48, 60, 72].map((hour) => {
          const isSelected = currentHour === hour;
          return (
            <button
              key={hour}
              type="button"
              onClick={() => jumpToHour(hour)}
              className={`px-2 py-0.5 rounded transition-all ${
                isSelected
                  ? 'bg-white text-[#072118] font-bold shadow-xs'
                  : 'text-emerald-200/80 hover:text-white hover:bg-[#061d15]'
              }`}
            >
              {hour === 0 ? 'Now' : `+${hour}h`}
            </button>
          );
        })}
      </div>
    </div>
  );
};
