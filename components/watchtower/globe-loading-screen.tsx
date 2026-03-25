// components/watchtower/globe-loading-screen.tsx
"use client";

import { useState, useEffect } from "react";

export function GlobeLoadingScreen() {
  const [dots,   setDots]   = useState("");
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setReveal(true), 320);
    const iv = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 480);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);

  return (
    <div className="w-full h-full bg-void-0 flex flex-col overflow-hidden relative select-none">

      {/* ── Background grid ───────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,64,64,0.03) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(232,64,64,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Scan line ─────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 h-[2px] pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(232,64,64,0.18),transparent)",
          animation: "scanDown 3.5s linear infinite",
        }}
      />

      <style>{`
        @keyframes scanDown {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes slideRight {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-border-protocol/40 relative z-10">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-bright animate-pulse flex-shrink-0" />
          <p className="font-syne font-bold text-[14px] text-text-base tracking-[.04em]">TEVATHA</p>
          <span className="w-px h-4 bg-border-protocol opacity-60" />
          <p className="font-mono text-[8.5px] text-text-mute2/60 tracking-[.22em] uppercase">
            Global Threat Matrix
          </p>
        </div>
        {/* Right: version */}
        <p className="font-mono text-[7.5px] text-text-mute2/30 tracking-[.14em]">
          MATRIX v2.6 · INITIALIZING
        </p>
      </div>

      {/* ── Center loading indicator ──────────────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col items-center gap-3 pt-10 pb-8 relative z-10">
        <p className="font-mono text-[8px] tracking-[.32em] uppercase text-red-bright/60">
          ◈ Initializing Threat Matrix ◈
        </p>
        <p
          className="font-syne font-bold text-[12px] tracking-[.28em] uppercase"
          style={{ color: "rgba(150,165,180,0.5)" }}
        >
          Loading Globe Data{dots}
          <span style={{ animation: "blink 1s step-end infinite", marginLeft: 1 }}>▌</span>
        </p>
        {/* Progress bar */}
        <div className="w-56 h-px bg-border-protocol/40 relative overflow-hidden rounded-full">
          <div
            className="absolute inset-y-0 w-20 rounded-full"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(232,64,64,0.7),transparent)",
              animation: "slideRight 1.6s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ── Briefing panels ───────────────────────────────────────────────── */}
      <div
        className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 pb-8 max-w-4xl w-full mx-auto relative z-10 items-start"
        style={{ opacity: reveal ? 1 : 0, animation: reveal ? "fadeUp 0.5s ease-out forwards" : "none" }}
      >

        {/* ── Vision card ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-gold-protocol/22 bg-void-1/70 p-6 relative overflow-hidden h-full"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 8px 32px rgba(0,0,0,0.5)" }}
        >
          {/* Gold top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg,#c9a84c,rgba(201,168,76,0.15),transparent)" }}
          />

          <p className="font-mono text-[7.5px] tracking-[.24em] uppercase text-gold-protocol/60 mb-3">
            Mission Statement
          </p>

          <p className="font-syne font-extrabold text-[22px] leading-tight text-gold-bright mb-1">
            General Contractor
          </p>
          <p className="font-syne font-extrabold text-[22px] leading-tight text-gold-protocol mb-4">
            of Human Continuity
          </p>

          <div className="w-12 h-px bg-gold-protocol/40 mb-4" />

          <p className="font-mono text-[9.5px] text-text-dim leading-relaxed">
            We exist at the convergence of the most significant civilisation-level risks in recorded
            history — nuclear escalation, infrastructure collapse, monetary failure, and pandemic.
          </p>
          <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mt-3">
            Tevatha's mission: give every person the intelligence, tools, and community to survive
            what comes next — and rebuild what matters on the other side.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-protocol flex-shrink-0" />
            <p className="font-mono text-[8px] tracking-[.12em] text-gold-protocol/60">
              TEVATHA · ARK PROTOCOL ACTIVE
            </p>
          </div>
        </div>

        {/* ── Doomsday Clock card ───────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-red-protocol/22 bg-void-1/70 p-6 relative overflow-hidden h-full"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 8px 32px rgba(0,0,0,0.5)" }}
        >
          {/* Red top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg,#e84040,rgba(232,64,64,0.15),transparent)" }}
          />

          <p className="font-mono text-[7.5px] tracking-[.24em] uppercase text-red-bright/60 mb-3">
            Intel Basis · Doomsday Clock
          </p>

          {/* Big number */}
          <div className="flex items-end gap-3 mb-4">
            <span className="font-mono font-bold text-[52px] text-red-bright leading-none tabular-nums"
                  style={{ textShadow: "0 0 32px rgba(232,64,64,0.4)" }}>
              85
            </span>
            <div className="pb-1">
              <p className="font-mono text-[10px] font-bold text-red-protocol leading-tight">SECONDS</p>
              <p className="font-mono text-[10px] font-bold text-red-protocol leading-tight">TO MIDNIGHT</p>
            </div>
          </div>

          <div className="w-12 h-px bg-red-protocol/40 mb-4" />

          <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mb-3">
            The Doomsday Clock is maintained by the{" "}
            <span className="text-text-base font-bold">Bulletin of Atomic Scientists (BAS)</span> — a
            non-profit founded in 1945 by the Manhattan Project scientists who built the first atomic
            bomb. Haunted by what they created, they built this clock as a warning to the world.
          </p>
          <p className="font-mono text-[9.5px] text-text-dim leading-relaxed">
            The clock measures how close humanity is to self-caused global catastrophe.{" "}
            <span className="text-red-bright font-bold">Midnight means extinction.</span> Every
            movement is determined by experts across nuclear risk, climate, and disruptive technology.
          </p>

          <div
            className="mt-5 flex items-center gap-2 pt-4 border-t"
            style={{ borderColor: "rgba(232,64,64,0.12)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse flex-shrink-0" />
            <p className="font-mono text-[8px] tracking-[.1em] text-red-bright/80">
              JAN 27 2026 · ALL-TIME CLOSEST IN 79-YEAR HISTORY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
