// components/watchtower/globe-timeline.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";
import type { TimelineEvent, DecisionGate } from "@/lib/watchtower/data";

// ── Constants ─────────────────────────────────────────────────────────────────

const PX_PER_YEAR = 40;
const START_YEAR  = 1942;
const END_YEAR    = 2038;
const NOW_YEAR    = 2026;
const AXIS_TOP    = 62; // px from top of container — horizontal axis position
const TOTAL_W     = (END_YEAR - START_YEAR) * PX_PER_YEAR + 80; // +80 right padding

function yrToPx(y: number): number {
  return (y - START_YEAR) * PX_PER_YEAR;
}

const PHASES = [
  { id:"P1", label:"STABILITY",  yearStart:1945, yearEnd:1971, hex:"#38bdf8" },
  { id:"P2", label:"EXPANSION",  yearStart:1971, yearEnd:2008, hex:"#818cf8" },
  { id:"P3", label:"STRESS",     yearStart:2008, yearEnd:2020, hex:"#fbbf24" },
  { id:"P4", label:"NOW",        yearStart:2020, yearEnd:2027, hex:"#e84040", isNow:true },
  { id:"P5", label:"CASCADE",    yearStart:2027, yearEnd:2032, hex:"#ff0055" },
  { id:"P6", label:"RESOLVE",    yearStart:2032, yearEnd:2038, hex:"#64748b" },
] as const;

const EVENT_COLORS: Record<string, string> = {
  red:  "#e84040",
  warn: "#f0a500",
  info: "#38bdf8",
  pink: "#ff0055",
};

const TIER_HEX: Record<string, string> = {
  t4: "#e84040",
  t3: "#f0a500",
  t2: "#38bdf8",
  t1: "#1ae8a0",
};

