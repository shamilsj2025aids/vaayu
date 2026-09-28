import React, { useState } from 'react';
import { Wind, Shield, User, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import Demo from '@/components/ui/demo';

export interface AuthUser {
  role: 'civilian' | 'authority';
  identifier: string;
  name: string;
  organization?: string;
  badge?: string;
}

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'authority' | 'civilian'>('authority');
  const [showPortalPreview, setShowPortalPreview] = useState(false);

  // Civilian Form State
  const [civilianContact, setCivilianContact] = useState('');
  const [civilianPassword, setCivilianPassword] = useState('');
  const [civilianError, setCivilianError] = useState('');

  // Authority Form State
  const [aerisId, setAerisId] = useState('');
  const [pin, setPin] = useState('');
  const [authorityError, setAuthorityError] = useState('');

  const handleCivilianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!civilianContact.trim()) {
      setCivilianError('Please enter your mobile number or email address');
      return;
    }
    if (!civilianPassword.trim()) {
      setCivilianError('Please enter your password');
      return;
    }
    onLogin({
      role: 'civilian',
      identifier: civilianContact,
      name: 'Delhi-NCR Resident',
      badge: 'Public Citizen Access',
    });
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aerisId.trim()) {
      setAuthorityError('Please enter your official VAAYU Officer ID');
      return;
    }
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setAuthorityError('Official security PIN must be exactly 6 digits');
      return;
    }
    onLogin({
      role: 'authority',
      identifier: aerisId.toUpperCase(),
      name: 'Dr. V. Sharma (Nodal Officer)',
      organization: 'CAQM / CPCB Decision Support Desk',
      badge: 'Level-3 GRAP Enforcement Clearance',
    });
  };

  const demoCivilianLogin = () => {
    onLogin({
      role: 'civilian',
      identifier: 'citizen@delhi.gov.in',
      name: 'Resident (South Delhi)',
      badge: 'Public Citizen Access',
    });
  };

  const demoAuthorityLogin = () => {
    onLogin({
      role: 'authority',
      identifier: 'VAAYU-CAQM-0809',
      name: 'Dr. P. Nair (Joint Director)',
      organization: 'Commission for Air Quality Management (CAQM)',
      badge: 'Level-3 GRAP Enforcement Clearance',
    });
  };

  if (showPortalPreview) {
    return (
      <div className="min-h-screen bg-[#061d15] flex flex-col font-sans text-white">
        <div className="bg-[#072118] text-white px-6 py-3 flex items-center justify-between border-b border-[#134e38] z-50">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2"><span className="font-vaayu text-2xl tracking-wider text-white">VAAYU</span><span className="font-heading text-base font-bold text-white">Portal Preview</span></span>
          </div>
          <button
            type="button"
            onClick={() => setShowPortalPreview(false)}
            className="px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-[#072118] font-bold text-xs rounded-lg transition shadow-sm"
          >
            Back to Sign In
          </button>
        </div>
        <div className="flex-1">
          <Demo
            word="VAAYU"
            onEnterDashboard={() => {
              demoAuthorityLogin();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#061d15] text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Govt / Institutional Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-[#134e38] pb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-vaayu text-3xl tracking-wider text-white">VAAYU</span>
              <span className="text-[10px] bg-[#0e3d2c] text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-600/50">
                v2.0
              </span>
            </div>
            <p className="text-xs text-[#a7d0bf] font-medium">
              Commission for Air Quality Management • Delhi-NCR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPortalPreview(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0a2e21] hover:bg-[#0e3d2c] text-white border border-emerald-600/40 text-xs font-bold rounded-lg transition-all"
          >
            <span>Glyph Portal Intro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md mx-auto w-full my-8 bg-[#0a2e21] border-2 border-emerald-600/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-white flex items-center justify-center gap-2"><span>Access</span><span className="font-vaayu text-3xl font-normal tracking-wider text-white">VAAYU</span><span>Portal</span></h1>
          <p className="text-xs text-[#a7d0bf] mt-1 font-sans">
            Air Quality Early Warning System
          </p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#061d15] p-1 rounded-xl border border-emerald-800/60 text-xs font-medium mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('authority')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'authority'
                ? 'bg-white text-[#072118] shadow-md font-bold'
                : 'text-emerald-100/80 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Authority (CPCB/CAQM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('civilian')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'civilian'
                ? 'bg-white text-[#072118] shadow-md font-bold'
                : 'text-emerald-100/80 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Civilian / Public</span>
          </button>
        </div>

        {/* AUTHORITY LOGIN FORM */}
        {activeTab === 'authority' && (
          <form onSubmit={handleAuthoritySubmit} className="space-y-4">
            <div className="p-3 bg-[#061d15] border border-emerald-700/50 rounded-xl text-xs text-emerald-100 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Restricted Administrative Access</strong>
                <span>Requires official VAAYU Officer Identification and 6-digit cryptographic security PIN.</span>
              </div>
            </div>

            {authorityError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{authorityError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Official VAAYU Officer ID
              </label>
              <input
                type="text"
                placeholder="e.g. VAAYU-CAQM-26082"
                value={aerisId}
                onChange={(e) => {
                  setAerisId(e.target.value);
                  setAuthorityError('');
                }}
                className="w-full bg-[#061d15] border border-emerald-700/60 focus:border-white focus:ring-1 focus:ring-white rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-emerald-500/70 font-mono focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                6-Digit Security Password / PIN
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setAuthorityError('');
                }}
                className="w-full bg-[#061d15] border border-emerald-700/60 focus:border-white focus:ring-1 focus:ring-white rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-emerald-500/70 font-mono tracking-widest text-center focus:outline-none transition"
              />
              <span className="text-[11px] text-[#a7d0bf] block">
                Issued by CAQM Telemetry Infrastructure Command
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-white hover:bg-emerald-100 text-[#072118] font-bold rounded-xl text-xs tracking-wide transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authenticate & Enter Decision Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-emerald-800/60">
              <button
                type="button"
                onClick={demoAuthorityLogin}
                className="w-full py-2 px-3 bg-[#061d15] hover:bg-[#0e3d2c] border border-emerald-700/50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>Demo 1-Click: Sign in as CAQM Taskforce Chief</span>
              </button>
            </div>
          </form>
        )}

        {/* CIVILIAN LOGIN FORM */}
        {activeTab === 'civilian' && (
          <form onSubmit={handleCivilianSubmit} className="space-y-4">
            <div className="p-3 bg-[#061d15] border border-emerald-700/50 rounded-xl text-xs text-emerald-100 flex items-start gap-2.5">
              <User className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Public Citizen Air Advisory</strong>
                <span>Check localized air quality, 3-day health forecasts, mask mandates, and set personal threshold alerts.</span>
              </div>
            </div>

            {civilianError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{civilianError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Mobile Number or Email
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210 or user@gmail.com"
                value={civilianContact}
                onChange={(e) => {
                  setCivilianContact(e.target.value);
                  setCivilianError('');
                }}
                className="w-full bg-[#061d15] border border-emerald-700/60 focus:border-white focus:ring-1 focus:ring-white rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-emerald-500/70 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={civilianPassword}
                onChange={(e) => {
                  setCivilianPassword(e.target.value);
                  setCivilianError('');
                }}
                className="w-full bg-[#061d15] border border-emerald-700/60 focus:border-white focus:ring-1 focus:ring-white rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-emerald-500/70 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-white hover:bg-emerald-100 text-[#072118] font-bold rounded-xl text-xs tracking-wide transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Citizen Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 border-t border-emerald-800/60">
              <button
                type="button"
                onClick={demoCivilianLogin}
                className="w-full py-2 px-3 bg-[#061d15] hover:bg-[#0e3d2c] border border-emerald-700/50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>Demo 1-Click: Quick Continue as Public Citizen</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-[#a7d0bf] border-t border-[#134e38] pt-4">
        VAAYU Air Quality Decision Support System • Ministry of Environment, Forest and Climate Change • White & Green Edition
      </div>
    </div>
  );
};
export default LoginPage;
