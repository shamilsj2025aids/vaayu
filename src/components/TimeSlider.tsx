import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ShieldAlert, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
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

  // Auto-play timelapse
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

  // Uncertainty band indicator
  const uncertaintyWidth = Math.round(12 + (currentHour / maxHours) * 38);

  return (
    <div className="bg-surface/95 backdrop-blur border border-border rounded-xl p-3.5 shadow-xl flex flex-col gap-3">
      {/* Top row: Current Forecast Lead Time Label & Confidence Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Forecast Horizon:
            </span>
            <span className="text-sm font-bold font-mono text-white bg-sky-500/20 px-2.5 py-0.5 rounded-md border border-sky-500/30">
              {formatHourLeadTime(currentHour)}
            </span>
          </div>

          {currentHour > 0 && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              (+{Math.floor(currentHour / 24)}d {currentHour % 24}h lead)
            </span>
          )}
        </div>

        {/* Confidence Range Badge (Emphasizing confidence over false precision) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">Uncertainty Margin:</span>
            <span className={`font-semibold ${currentHour > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ±{uncertaintyWidth} µg/m³
            </span>
          </div>

          <div className="hidden lg:flex items-center text-[11px] text-slate-400 italic">
            <span>(Interval expands at +48h/72h to prevent false precision)</span>
          </div>
        </div>
      </div>

      {/* Main Slider & Playback Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-lg transition-all ${
            isPlaying 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
              : 'bg-sky-600 text-white hover:bg-sky-500 shadow-md shadow-sky-600/30'
          }`}
          title={isPlaying ? 'Pause 72h timelapse' : 'Play 72h continuous timelapse'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </button>

        {/* Step Backward */}
        <button
          onClick={handleStepBack}
          disabled={currentHour === 0}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
          title="Step back 1 hour"
        >
          <ChevronLeft className="w-4 h-4" />
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
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        {/* Step Forward */}
        <button
          onClick={handleStepForward}
          disabled={currentHour === maxHours}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent"
          title="Step forward 1 hour"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Jump Milestones (Now, +12h, +24h, +36h, +48h, +60h, +72h) */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 font-mono">
        {[0, 12, 24, 36, 48, 60, 72].map((hour) => {
          const isSelected = currentHour === hour;
          return (
            <button
              key={hour}
              onClick={() => jumpToHour(hour)}
              className={`px-2 py-0.5 rounded transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
