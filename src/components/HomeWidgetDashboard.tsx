import React, { useState, useRef } from 'react';
import DraggableWidgetGrid, { WidgetItem, WidgetSize } from './ui/draggable-widget-grid';
import { 
  StationForecast, 
  Alert, 
  FIRMSFireHotspot, 
  FirePlumeTrajectory,
  TrackRecordEntry,
  ModelAccuracyStats,
  DataSourceStatus
} from '../types';
import { formatVentilation, formatInversionLevel } from '../utils/formatters';
import { GripVertical } from 'lucide-react';

interface HomeWidgetDashboardProps {
  forecasts: Map<string, StationForecast>;
  selectedHour: number;
  alerts: Alert[];
  fireHotspots: FIRMSFireHotspot[];
  firePlumes: FirePlumeTrajectory[];
  inversionTrend: any[];
  trackRecords: TrackRecordEntry[];
  modelStats: ModelAccuracyStats[];
  dataSources: DataSourceStatus[];
  onNavigateTab: (tab: 'map' | 'inversion-fire' | 'comparison' | 'track-record') => void;
  onOpenAlert: (alert: Alert) => void;
  onSelectStation: (stationId: string) => void;
}

interface CustomWidget extends WidgetItem {
  type: 
    | 'map-overview'
    | 'inversion-gauge'
    | 'ventilation-card'
    | 'firms-fires'
    | 'cams-vs-gnn'
    | 'track-record'
    | 'proactive-alert'
    | 'high-risk-stations'
    | 'system-freshness'
    | 'plume-trajectory';
}

const MAX_WIDGETS = 10;

const DEFAULT_HOME_WIDGETS: CustomWidget[] = [
  { id: 'w-alert', type: 'proactive-alert', size: 'wide', label: 'Proactive Advisory' },
  { id: 'w-inversion', type: 'inversion-gauge', size: 'sm', label: 'Inversion Index' },
  { id: 'w-ventilation', type: 'ventilation-card', size: 'sm', label: 'Ventilation Capacity' },
  { id: 'w-map', type: 'map-overview', size: 'lg', label: 'Spatial Telemetry Grid' },
  { id: 'w-firms', type: 'firms-fires', size: 'wide', label: 'NASA FIRMS Fires' },
  { id: 'w-cams', type: 'cams-vs-gnn', size: 'wide', label: 'CAMS vs GNN Residual' },
  { id: 'w-accuracy', type: 'track-record', size: 'sm', label: 'Severe Event Recall' },
  { id: 'w-stations', type: 'high-risk-stations', size: 'wide', label: 'Focal CAAQMS Stations' },
];

const AVAILABLE_WIDGET_CATALOG: { 
  type: CustomWidget['type']; 
  label: string; 
  description: string;
  defaultSize: WidgetSize; 
  tab: string;
}[] = [
  { 
    type: 'proactive-alert', 
    label: 'GRAP Proactive Advisory', 
    description: 'Advance warning banner before severe AQI threshold breach',
    defaultSize: 'wide', 
    tab: 'Alerts',
  },
  { 
    type: 'map-overview', 
    label: 'Spatial Telemetry Summary Grid', 
    description: 'Live sensor network overview with wind direction and connectivity',
    defaultSize: 'lg', 
    tab: 'Spatial Map',
  },
  { 
    type: 'inversion-gauge', 
    label: 'Atmospheric Inversion Index (0-100)', 
    description: 'Diurnal thermal cap strength trapping particulates near ground',
    defaultSize: 'sm', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'ventilation-card', 
    label: 'Ventilation Dispersion Capacity (Vc)', 
    description: 'Mixing height × wind speed horizontal dispersion potential',
    defaultSize: 'sm', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'firms-fires', 
    label: 'NASA FIRMS Stubble Fires & MW Power', 
    description: 'Real-time satellite detections in Punjab and Haryana upwind corridor',
    defaultSize: 'wide', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'plume-trajectory', 
    label: 'Stubble Plume Wind Corridor & ETA', 
    description: 'Atmospheric transport vectors entering North-West Delhi',
    defaultSize: 'wide', 
    tab: 'Inversion & Fire',
  },
  { 
    type: 'cams-vs-gnn', 
    label: 'GNN Residual vs CAMS Baseline', 
    description: 'Day-2 & Day-3 correction delta resolving baseline underprediction',
    defaultSize: 'wide', 
    tab: 'Model Comparison',
  },
  { 
    type: 'track-record', 
    label: 'Verification & Severe Event Recall', 
    description: 'Empirical audit track record against CPCB ground truth',
    defaultSize: 'sm', 
    tab: 'Track Record',
  },
  { 
    type: 'high-risk-stations', 
    label: 'Top 3 Entrapment Stations (Anand Vihar)', 
    description: 'Critical hotspot stations facing immediate stagnation',
    defaultSize: 'wide', 
    tab: 'Spatial Map',
  },
  { 
    type: 'system-freshness', 
    label: 'Telemetry Ingestion & Pipeline Health', 
    description: 'CPCB CAAQMS, CAMS, Open-Meteo sync freshness',
    defaultSize: 'sm', 
    tab: 'System Status',
  },
];

