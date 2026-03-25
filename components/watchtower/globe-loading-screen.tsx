// components/watchtower/globe-loading-screen.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Historical Doomsday Clock milestones ──────────────────────────────────────
const MILESTONES = [
  { year: 1947, secs: 420,  label: "7 MIN",   event: "Cold War begins. First Soviet test coming." },
  { year: 1953, secs: 120,  label: "2 MIN",   event: "US & USSR test H-bombs. Closest in 38 years." },
  { year: 1960, secs: 420,  label: "7 MIN",   event: "Partial Nuclear Test Ban Treaty signed." },
  { year: 1991, secs: 1020, label: "17 MIN",  event: "Cold War ends. Strategic arms reduction. Safest ever." },
  { year: 2002, secs: 420,  label: "7 MIN",   event: "Post-9/11. US withdraws from ABM Treaty." },
  { year: 2015, secs: 180,  label: "3 MIN",   event: "Climate added as threat. No disarmament progress." },
  { year: 2017, secs: 150,  label: "2:30",    event: "North Korea ICBM tests. Breakdown of global norms." },
  { year: 2020, secs: 100,  label: "100 SEC", event: "COVID. Climate. Nuclear. First sub-2-minute reading." },
  { year: 2023, secs: 90,   label: "90 SEC",  event: "Russia invades Ukraine. Nuclear threats resume." },
  { year: 2026, secs: 85,   label: "85 SEC",  event: "New START expired. No active nuclear treaty. AI arms race." },
] as const;

// Cumulative timings (ms) for each step to fire
const STEP_MS = [0, 260, 510, 750, 980, 1210, 1430, 1640, 1890, 2280] as const;

// ── SVG helpers ───────────────────────────────────────────────────────────────

// Arc from 12 o'clock, going counterclockwise to the hand position.
// This represents the gap between the hand and midnight — the danger zone.
function clockArcPath(secs: number, r = 40): string {
  const frac = Math.min(secs, 3540) / 3600;
  if (frac <= 0.001) return `M 50 ${50 - r} A ${r} ${r} 0 0 0 50 ${50 - r + 0.01}`;
  const angleRad = -frac * 2 * Math.PI; // negative = counterclockwise
  const ex = 50 + r * Math.sin(angleRad);
  const ey = 50 - r * Math.cos(angleRad);
  const large = frac > 0.5 ? 1 : 0;
  return `M 50 ${50 - r} A ${r} ${r} 0 ${large} 0 ${ex.toFixed(3)} ${ey.toFixed(3)}`;
}

