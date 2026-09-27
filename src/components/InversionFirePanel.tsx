import React from 'react';
import { 
  Flame, 
  Layers, 
  Wind, 
  Gauge, 
  Compass, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { FIRMSFireHotspot, FirePlumeTrajectory } from '../types';
import { formatVentilation, formatInversionLevel } from '../utils/formatters';

interface InversionFirePanelProps {
  hotspots: FIRMSFireHotspot[];
  plumes: FirePlumeTrajectory[];
  trendData: { hour: number; score: number; pblh: number; ventilation: number }[];
  selectedHour: number;
}

export const InversionFirePanel: React.FC<InversionFirePanelProps> = ({
  hotspots,
  plumes,
  trendData,
  selectedHour,
}) => {
  const currentTrend = trendData[selectedHour] || trendData[0];
  const inversionStatus = formatInversionLevel(currentTrend?.score || 45);
  const ventStatus = formatVentilation(currentTrend?.ventilation || 3500);

  // Calculate FIRMS statistics
  const totalFRP = hotspots.reduce((acc, f) => acc + f.frp, 0);
  const avgBrightness = hotspots.length 
    ? Math.round(hotspots.reduce((acc, f) => acc + f.brightness, 0) / hotspots.length) 
    : 340;
  const punjabHotspots = hotspots.filter(f => f.state === 'Punjab').length;
  const haryanaHotspots = hotspots.filter(f => f.state === 'Haryana').length;

  return (
    <div className="space-y-6">
      {/* Title & Physics Context */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Atmospheric Inversion Strength & NASA FIRMS Plume Influx
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coupled physical features tracked as primary first-class metrics rather than hidden black-box inputs
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Active Stubble Window: Oct–Nov Influx
          </span>
        </div>
      </div>

      {/* Top Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Inversion Strength Index */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Inversion Index</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-purple-400">
              {currentTrend?.score || 55}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-xs">
            <div className={`font-semibold ${inversionStatus.color}`}>
              {inversionStatus.label}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strong thermal cap preventing vertical dilution
            </p>
          </div>
        </div>

        {/* Gauge 2: Ventilation Coefficient */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Ventilation (Vc)</span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {(currentTrend?.ventilation || 2800).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">m²/s</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-xs">
            <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${ventStatus.badgeColor}`}>
              {ventStatus.label}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Critical threshold: &lt; 2,000 m²/s traps smog
            </p>
          </div>
        </div>

        {/* Gauge 3: Planetary Boundary Layer Height */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Mixing Height (PBLH)</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {currentTrend?.pblh || 320}
            </span>
            <span className="text-xs text-slate-400">meters</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-xs">
            <div className="font-medium text-slate-300">
              Diurnal Surface Ceiling
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Night drop creates shallow 200m particulate trap
            </p>
          </div>
        </div>

        {/* Gauge 4: NASA FIRMS Fire Radiative Power */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">FIRMS Fire Power (FRP)</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-orange-400">
              {Math.round(totalFRP)}
            </span>
            <span className="text-xs text-slate-400">MW ({hotspots.length} fires)</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-xs">
            <div className="font-medium text-amber-300">
              {punjabHotspots} in Punjab • {haryanaHotspots} in Haryana
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Transported along NW corridor toward Delhi-NCR
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section: 72h Inversion Strength vs PBLH & Ventilation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inversion Strength & Upwind Fire Influence Trend */}
        <div className="bg-surface p-5 rounded-2xl border border-border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                72-Hour Inversion Strength & Fire Flux Score
              </h3>
              <p className="text-xs text-slate-400">
                GNN first-class input tracking atmospheric trapping potential
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm"></span>
                Inversion Index
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></span>
                Fire Flux
              </span>
            </div>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={(val) => `+${val}h`} 
                  interval={8}
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1f293d',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val}/100`, name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#invGrad)" 
                  name="Inversion Strength"
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#fireGrad)" 
                  name="Fire Plume Influence"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Planetary Boundary Layer Height (PBLH) & Ventilation Coefficient */}
        <div className="bg-surface p-5 rounded-2xl border border-border flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" />
                Planetary Boundary Layer & Ventilation Dilution
              </h3>
              <p className="text-xs text-slate-400">
                Vertical mixing depth (PBLH) and horizontal wind dispersion capacity
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
                PBLH (m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span>
                Vc (m²/s)
              </span>
            </div>
          </div>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickFormatter={(val) => `+${val}h`} 
                  interval={8}
                />
                <YAxis yAxisId="pblh" stroke="#38bdf8" fontSize={11} domain={[100, 1200]} />
                <YAxis yAxisId="vc" orientation="right" stroke="#34d399" fontSize={11} domain={[500, 8000]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1f293d',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line 
                  yAxisId="pblh"
                  type="monotone" 
                  dataKey="pblh" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  dot={false}
                  name="Boundary Layer (m)"
                />
                <Line 
                  yAxisId="vc"
                  type="monotone" 
                  dataKey="ventilation" 
                  stroke="#34d399" 
                  strokeWidth={2}
                  dot={false}
                  name="Ventilation (m²/s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Stubble Plume Conduits & Hotspot Breakdown */}
      <div className="bg-surface p-5 rounded-2xl border border-border">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          Detected Fire Plume Conduits (Wind Transport to Delhi-NCR)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plumes.map((plume) => (
            <div 
              key={plume.source_id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{plume.source_name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-orange-950 text-orange-300 border border-orange-700">
                  {plume.plume_intensity} Plume
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-surface border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ETA Delhi</span>
                  <span className="text-amber-400 font-bold">+{plume.eta_delhi_hours}h</span>
                </div>
                <div className="p-2 rounded bg-surface border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Corridor Speed</span>
                  <span className="text-white font-bold">{plume.current_wind_speed_kmh} km/h</span>
                </div>
                <div className="p-2 rounded bg-surface border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Bearing</span>
                  <span className="text-sky-300 font-bold">{plume.corridor_bearing_deg}° (NW)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct atmospheric trajectory passing over Haryana border entering North-West Delhi (Rohini & Wazirpur) before pooling in the Yamuna basin.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
