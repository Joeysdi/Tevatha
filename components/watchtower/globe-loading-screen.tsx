// components/watchtower/globe-loading-screen.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Final doomsday clock state — always shown immediately ─────────────────────
const FINAL = {
  year:  2026,
  secs:  85,
  label: "85 SEC",
  event: "New START expired. No active nuclear treaty. AI arms race begins.",
} as const;

// ── Module init list ──────────────────────────────────────────────────────────
const MODULES = [
  { label: "Nuclear threat vectors",      type: "ok"   },
  { label: "Geopolitical signal feeds",   type: "ok"   },
  { label: "Decision gate matrix",        type: "ok"   },
  { label: "Globe renderer",              type: "wait" },
  { label: "Scenario probability engine", type: "wait" },
  { label: "Collapse index calibration",  type: "wait" },
] as const;

// Module stagger — fast enough to be visible even on cached loads
const MODULE_TIMINGS = [150, 350, 550, 750, 950, 1150] as const;

const LOADING_MESSAGES = [
  "INITIALIZING WATCHTOWER",
  "RENDERING GLOBE",
  "CALIBRATING THREAT MATRIX",
];

// ── SVG helpers ───────────────────────────────────────────────────────────────

// Arc from 12 o'clock, going counterclockwise to the hand position.
function clockArcPath(secs: number, r = 40): string {
  const frac = Math.min(secs, 3540) / 3600;
  if (frac <= 0.001) return `M 50 ${50 - r} A ${r} ${r} 0 0 0 50 ${50 - r + 0.01}`;
  const angleRad = -frac * 2 * Math.PI;
  const ex = 50 + r * Math.sin(angleRad);
  const ey = 50 - r * Math.cos(angleRad);
  const large = frac > 0.5 ? 1 : 0;
  return `M 50 ${50 - r} A ${r} ${r} 0 ${large} 0 ${ex.toFixed(3)} ${ey.toFixed(3)}`;
}

// Tick mark positions
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

// Globe wireframe latitude rings
const LATITUDE_RINGS = [
  { rx: 38, ry: 7  },
  { rx: 32, ry: 13 },
  { rx: 22, ry: 17 },
  { rx: 11, ry: 19 },
  { rx: 2,  ry: 20 },
];

// Pre-computed arc path for 85 SEC (never changes)
const ARC_PATH = clockArcPath(FINAL.secs);
// Hand angle for 85 SEC — just 8.5° counterclockwise from 12
const HAND_DEG = -(FINAL.secs / 3600) * 360;

