import React, { useState } from 'react';

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

  // Civilian Form State
  const [civilianContact, setCivilianContact] = useState('');
  const [civilianPassword, setCivilianPassword] = useState('');
  const [civilianError, setCivilianError] = useState('');

  // Authority Form State
  const [vaayuId, setVaayuId] = useState('');
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
    if (!vaayuId.trim()) {
      setAuthorityError('Please enter your official VAAYU Officer ID');
      return;
    }
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setAuthorityError('Official security PIN must be exactly 6 digits');
      return;
    }
    onLogin({
      role: 'authority',
      identifier: vaayuId.toUpperCase(),
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Govt / Institutional Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-[#27272a] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center font-bold text-sm tracking-wider text-sky-400">
            <span className="material-symbols-outlined text-xl">air</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl tracking-wide text-white">VAAYU</span>
            </div>
            <p className="text-xs text-neutral-400">
              Commission for Air Quality Management
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span>Official Portal</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md mx-auto w-full my-8 bg-[#121316] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl text-white">Access VAAYU Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Air Quality Intelligence Network
          </p>
        </div>

        {/* Portal Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a] text-xs font-medium mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('authority')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'authority'
                ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Authority (CPCB/CAQM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('civilian')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'civilian'
                ? 'bg-[#27272a] text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            <span>Civilian / Public</span>
          </button>
        </div>

        {/* AUTHORITY LOGIN FORM */}
        {activeTab === 'authority' && (
          <form onSubmit={handleAuthoritySubmit} className="space-y-4">
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-neutral-300 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-sky-400 text-base shrink-0 mt-0.5">verified_user</span>
              <div>
                <strong className="text-white block font-medium">Restricted Administrative Access</strong>
                <span>Requires official VAAYU Officer Identification and 6-digit cryptographic security PIN.</span>
              </div>
            </div>

            {authorityError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{authorityError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">
                Official VAAYU Officer ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. VAAYU-CAQM-26082"
                  value={vaayuId}
                  onChange={(e) => {
                    setVaayuId(e.target.value);
                    setAuthorityError('');
                  }}
                  className="w-full bg-[#18181b] border border-[#27272a] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">
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
                className="w-full bg-[#18181b] border border-[#27272a] focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 font-mono tracking-widest text-center focus:outline-none"
              />
              <span className="text-[11px] text-neutral-500 block">
                Issued by CAQM Telemetry Infrastructure Command
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>Authenticate & Enter Decision Dashboard</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <div className="pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={demoAuthorityLogin}
                className="w-full py-2 px-3 bg-[#18181b] hover:bg-[#202127] border border-[#27272a] text-sky-400 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>Demo 1-Click: Sign in as CAQM Taskforce Chief</span>
              </button>
            </div>
          </form>
        )}

        {/* CIVILIAN LOGIN FORM */}
        {activeTab === 'civilian' && (
          <form onSubmit={handleCivilianSubmit} className="space-y-4">
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-neutral-300 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">public</span>
              <div>
                <strong className="text-white block font-medium">Public Citizen Air Advisory</strong>
                <span>Check localized air quality, 3-day health forecasts, mask mandates, and set personal threshold alerts.</span>
              </div>
            </div>

            {civilianError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{civilianError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">
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
                className="w-full bg-[#18181b] border border-[#27272a] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 block">
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
                className="w-full bg-[#18181b] border border-[#27272a] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>Sign In to Citizen Portal</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <div className="pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={demoCivilianLogin}
                className="w-full py-2 px-3 bg-[#18181b] hover:bg-[#202127] border border-[#27272a] text-emerald-400 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>Demo 1-Click: Quick Continue as Public Citizen</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-neutral-500 border-t border-[#27272a] pt-4">
        VAAYU Air Quality Decision Support System • Ministry of Environment, Forest and Climate Change • SIH26082
      </div>
    </div>
  );
};
