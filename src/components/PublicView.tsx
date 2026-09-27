import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  Wind, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Calendar,
  Sparkles,
  Heart,
  ChevronRight,
  Info
} from 'lucide-react';
import { StationForecast } from '../types';
import { DELHI_NCR_STATIONS } from '../data/stations';
import { getAQIColor, getAQICategory, getAQIBadgeClass, getAQIDescription } from '../utils/aqi';
import { formatConfidenceRange } from '../utils/formatters';

interface PublicViewProps {
  forecasts: Map<string, StationForecast>;
}

export const PublicView: React.FC<PublicViewProps> = ({ forecasts }) => {
  const [selectedStationId, setSelectedStationId] = useState<string>('dl-anand-vihar');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifyThreshold, setNotifyThreshold] = useState<number>(300);
  const [notificationConfigured, setNotificationConfigured] = useState(false);
  const [showDetailedNumbers, setShowDetailedNumbers] = useState(false);

  // Filter stations by search
  const filteredStations = DELHI_NCR_STATIONS.filter(
    (s) =>
      !s.isBoundaryNode &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.zone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentForecast = forecasts.get(selectedStationId) || Array.from(forecasts.values())[0];
  const hours = currentForecast?.hours || [];

  // Derive 3 days summary: Today (0h-24h), Tomorrow (+24h to +48h), Day 3 (+48h to +72h)
  const todayHour = hours[0] || hours[0];
  const tomorrowHour = hours[24] || hours[0];
  const day3Hour = hours[48] || hours[0];

  const days = [
    {
      label: 'Today',
      date: 'Live Now',
      hourData: todayHour,
      headline: todayHour.aqi.mean > 350 
        ? 'Severe smog layer trapping particulates across the area.'
        : 'Poor to Very Poor air quality; morning haze persists.',
      advice: 'Avoid morning outdoor exercise; wear N95 mask outdoors.',
    },
    {
      label: 'Tomorrow (Day 2)',
      date: '+24h Forecast',
      hourData: tomorrowHour,
      headline: tomorrowHour.aqi.mean > todayHour.aqi.mean
        ? 'Air quality expected to worsen sharply Thursday — stagnant winds incoming.'
        : 'Marginal ventilation improvement expected by late afternoon.',
      advice: 'Keep windows firmly closed in early morning/evening; run indoor air purifier.',
    },
    {
      label: 'Day 3',
      date: '+48h Forecast',
      hourData: day3Hour,
      headline: day3Hour.aqi.mean >= 400
        ? 'Critical thermal inversion ceiling: hazardous particulate entrapment.'
        : 'High particulate index continues under calm surface conditions.',
      advice: 'Vulnerable individuals, seniors, and children should remain strictly indoors.',
    },
  ];

  const currentAQI = todayHour.aqi.mean;
  const currentCategory = todayHour.category;

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationConfigured(true);
    setTimeout(() => setNotificationConfigured(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Area Search */}
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Air Quality for You & Your Family</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Citizen Advisory
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            72-hour plain language forecast powered by VAAYU physics + GNN intelligence
          </p>
        </div>

        {/* Search Bar & Quick Area Chips */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search your neighborhood (e.g., Anand Vihar, Rohini, Dwarka, Noida, Gurugram)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick Select Popular Neighborhood Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
            {[
              { id: 'dl-anand-vihar', name: 'Anand Vihar' },
              { id: 'dl-ito', name: 'Central Delhi (ITO)' },
              { id: 'dl-rohini', name: 'Rohini' },
              { id: 'dl-dwarka-sec8', name: 'Dwarka' },
              { id: 'noida-sec62', name: 'Noida Sec 62' },
              { id: 'ggn-sec51', name: 'Gurugram' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  setSelectedStationId(chip.id);
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedStationId === chip.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>

          {/* Search Results Dropdown if user searched */}
          {searchQuery && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
              {filteredStations.length === 0 ? (
                <div className="text-xs text-slate-400 p-2">No monitoring station found.</div>
              ) : (
                filteredStations.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStationId(st.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{st.city} ({st.zone})</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Big Current Air Status Card */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden bg-gradient-to-br from-surface via-slate-900 to-surface-elevated"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <h3 className="text-xl font-bold text-white">
                {currentForecast.station.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {currentForecast.station.city}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span 
                className="text-4xl sm:text-5xl font-extrabold font-mono"
                style={{ color: getAQIColor(currentAQI) }}
              >
                {Math.round(currentAQI)}
              </span>
              <div>
                <span className={`text-sm px-2.5 py-0.5 rounded-full font-bold ${getAQIBadgeClass(currentCategory)}`}>
                  {currentCategory} Air
                </span>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Confidence: {formatConfidenceRange(todayHour.aqi)} AQI
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed pt-1">
              {getAQIDescription(currentCategory)}
            </p>
          </div>

          {/* Toggle Raw Scientific Data Button */}
          <div className="sm:self-center shrink-0">
            <button
              onClick={() => setShowDetailedNumbers(!showDetailedNumbers)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
            >
              {showDetailedNumbers ? 'Hide Detailed Numbers' : 'Show Chemical Readings'}
            </button>
          </div>
        </div>

        {/* Expandable Exact Numbers */}
        {showDetailedNumbers && (
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PM2.5 (Fine dust)</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(todayHour.pm25.mean)} µg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PM10 (Coarse dust)</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(todayHour.pm10.mean)} µg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">NO2 (Traffic exhaust)</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(todayHour.no2.mean)} µg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Ventilation Capacity</span>
              <span className="text-base font-bold font-mono text-white">
                {todayHour.physics.ventilation_coefficient.toLocaleString()} m²/s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3-Day Plain-Language Outlook */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          Next 3 Days Outlook: What to Expect
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {days.map((day, idx) => {
            const aqiVal = day.hourData.aqi.mean;
            const cat = day.hourData.category;
            return (
              <div 
                key={idx}
                className="bg-surface p-5 rounded-2xl border border-border flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2.5">
                    <span className="font-bold text-white text-xs">{day.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{day.date}</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span 
                      className="text-2xl font-bold font-mono"
                      style={{ color: getAQIColor(aqiVal) }}
                    >
                      {Math.round(aqiVal)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${getAQIBadgeClass(cat)}`}>
                      {cat}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-snug font-medium mb-2">
                    "{day.headline}"
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-amber-400 block mb-0.5">Recommendation:</strong>
                  {day.advice}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health & Lifestyle Recommendations Layer */}
      <div className="bg-surface p-6 rounded-3xl border border-border space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          Health & Daily Lifestyle Guidance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Mask Guide */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>😷 Mask Needed?</span>
            </span>
            <p className="text-slate-300">
              <strong className="text-rose-400">Yes, N95 / FFP2 mandatory</strong> for any transit exceeding 15 minutes outdoors. Cloth masks do not filter PM2.5.
            </p>
          </div>

          {/* Outdoor Exercise */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>🏃 Outdoor Exercise?</span>
            </span>
            <p className="text-slate-300">
              <strong className="text-rose-400">Avoid morning/evening jogs.</strong> Nocturnal inversion concentrates poison near ground until 11 AM.
            </p>
          </div>

          {/* Windows & Air Purifiers */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>🪟 Windows Open?</span>
            </span>
            <p className="text-slate-300">
              <strong className="text-amber-400">Keep windows sealed shut.</strong> Run HEPA air cleaners on medium-high in sleeping quarters.
            </p>
          </div>

          {/* Vulnerable Groups */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>👶 Children & Seniors</span>
            </span>
            <p className="text-slate-300">
              Strict indoor stay recommended. Ensure asthma inhalers and bronchodilators are stocked and accessible.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Alert Notification Simulator */}
      <div className="bg-gradient-to-r from-slate-900 via-surface to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              Proactive Citizen Alert Notification
            </h4>
            <p className="text-xs text-slate-400">
              Get notified automatically if air quality near <strong className="text-slate-200">{currentForecast.station.name}</strong> is forecast to cross your threshold in the next 3 days.
            </p>
          </div>

          <form onSubmit={handleNotifySubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Threshold:</span>
              <input
                type="number"
                min={100}
                max={500}
                step={25}
                value={notifyThreshold}
                onChange={(e) => setNotifyThreshold(Number(e.target.value))}
                className="w-16 bg-slate-800 rounded px-1.5 py-0.5 text-center font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="text-slate-400">AQI</span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md shadow-sky-600/30 transition-all shrink-0"
            >
              Set Alert
            </button>
          </form>
        </div>

        {notificationConfigured && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Simulated notification active! You will be alerted 24 hours prior if {currentForecast.station.name} breaches AQI {notifyThreshold}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