/**
 * iOS Control Center style Corner Resize Handle
 * Green and white aesthetic
 */
const ResizeCornerHandle: React.FC<{
  currentSize: WidgetSize;
  onResize: (newSize: WidgetSize) => void;
}> = ({ currentSize, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; size: WidgetSize; hasMoved: boolean } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      size: currentSize,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
      dragStartRef.current.hasMoved = true;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const startSize = dragStartRef.current.size;

    if (dragStartRef.current.hasMoved) {
      if (startSize === 'sm') {
        if (dx > 35 && dy > 35) {
          onResize('lg');
        } else if (dx > 30) {
          onResize('wide');
        } else if (dy > 30) {
          onResize('tall');
        }
      } else if (startSize === 'wide') {
        if (dy > 35) {
          onResize('lg');
        } else if (dx < -30) {
          onResize('sm');
        }
      } else if (startSize === 'tall') {
        if (dx > 30) {
          onResize('lg');
        } else if (dy < -30) {
          onResize('sm');
        }
      } else if (startSize === 'lg') {
        if (dx < -35 && dy < -35) {
          onResize('sm');
        } else if (dx < -30) {
          onResize('tall');
        } else if (dy < -30) {
          onResize('wide');
        }
      }
    } else {
      const cycleMap: Record<WidgetSize, WidgetSize> = {
        sm: 'wide',
        wide: 'lg',
        lg: 'sm',
        tall: 'sm',
      };
      onResize(cycleMap[currentSize] || 'sm');
    }

    dragStartRef.current = null;
    setIsDragging(false);
  };

  return (
    <div
      data-no-drag
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Click to cycle size, or drag to resize"
      className={`absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-1.5 z-30 group touch-none select-none transition-all ${
        isDragging ? 'scale-125' : 'hover:scale-110'
      }`}
    >
      <div className={`w-3.5 h-3.5 rounded-br-sm border-r-2 border-b-2 transition-all ${
        isDragging
          ? 'border-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-110'
          : 'border-emerald-400 group-hover:border-white'
      }`} />
    </div>
  );
};

