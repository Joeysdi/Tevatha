// components/watchtower/globe-timeline.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";
import type { TimelineEvent, DecisionGate } from "@/lib/watchtower/data";

// ── Constants ─────────────────────────────────────────────────────────────────

const PX_PER_YEAR = 36;
const START_YEAR  = 1942;
const END_YEAR    = 2037;
const NOW_YEAR    = 2026;

function yrToPx(y: number): number {
  return (y - START_YEAR) * PX_PER_YEAR;
}

const TOTAL_W = yrToPx(END_YEAR);

const PHASES = [
  { id:"P1", shortLabel:"P1 · Stability",  yearStart:1945, yearEnd:1971,  hex:"#38bdf8" },
  { id:"P2", shortLabel:"P2 · Expansion",  yearStart:1971, yearEnd:2008,  hex:"#818cf8" },
  { id:"P3", shortLabel:"P3 · Stress",     yearStart:2008, yearEnd:2020,  hex:"#fbbf24" },
  { id:"P4", shortLabel:"P4 · NOW ◀",      yearStart:2020, yearEnd:2027,  hex:"#e84040", isNow:true },
  { id:"P5", shortLabel:"P5 · Cascade",    yearStart:2025, yearEnd:2032,  hex:"#ff0055" },
  { id:"P6", shortLabel:"P6 · Resolve",    yearStart:2030, yearEnd:2037,  hex:"#475569" },
] as const;

const EVENT_COLORS: Record<string, string> = {
  red:  "#e84040",
  warn: "#f0a500",
  info: "#38bdf8",
  pink: "#ff0055",
};

function parseYear(y: string): number {
  if (y.toLowerCase() === "now") return NOW_YEAR;
  const n = parseInt(y, 10);
  return isNaN(n) ? NOW_YEAR : n;
}