// ── Component ─────────────────────────────────────────────────────────────────
export function GlobeLoadingScreen({ isReady = false }: { isReady?: boolean }) {
  const [moduleVisible,  setModuleVisible]  = useState<boolean[]>(Array(6).fill(false));
  const [moduleComplete, setModuleComplete] = useState<boolean[]>(Array(6).fill(false));
  const [msgIdx,         setMsgIdx]         = useState(0);

  // Module stagger reveal
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    MODULE_TIMINGS.forEach((ms, i) => {
      timers.push(
        setTimeout(() => {
          setModuleVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, ms)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Cycling loading message every 2.5 s
  useEffect(() => {
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2500);
    return () => clearInterval(iv);
  }, []);

  // When globe is ready, mark all modules complete
  useEffect(() => {
    if (!isReady) return;
    setModuleComplete(Array(6).fill(true));
  }, [isReady]);

  const visibleCount = moduleVisible.filter(Boolean).length;

  return (
    <div className="w-full h-full bg-void-0 flex flex-col overflow-hidden relative select-none">

      {/* ── CSS keyframes ────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes scanDown {
          0%   { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        @keyframes ringRotate {
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1;   }
        }
        @keyframes arcPulse {
          0%, 100% { opacity: 1;    }
          50%       { opacity: 0.55; }
        }
      `}</style>

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
        className="absolute inset-x-0 top-0 h-[2px] pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(232,64,64,0.15),transparent)",
          animation: "scanDown 3.5s linear infinite",
          willChange: "transform",
        }}
      />


      {/* ── Main body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-stretch gap-0 overflow-hidden relative z-10 min-h-0">

        {/* ── Clock column ────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center px-6 py-6 flex-1 min-h-0 gap-5">

          {/* Eyebrow */}
          <p className="font-mono text-[8px] tracking-[.28em] uppercase text-red-bright/60">
            ◈ Doomsday Clock · 2026 ◈
          </p>

          {/* SVG Clock */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            {/* Pulsing ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, rgba(232,64,64,0.14) 0%, transparent 70%)",
                animation: "glowPulse 2.8s ease-in-out infinite",
                zIndex: 0,
              }}
            />

            <svg
              viewBox="0 0 100 100"
              width="280"
              height="280"
              style={{ overflow: "visible", position: "relative", zIndex: 1 }}
              aria-label="Doomsday Clock — 85 seconds to midnight"
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
              </defs>

              {/* Globe wireframe latitude rings — CSS animation, compositor only */}
              <g style={{
                transformOrigin: "50px 50px",
                animation: "ringRotate 40s linear infinite",
                willChange: "transform",
              }}>
                {LATITUDE_RINGS.map((ring, i) => (
                  <ellipse
                    key={i}
                    cx="50" cy="50"
                    rx={ring.rx} ry={ring.ry}
                    fill="none"
                    stroke="#e84040"
                    strokeWidth="0.5"
                    opacity="0.07"
                  />
                ))}
              </g>

              {/* Clock face */}
              <circle cx="50" cy="50" r="44" fill="url(#face-bg)" />

              {/* Midnight glow — pulsing */}
              <circle
                cx="50" cy="50" r="44"
                fill="url(#midnight-glow)"
                style={{ animation: "glowPulse 2.8s ease-in-out infinite" }}
              />

              {/* Outer ring */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(232,64,64,0.22)" strokeWidth="1" />

              {/* Danger arc — glow layer + sharp layer, both pulsing */}
              <path
                fill="none"
                stroke="#e84040"
                strokeWidth="7"
                strokeLinecap="round"
                strokeOpacity="0.18"
                d={ARC_PATH}
                style={{ animation: "arcPulse 2.8s ease-in-out infinite" }}
              />
              <path
                fill="none"
                stroke="#e84040"
                strokeWidth="3.5"
                strokeLinecap="round"
                d={ARC_PATH}
                style={{ animation: "arcPulse 2.8s ease-in-out infinite" }}
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

              {/* Clock hand — static at 85 SEC position, hand glows */}
              <g transform="translate(50 50)">
                <g style={{
                  transform: `rotate(${HAND_DEG}deg)`,
                  transformOrigin: "0px 0px",
                }}>
                  <line x1="0" y1="3" x2="0" y2="-34"
                    stroke="rgba(240,200,66,0.3)" strokeWidth="5" strokeLinecap="round" />
                  <line x1="0" y1="3" x2="0" y2="-34"
                    stroke="#f0c842" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: "arcPulse 2.8s ease-in-out infinite" }} />
                </g>
              </g>

              {/* Center pin */}
              <circle cx="50" cy="50" r="3" fill="#0a1020" stroke="#c9a84c" strokeWidth="1" />
              <circle cx="50" cy="50" r="1.2" fill="#f0c842" />
            </svg>
          </div>

          {/* Readout — static, no state machine */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-mono text-[9px] tracking-[.26em] uppercase text-text-mute2/50">
              {FINAL.year}
            </p>
            <p
              className="font-mono font-bold tabular-nums leading-none"
              style={{
                fontSize: "clamp(28px, 7vw, 40px)",
                color: "#e84040",
                textShadow: "0 0 32px rgba(232,64,64,0.7)",
                animation: "arcPulse 2.8s ease-in-out infinite",
              }}
            >
              {FINAL.label}
            </p>
            <p className="font-mono text-[9px] tracking-[.2em] uppercase text-red-bright/70">
              TO MIDNIGHT
            </p>
            <p className="font-mono text-[8.5px] text-text-mute2/55 max-w-[200px] leading-relaxed mt-1">
              {FINAL.event}
            </p>
          </div>

        </div>

        {/* ── Module init list ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-3 px-6 pb-6 items-center"
          style={{ borderTop: "1px solid rgba(232,64,64,0.08)" }}
        >
          <p className="font-mono text-[7.5px] tracking-[.22em] uppercase text-text-mute2/40 mb-1">
            MODULE INITIALISATION
          </p>

          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {MODULES.map((mod, i) => {
                if (!moduleVisible[i]) return null;
                const isDone = mod.type === "ok" || moduleComplete[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-center gap-2 font-mono text-[10px] leading-none"
                  >
                    <span
                      className={isDone ? "" : "animate-pulse"}
                      style={{ color: isDone ? "#1ae8a0" : "#f0a500", flexShrink: 0 }}
                    >
                      {isDone ? "[OK]" : "[..]"}
                    </span>
                    <span
                      className={isDone ? "" : "animate-pulse"}
                      style={{ color: isDone ? "#1ae8a0" : "#f0a500" }}
                    >
                      {mod.label}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Segmented progress bar */}
          <div className="mt-4 flex items-center gap-0.5" style={{ width: "240px" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-sm overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  className="h-full rounded-sm"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: visibleCount > i ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    transformOrigin: "left",
                    background: i < 3 ? "#1ae8a0" : "#f0a500",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cycling loading message ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2 pb-5 pt-2 relative z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[7.5px] tracking-[.22em] uppercase text-text-mute2/30"
          >
            {LOADING_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

    </div>
  );
}
