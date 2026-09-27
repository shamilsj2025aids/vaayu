import React, { useState } from 'react';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  XAxis, 
  YAxis 
} from 'recharts';
import { FIRMSFireHotspot, FirePlumeTrajectory } from '../types';
import { formatVentilation, formatInversionLevel } from '../utils/formatters';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InversionFirePanelProps {
  hotspots: FIRMSFireHotspot[];
  plumes: FirePlumeTrajectory[];
  trendData: { hour: number; score: number; pblh: number; ventilation: number }[];
  selectedHour: number;
}

const inversionChartConfig = {
  score: {
    label: "Inversion Index",
    color: "#a855f7",
  },
  fire_flux: {
    label: "Fire Flux Impact",
    color: "#f97316",
  },
} satisfies ChartConfig;

const boundaryChartConfig = {
  pblh: {
    label: "Boundary Layer (PBLH m)",
    color: "#38bdf8",
  },
  ventilation: {
    label: "Ventilation (Vc m²/s)",
    color: "#34d399",
  },
} satisfies ChartConfig;

export const InversionFirePanel: React.FC<InversionFirePanelProps> = ({
  hotspots,
  plumes,
  trendData,
  selectedHour,
}) => {
  const [inversionTimeRange, setInversionTimeRange] = useState<string>("72h");
  const [boundaryMetric, setBoundaryMetric] = useState<"both" | "pblh" | "ventilation">("both");

  const currentTrend = trendData[selectedHour] || trendData[0];
  const inversionStatus = formatInversionLevel(currentTrend?.score || 45);
  const ventStatus = formatVentilation(currentTrend?.ventilation || 3500);

  // Calculate FIRMS statistics
  const totalFRP = hotspots.reduce((acc, f) => acc + f.frp, 0);
  const punjabHotspots = hotspots.filter(f => f.state === 'Punjab').length;
  const haryanaHotspots = hotspots.filter(f => f.state === 'Haryana').length;

  // Filter trend data based on selected horizon
  const maxHour = inversionTimeRange === "24h" ? 24 : inversionTimeRange === "48h" ? 48 : 72;
  const filteredTrendData = trendData.filter(d => d.hour <= maxHour).map(d => ({
    ...d,
    fire_flux: Math.round(Math.min(95, d.score * 0.85 + (d.hour % 24 > 16 ? 18 : 6))),
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Physics Context (Detached Box) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-card p-5 rounded-2xl border border-border">
        <div>
          <h2 className="font-heading text-2xl text-white">
            Atmospheric Inversion Strength & Fire Plume Influx
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Physical boundary layers tracked as primary metrics rather than hidden black-box inputs
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
            Active Stubble Window: Punjab & Haryana Influx
          </span>
        </div>
      </div>

      {/* Top Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Inversion Strength Index */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Inversion Index</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-purple-400">
              {currentTrend?.score || 55}
            </span>
            <span className="text-xs text-neutral-400 font-bold">/ 100</span>
          </div>
          <div className="mt-3 pt-2 border-t border-border text-xs">
            <div className={`font-bold ${inversionStatus.color}`}>
              {inversionStatus.label}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Thermal cap suppressing vertical buoyant dilution
            </p>
          </div>
        </div>

        {/* Gauge 2: Ventilation Coefficient */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Ventilation (Vc)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-white">
              {(currentTrend?.ventilation || 2800).toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400 font-bold">m²/s</span>
          </div>
          <div className="mt-3 pt-2 border-t border-border text-xs">
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${ventStatus.badgeColor}`}>
              {ventStatus.label}
            </span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Critical threshold: &lt; 2,000 m²/s traps stagnation
            </p>
          </div>
        </div>

        {/* Gauge 3: Planetary Boundary Layer Height */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Mixing Height (PBLH)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-emerald-400">
              {currentTrend?.pblh || 320}
            </span>
            <span className="text-xs text-neutral-400 font-bold">meters</span>
          </div>
          <div className="mt-3 pt-2 border-t border-border text-xs">
            <div className="font-bold text-slate-300">
              Diurnal Surface Ceiling
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Night compression forms shallow 200m particulate trap
            </p>
          </div>
        </div>

        {/* Gauge 4: NASA FIRMS Fire Radiative Power */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">FIRMS Fire Power</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-orange-400">
              {Math.round(totalFRP)}
            </span>
            <span className="text-xs text-neutral-400 font-bold">MW ({hotspots.length} fires)</span>
          </div>
          <div className="mt-3 pt-2 border-t border-border text-xs">
            <div className="font-bold text-amber-300">
              {punjabHotspots} in Punjab • {haryanaHotspots} in Haryana
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Transported along NW corridor
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Area Chart: Inversion Strength & Fire Flux Score */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <CardTitle className="font-heading text-xl text-white">
                Inversion Strength & Fire Flux Score
              </CardTitle>
              <CardDescription>
                Atmospheric trapping potential and upwind stubble influx
              </CardDescription>
            </div>
            {/* Interactive Time Range Select */}
            <div className="w-[150px]">
              <Select value={inversionTimeRange} onValueChange={setInversionTimeRange}>
                <SelectTrigger aria-label="Forecast Horizon">
                  <SelectValue placeholder="Full 72 Hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="72h">Full 72 Hours</SelectItem>
                  <SelectItem value="48h">Next 48 Hours</SelectItem>
                  <SelectItem value="24h">Next 24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <ChartContainer config={inversionChartConfig} className="aspect-auto h-[260px] w-full">
              <AreaChart data={filteredTrendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="fillInversion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillFireFlux" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-fire_flux)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--color-fire_flux)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tickFormatter={(val) => `+${val}h`}
                  interval={inversionTimeRange === "24h" ? 2 : inversionTimeRange === "48h" ? 5 : 8}
                />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent indicator="dot" />} 
                />
                <Area 
                  dataKey="score" 
                  type="monotone" 
                  fill="url(#fillInversion)" 
                  stroke="var(--color-score)" 
                  strokeWidth={2}
                  name="Inversion Index"
                />
                <Area 
                  dataKey="fire_flux" 
                  type="monotone" 
                  fill="url(#fillFireFlux)" 
                  stroke="var(--color-fire_flux)" 
                  strokeWidth={2}
                  name="Fire Flux Impact"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Boundary Layer Height (PBLH) & Ventilation Coefficient */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <CardTitle className="font-heading text-xl text-white">
                Boundary Layer & Ventilation
              </CardTitle>
              <CardDescription>
                Vertical mixing ceiling (PBLH) and horizontal dispersion capacity (Vc)
              </CardDescription>
            </div>
            {/* Interactive series toggle */}
            <div className="flex items-center bg-[#18181b] border border-border rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setBoundaryMetric("both")}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  boundaryMetric === "both" ? "bg-[#27272a] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setBoundaryMetric("pblh")}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  boundaryMetric === "pblh" ? "bg-[#27272a] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                PBLH
              </button>
              <button
                type="button"
                onClick={() => setBoundaryMetric("ventilation")}
                className={`px-2.5 py-1 rounded-lg transition-colors font-bold ${
                  boundaryMetric === "ventilation" ? "bg-[#27272a] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                Vc
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <ChartContainer config={boundaryChartConfig} className="aspect-auto h-[260px] w-full">
              <LineChart data={trendData} margin={{ top: 10, right: 15, bottom: 0, left: -10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tickFormatter={(val) => `+${val}h`} 
                  interval={8}
                />
                {(boundaryMetric === "both" || boundaryMetric === "pblh") && (
                  <YAxis yAxisId="pblh" domain={[100, 1200]} tickLine={false} axisLine={false} />
                )}
                {(boundaryMetric === "both" || boundaryMetric === "ventilation") && (
                  <YAxis yAxisId="vc" orientation={boundaryMetric === "both" ? "right" : "left"} domain={[500, 8000]} tickLine={false} axisLine={false} />
                )}
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                {(boundaryMetric === "both" || boundaryMetric === "pblh") && (
                  <Line 
                    yAxisId="pblh"
                    type="monotone" 
                    dataKey="pblh" 
                    stroke="var(--color-pblh)" 
                    strokeWidth={2}
                    dot={false}
                    name="Boundary Layer (m)"
                  />
                )}
                {(boundaryMetric === "both" || boundaryMetric === "ventilation") && (
                  <Line 
                    yAxisId="vc"
                    type="monotone" 
                    dataKey="ventilation" 
                    stroke="var(--color-ventilation)" 
                    strokeWidth={2}
                    dot={false}
                    name="Ventilation (m²/s)"
                  />
                )}
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Stubble Plume Conduits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-xl text-white">
            Detected Fire Plume Conduits
          </CardTitle>
          <CardDescription>
            Trajectory vectors modeled from satellite fire detections and boundary-layer wind fields
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plumes.map((plume) => (
              <div 
                key={plume.source_id}
                className="p-4 rounded-xl bg-[#141518] border border-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{plume.source_name}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-lg font-bold bg-orange-950/60 text-orange-300 border border-orange-700/50">
                    {plume.plume_intensity} Plume
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-card border border-border">
                    <span className="text-neutral-400 block text-[10px] font-bold">ETA</span>
                    <span className="text-amber-400 font-numbers text-sm">+{plume.eta_delhi_hours}h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border">
                    <span className="text-neutral-400 block text-[10px] font-bold">Wind Speed</span>
                    <span className="text-white font-numbers text-sm">{plume.current_wind_speed_kmh} km/h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border">
                    <span className="text-neutral-400 block text-[10px] font-bold">Bearing</span>
                    <span className="text-sky-300 font-numbers text-sm">{plume.corridor_bearing_deg}° NW</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Direct atmospheric trajectory entering North-West Delhi before pooling in the basin.
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