// Tier colors for gate dots
const TIER_HEX: Record<string, string> = {
  t4: "#e84040",
  t3: "#f0a500",
  t2: "#38bdf8",
  t1: "#1ae8a0",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  activePhase:   string;
  onPhaseSelect: (phaseId: string) => void;
  onEventSelect: (event: TimelineEvent | null) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobeTimeline({ activePhase, onPhaseSelect, onEventSelect }: Props) {
  const scrollRef     = useRef<HTMLDivElement>(null);
  const [hovered,     setHovered]     = useState<TimelineEvent | null>(null);
  const [selected,    setSelected]    = useState<TimelineEvent | null>(null);
  const [gateHovered, setGateHovered] = useState<DecisionGate | null>(null);

  // Scroll NOW into view on mount (at ~65% from left)
  useEffect(() => {
    if (scrollRef.current) {
      const nowPx  = yrToPx(NOW_YEAR);
      const viewW  = scrollRef.current.clientWidth;
      scrollRef.current.scrollLeft = nowPx - viewW * 0.65;
    }
  }, []);

  const handleEventClick = (evt: TimelineEvent) => {
    const next = selected === evt ? null : evt;
    setSelected(next);
    onEventSelect(next);
    const yr    = parseYear(evt.year);
    const phase = PHASES.find((p) => yr >= p.yearStart && yr <= p.yearEnd);
    if (phase) onPhaseSelect(phase.id);
  };

  return (
    <div className="h-[72px] sm:h-[86px] flex-shrink-0 bg-void-1 border-t border-border-protocol relative overflow-hidden select-none">

      {/* Label */}
      <div className="absolute top-1.5 left-3 z-10 pointer-events-none">
        <p className="font-mono text-[6.5px] tracking-[.24em] uppercase text-text-mute2/50">
          Timeline · click phase or event · drag to explore
        </p>
      </div>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="relative h-full" style={{ width: TOTAL_W, minWidth: TOTAL_W }}>

          {/* ── Phase zone backgrounds ────────────────────────────────────── */}
          {PHASES.map((p) => {
            const x      = yrToPx(p.yearStart);
            const w      = yrToPx(p.yearEnd) - x;
            const active = activePhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPhaseSelect(p.id)}
                className="absolute top-0 h-full cursor-pointer transition-all duration-300 group"
                style={{
                  left:        x,
                  width:       w,
                  background:  active ? `${p.hex}22` : `${p.hex}09`,
                  borderRight: `1px solid ${p.hex}28`,
                }}
                title={p.shortLabel}
              >
                {/* Phase label */}
                <div className="absolute top-[14px] left-2 right-1 flex items-center gap-1 pointer-events-none overflow-hidden">
                  <span
                    className="font-mono font-bold truncate transition-colors"
                    style={{
                      fontSize:      "7.5px",
                      letterSpacing: ".08em",
                      color:         active ? p.hex : `${p.hex}70`,
                    }}
                  >
                    {p.shortLabel}
                    {"isNow" in p && p.isNow && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse ml-1 align-middle"
                      />
                    )}
                  </span>
                </div>

                {/* Active indicator line at top of zone */}
                {active && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                    style={{ background: p.hex, boxShadow: `0 0 8px ${p.hex}` }}
                  />
                )}
              </button>
            );
          })}

          {/* ── NOW vertical line ─────────────────────────────────────────── */}
          <div
            className="absolute top-0 bottom-0 w-px pointer-events-none z-10"
            style={{
              left:       yrToPx(NOW_YEAR),
              background: "linear-gradient(to bottom, #e84040cc, #e8404033)",
              boxShadow:  "0 0 8px rgba(232,64,64,0.5)",
            }}
          />

          {/* ── Decade tick marks ─────────────────────────────────────────── */}
          {Array.from(
            { length: Math.ceil((END_YEAR - START_YEAR) / 10) },
            (_, i) => START_YEAR + Math.ceil((START_YEAR % 10 === 0 ? 0 : 10 - (START_YEAR % 10)) + i * 10)
          )
            .filter((y) => y % 10 === 0 && y >= START_YEAR && y <= END_YEAR)
            .map((yr) => (
              <div
                key={yr}
                className="absolute bottom-0 pointer-events-none"
                style={{ left: yrToPx(yr) }}
              >
                <div className="w-px h-2 bg-border-protocol/30" />
                <div
                  className="absolute bottom-2.5 left-0.5 font-mono whitespace-nowrap"
                  style={{ fontSize: "6.5px", color: "rgba(120,140,160,0.45)" }}
                >
                  {yr}
                </div>
              </div>
            ))}

          {/* ── Decision gates (small triangles above event area) ─────────── */}
          {GATES.map((gate, i) => {
            // We don't have a year on gates — place them at 2026+ spaced out
            const gateYear = NOW_YEAR + 0.5 + i * 0.7;
            const x        = yrToPx(gateYear);
            const col      = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div
                key={gate.id}
                className="absolute z-20 cursor-pointer"
                style={{ left: x - 4, top: 30 }}
                onMouseEnter={() => setGateHovered(gate)}
                onMouseLeave={() => setGateHovered(null)}
              >
                {/* Triangle marker */}
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft:   "4px solid transparent",
                    borderRight:  "4px solid transparent",
                    borderBottom: `6px solid ${col}`,
                    filter:       `drop-shadow(0 0 4px ${col}80)`,
                  }}
                />
                <span
                  className="font-mono absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  style={{ fontSize: "6px", color: col, opacity: 0.8 }}
                >
                  {gate.id}
                </span>
              </div>
            );
          })}

          {/* Gate hover tooltip */}
          {gateHovered && (
            <div
              className="fixed bottom-[92px] z-50 bg-void-1 border border-border-protocol
                         rounded-xl px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]
                         pointer-events-none max-w-[280px]"
              style={{ borderColor: `${TIER_HEX[gateHovered.tier]}40` }}
            >
              <p className="font-mono text-[8px] tracking-[.14em] uppercase mb-1"
                 style={{ color: TIER_HEX[gateHovered.tier] }}>
                {gateHovered.id} · {gateHovered.tier.toUpperCase()} · {gateHovered.window}
              </p>
              <p className="font-syne font-bold text-[11px] text-text-base mb-1">
                {gateHovered.trigger}
              </p>
              <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                {gateHovered.action}
              </p>
            </div>
          )}

          {/* ── Timeline event dots ───────────────────────────────────────── */}
          {TIMELINE_EVENTS.map((evt, i) => {
            const yr     = parseYear(evt.year);
            const x      = yrToPx(yr);
            const col    = EVENT_COLORS[evt.colKey] ?? "#c9a84c";
            const isSel  = selected === evt;
            const isHov  = hovered  === evt;
            const active = isSel || isHov;

            return (
              <button
                key={i}
                onClick={() => handleEventClick(evt)}
                onMouseEnter={() => setHovered(evt)}
                onMouseLeave={() => setHovered(null)}
                className="absolute z-20 group"
                style={{ left: x - 5, bottom: 8 }}
              >
                {/* Pulse ring for NOW event */}
                {evt.isNow && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-40"
                    style={{ background: col }}
                  />
                )}

                {/* Dot */}
                <div
                  className="relative w-2.5 h-2.5 rounded-full border-2 border-void-1
                             transition-transform duration-100"
                  style={{
                    background:  col,
                    boxShadow:   active ? `0 0 12px ${col}, 0 0 24px ${col}55` : `0 0 5px ${col}66`,
                    transform:   active ? "scale(1.55)" : "scale(1)",
                  }}
                />

                {/* Year label below dot */}
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ opacity: active ? 1 : 0.55 }}
                >
                  <span
                    className="font-mono font-bold whitespace-nowrap block"
                    style={{ fontSize: "7px", color: col }}
                  >
                    {evt.isNow ? "NOW" : evt.year}
                  </span>
                </div>

                {/* Popup card on select/hover */}
                {active && (
                  <div
                    className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30
                               bg-void-1 rounded-xl overflow-hidden
                               pointer-events-none whitespace-nowrap"
                    style={{
                      border:    `1px solid ${col}50`,
                      boxShadow: `0 6px 24px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03) inset`,
                      minWidth:  200,
                      maxWidth:  260,
                      whiteSpace:"normal",
                    }}
                  >
                    <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />
                    <div className="px-3 py-2">
                      <p className="font-syne font-bold text-[10px] text-text-base leading-snug mb-1">
                        {evt.label}
                      </p>
                      <p className="font-mono text-[8.5px] text-text-dim leading-relaxed">
                        {evt.signal}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
}