function formatTime(secs: number): string {
  if (secs >= 60) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${m} MIN`;
  }
  return `${secs} SEC`;
}

// ── Tick mark positions ───────────────────────────────────────────────────────
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const deg = i * 30;
  const rad = (deg - 90) * (Math.PI / 180);
  const major = i % 3 === 0;
  const r1 = major ? 35.5 : 37.5;
  const r2 = 42;
  return {
    x1: 50 + r1 * Math.cos(rad),
    y1: 50 + r1 * Math.sin(rad),
    x2: 50 + r2 * Math.cos(rad),
    y2: 50 + r2 * Math.sin(rad),
    major,
  };
});

// ── Component ─────────────────────────────────────────────────────────────────
export function GlobeLoadingScreen() {
  const [stepIdx,  setStepIdx]  = useState(0);
  const [reveal,   setReveal]   = useState(false);
  const [dots,     setDots]     = useState("");

  // Advance through milestones
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < MILESTONES.length; i++) {
      timers.push(setTimeout(() => setStepIdx(i), STEP_MS[i]));
    }
    // Reveal info cards after clock animation completes
    timers.push(setTimeout(() => setReveal(true), 2900));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Loading dots
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 480);
    return () => clearInterval(iv);
  }, []);

  const m       = MILESTONES[stepIdx];
  const handDeg = -(m.secs / 3600) * 360; // negative = CCW from 12
  const isFinal = stepIdx === MILESTONES.length - 1;

  return (
    <div className="w-full h-full bg-void-0 flex flex-col overflow-hidden relative select-none">

      {/* ── Background grid ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,64,64,0.03) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(232,64,64,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Scan line ───────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 h-[2px] pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(232,64,64,0.15),transparent)",
          animation: "scanDown 3.5s linear infinite",
        }}
      />

      <style>{`
        @keyframes scanDown {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes slideRight {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-border-protocol/40 relative z-10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-bright animate-pulse flex-shrink-0" />
          <p className="font-syne font-bold text-[14px] text-text-base tracking-[.04em]">TEVATHA</p>
          <span className="w-px h-4 bg-border-protocol opacity-60" />
          <p className="font-mono text-[8.5px] text-text-mute2/60 tracking-[.22em] uppercase">
            Global Threat Matrix
          </p>
        </div>
        <p className="font-mono text-[7.5px] text-text-mute2/30 tracking-[.14em]">
          MATRIX v2.6 · INITIALIZING
        </p>
      </div>

      {/* ── Main body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-0 overflow-hidden relative z-10 min-h-0">

        {/* ── Left: Clock column ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center px-6 py-6 flex-1 min-h-0 gap-5">

          {/* Eyebrow */}
          <p className="font-mono text-[8px] tracking-[.28em] uppercase text-red-bright/60">
            ◈ Doomsday Clock · Historical Record ◈
          </p>

          {/* SVG Clock */}
          <div className="relative flex-shrink-0">
            <svg
              viewBox="0 0 100 100"
              width="200"
              height="200"
              style={{ overflow: "visible" }}
              aria-label="Doomsday Clock"
            >
              <defs>
                <radialGradient id="face-bg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#0c1525" />
                  <stop offset="100%" stopColor="#050810" />
                </radialGradient>
                <radialGradient id="midnight-glow" cx="50%" cy="0%" r="60%">
                  <stop offset="0%"   stopColor="rgba(232,64,64,0.30)" stopOpacity="1" />
                  <stop offset="100%" stopColor="rgba(232,64,64,0)"    stopOpacity="0" />
                </radialGradient>
                <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="hand-glow" x="-200%" y="-50%" width="500%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Clock face */}
              <circle cx="50" cy="50" r="44" fill="url(#face-bg)" />

              {/* Midnight glow (intensifies at 2026) */}
              <motion.circle
                cx="50" cy="50" r="44"
                fill="url(#midnight-glow)"
                animate={{ opacity: isFinal ? 1 : 0.3 + (stepIdx / MILESTONES.length) * 0.7 }}
                transition={{ duration: 0.5 }}
              />

              {/* Outer ring */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(232,64,64,0.22)" strokeWidth="1" />

              {/* Danger arc — CCW from 12 to hand */}
              <motion.path
                fill="none"
                stroke="#e84040"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#arc-glow)"
                animate={{ d: clockArcPath(m.secs) }}
                transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              />

              {/* Tick marks */}
              {TICKS.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1.toFixed(2)} y1={t.y1.toFixed(2)}
                  x2={t.x2.toFixed(2)} y2={t.y2.toFixed(2)}
                  stroke={t.major ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)"}
                  strokeWidth={t.major ? "1.5" : "0.75"}
                />
              ))}

              {/* 12 o'clock marker */}
              <circle cx="50" cy="9.5" r="1.8" fill="#e84040" opacity="0.9" />

              {/* Clock hand — rotates around center */}
              <g transform="translate(50 50)">
                <motion.g
                  animate={{ rotate: handDeg }}
                  transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
                  filter="url(#hand-glow)"
                  style={{ originX: "0px", originY: "0px" }}
                >
                  {/* Main hand */}
                  <line x1="0" y1="3" x2="0" y2="-34" stroke="#f0c842" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Hand glow duplicate */}
                  <line x1="0" y1="3" x2="0" y2="-34" stroke="rgba(240,200,66,0.3)" strokeWidth="5" strokeLinecap="round" />
                </motion.g>
              </g>

              {/* Center pin */}
              <circle cx="50" cy="50" r="3" fill="#0a1020" stroke="#c9a84c" strokeWidth="1" />
              <circle cx="50" cy="50" r="1.2" fill="#f0c842" />
            </svg>
          </div>

          {/* Year + Time readout */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <p className="font-mono text-[9px] tracking-[.26em] uppercase text-text-mute2/50">
                {m.year}
              </p>
              <p
                className="font-mono font-bold tabular-nums leading-none"
                style={{
                  fontSize: "clamp(28px, 7vw, 40px)",
                  color: isFinal ? "#e84040" : "#e05050",
                  textShadow: isFinal
                    ? "0 0 32px rgba(232,64,64,0.7)"
                    : "0 0 16px rgba(232,64,64,0.35)",
                }}
              >
                {formatTime(m.secs)}
              </p>
              <p className="font-mono text-[9px] tracking-[.2em] uppercase text-red-bright/70">
                TO MIDNIGHT
              </p>
              <p className="font-mono text-[8.5px] text-text-mute2/55 max-w-[200px] leading-relaxed mt-1">
                {m.event}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Milestone progress dots */}
          <div className="flex items-center gap-1.5">
            {MILESTONES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === stepIdx ? 14 : 5,
                  height:     5,
                  background: i < stepIdx
                    ? "rgba(232,64,64,0.55)"
                    : i === stepIdx
                    ? "rgba(232,64,64,0.9)"
                    : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Info column ──────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-4 px-6 py-6 lg:w-[340px] flex-shrink-0 justify-center"
          style={{
            borderLeft: "1px solid rgba(232,64,64,0.08)",
            opacity: reveal ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* Vision card */}
          <div
            className="rounded-xl border border-gold-protocol/22 bg-void-1/80 p-5 relative overflow-hidden"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 6px 24px rgba(0,0,0,0.45)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg,#c9a84c,rgba(201,168,76,0.12),transparent)" }}
            />
            <p className="font-mono text-[7.5px] tracking-[.22em] uppercase text-gold-protocol/60 mb-2">
              Mission Statement
            </p>
            <p className="font-syne font-extrabold text-[18px] leading-tight text-gold-bright mb-0.5">
              General Contractor
            </p>
            <p className="font-syne font-extrabold text-[18px] leading-tight text-gold-protocol mb-3">
              of Human Continuity
            </p>
            <div className="w-10 h-px bg-gold-protocol/40 mb-3" />
            <p className="font-mono text-[9px] text-text-dim leading-relaxed">
              We exist at the convergence of the most significant civilisation-level risks in recorded
              history — nuclear escalation, infrastructure collapse, monetary failure, and pandemic.
              Tevatha gives every person the intelligence, tools, and community to survive what comes
              next — and rebuild what matters on the other side.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-protocol flex-shrink-0" />
              <p className="font-mono text-[7.5px] tracking-[.1em] text-gold-protocol/60">
                TEVATHA · ARK PROTOCOL ACTIVE
              </p>
            </div>
          </div>

          {/* BAS explanation card */}
          <div
            className="rounded-xl border border-red-protocol/22 bg-void-1/80 p-5 relative overflow-hidden"
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 6px 24px rgba(0,0,0,0.45)" }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg,#e84040,rgba(232,64,64,0.12),transparent)" }}
            />
            <p className="font-mono text-[7.5px] tracking-[.22em] uppercase text-red-bright/60 mb-2">
              Intel Basis · BAS
            </p>
            <p className="font-mono text-[9px] text-text-dim leading-relaxed mb-2">
              The Doomsday Clock is maintained by the{" "}
              <span className="text-text-base font-bold">Bulletin of Atomic Scientists</span> — founded
              in 1945 by the Manhattan Project scientists who built the first atomic bomb. Haunted by
              what they created, they built this clock as a warning to the world.
            </p>
            <p className="font-mono text-[9px] text-text-dim leading-relaxed">
              The clock measures how close humanity is to self-caused global catastrophe.{" "}
              <span className="text-red-bright font-bold">Midnight means extinction.</span> Every
              movement is determined by experts across nuclear risk, climate, and disruptive technology.
            </p>
            <div
              className="mt-4 flex items-center gap-2 pt-3 border-t"
              style={{ borderColor: "rgba(232,64,64,0.12)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse flex-shrink-0" />
              <p className="font-mono text-[7.5px] tracking-[.1em] text-red-bright/80">
                JAN 27 2026 · ALL-TIME CLOSEST IN 79-YEAR HISTORY
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading bar ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pb-5 pt-2 relative z-10">
        <div className="w-56 h-px bg-border-protocol/40 relative overflow-hidden rounded-full">
          <div
            className="absolute inset-y-0 w-20 rounded-full"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(232,64,64,0.7),transparent)",
              animation: "slideRight 1.6s ease-in-out infinite",
            }}
          />
        </div>
        <p className="font-mono text-[7.5px] tracking-[.22em] uppercase text-text-mute2/30">
          Loading Globe Data{dots}
        </p>
      </div>

    </div>
  );
}
