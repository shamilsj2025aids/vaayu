import React, { useState } from 'react';
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

  const todayHour = hours[0] || hours[0];
  const tomorrowHour = hours[24] || hours[0];
  const day3Hour = hours[48] || hours[0];

  const days = [
    {
      label: 'Today',
      date: 'Live Telemetry',
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
      <div className="bg-[#121316] p-6 rounded-2xl border border-[#27272a] shadow-lg space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Air Quality for You & Your Family</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
              Citizen Advisory
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            72-hour plain language forecast powered by VAAYU physics + GNN intelligence
          </p>
        </div>

        {/* Search Bar & Quick Area Chips */}
        <div className="space-y-2.5">
          <div className="relative">
            <span className="material-symbols-outlined text-neutral-400 text-lg absolute left-3.5 top-2.5">search</span>
            <input
              type="text"
              placeholder="Search your neighborhood (e.g. Anand Vihar, Rohini, Dwarka, Noida, Gurugram)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick Select Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-400 mr-1">Popular:</span>
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
                type="button"
                onClick={() => {
                  setSelectedStationId(chip.id);
                  setSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedStationId === chip.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-[#18181b] text-neutral-300 border border-[#27272a] hover:border-neutral-700'
                }`}
              >
                {chip.name}
              </button>
            ))}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
              {filteredStations.length === 0 ? (
                <div className="text-xs text-neutral-400 p-2">No monitoring station found.</div>
              ) : (
                filteredStations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedStationId(st.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-neutral-200 hover:bg-[#27272a] flex items-center justify-between"
                  >
                    <span>{st.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{st.city} ({st.zone})</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Air Status Card */}
      <div className="p-6 sm:p-7 rounded-2xl border border-[#27272a] shadow-xl relative overflow-hidden bg-[#121316]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-sky-400">location_on</span>
              <h3 className="text-lg font-bold text-white">
                {currentForecast.station.name}
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                ({currentForecast.station.city})
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
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getAQIBadgeClass(currentCategory)}`}>
                  {currentCategory} Air
                </span>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Confidence: {formatConfidenceRange(todayHour.aqi)} AQI
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed pt-1">
              {getAQIDescription(currentCategory)}
            </p>
          </div>

          <div className="sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowDetailedNumbers(!showDetailedNumbers)}
              className="px-4 py-2 rounded-xl bg-[#18181b] hover:bg-[#202127] border border-[#27272a] text-xs text-neutral-200 font-medium transition-colors"
            >
              {showDetailedNumbers ? 'Hide Detailed Numbers' : 'Show Chemical Readings'}
            </button>
          </div>
        </div>

        {/* Expandable Exact Numbers */}
        {showDetailedNumbers && (
          <div className="mt-5 pt-4 border-t border-[#27272a] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-neutral-400 block text-[10px]">PM2.5 (Fine dust)</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(todayHour.pm25.mean)} µg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-neutral-400 block text-[10px]">PM10 (Coarse dust)</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(todayHour.pm10.mean)} µg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-neutral-400 block text-[10px]">NO2 (Traffic exhaust)</span>
              <span className="text-base font-bold font-mono text-white">
                {Math.round(todayHour.no2.mean)} µg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <span className="text-neutral-400 block text-[10px]">Ventilation Capacity</span>
              <span className="text-base font-bold font-mono text-white">
                {todayHour.physics.ventilation_coefficient.toLocaleString()} m²/s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3-Day Outlook */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sky-400 text-base">calendar_month</span>
          <span>Next 3 Days Outlook: What to Expect</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {days.map((day, idx) => {
            const aqiVal = day.hourData.aqi.mean;
            const cat = day.hourData.category;
            return (
              <div 
                key={idx}
                className="bg-[#121316] p-5 rounded-2xl border border-[#27272a] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-2.5">
                    <span className="font-bold text-white text-xs">{day.label}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">{day.date}</span>
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

                  <p className="text-xs text-neutral-200 leading-snug font-medium mb-2">
                    "{day.headline}"
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[11px] text-neutral-300">
                  <strong className="text-amber-400 block mb-0.5">Recommendation:</strong>
                  {day.advice}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health & Lifestyle Recommendations Layer */}
      <div className="bg-[#121316] p-6 rounded-2xl border border-[#27272a] space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
          <span className="material-symbols-outlined text-rose-400 text-base">favorite</span>
          <span>Health & Daily Lifestyle Guidance</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-sky-400">masks</span>
              <span>Mask Mandatory?</span>
            </span>
            <p className="text-neutral-300">
              <strong className="text-rose-400">Yes, N95 / FFP2 mandatory</strong> for any transit exceeding 15 minutes outdoors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-amber-400">directions_run</span>
              <span>Outdoor Exercise?</span>
            </span>
            <p className="text-neutral-300">
              <strong className="text-rose-400">Avoid morning jogs.</strong> Nocturnal inversion concentrates poison near ground until 11 AM.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-sky-400">window</span>
              <span>Windows Open?</span>
            </span>
            <p className="text-neutral-300">
              <strong className="text-amber-400">Keep windows sealed shut.</strong> Run HEPA air cleaners on medium-high in sleeping quarters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-emerald-400">family_restroom</span>
              <span>Children & Seniors</span>
            </span>
            <p className="text-neutral-300">
              Strict indoor stay recommended. Ensure inhalers and bronchodilators are stocked and accessible.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Alert Notification Simulator */}
      <div className="bg-[#121316] p-6 rounded-2xl border border-[#27272a] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-400 text-base">notifications</span>
              <span>Proactive Citizen Alert Notification</span>
            </h4>
            <p className="text-xs text-neutral-400">
              Get notified automatically if air quality near <strong className="text-neutral-200">{currentForecast.station.name}</strong> is forecast to cross your threshold in the next 3 days.
            </p>
          </div>

          <form onSubmit={handleNotifySubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-[#18181b] px-3 py-1.5 rounded-xl border border-[#27272a] text-xs">
              <span className="text-neutral-400">Threshold:</span>
              <input
                type="number"
                min={100}
                max={500}
                step={25}
                value={notifyThreshold}
                onChange={(e) => setNotifyThreshold(Number(e.target.value))}
                className="w-16 bg-[#27272a] rounded px-1.5 py-0.5 text-center font-mono font-bold text-white focus:outline-none"
              />
              <span className="text-neutral-400">AQI</span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-sm transition-all shrink-0"
            >
              Set Alert
            </button>
          </form>
        </div>

        {notificationConfigured && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
            <span>
              Notification active! You will be alerted 24 hours prior if {currentForecast.station.name} breaches AQI {notifyThreshold}.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
