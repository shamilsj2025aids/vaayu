import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  FileCheck,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { TrackRecordEntry, ModelAccuracyStats } from '../types';
import { getAQIColor } from '../utils/aqi';

interface TrackRecordViewProps {
  records: TrackRecordEntry[];
  stats: ModelAccuracyStats[];
}

export const TrackRecordView: React.FC<TrackRecordViewProps> = ({ records, stats }) => {
  const [selectedLeadTime, setSelectedLeadTime] = useState<'24h' | '48h' | '72h'>('48h');

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
    <div className="space-y-6">
      {/* Title & Trust Statement */}
      <div className="bg-surface p-5 rounded-2xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">
              System Track Record & Historical Forecast Verification
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged predicted-vs-actual outcomes from the automated hourly inference & evaluation loop. Real evidence, not a live demo trick.
          </p>
        </div>

        {/* Lead Time Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedLeadTime('24h')}
            className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
              selectedLeadTime === '24h' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24h Horizon
          </button>
          <button
            onClick={() => setSelectedLeadTime('48h')}
            className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
              selectedLeadTime === '48h' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            48h Horizon
          </button>
          <button
            onClick={() => setSelectedLeadTime('72h')}
            className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
              selectedLeadTime === '72h' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            72h Horizon
          </button>
        </div>
      </div>

      {/* Top Benchmark Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Extreme-Event Recall (Crucial for stubble spikes) */}
        <div className="bg-surface p-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
            <span className="font-semibold uppercase tracking-wider">Severe Event Recall</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {activeStat.extreme_event_recall}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-2 pt-2 border-t border-emerald-900/30">
            Fraction of true "Severe" hours correctly forecast ≥36h in advance
          </p>
        </div>

        {/* Mean Absolute Error (MAE) */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">PM2.5 MAE (+{selectedLeadTime})</span>
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-sky-400">
              {activeStat.gnn_mae}
            </span>
            <span className="text-xs text-slate-400">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            vs CAMS: <strong className="text-rose-400">{activeStat.cams_mae} µg/m³</strong> | WRF: <strong className="text-rose-400">{activeStat.wrf_mae}</strong>
          </div>
        </div>

        {/* Category Accuracy */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">AQI Category Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-purple-400">
              {activeStat.category_accuracy}%
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            Hits correct regulatory band (Good/Mod/Poor/Severe)
          </div>
        </div>

        {/* Coefficient of Determination R² */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Correlation (R²)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-400">
              {activeStat.gnn_r2}
            </span>
            <span className="text-xs text-slate-400">/ 1.0</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
            CAMS collapses to {activeStat.cams_r2} at this lead time
          </div>
        </div>
      </div>

      {/* MAE Error Degradation Comparison Chart */}
      <div className="bg-surface p-5 rounded-2xl border border-border space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Lead Time Error Degradation (MAE in µg/m³: Lower is Better)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing VAAYU GNN Residual against CAMS and government WRF-Chem benchmarks across forecast horizons
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-sky-500 rounded-sm"></span>
              VAAYU GNN
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-purple-500 rounded-sm"></span>
              CAMS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded-sm"></span>
              WRF-Chem
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadTimeComparisonData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="lead_time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={11} label={{ value: 'MAE (µg/m³)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#1f293d',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="gnn_mae" fill="#38bdf8" name="VAAYU GNN" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cams_mae" fill="#a855f7" name="CAMS Baseline" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wrf_mae" fill="#f43f5e" name="WRF-Chem (Govt)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logged Past Forecasts Verification Table */}
      <div className="bg-surface p-5 rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-sky-400" />
            Audit Log: Verified Historical Forecasts (+{selectedLeadTime} Lead Time)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Ground Truth from CPCB CAAQMS Stations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-900/80 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">Timestamp (IST)</th>
                <th className="py-2.5 px-3">Actual PM2.5 (Ground)</th>
                <th className="py-2.5 px-3">Actual AQI</th>
                <th className="py-2.5 px-3 text-sky-400">VAAYU GNN Forecast</th>
                <th className="py-2.5 px-3 text-purple-400">CAMS Physics</th>
                <th className="py-2.5 px-3 text-rose-400">WRF-Chem</th>
                <th className="py-2.5 px-3">GNN Error (µg/m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredRecords.map((r, i) => {
                const error = Math.abs(r.gnn_pm25 - r.actual_pm25);
                const camsError = Math.abs(r.cams_pm25 - r.actual_pm25);
                return (
                  <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">
                      {r.station_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {r.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {r.actual_pm25} µg/m³
                    </td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: getAQIColor(r.actual_aqi) }}>
                      {r.actual_aqi}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-400">
                      {r.gnn_pm25} µg/m³ ({r.gnn_aqi} AQI)
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {r.cams_pm25} µg/m³
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.wrf_chem_pm25} µg/m³
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        error <= 15 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        ±{error} µg/m³ (vs CAMS ±{camsError})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
