"use client";

import React, { useEffect, useState } from "react";
import GlyphPortal from "@/components/ui/glyph-portal";
import { Wind, ShieldCheck, Activity, ArrowDown } from "lucide-react";

const settings = { word: "VAAYU", scrollLength: 2.4, interactive: true, annotations: false };
const family = '"Danfo", Arial, sans-serif';

export function Demo(props: Partial<typeof settings> & { onEnterDashboard?: () => void }) {
  const s = { ...settings, ...props };
  const [face, setFace] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;
    const finish = (value: string) => { if (!settled) { settled = true; setFace(value); } };
    // Load Danfo from Google Fonts for VAAYU glyph portal
    if (document.fonts && document.fonts.load) {
      document.fonts.load('1em Danfo').then(() => finish(family)).catch(() => finish(family));
    }
    const timeout = window.setTimeout(() => finish(family), 600);
    return () => { settled = true; clearTimeout(timeout); };
  }, []);

  return (
    <div data-demo-scroll data-slipstream-demo tabIndex={0} role="region" aria-label="VAAYU. Scroll to step inside."
      style={{ width: "100%", height: "min(780px, 100svh)", overflowY: "auto", background: "#ffffff", containerType: "inline-size", fontFamily: face ?? "Arial, sans-serif" }}>
      <style>{`
        [data-slipstream-demo] [data-gp-caption]{inset:calc(var(--gp-word-bottom,50%) + 82px) 24px auto;justify-content:center;}
        [data-slipstream-demo] [data-gp-hint]{display:none;}
        [data-slipstream-demo] [data-gp-enter]{min-height:46px;padding:0 22px;gap:20px;background:#0b3b2a;border:1px solid #082d22;border-radius:10px;color:#ffffff;font-size:13px;font-weight:600;box-shadow:0 2px 4px rgba(11,59,42,0.18);transition:all .18s;}
        [data-slipstream-demo] [data-gp-enter]:hover{background:#14573f;box-shadow:0 4px 12px rgba(11,59,42,0.25);}
        [data-slipstream-demo] [data-gp-enter]:focus-visible{outline:2px solid #176247;outline-offset:4px;}
        [data-slipstream-demo] [data-gp-touch-picker]{top:auto;bottom:18px;left:50%;}
        [data-slipstream-demo] [data-gp-select]{border-color:transparent;border-radius:8px;font-size:12px;color:#14573f;}
        [data-sublime-header]{position:absolute;inset:clamp(20px,4.5cqw,42px) clamp(20px,5cqw,56px) auto;display:flex;align-items:center;justify-content:space-between;gap:20px;}
        [data-sublime-logo]{font-size:24px;font-family:'Danfo', serif;letter-spacing:0.04em;color:#0b3b2a;display:flex;align-items:center;gap:8px;}
        [data-sublime-category]{font-size:12px;line-height:1.5;color:#2e7d5a;font-weight:500;}
        [data-sublime-eyebrow]{position:absolute;inset:auto 24px calc(100% - var(--gp-word-top,35%) + 28px);margin:0;text-align:center;font-size:13px;font-weight:500;line-height:1.5;letter-spacing:.02em;color:#2e7d5a;}
        [data-sublime-support]{position:absolute;inset:calc(var(--gp-word-bottom,50%) + 28px) 24px auto;margin:0;text-align:center;font-size:16px;font-weight:500;line-height:1.5;color:#0b3b2a;}
        [data-sublime-scroll]{position:absolute;inset:auto 24px 6%;text-align:center;color:#4a7260;font-size:12px;letter-spacing:.02em;display:flex;align-items:center;justify-content:center;gap:6px;}
        @media(any-pointer:coarse){[data-sublime-scroll]{bottom:12%;}}
        @container(max-width:450px){[data-sublime-category]{max-width:14ch;text-align:right;}[data-sublime-eyebrow]{font-size:12px;}[data-sublime-support]{font-size:14px;}[data-slipstream-demo] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 76px);}}
        @container(max-height:479px){[data-sublime-header]{top:18px;}[data-sublime-support]{top:calc(var(--gp-word-bottom,50%) + 16px);}[data-slipstream-demo] [data-gp-caption]{top:calc(var(--gp-word-bottom,50%) + 60px);}[data-sublime-scroll]{display:none;}}
        [data-slipstream-demo] [data-gp-content]{padding:5rem clamp(1.25rem,5cqw,5rem) 6rem;font-family:inherit;}
        [data-slipstream-demo] section,[data-slipstream-demo] [data-gp-caption]{font-family:inherit;}
        [data-slipstream-copy]{display:flex;width:min(100%,80rem);margin:auto;flex-direction:column;align-items:flex-start;gap:clamp(2rem,5svh,3.5rem);}
        [data-slipstream-copy] h2{max-width:48rem;margin:0;color:inherit;font-size:clamp(1.75rem,1.1rem + 2.1cqw,2.25rem);font-weight:600;line-height:1.25;letter-spacing:-0.02em;text-wrap:balance;}
        [data-slipstream-features]{display:grid;width:100%;grid-template-columns:1fr;gap:1.75rem;}
        [data-slipstream-feature]{border-top:1px solid rgba(251,251,250,.25);padding-top:1.2rem;}
        [data-slipstream-feature] h3{margin:0;color:inherit;font-size:1.125rem;font-weight:600;line-height:1.2;letter-spacing:0;display:flex;align-items:center;gap:6px;}
        [data-slipstream-feature] p{margin:.55rem 0 0;color:rgba(251,251,250,.88);font-size:.9375rem;line-height:1.6;}
        [data-slipstream-no]{display:inline-block;margin-right:.6rem;color:#86efac;font:600 .8rem ui-monospace,monospace;letter-spacing:.08em;transform:translateY(-.05em);}
        @container(min-width:768px){[data-slipstream-features]{grid-template-columns:repeat(3,minmax(0,1fr));gap:3.5rem;}}
      `}</style>
      {face ? (
        <GlyphPortal
          word={s.word}
          fontFamily={face}
          fontWeight={700}
          style={{ fontFamily: face }}
          scrollLength={s.scrollLength}
          interactive={s.interactive}
          annotations={s.annotations}
          enterLabel="Enter VAAYU Portal"
          background={
            <div className="absolute inset-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=80"
                alt="VAAYU atmospheric canopy"
                className="w-full h-full object-cover opacity-35 mix-blend-overlay"
              />
              <div 
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 18% 8%, rgba(68,125,98,.82), transparent 38%), radial-gradient(circle at 82% 20%, rgba(251,251,250,.18), transparent 30%), radial-gradient(circle at 48% 78%, rgba(9,48,35,.75), transparent 46%), linear-gradient(135deg,#0b3b2a 0%,#14573f 48%,#082d22 100%)"
                }}
              />
            </div>
          }
          front={
            <>
              <div data-sublime-header>
                <span data-sublime-logo>
                  VAAYU
                </span>
                <span data-sublime-category>Delhi-NCR Atmospheric Forecasting</span>
              </div>
              <p data-sublime-eyebrow>Next-Gen Atmospheric Quality Forecasting</p>
              <p data-sublime-support>Real-Time Air Quality Early Warning System</p>
              <span data-sublime-scroll>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                Scroll down to step inside VAAYU
              </span>
            </>
          }
        >
          <div data-slipstream-copy>
            <h2>Step inside the <span className="font-vaayu text-3xl">VAAYU</span> Forecasting Platform.</h2>
            <div data-slipstream-features>
              <div data-slipstream-feature>
                <h3>
                  <span data-slipstream-no>01</span>
                  <Wind className="w-4 h-4 text-[#86efac] inline mr-1" />
                  Dynamic GNN Graph
                </h3>
                <p>56 Delhi-NCR stations coupled with NASA FIRMS active fire nodes and real-time wind vector transport.</p>
              </div>
              <div data-slipstream-feature>
                <h3>
                  <span data-slipstream-no>02</span>
                  <Activity className="w-4 h-4 text-[#86efac] inline mr-1" />
                  Day-2 & Day-3 Correction
                </h3>
                <p>Overcomes CAMS & WRF-Chem atmospheric dispersion decay using deep graph attention residuals.</p>
              </div>
              <div data-slipstream-feature>
                <h3>
                  <span data-slipstream-no>03</span>
                  <ShieldCheck className="w-4 h-4 text-[#86efac] inline mr-1" />
                  Live GRAP Protocol
                </h3>
                <p>Pre-emptive alerts triggered ≥36h before inversion caps trap ground particulates in Delhi-NCR.</p>
              </div>
            </div>

            {props.onEnterDashboard && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={props.onEnterDashboard}
                  className="px-6 py-3 bg-white text-[#0b3b2a] hover:bg-[#f0fdf4] font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  Proceed to Operational Dashboard
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </GlyphPortal>
      ) : (
        <div role="status" style={{ height: "100%", display: "grid", placeItems: "center", color: "#0b3b2a", fontSize: 13, fontWeight: 500 }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#0b3b2a] border-t-transparent rounded-full animate-spin" />
            Loading VAAYU typography & engine…
          </div>
        </div>
      )}
    </div>
  );
}

export default Demo;
