// components/watchtower/doomsday-clock.tsx
"use client";

import { useEffect, useState } from "react";

// Locked at 85 seconds — display fixture, not a countdown.
// Source: Bulletin of Atomic Scientists, January 27, 2026.
const LOCKED_SECONDS = 85;
const MAX_SECONDS    = 120; // Historical max for arc scale

const HISTORY = [
  { year: "1953", val: "120s", note: "Closest historically until 2020" },
  { year: "1991", val: "17min", note: "Post-Cold War reset" },
  { year: "2020", val: "100s", note: "Prior record" },
  { year: "2026", val: "85s",  note: "All-time closest", isNow: true },
] as const;

interface DoomsdayClockProps {
  className?: string;
}

export function DoomsdayClock({ className = "" }: DoomsdayClockProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r    = 70;
  const cx   = 88;
  const cy   = 88;
  // Extra top padding so the MIDNIGHT label doesn't clip into HTML above the SVG
  const topPad = 26;

  const circ       = 2 * Math.PI * r;
  const pct        = LOCKED_SECONDS / MAX_SECONDS;
  const dashOffset = mounted ? circ * (1 - pct) : circ;

  // SVG viewport: extend upward by topPad so MIDNIGHT text has room
  const svgW = cx * 2;
  const svgH = cy * 2 + topPad;

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="figure"
      aria-label={`Doomsday Clock: ${LOCKED_SECONDS} seconds to midnight — all-time closest. Source: Bulletin of Atomic Scientists, January 27, 2026`}
    >
      {/* SVG Arc — viewBox shifted up by topPad so MIDNIGHT fits */}
      <div className="relative">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 ${-topPad} ${svgW} ${svgH}`}
        >
          <defs>
            <filter id="clock-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
          />

          {/* Midnight marker (top, 12 o'clock) */}
          <line
            x1={cx} y1={cy - r - 14}
            x2={cx} y2={cy - r - 6}
            stroke="rgba(232,64,64,0.5)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <text
            x={cx} y={cy - r - 18}
            textAnchor="middle"
            className="font-mono"
            fontSize="7"
            fill="rgba(232,64,64,0.6)"
            letterSpacing="1"
          >
            MIDNIGHT
          </text>

          {/* Active arc */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#e84040"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            filter="url(#arc-glow)"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }}
          />

          {/* Glowing tip dot at arc end */}
          {mounted && (
            <circle
              cx={cx + r * Math.cos((2 * Math.PI * pct) - Math.PI / 2)}
              cy={cy + r * Math.sin((2 * Math.PI * pct) - Math.PI / 2)}
              r={6}
              fill="#e84040"
              filter="url(#clock-glow)"
              className="animate-pulse"
            />
          )}

          {/* Centre: seconds */}
          <text
            x={cx} y={cy - 10}
            textAnchor="middle"
            fontSize="36"
            fontFamily="'Rajdhani', 'Syne', sans-serif"
            fontWeight="700"
            fill="#e84040"
            filter="url(#arc-glow)"
          >
            85s
          </text>
          <text
            x={cx} y={cy + 10}
            textAnchor="middle"
            fontSize="8"
            fontFamily="'Share Tech Mono', monospace"
            fill="rgba(148,163,184,0.7)"
            letterSpacing="1.5"
          >
            TO MIDNIGHT
          </text>
          <text
            x={cx} y={cy + 24}
            textAnchor="middle"
            fontSize="7"
            fontFamily="'Share Tech Mono', monospace"
            fill="rgba(71,85,105,0.8)"
            letterSpacing="1"
          >
            ALL-TIME CLOSEST
          </text>
        </svg>
      </div>

      {/* Historical comparison */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {HISTORY.map((h) => (
          <div
            key={h.year}
            className={`text-center px-1.5 py-1.5 rounded-md border
                        ${"isNow" in h && h.isNow
                          ? "bg-red-protocol/10 border-red-protocol/25"
                          : "bg-void-2 border-border-protocol"
                        }`}
          >
            <div className="font-mono text-[9px] text-text-mute2">{h.year}</div>
            <div
              className={`font-syne font-bold text-sm leading-tight
                          ${"isNow" in h && h.isNow ? "text-red-bright" : "text-text-dim"}`}
            >
              {h.val}
            </div>
          </div>
        ))}
      </div>

      {/* Source attribution — below the grid, no overlap risk */}
      <p className="font-mono text-[8.5px] text-red-bright/60 tracking-[.14em] uppercase text-center">
        Bulletin of Atomic Scientists · Jan 27, 2026
      </p>
    </div>
  );
}
