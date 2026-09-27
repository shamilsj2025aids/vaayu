import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { StationForecast } from '../types';
import { getAQIColor, getAQICategory, getAQIBadgeClass, getGRAPStage } from '../utils/aqi';
import { 
  formatConfidenceRange, 
  formatHourLeadTime, 
  formatVentilation, 
  degreesToCompass 
} from '../utils/formatters';

interface StationDetailModalProps {
  forecast: StationForecast | null;
  selectedHour: number;
  onClose: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  forecast,
  selectedHour,
  onClose,
}) => {
  const [activeMetric, setActiveMetric] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'o3'>('pm25');

  if (!forecast) return null;

  const { station, hours } = forecast;
  const currentHourData = hours[selectedHour] || hours[0];
  const currentAQI = currentHourData.aqi.mean;
  const currentCategory = currentHourData.category;
  const grap = getGRAPStage(currentAQI);
  const ventStatus = formatVentilation(currentHourData.physics.ventilation_coefficient);

  const chartData = hours.map((h) => ({
    hour: `+${h.hour_offset}h`,
    rawHour: h.hour_offset,
    pm25: h.pm25.mean,
    pm25_lower: h.pm25.lower,
    pm25_upper: h.pm25.upper,
    cams_pm25: h.cams_baseline_pm25,
    aqi: h.aqi.mean,
    aqi_lower: h.aqi.lower,
    aqi_upper: h.aqi.upper,
    cams_aqi: h.cams_baseline_aqi,
    pm10: h.pm10.mean,
    no2: h.no2.mean,
    o3: h.o3.mean,
    pblh: h.weather.boundary_layer_height,
    inversion: h.physics.inversion_index,
    wind: h.weather.wind_speed,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#121316] border border-[#27272a] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white font-mono shadow-md text-base"
              style={{ backgroundColor: getAQIColor(currentAQI) }}
            >
              {Math.round(currentAQI)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{station.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getAQIBadgeClass(currentCategory)}`}>
                  {currentCategory}
                </span>
                {station.isBoundaryNode && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    Synthetic Fire Boundary Node
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-sm text-neutral-500">location_on</span>
                <span>{station.city}, {station.state} ({station.zone} Zone)</span>
                <span>•</span>
                <span className="font-mono text-neutral-300">Lat: {station.lat.toFixed(4)}, Lon: {station.lon.toFixed(4)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="p-4 sm:px-6 bg-[#18181b] border-b border-[#27272a] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#121316] border border-[#27272a]">
            <div className="text-neutral-400 mb-1 flex items-center justify-between">
              <span>AQI ({formatHourLeadTime(selectedHour)})</span>
              <span className="text-[10px] text-sky-400 font-mono">P10-P90</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {Math.round(currentAQI)}
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Confidence: <strong className="text-neutral-200">{formatConfidenceRange(currentHourData.aqi)}</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121316] border border-[#27272a]">
            <div className="text-neutral-400 mb-1 flex items-center justify-between">
              <span>PM2.5 / CAMS Delta</span>
              <span className="text-[10px] text-purple-400 font-mono">Residual</span>
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
              <span>{Math.round(currentHourData.pm25.mean)}</span>
              <span className="text-xs text-neutral-400 font-normal">µg/m³</span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
              CAMS: <span className="text-neutral-300">{currentHourData.cams_baseline_pm25}</span> | Δ: <span className="text-purple-400">+{currentHourData.gnn_residual_pm25}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121316] border border-[#27272a]">
            <div className="text-neutral-400 mb-1 flex items-center justify-between">
              <span>Ventilation (Vc)</span>
              <span className="material-symbols-outlined text-sm text-sky-400">air</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {currentHourData.physics.ventilation_coefficient.toLocaleString()}{' '}
              <span className="text-xs text-neutral-400 font-normal">m²/s</span>
            </div>
            <div className="text-[11px] mt-0.5 truncate">
              <span className={`px-1.5 py-0.2 rounded font-medium ${ventStatus.badgeColor}`}>
                {ventStatus.label}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121316] border border-[#27272a]">
            <div className="text-neutral-400 mb-1 flex items-center justify-between">
              <span>Atmospheric Lid</span>
              <span className="material-symbols-outlined text-sm text-amber-400">layers</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {currentHourData.weather.boundary_layer_height}m{' '}
              <span className="text-xs text-neutral-400 font-normal">PBLH</span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Wind: {currentHourData.weather.wind_speed} m/s ({degreesToCompass(currentHourData.weather.wind_direction)})
            </div>
          </div>
        </div>

        {/* Scrollable Chart & Deep-Dive Section */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[#27272a] text-xs">
              <button
                type="button"
                onClick={() => setActiveMetric('pm25')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'pm25' ? 'bg-[#27272a] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                PM2.5 (Fine Particulates)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('aqi')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'aqi' ? 'bg-[#27272a] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Composite AQI
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('pm10')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'pm10' ? 'bg-[#27272a] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                PM10
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('no2')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'no2' ? 'bg-[#27272a] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                NO2
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('o3')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeMetric === 'o3' ? 'bg-[#27272a] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Ozone (O3)
              </button>
            </div>

            <div className="text-xs text-neutral-400 font-mono flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
                GNN Corrected (Mean)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 bg-sky-500/20 border border-sky-400/40 inline-block rounded-xs"></span>
                Confidence Range (P10-P90)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-neutral-500 inline-block border-dashed"></span>
                CAMS Raw Physics
              </span>
            </div>
          </div>

          {/* 72-Hour Forecast Time-Series Chart */}
          <div className="h-64 sm:h-72 w-full bg-[#18181b] p-3 rounded-2xl border border-[#27272a]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  interval={5}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121316',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />

                {activeMetric === 'pm25' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="pm25_upper"
                      stroke="none"
                      fill="#38bdf8"
                      fillOpacity={0.15}
                      name="Confidence Upper"
                    />
                    <Area
                      type="monotone"
                      dataKey="pm25_lower"
                      stroke="none"
                      fill="#121316"
                      fillOpacity={1.0}
                      name="Confidence Lower"
                    />
                    <Line
                      type="monotone"
                      dataKey="cams_pm25"
                      stroke="#71717a"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      name="CAMS Baseline (µg/m³)"
                    />
                    <Line
                      type="monotone"
                      dataKey="pm25"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={false}
                      name="GNN Residual Corrected (µg/m³)"
                    />
                  </>
                )}

                {activeMetric === 'aqi' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="aqi_upper"
                      stroke="none"
                      fill="#f97316"
                      fillOpacity={0.18}
                      name="AQI Upper"
                    />
                    <Area
                      type="monotone"
                      dataKey="aqi_lower"
                      stroke="none"
                      fill="#121316"
                      fillOpacity={1.0}
                      name="AQI Lower"
                    />
                    <Line
                      type="monotone"
                      dataKey="cams_aqi"
                      stroke="#71717a"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      name="CAMS Baseline AQI"
                    />
                    <Line
                      type="monotone"
                      dataKey="aqi"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={false}
                      name="GNN Corrected AQI"
                    />
                  </>
                )}

                {activeMetric === 'pm10' && (
                  <Line
                    type="monotone"
                    dataKey="pm10"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={false}
                    name="PM10 (µg/m³)"
                  />
                )}

                {activeMetric === 'no2' && (
                  <Line
                    type="monotone"
                    dataKey="no2"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={false}
                    name="NO2 (µg/m³)"
                  />
                )}

                {activeMetric === 'o3' && (
                  <Line
                    type="monotone"
                    dataKey="o3"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="O3 (µg/m³)"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* CPCB Regulatory GRAP Action Plan */}
          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-400">warning</span>
                <span>Statutory GRAP Protocol Required:</span>
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-semibold ${grap.badgeColor}`}>
                {grap.stage}
              </span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              {grap.action}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
