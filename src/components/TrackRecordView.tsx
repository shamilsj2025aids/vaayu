import React, { useState } from 'react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis 
} from 'recharts';
import { TrackRecordEntry, ModelAccuracyStats } from '../types';
import { getAQIColor } from '../utils/aqi';
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

interface TrackRecordViewProps {
  records: TrackRecordEntry[];
  stats: ModelAccuracyStats[];
}

const trackRecordChartConfig = {
  gnn_mae: {
    label: "VAAYU GNN Residual",
    color: "#34d399",
  },
  cams_mae: {
    label: "CAMS Physics Baseline",
    color: "#ca8a04",
  },
  wrf_mae: {
    label: "WRF-Chem (Govt Model)",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export const TrackRecordView: React.FC<TrackRecordViewProps> = ({ records, stats }) => {
  const [selectedLeadTime, setSelectedLeadTime] = useState<'24h' | '48h' | '72h'>('48h');
  const [activeMetricTab, setActiveMetricTab] = useState<"all" | "gnn_mae" | "cams_mae" | "wrf_mae">("all");

  const filteredRecords = records.filter(r => r.lead_time === selectedLeadTime);
  const activeStat = stats.find(s => s.lead_time === selectedLeadTime) || stats[0];

  // Prepare Lead-time MAE Comparison Chart Data
  const leadTimeComparisonData = stats.map(s => ({
    lead_time: `+${s.lead_time}`,
    gnn_mae: s.gnn_mae,
    cams_mae: s.cams_mae,
    wrf_mae: s.wrf_mae,
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Title & Trust Statement */}
      <div className="bg-card p-5 rounded-2xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-white">
            System Track Record & Historical Verification
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Logged predicted-vs-actual outcomes from the automated inference & evaluation loop. Real evidence against ground truth.
          </p>
        </div>

        {/* Lead Time Selector */}
        <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-border text-xs">
          <button
            type="button"
            onClick={() => setSelectedLeadTime('24h')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedLeadTime === '24h' ? 'bg-sky-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            24h Horizon
          </button>
          <button
            type="button"
            onClick={() => setSelectedLeadTime('48h')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedLeadTime === '48h' ? 'bg-sky-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            48h Horizon
          </button>
          <button
            type="button"
            onClick={() => setSelectedLeadTime('72h')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedLeadTime === '72h' ? 'bg-sky-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            72h Horizon
          </button>
        </div>
      </div>

      {/* Top Benchmark Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Extreme-Event Recall */}
        <div className="bg-card p-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
            <span className="font-bold uppercase tracking-wider">Severe Event Recall</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-emerald-400">
              {activeStat.extreme_event_recall}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-2 pt-2 border-t border-emerald-900/30">
            Fraction of true "Severe" hours correctly forecast ≥36h in advance
          </p>
        </div>

        {/* Mean Absolute Error (MAE) */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">PM2.5 MAE (+{selectedLeadTime})</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-sky-400">
              {activeStat.gnn_mae}
            </span>
            <span className="text-xs text-neutral-400 font-bold">µg/m³</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-border">
            vs CAMS: <strong className="text-rose-400 font-numbers">{activeStat.cams_mae}</strong> | WRF: <strong className="text-rose-400 font-numbers">{activeStat.wrf_mae}</strong>
          </div>
        </div>

        {/* Category Accuracy */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">AQI Band Accuracy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-purple-400">
              {activeStat.category_accuracy}%
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-border">
            Hits correct regulatory band (Good/Mod/Poor/Severe)
          </div>
        </div>

        {/* Coefficient of Determination R² */}
        <div className="bg-card p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Correlation (R²)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-numbers text-amber-400">
              {activeStat.gnn_r2}
            </span>
            <span className="text-xs text-neutral-400 font-bold">/ 1.0</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 pt-2 border-t border-border">
            CAMS collapses to <strong className="font-numbers text-rose-300">{activeStat.cams_r2}</strong> at this lead time
          </div>
        </div>
      </div>

      {/* ChartBarInteractive: MAE Error Degradation Comparison */}
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-border p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
            <CardTitle className="font-heading text-xl text-white">
              Lead Time Error Degradation (MAE in µg/m³)
            </CardTitle>
            <CardDescription>
              Benchmark comparison of VAAYU GNN vs CAMS Baseline vs WRF-Chem across +24h, +48h, and +72h horizons
            </CardDescription>
          </div>

          {/* Interactive filter buttons in CardHeader */}
          <div className="flex border-t sm:border-t-0 sm:border-l border-border divide-x divide-border">
            <button
              type="button"
              data-active={activeMetricTab === "all"}
              onClick={() => setActiveMetricTab("all")}
              className="flex flex-1 flex-col justify-center gap-0.5 px-4 py-3 text-left data-[active=true]:bg-[#14533c] hover:bg-[#0e3d2c] transition-colors min-w-[95px]"
            >
              <span className="text-[10px] text-neutral-400 font-bold uppercase">Comparison</span>
              <span className="text-xs font-bold text-white">All Models</span>
            </button>
            <button
              type="button"
              data-active={activeMetricTab === "gnn_mae"}
              onClick={() => setActiveMetricTab("gnn_mae")}
              className="flex flex-1 flex-col justify-center gap-0.5 px-4 py-3 text-left data-[active=true]:bg-[#14533c] hover:bg-[#0e3d2c] transition-colors min-w-[100px]"
            >
              <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1"><span className="font-vaayu text-xs font-normal">VAAYU</span><span>GNN</span></span>
              <span className="text-xs font-numbers text-sky-300">14.2 avg</span>
            </button>
            <button
              type="button"
              data-active={activeMetricTab === "cams_mae"}
              onClick={() => setActiveMetricTab("cams_mae")}
              className="flex flex-1 flex-col justify-center gap-0.5 px-4 py-3 text-left data-[active=true]:bg-[#14533c] hover:bg-[#0e3d2c] transition-colors min-w-[100px]"
            >
              <span className="text-[10px] text-purple-400 font-bold">CAMS Physics</span>
              <span className="text-xs font-numbers text-purple-300">38.6 avg</span>
            </button>
            <button
              type="button"
              data-active={activeMetricTab === "wrf_mae"}
              onClick={() => setActiveMetricTab("wrf_mae")}
              className="flex flex-1 flex-col justify-center gap-0.5 px-4 py-3 text-left data-[active=true]:bg-[#14533c] hover:bg-[#0e3d2c] transition-colors min-w-[100px]"
            >
              <span className="text-[10px] text-rose-400 font-bold">WRF-Chem</span>
              <span className="text-xs font-numbers text-rose-300">51.4 avg</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <ChartContainer config={trackRecordChartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={leadTimeComparisonData} margin={{ top: 10, right: 15, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="lead_time" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    className="w-[180px]" 
                    labelFormatter={(val) => `Forecast Horizon: ${val}`}
                  />
                } 
              />
              {(activeMetricTab === "all" || activeMetricTab === "gnn_mae") && (
                <Bar 
                  dataKey="gnn_mae" 
                  fill="var(--color-gnn_mae)" 
                  name="VAAYU GNN" 
                  radius={[4, 4, 0, 0]} 
                />
              )}
              {(activeMetricTab === "all" || activeMetricTab === "cams_mae") && (
                <Bar 
                  dataKey="cams_mae" 
                  fill="var(--color-cams_mae)" 
                  name="CAMS Baseline" 
                  radius={[4, 4, 0, 0]} 
                />
              )}
              {(activeMetricTab === "all" || activeMetricTab === "wrf_mae") && (
                <Bar 
                  dataKey="wrf_mae" 
                  fill="var(--color-wrf_mae)" 
                  name="WRF-Chem (Govt)" 
                  radius={[4, 4, 0, 0]} 
                />
              )}
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Logged Past Forecasts Verification Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3">
          <div>
            <CardTitle className="font-heading text-xl text-white">
              Audit Log: Verified Historical Forecasts (+{selectedLeadTime})
            </CardTitle>
            <CardDescription>
              Ground Truth directly from CPCB CAAQMS Stations
            </CardDescription>
          </div>
          <span className="text-xs text-neutral-400 font-bold mt-1 sm:mt-0">
            CPCB CAAQMS Station Ground Truth
          </span>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-border bg-[#141518] text-neutral-400">
                  <th className="py-2.5 px-3 font-bold uppercase">Station</th>
                  <th className="py-2.5 px-3 font-bold uppercase">Timestamp (IST)</th>
                  <th className="py-2.5 px-3 font-bold uppercase">Actual Ground</th>
                  <th className="py-2.5 px-3 font-bold uppercase">Actual AQI</th>
                  <th className="py-2.5 px-3 text-sky-400 font-bold uppercase">GNN Forecast</th>
                  <th className="py-2.5 px-3 text-purple-400 font-bold uppercase">CAMS Physics</th>
                  <th className="py-2.5 px-3 text-rose-400 font-bold uppercase">WRF-Chem</th>
                  <th className="py-2.5 px-3 font-bold uppercase">GNN Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.map((r, i) => {
                  const error = Math.abs(r.gnn_pm25 - r.actual_pm25);
                  const camsError = Math.abs(r.cams_pm25 - r.actual_pm25);
                  return (
                    <tr key={i} className="hover:bg-[#18191d] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">
                        {r.station_name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">
                        {r.timestamp}
                      </td>
                      <td className="py-2.5 px-3 font-numbers text-white">
                        {r.actual_pm25} µg/m³
                      </td>
                      <td className="py-2.5 px-3 font-numbers" style={{ color: getAQIColor(r.actual_aqi) }}>
                        {r.actual_aqi}
                      </td>
                      <td className="py-2.5 px-3 font-numbers text-sky-400">
                        {r.gnn_pm25} µg/m³ ({r.gnn_aqi} AQI)
                      </td>
                      <td className="py-2.5 px-3 font-numbers text-neutral-400">
                        {r.cams_pm25} µg/m³
                      </td>
                      <td className="py-2.5 px-3 font-numbers text-neutral-500">
                        {r.wrf_chem_pm25} µg/m³
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          error <= 15 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          ±{error} µg/m³
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