function parseYear(y: string): number {
  if (y.toLowerCase() === "now") return NOW_YEAR;
  const n = parseInt(y, 10);
  return isNaN(n) ? NOW_YEAR : n;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  activePhase:   string;
  onPhaseSelect: (phaseId: string) => void;
  onEventSelect: (event: TimelineEvent | null) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobeTimeline({ activePhase, onPhaseSelect, onEventSelect }: Props) {
  const scrollRef    = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeEvt,  setActiveEvt]  = useState<TimelineEvent | null>(null);
  const [gateHov,    setGateHov]    = useState<DecisionGate | null>(null);
  const [scrollYear, setScrollYear] = useState(NOW_YEAR);

  // Scroll NOW into view on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nowPx = yrToPx(NOW_YEAR);
    el.scrollLeft = nowPx - el.clientWidth * 0.55;
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Scroll handler — instant year display, debounced globe update
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const centerX    = el.scrollLeft + el.clientWidth / 2;
    const centerYear = centerX / PX_PER_YEAR + START_YEAR;
    setScrollYear(Math.round(centerYear));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Update active phase
      const phase = PHASES.find(
        (p) => centerYear >= p.yearStart && centerYear < p.yearEnd,
      );
      if (phase) onPhaseSelect(phase.id);

      // Find nearest event within ±3.5 years of center
      let closest: TimelineEvent | null = null;
      let minDist = Infinity;
      for (const evt of TIMELINE_EVENTS) {
        const dist = Math.abs(parseYear(evt.year) - centerYear);
        if (dist < minDist) { minDist = dist; closest = evt; }
      }
      if (closest && minDist < 3.5) {
        setActiveEvt(closest);
        onEventSelect(closest);
      } else {
        setActiveEvt(null);
        onEventSelect(null);
      }
    }, 180);
  }, [onPhaseSelect, onEventSelect]);

  return (
    <div
      className="flex-shrink-0 bg-void-1 border-t border-border-protocol relative overflow-hidden select-none"
      style={{ height: 100 }}
    >
      {/* Viewport center hairline — visual guide */}
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none z-10"
        style={{ background: "rgba(255,255,255,0.035)" }}
      />

      {/* Scroll year display — top center */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p className="font-mono text-[7px] tabular-nums tracking-[.1em] text-text-mute2/45">
          {scrollYear > NOW_YEAR
            ? `▶ ${scrollYear} FORECAST`
            : scrollYear < NOW_YEAR
            ? `◀ ${scrollYear}`
            : "▶ NOW · 2026"}
        </p>
      </div>

      {/* Scroll hint — top right */}
      <div className="absolute top-2 right-3 z-20 pointer-events-none">
        <p className="font-mono text-[6px] tracking-[.2em] uppercase text-text-mute2/25">
          drag ←→
        </p>
      </div>

      {/* Scrollable canvas */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="relative h-full" style={{ width: TOTAL_W, minWidth: TOTAL_W }}>

          {/* ── Phase zone backgrounds ──────────────────────────────────── */}
          {PHASES.map((p) => {
            const x      = yrToPx(p.yearStart);
            const w      = yrToPx(p.yearEnd) - x;
            const active = activePhase === p.id;
            return (
              <div
                key={p.id}
                className="absolute top-0 bottom-0 transition-colors duration-500 pointer-events-none"
                style={{
                  left:        x,
                  width:       w,
                  background:  active ? `${p.hex}12` : `${p.hex}06`,
                  borderRight: `1px solid ${p.hex}18`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 transition-all duration-500"
                  style={{
                    height:     active ? 2 : 1,
                    background: active ? p.hex : `${p.hex}30`,
                    boxShadow:  active ? `0 0 8px ${p.hex}` : "none",
                  }}
                />
                {/* Phase label */}
                <div className="absolute left-2 top-[5px]">
                  <p
                    className="font-mono font-bold truncate transition-all duration-300"
                    style={{
                      fontSize:      "6.5px",
                      letterSpacing: ".18em",
                      color:         active ? p.hex : `${p.hex}50`,
                    }}
                  >
                    {"isNow" in p && p.isNow ? "▶ " : ""}{p.label}
                  </p>
                  <p
                    className="font-mono"
                    style={{
                      fontSize: "5.5px",
                      color:    active ? `${p.hex}70` : `${p.hex}30`,
                      letterSpacing: ".06em",
                    }}
                  >
                    {p.yearStart}–{p.yearEnd}
                  </p>
                </div>
              </div>
            );
          })}

          {/* ── Horizontal axis line ──────────────────────────────────── */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top:        AXIS_TOP,
              height:     1,
              background: "rgba(255,255,255,0.08)",
            }}
          />

          {/* ── NOW vertical glow line ────────────────────────────────── */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{
              left:       yrToPx(NOW_YEAR),
              width:      1,
              background: "linear-gradient(to bottom,#e84040cc,#e8404022)",
              boxShadow:  "0 0 6px rgba(232,64,64,0.5)",
            }}
          />

          {/* ── Decade tick marks ─────────────────────────────────────── */}
          {Array.from({ length: Math.ceil((END_YEAR - START_YEAR) / 10) }, (_, i) => {
            const yr = Math.ceil(START_YEAR / 10) * 10 + i * 10;
            if (yr < START_YEAR || yr > END_YEAR) return null;
            return (
              <div
                key={yr}
                className="absolute pointer-events-none"
                style={{ left: yrToPx(yr), top: AXIS_TOP - 5 }}
              >
                <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.12)" }} />
                <p
                  className="font-mono absolute whitespace-nowrap"
                  style={{
                    fontSize:      "6px",
                    color:         "rgba(120,140,160,0.35)",
                    top:           12,
                    left:          2,
                    letterSpacing: ".04em",
                  }}
                >
                  {yr}
                </p>
              </div>
            );
          })}

          {/* ── Decision gate markers ─────────────────────────────────── */}
          {GATES.map((gate, i) => {
            const gateYear = NOW_YEAR + 0.4 + i * 0.75;
            const x        = yrToPx(gateYear);
            const col      = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div
                key={gate.id}
                className="absolute z-20 cursor-pointer"
                style={{ left: x - 5, top: AXIS_TOP - 18 }}
                onMouseEnter={() => setGateHov(gate)}
                onMouseLeave={() => setGateHov(null)}
              >
                {/* Downward triangle */}
                <div
                  style={{
                    width:  0,
                    height: 0,
                    borderLeft:  "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop:   `7px solid ${col}`,
                    filter:      `drop-shadow(0 0 3px ${col}99)`,
                  }}
                />
                <p
                  className="font-mono absolute whitespace-nowrap text-center"
                  style={{
                    fontSize:  "5.5px",
                    color:     col,
                    opacity:   0.7,
                    top:       -10,
                    left:      "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {gate.id}
                </p>
              </div>
            );
          })}

          {/* Gate hover tooltip — fixed so it doesn't get clipped */}
          {gateHov && (
            <div
              className="fixed bottom-[108px] left-1/2 -translate-x-1/2 z-50
                         rounded-xl px-3 py-2.5 pointer-events-none max-w-[260px]"
              style={{
                background:  "rgba(8,10,18,0.97)",
                border:      `1px solid ${TIER_HEX[gateHov.tier]}45`,
                boxShadow:   "0 8px 32px rgba(0,0,0,0.7)",
              }}
            >
              <p
                className="font-mono text-[8px] tracking-[.14em] uppercase mb-1"
                style={{ color: TIER_HEX[gateHov.tier] }}
              >
                {gateHov.id} · {gateHov.tier.toUpperCase()} · {gateHov.window}
              </p>
              <p className="font-syne font-bold text-[11px] text-text-base mb-1">{gateHov.trigger}</p>
              <p className="font-mono text-[9px] text-text-dim leading-relaxed">{gateHov.action}</p>
            </div>
          )}

          {/* ── Event dots ────────────────────────────────────────────── */}
          {TIMELINE_EVENTS.map((evt, i) => {
            const yr       = parseYear(evt.year);
            const x        = yrToPx(yr);
            const col      = EVENT_COLORS[evt.colKey] ?? "#c9a84c";
            const isActive = activeEvt === evt;
            const isPred   = evt.predicted === true;
            const dotSize  = isActive ? 12 : 8;
            const dotLeft  = x - dotSize / 2;
            const dotTop   = AXIS_TOP - dotSize / 2;

            return (
              <div
                key={i}
                className="absolute z-20 pointer-events-none"
                style={{ left: dotLeft, top: dotTop }}
              >
                {/* NOW pulse ring */}
                {evt.isNow && (
                  <div
                    className="absolute rounded-full animate-ping"
                    style={{
                      inset:      -4,
                      background: col,
                      opacity:    0.25,
                    }}
                  />
                )}

                {/* Dot */}
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width:       dotSize,
                    height:      dotSize,
                    background:  isPred ? "transparent" : isActive ? col : `${col}cc`,
                    border:      isPred
                      ? `1.5px dashed ${col}${isActive ? "ff" : "88"}`
                      : `2px solid rgba(5,8,10,0.6)`,
                    boxShadow:   isActive
                      ? `0 0 12px ${col}, 0 0 24px ${col}55`
                      : `0 0 4px ${col}55`,
                    opacity:     isPred && !isActive ? 0.55 : 1,
                  }}
                />

                {/* Year label — below dot */}
                <p
                  className="font-mono absolute whitespace-nowrap text-center transition-all duration-200"
                  style={{
                    fontSize:  "6px",
                    color:     isActive ? col : `${col}70`,
                    top:       dotSize + 5,
                    left:      "50%",
                    transform: "translateX(-50%)",
                    fontWeight: isActive ? "bold" : "normal",
                    letterSpacing: ".04em",
                  }}
                >
                  {evt.isNow ? "NOW" : yr}{isPred ? "~" : ""}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
