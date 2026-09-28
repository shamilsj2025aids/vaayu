import React, { useState } from 'react';
import { Alert } from '../types';
import TabsDemo from '@/components/ui/tabs-10';
import { AgentAvatar } from '@/components/ui/agent-avatar';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  initialTab?: 'why' | 'chat';
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ 
  alert, 
  onClose,
  initialTab = 'chat'
}) => {
  if (!alert) return null;

  const { causal_drivers } = alert;
  const [activeTab, setActiveTab] = useState<'why' | 'chat'>(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div 
        className="bg-[#0a2e21] border-2 border-emerald-600/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Mode Tabs */}
        <div className="px-5 py-4 border-b border-[#134e38] bg-[#072118] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 text-white">
          <div className="flex items-center gap-3">
            {/* The Researcher Avatar */}
            <AgentAvatar name="researcher" size={44} pulse showBadge />

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl text-white font-bold flex items-center gap-1.5"><span className="font-vaayu text-2xl font-normal tracking-wider">VAAYU</span><span>AI Researcher</span></h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {alert.grap_stage}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0e3d2c] text-emerald-300 border border-emerald-600/50 font-mono font-bold">
                  agent: researcher
                </span>
              </div>
              <p className="text-xs text-[#a7d0bf] mt-0.5 font-sans">
                {alert.title} • Lead Time: <span className="font-numbers text-amber-400 font-bold">+{alert.lead_time_hours}h</span>
              </p>
            </div>
          </div>

          {/* Tab Switcher: The "Why" vs Chatbot */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center bg-[#061d15] border border-emerald-700/60 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-white text-[#072118] shadow-sm font-bold'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                AI Chatbot Agent
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('why')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeTab === 'why'
                    ? 'bg-white text-[#072118] shadow-sm font-bold'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                Causal Evidence ("The Why")
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#0e3d2c] text-emerald-100 hover:text-white hover:bg-[#14533c] border border-emerald-600/50 transition-colors cursor-pointer"
              title="Close Dialog"
            >
              <span className="text-base font-bold leading-none px-1">&times;</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-6 bg-[#0a2e21] text-white">
          {/* TAB 1: AI CHATBOT INTERFACE */}
          {activeTab === 'chat' && (
            <div className="w-full flex justify-center py-1">
              <TabsDemo alert={alert} className="w-full" />
            </div>
          )}

          {/* TAB 2: ALL THE INFORMATION WITHIN "THE WHY" */}
          {activeTab === 'why' && (
            <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs font-sans">
              {/* Executive Diagnostic Summary */}
              <div className="p-4 rounded-xl bg-[#061d15] border border-emerald-700/50 space-y-1.5 text-white">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                  Executive Physical & GNN Residual Explanation
                </h3>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {causal_drivers.narrative}
                </p>
              </div>

              {/* Coupled Physics Feature Diagnostics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 text-white">
                  <span className="text-[#a7d0bf] block text-[10px] font-bold uppercase">PBL Height Drop</span>
                  <div className="text-xl font-numbers text-rose-600 mt-1">
                    -{causal_drivers.pblh_drop}m
                  </div>
                  <p className="text-[10px] text-[#a7d0bf] mt-0.5">
                    Trapping below 220m ceiling
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 text-white">
                  <span className="text-[#a7d0bf] block text-[10px] font-bold uppercase">Surface Wind</span>
                  <div className="text-xl font-numbers text-amber-600 mt-1">
                    {causal_drivers.wind_speed} m/s
                  </div>
                  <p className="text-[10px] text-[#a7d0bf] mt-0.5">
                    Calm stagnation collapse
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 text-white">
                  <span className="text-[#a7d0bf] block text-[10px] font-bold uppercase">Inversion Index</span>
                  <div className="text-xl font-numbers text-emerald-800 mt-1">
                    {causal_drivers.inversion_index}/100
                  </div>
                  <p className="text-[10px] text-[#a7d0bf] mt-0.5">
                    Thermal ceiling cap
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 text-white">
                  <span className="text-[#a7d0bf] block text-[10px] font-bold uppercase">Upwind Fire Flux</span>
                  <div className="text-xl font-numbers text-orange-600 mt-1">
                    {causal_drivers.fire_influence}/100
                  </div>
                  <p className="text-[10px] text-[#a7d0bf] mt-0.5">
                    NASA FIRMS stubble flux
                  </p>
                </div>
              </div>

              {/* Chemical & Meteorological Mechanism Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-white">Coupled Model Inferences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 text-white">
                    <span className="font-bold text-emerald-300 block mb-1">Chemical Head:</span>
                    <p className="text-slate-200 leading-normal">
                      {causal_drivers.chemical_factor}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#061d15] border border-emerald-700/50 text-white">
                    <span className="font-bold text-amber-300 block mb-1">Meteorology Head:</span>
                    <p className="text-slate-200 leading-normal">
                      {causal_drivers.meteorological_factor}
                    </p>
                  </div>
                </div>
              </div>

              {/* Highest Accumulation Stations */}
              <div className="p-4 rounded-xl bg-[#f8faf9] border border-[#dbe7e1]">
                <span className="font-bold text-white block mb-2">
                  Focal Entrapment Monitoring Stations (Highest GNN Node Weight):
                </span>
                <div className="flex flex-wrap gap-2">
                  {causal_drivers.accumulation_stations.map((st) => (
                    <span 
                      key={st}
                      className="px-3 py-1 rounded-lg bg-[#0e3d2c] border border-emerald-600/50 text-white font-bold text-xs"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Regulatory Mandate */}
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 space-y-2 text-rose-100">
                <h4 className="font-bold text-rose-300">
                  Required Pre-emptive Regulatory Interventions:
                </h4>
                <ul className="space-y-1.5 text-rose-100 list-disc list-inside">
                  {alert.action_recommendations.map((rec, i) => (
                    <li key={i} className="leading-relaxed">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AlertDetailModal;