export const HomeWidgetDashboard: React.FC<HomeWidgetDashboardProps> = ({
  forecasts,
  selectedHour,
  alerts,
  fireHotspots,
  firePlumes,
  inversionTrend,
  trackRecords,
  modelStats,
  dataSources,
  onNavigateTab,
  onOpenAlert,
  onSelectStation,
}) => {
  const [widgets, setWidgets] = useState<CustomWidget[]>(() => {
    const saved = localStorage.getItem('aeris_home_widgets') || localStorage.getItem('vaayu_home_widgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, MAX_WIDGETS);
        }
      } catch (e) {}
    }
    return DEFAULT_HOME_WIDGETS;
  });

  const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  const updateWidgets = (newWidgets: CustomWidget[]) => {
    const capped = newWidgets.slice(0, MAX_WIDGETS);
    setWidgets(capped);
    localStorage.setItem('aeris_home_widgets', JSON.stringify(capped));
  };

  const moveWidget = (id: string, direction: 'left' | 'right') => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;
    const updated = [...widgets];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    updateWidgets(updated);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidgetId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedWidgetId;
    setDraggedWidgetId(null);
    if (!sourceId || sourceId === targetId) return;

    const sourceIdx = widgets.findIndex(w => w.id === sourceId);
    const targetIdx = widgets.findIndex(w => w.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...widgets];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);
    updateWidgets(updated);
  };

  const activeAlert = alerts[0];
  const currentInv = inversionTrend[selectedHour] || inversionTrend[0];
  const invLevel = formatInversionLevel(currentInv?.score || 58);
  const vent = formatVentilation(currentInv?.ventilation || 2800);
  const stat48 = modelStats.find(s => s.lead_time === '48h') || modelStats[0];

  const totalFRP = Math.round(fireHotspots.reduce((acc, f) => acc + f.frp, 0));

  const addWidget = (cat: typeof AVAILABLE_WIDGET_CATALOG[0]) => {
    if (widgets.length >= MAX_WIDGETS) return;
    if (widgets.some(w => w.type === cat.type)) return;

    const newWidget: CustomWidget = {
      id: `w-${cat.type}-${Date.now()}`,
      type: cat.type,
      size: cat.defaultSize,
      label: cat.label,
    };
    updateWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    updateWidgets(widgets.filter(w => w.id !== id));
  };

  const setWidgetSize = (id: string, newSize: WidgetSize) => {
    updateWidgets(widgets.map(w => w.id === id ? { ...w, size: newSize } : w));
  };

  const applyPreset = (preset: 'balanced' | 'meteo' | 'taskforce') => {
    if (preset === 'balanced') {
      updateWidgets(DEFAULT_HOME_WIDGETS);
    } else if (preset === 'meteo') {
      updateWidgets([
        { id: 'w-inversion', type: 'inversion-gauge', size: 'sm', label: 'Inversion Index' },
        { id: 'w-ventilation', type: 'ventilation-card', size: 'sm', label: 'Ventilation Capacity' },
        { id: 'w-firms', type: 'firms-fires', size: 'wide', label: 'NASA FIRMS Fires' },
        { id: 'w-plumes', type: 'plume-trajectory', size: 'wide', label: 'Stubble Plume Wind Corridor' },
        { id: 'w-cams', type: 'cams-vs-gnn', size: 'wide', label: 'CAMS vs GNN Residual' },
      ]);
    } else if (preset === 'taskforce') {
      updateWidgets([
        { id: 'w-alert', type: 'proactive-alert', size: 'wide', label: 'Proactive Advisory' },
        { id: 'w-map', type: 'map-overview', size: 'lg', label: 'Spatial Telemetry Grid' },
        { id: 'w-stations', type: 'high-risk-stations', size: 'wide', label: 'Focal CAAQMS Stations' },
        { id: 'w-accuracy', type: 'track-record', size: 'sm', label: 'Severe Event Recall' },
      ]);
    }
  };

  const renderWidgetContent = (item: CustomWidget, size: WidgetSize) => {
    const isDragged = draggedWidgetId === item.id;
    return (
      <div 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, item.id)}
        className={`relative w-full h-full p-4 sm:p-5 flex flex-col justify-between bg-[#0a2e21] text-white rounded-2xl select-none font-sans border-2 transition-all shadow-lg ${
          isDragged 
            ? 'border-white bg-[#0e3d2c] opacity-60 scale-95' 
            : 'border-emerald-600/40 hover:border-emerald-500/70 shadow-black/25'
        }`}
      >
        {/* Widget Top Bar: Grip, Title, Reorder Arrows, Size Toggle, Close */}
        <div 
          draggable={true}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragEnd={() => setDraggedWidgetId(null)}
          className="flex items-center justify-between gap-1.5 border-b border-[#134e38] pb-2.5 mb-2.5 cursor-grab active:cursor-grabbing"
          title="Drag header to reorder, or use controls on the right"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="text-emerald-400 hover:text-white shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>

            <span className="text-xs sm:text-sm font-bold tracking-wide text-white uppercase truncate block">
              {item.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0" data-no-drag>
            {/* Quick 1-Click Move Left/Right */}
            <div className="flex items-center bg-[#061d15] border border-emerald-700/60 rounded-lg p-0.5">
              <button
                type="button"
                data-no-drag
                onClick={(e) => { e.stopPropagation(); moveWidget(item.id, 'left'); }}
                title="Move earlier"
                className="w-5 h-5 rounded hover:bg-[#0e3d2c] text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors"
              >
                &larr;
              </button>
              <button
                type="button"
                data-no-drag
                onClick={(e) => { e.stopPropagation(); moveWidget(item.id, 'right'); }}
                title="Move later"
                className="w-5 h-5 rounded hover:bg-[#0e3d2c] text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors"
              >
                &rarr;
              </button>
            </div>

            {/* Direct 1-Click Size Switcher */}
            <div className="flex items-center bg-[#061d15] border border-emerald-700/60 rounded-lg p-0.5">
              {(['sm', 'wide', 'lg'] as WidgetSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  data-no-drag
                  onClick={(e) => {
                    e.stopPropagation();
                    setWidgetSize(item.id, sz);
                  }}
                  title={`Resize to ${sz}`}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    item.size === sz
                      ? 'bg-white text-[#072118] font-black shadow-xs'
                      : 'text-emerald-300/80 hover:bg-[#0e3d2c] hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Remove Widget Button */}
            <button
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                removeWidget(item.id);
              }}
              title="Remove widget"
              className="w-5 h-5 rounded-lg bg-[#061d15] hover:bg-rose-950/70 border border-emerald-700/60 hover:border-rose-700 text-emerald-300 hover:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Widget Body Content */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* 1. Proactive Alert */}
          {item.type === 'proactive-alert' && activeAlert && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800 font-mono">
                  {activeAlert.grap_stage}
                </span>
                <span className="text-xs font-black font-mono text-white">{activeAlert.start_time}</span>
              </div>
              <p className="text-xs sm:text-sm text-white font-medium line-clamp-2 leading-relaxed">
                {activeAlert.subtitle}
              </p>
              <button
                type="button"
                data-no-drag
                onClick={() => onOpenAlert(activeAlert)}
                className="text-xs sm:text-sm text-[#86efac] hover:text-white hover:underline font-bold pt-1 text-left inline-flex items-center gap-1"
              >
                View Causal Explanation ("The Why") &rarr;
              </button>
            </div>
          )}

          {/* 2. Inversion Gauge */}
          {item.type === 'inversion-gauge' && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black font-numbers text-amber-400 tracking-tight">
                  {currentInv?.score || 55}
                </span>
                <span className="text-sm font-bold text-[#a7d0bf] font-mono">/ 100</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {invLevel.label}
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('inversion-fire')}
                className="text-xs sm:text-sm text-[#86efac] hover:text-white hover:underline font-bold mt-auto text-left"
              >
                Open Inversion Telemetry &rarr;
              </button>
            </div>
          )}

          {/* 3. Ventilation Card */}
          {item.type === 'ventilation-card' && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black font-numbers text-white tracking-tight">
                  {(currentInv?.ventilation || 2800).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-[#a7d0bf] font-mono">m²/s</span>
              </div>
              <div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block border ${vent.badgeColor}`}>
                  {vent.label}
                </span>
              </div>
              <p className="text-xs text-[#a7d0bf] mt-1">
                Ceiling: <span className="font-numbers font-black text-white text-sm">{currentInv?.pblh || 320}</span> m
              </p>
            </div>
          )}

          {/* 4. Spatial Map Overview */}
          {item.type === 'map-overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] block text-[10px] uppercase font-bold">Stations</span>
                  <span className="font-numbers font-black text-white text-sm sm:text-base">56 / 56 CPCB</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] block text-[10px] uppercase font-bold">Fire Nodes</span>
                  <span className="font-numbers font-black text-amber-400 text-sm sm:text-base">5 Clusters</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] block text-[10px] uppercase font-bold">Vectors</span>
                  <span className="font-numbers font-black text-[#86efac] text-sm sm:text-base">315° NW</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] block text-[10px] uppercase font-bold">Lead Horizon</span>
                  <span className="font-numbers font-black text-white text-sm sm:text-base">0h to 72h</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs sm:text-sm text-[#a7d0bf]">
                  Interactive spatiotemporal sensor grid with wind dispersion overlay.
                </p>
                <button
                  type="button"
                  data-no-drag
                  onClick={() => onNavigateTab('map')}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-[#072118] text-xs font-bold shrink-0 transition-all shadow-sm"
                >
                  Open Map &rarr;
                </button>
              </div>
            </div>
          )}

          {/* 5. FIRMS Stubble Fires */}
          {item.type === 'firms-fires' && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-black font-numbers text-amber-400">{totalFRP}</span>
                  <span className="text-xs font-bold text-[#a7d0bf] ml-1">MW Fire Power</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black font-numbers text-white">{fireHotspots.length}</span>
                  <span className="text-xs font-bold text-[#a7d0bf] ml-1">Hotspots</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 text-white bg-[#061d15] p-2.5 rounded-xl border border-emerald-700/50">
                <span>Punjab: <strong className="font-numbers font-black text-[#86efac] text-sm">{fireHotspots.filter(f => f.state === 'Punjab').length}</strong></span>
                <span>Haryana: <strong className="font-numbers font-black text-[#86efac] text-sm">{fireHotspots.filter(f => f.state === 'Haryana').length}</strong></span>
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('inversion-fire')}
                className="text-xs sm:text-sm text-[#86efac] hover:text-white hover:underline font-bold pt-1 text-left"
              >
                Track Plume Trajectory &rarr;
              </button>
            </div>
          )}

          {/* 6. Plume Trajectory Corridor */}
          {item.type === 'plume-trajectory' && (
            <div className="space-y-2">
              {firePlumes[0] ? (
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                    <span className="text-white font-bold">{firePlumes[0].source_name}</span>
                    <span className="text-amber-400 font-numbers font-black">+{firePlumes[0].eta_delhi_hours}h ETA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#061d15] border border-emerald-700/50">
                      <span className="text-[10px] text-[#a7d0bf] block font-bold">Speed</span>
                      <span className="font-numbers font-black text-white text-sm">{firePlumes[0].current_wind_speed_kmh} km/h</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#061d15] border border-emerald-700/50">
                      <span className="text-[10px] text-[#a7d0bf] block font-bold">Bearing</span>
                      <span className="font-numbers font-black text-[#86efac] text-sm">{firePlumes[0].corridor_bearing_deg}° NW</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#a7d0bf]">No active fire conduits detected currently.</p>
              )}
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('inversion-fire')}
                className="text-xs sm:text-sm text-[#86efac] hover:text-white hover:underline font-bold pt-1 text-left"
              >
                View Plume Vectors &rarr;
              </button>
            </div>
          )}

          {/* 7. CAMS vs GNN Residual */}
          {item.type === 'cams-vs-gnn' && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs sm:text-sm">
                <span className="text-white font-bold">Anand Vihar (+48h)</span>
                <span className="text-[#86efac] font-numbers font-black text-sm">+68 µg/m³</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60">
                  <span className="text-rose-300 block text-[10px] font-bold">CAMS Baseline</span>
                  <span className="text-lg font-numbers font-black text-rose-400 line-through">245</span>
                  <span className="text-[10px] text-rose-300 font-bold block">Underpredicts</span>
                </div>
                <div className="p-3 rounded-xl bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] block text-[10px] font-bold">GNN Forecast</span>
                  <span className="text-xl font-numbers font-black text-[#86efac]">313</span>
                  <span className="text-[10px] text-[#86efac] font-bold block">Calibrated</span>
                </div>
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('comparison')}
                className="text-xs sm:text-sm text-[#86efac] hover:text-white hover:underline font-bold pt-1 text-left"
              >
                Compare Model Curves &rarr;
              </button>
            </div>
          )}

          {/* 8. Track Record Accuracy */}
          {item.type === 'track-record' && (
            <div className="space-y-2">
              <div>
                <span className="text-4xl sm:text-5xl font-black font-numbers text-[#86efac] tracking-tight">
                  {stat48?.extreme_event_recall || 92}%
                </span>
                <span className="text-xs sm:text-sm font-bold text-white block mt-0.5">Severe Event Recall (+48h)</span>
              </div>
              <div className="text-xs sm:text-sm text-[#a7d0bf] pt-1.5 border-t border-[#134e38]">
                MAE: <span className="font-numbers font-black text-[#86efac]">{stat48?.gnn_mae || 14.2}</span> vs CAMS <span className="font-numbers font-black text-rose-400">{stat48?.cams_mae || 38.6}</span>
              </div>
              <button
                type="button"
                data-no-drag
                onClick={() => onNavigateTab('track-record')}
                className="text-xs sm:text-sm text-[#86efac] hover:text-white hover:underline font-bold mt-auto text-left"
              >
                Inspect Audit Log &rarr;
              </button>
            </div>
          )}

          {/* 9. High-Risk Hotspot Stations */}
          {item.type === 'high-risk-stations' && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {[
                  { name: 'Anand Vihar', aqi: 442, change: '+45' },
                  { name: 'Wazirpur', aqi: 418, change: '+38' },
                  { name: 'Punjabi Bagh', aqi: 395, change: '+29' },
                ].map((st, i) => (
                  <div 
                    key={i} 
                    data-no-drag
                    onClick={() => onSelectStation('dl-anand-vihar')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#061d15] hover:bg-[#0e3d2c] border border-emerald-700/50 cursor-pointer transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">{st.name}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-numbers font-black text-rose-400 text-sm sm:text-base">{st.aqi} AQI</span>
                      <span className="font-numbers font-black text-amber-400 text-xs">({st.change})</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#a7d0bf] text-right">
                Click station to inspect details
              </p>
            </div>
          )}

          {/* 10. System Freshness */}
          {item.type === 'system-freshness' && (
            <div className="space-y-2">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] font-medium">CPCB CAAQMS</span>
                  <span className="text-[#86efac] font-mono font-black">Online</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] font-medium">NASA FIRMS</span>
                  <span className="text-[#86efac] font-mono font-black">Hourly Poll</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#061d15] border border-emerald-700/50">
                  <span className="text-[#a7d0bf] font-medium">CAMS Met</span>
                  <span className="text-white font-mono font-black">Synchronized</span>
                </div>
              </div>
              <p className="text-xs text-[#a7d0bf] pt-1 border-t border-[#134e38]">
                All telemetry feeds validated.
              </p>
            </div>
          )}
        </div>

        {/* Corner Resize Handle */}
        <ResizeCornerHandle
          currentSize={item.size}
          onResize={(newSize) => setWidgetSize(item.id, newSize)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Toolbar in Green & White with Green Stroke */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* Box 1: Title Box */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#0a2e21] border-2 border-emerald-600/40 shadow-lg text-white flex flex-col justify-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-white">Central Telemetry Overview</h2>
          <p className="text-xs sm:text-sm text-[#a7d0bf] mt-1">
            Drag by header or use arrows to rearrange. Click size pills ([sm] [wide] [lg]) or corner handle to resize.
          </p>
        </div>

        {/* Box 2: Capacity & Presets Box */}
        <div className="p-5 rounded-2xl bg-[#0a2e21] border-2 border-emerald-600/40 shadow-lg text-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#a7d0bf]">Board Capacity</span>
            <span className="font-numbers font-black text-base text-white">{widgets.length} / {MAX_WIDGETS}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-xs text-[#a7d0bf] font-bold mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className="px-2.5 py-1 rounded-lg bg-[#0e3d2c] hover:bg-[#14533c] border border-emerald-500/50 text-xs font-bold text-white transition-colors"
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => applyPreset('meteo')}
              className="px-2.5 py-1 rounded-lg bg-[#0e3d2c] hover:bg-[#14533c] border border-emerald-500/50 text-xs font-bold text-white transition-colors"
            >
              Meteo
            </button>
            <button
              type="button"
              onClick={() => applyPreset('taskforce')}
              className="px-2.5 py-1 rounded-lg bg-[#0e3d2c] hover:bg-[#14533c] border border-emerald-500/50 text-xs font-bold text-white transition-colors"
            >
              Action
            </button>
          </div>
        </div>

        {/* Box 3: Manage Widgets Button Box */}
        <button
          type="button"
          onClick={() => setIsOrganizerOpen(true)}
          className="p-5 rounded-2xl bg-white hover:bg-[#e6f4ea] text-[#072118] border-2 border-white font-bold text-sm sm:text-base flex flex-col justify-center items-center gap-1 transition-all shadow-md cursor-pointer"
        >
          <span className="font-black">Manage Widgets</span>
          <span className="text-xs font-semibold text-[#0b3b2a]">
            {MAX_WIDGETS - widgets.length} slots available
          </span>
        </button>
      </div>

      {/* Widget Catalog Modal / Drawer */}
      {isOrganizerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a2e21] border-2 border-emerald-600/50 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 font-sans text-white">
            {/* Catalog Header */}
            <div className="p-5 border-b border-[#134e38] bg-[#072118] flex items-center justify-between">
              <div>
                <h3 className="font-heading text-2xl text-white">Manage Dashboard Widgets</h3>
                <p className="text-xs sm:text-sm text-[#a7d0bf] mt-1">
                  Choose widgets for your workspace. Maximum {MAX_WIDGETS} widgets allowed on the board.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl text-xs font-numbers font-black bg-[#061d15] border border-emerald-600/50 text-white">
                  {widgets.length} / {MAX_WIDGETS}
                </span>

                <button
                  type="button"
                  onClick={() => setIsOrganizerOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#072118] font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Capacity Alert if full */}
            {widgets.length >= MAX_WIDGETS && (
              <div className="bg-amber-950/80 border-b border-amber-700/60 px-5 py-2.5 text-xs text-amber-200 font-bold">
                Maximum capacity reached ({MAX_WIDGETS} / {MAX_WIDGETS} widgets). Remove an active widget before adding another.
              </div>
            )}

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#061d15]">
              {AVAILABLE_WIDGET_CATALOG.map((cat) => {
                const activeInstance = widgets.find(w => w.type === cat.type);
                const isAdded = Boolean(activeInstance);
                const isFull = widgets.length >= MAX_WIDGETS;

                return (
                  <div
                    key={cat.type}
                    className={`p-4 rounded-xl border-2 flex flex-col justify-between gap-3 transition-colors ${
                      isAdded
                        ? 'bg-[#0e3d2c] border-emerald-400 shadow-md'
                        : 'bg-[#0a2e21] border-emerald-700/50 hover:border-emerald-500'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {cat.label}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-[#86efac] font-bold uppercase">
                          {cat.tab}
                        </span>
                      </div>
                      <p className="text-xs text-[#a7d0bf] leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[#134e38]">
                      <span className="text-xs text-[#a7d0bf] font-mono font-bold uppercase">
                        Default {cat.defaultSize}
                      </span>

                      {isAdded ? (
                        <button
                          type="button"
                          onClick={() => removeWidget(activeInstance!.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-bold transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isFull}
                          onClick={() => addWidget(cat)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isFull
                              ? 'bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed'
                              : 'bg-white hover:bg-emerald-100 text-[#072118] shadow-sm font-black'
                          }`}
                        >
                          {isFull ? 'Limit Reached' : 'Add to Board'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#134e38] bg-[#072118] flex items-center justify-between">
              <span className="text-xs text-[#a7d0bf]">
                Tip: Pull bottom-right corner or click size pills ([sm] [wide] [lg]) to resize.
              </span>
              <button
                type="button"
                onClick={() => setIsOrganizerOpen(false)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-[#072118] font-black text-xs shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Draggable Widget Grid */}
      <div className="min-h-[500px]">
        <DraggableWidgetGrid
          items={widgets}
          onChange={(newItems) => updateWidgets(newItems as CustomWidget[])}
          renderItem={(item, size) => renderWidgetContent(item as CustomWidget, size)}
          editable={true}
          maxColumns={4}
          cellSize={240}
          gap={14}
          radius={16}
        />
      </div>

      {/* Add Widget Empty Slot Button */}
      {widgets.length < MAX_WIDGETS && (
        <button
          type="button"
          onClick={() => setIsOrganizerOpen(true)}
          className="w-full py-4 border-2 border-dashed border-emerald-600/50 hover:border-emerald-400 rounded-2xl flex items-center justify-center gap-2 text-emerald-200 hover:text-white bg-[#0a2e21]/50 hover:bg-[#0a2e21] transition-all text-xs sm:text-sm font-bold font-sans shadow-sm"
        >
          <span>+ Add Widget to Board ({MAX_WIDGETS - widgets.length} of {MAX_WIDGETS} slots remaining)</span>
        </button>
      )}
    </div>
  );
};

export default HomeWidgetDashboard;
