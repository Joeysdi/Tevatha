"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── SVG helpers (extracted from globe-loading-screen.tsx) ──────────────────

function clockArcPath(secs: number, r = 40): string {
  const frac = Math.min(secs, 3540) / 3600;
  if (frac <= 0.001) return `M 50 ${50 - r} A ${r} ${r} 0 0 0 50 ${50 - r + 0.01}`;
  const angleRad = -frac * 2 * Math.PI;
  const ex = 50 + r * Math.sin(angleRad);
  const ey = 50 - r * Math.cos(angleRad);
  const large = frac > 0.5 ? 1 : 0;
  return `M 50 ${50 - r} A ${r} ${r} 0 ${large} 0 ${ex.toFixed(3)} ${ey.toFixed(3)}`;
}

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

const LATITUDE_RINGS = [
  { rx: 38, ry: 7  },
  { rx: 32, ry: 13 },
  { rx: 22, ry: 17 },
  { rx: 11, ry: 19 },
  { rx: 2,  ry: 20 },
];

const ARC_PATH = clockArcPath(85);
const HAND_DEG = -(85 / 3600) * 360;

// ── Pillar data ────────────────────────────────────────────────────────────

const PILLARS = [
  {
    id: "watchtower",
    label: "WATCHTOWER",
    accent: "#e84040",
    items: ["Collapse probability", "Threat matrix", "Signal feeds"],
  },
  {
    id: "provisioner",
    label: "PROVISIONER",
    accent: "#c9a84c",
    items: ["Certified gear", "Graded A–D", "Free · Nonprofit"],
  },
  {
    id: "protocol",
    label: "PROTOCOL",
    accent: "#00d4ff",
    items: ["Offline-first", "Continuity ledger", "AES-256 encrypted"],
  },
] as const;

// ── Mini clock SVG (120×120, prefixed IDs to avoid defs collision) ─────────

function MiniClockSvg() {
  return (
    <div className="relative flex-shrink-0 flex items-center justify-center">
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "160px",
          height: "160px",
          background: "radial-gradient(circle, rgba(232,64,64,0.14) 0%, transparent 70%)",
          animation: "glowPulse 2.8s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        width="120"
        height="120"
        style={{ overflow: "visible", position: "relative", zIndex: 1 }}
        aria-label="Doomsday Clock — 85 seconds to midnight"
      >
        <defs>
          <radialGradient id="splash-face-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0c1525" />
            <stop offset="100%" stopColor="#050810" />
          </radialGradient>
          <radialGradient id="splash-midnight-glow" cx="50%" cy="0%" r="60%">
            <stop offset="0%"   stopColor="rgba(232,64,64,0.30)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgba(232,64,64,0)"    stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Globe wireframe latitude rings */}
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
        <circle cx="50" cy="50" r="44" fill="url(#splash-face-bg)" />

        {/* Midnight glow */}
        <circle
          cx="50" cy="50" r="44"
          fill="url(#splash-midnight-glow)"
          style={{ animation: "glowPulse 2.8s ease-in-out infinite" }}
        />

        {/* Outer ring */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(232,64,64,0.22)" strokeWidth="1" />

        {/* Danger arc */}
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

        {/* Clock hand */}
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
  );
}

// ── FadeUp animation helper ────────────────────────────────────────────────

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export function TevatahSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-void-0 flex flex-col items-center
                     justify-center overflow-hidden select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Tevatha application loading"
        >
          {/* CSS keyframes */}
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

          {/* Gold grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(201,168,76,0.03) 1px,transparent 1px)," +
                "linear-gradient(90deg,rgba(201,168,76,0.03) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Scan line */}
          <div
            className="absolute inset-x-0 top-0 h-[2px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.12),transparent)",
              animation: "scanDown 3.5s linear infinite",
              willChange: "transform",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-2xl">

            {/* Header row */}
            <motion.div {...fadeUp(0.15)} className="flex items-center gap-5">
              <div className="hidden sm:block flex-shrink-0">
                <MiniClockSvg />
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className="font-cinzel font-bold tracking-[.22em]"
                  style={{
                    fontSize: "clamp(22px,5vw,32px)",
                    background: "linear-gradient(90deg,#f0c842,#c9a84c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  TEVATHA
                </span>
                <span className="font-mono text-[10px] text-text-mute2 tracking-[.18em] uppercase">
                  Zero-Hour Digital Infrastructure
                </span>
                <span
                  className="font-mono text-[9px] tracking-[.14em] uppercase mt-0.5"
                  style={{ color: "#e84040", textShadow: "0 0 16px rgba(232,64,64,0.5)" }}
                >
                  85 SEC TO MIDNIGHT · 2026
                </span>
                <span
                  className="font-mono text-[9px] tracking-[.12em] uppercase mt-0.5"
                  style={{ color: "#1ae8a0" }}
                >
                  ♥ Free Nonprofit · No Paywalls
                </span>
              </div>
            </motion.div>

            {/* Mission statement */}
            <motion.p
              {...fadeUp(0.35)}
              className="font-syne text-text-dim leading-relaxed text-center w-full"
              style={{ fontSize: "clamp(14px,2.2vw,17px)" }}
            >
              The systems you depend on were not built for the world{" "}
              that&apos;s coming.{" "}
              <span className="text-text-base font-semibold">
                Tevatha is Zero-Hour infrastructure for the scenario planners
                who refused to pretend otherwise.
              </span>
            </motion.p>

            {/* Pillar cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {PILLARS.map((pillar, i) => (
                <motion.div key={pillar.id} {...fadeUp(0.60 + i * 0.20)}>
                  <div
                    className="rounded-xl border border-border-protocol bg-void-1 p-4
                               flex flex-col gap-2 relative overflow-hidden"
                    style={{ borderLeftColor: pillar.accent, borderLeftWidth: "3px" }}
                  >
                    <span
                      className="font-mono text-[11px] font-bold tracking-[.16em]"
                      style={{ color: pillar.accent }}
                    >
                      ◈ {pillar.label}
                    </span>
                    <ul className="flex flex-col gap-0.5">
                      {pillar.items.map(item => (
                        <li key={item} className="font-mono text-[10px] text-text-mute2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              {...fadeUp(1.20)}
              className="w-full max-w-md flex flex-col items-center gap-2"
            >
              <div className="w-full h-px bg-border-protocol relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-0 origin-left"
                  style={{ background: "linear-gradient(90deg,#c9a84c,#f0c842)" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2.1, delay: 1.2, ease: "linear" }}
                />
              </div>
              <p className="font-mono text-[8px] tracking-[.24em] uppercase text-text-mute2/50">
                INITIALIZING SYSTEM
              </p>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
