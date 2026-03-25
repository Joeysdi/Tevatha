// components/watchtower/globe-timeline.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";
import type { TimelineEvent, DecisionGate } from "@/lib/watchtower/data";

// ── Non-linear scale ───────────────────────────────────────────────────────────
// Dense around NOW, compressed for distant past/future

const SEGMENTS = [
  { yearStart: 1942, yearEnd: 2000, pxPerYear: 5  },
  { yearStart: 2000, yearEnd: 2015, pxPerYear: 10 },
  { yearStart: 2015, yearEnd: 2022, pxPerYear: 24 },
  { yearStart: 2022, yearEnd: 2028, pxPerYear: 36 },
  { yearStart: 2028, yearEnd: 2035, pxPerYear: 16 },
  { yearStart: 2035, yearEnd: 2038, pxPerYear: 6  },
] as const;

// Cumulative px offset for each segment start
const SEG_OFFSETS: number[] = (() => {
  const out: number[] = [];
  let cum = 0;
  for (const seg of SEGMENTS) {
    out.push(cum);
    cum += (seg.yearEnd - seg.yearStart) * seg.pxPerYear;
  }
  return out;
})();

const CONTENT_W = SEG_OFFSETS[SEGMENTS.length - 1] +
  (SEGMENTS[SEGMENTS.length - 1].yearEnd - SEGMENTS[SEGMENTS.length - 1].yearStart) *
  SEGMENTS[SEGMENTS.length - 1].pxPerYear;

const SIDE_PAD = 1200; // empty space either side so any screen can scroll past edges
const TOTAL_W  = SIDE_PAD + CONTENT_W + SIDE_PAD;

const NOW_YEAR   = 2026;
const START_YEAR = 1942;
const END_YEAR   = 2038;
const AXIS_Y     = 40;   // px from container top — axis position
const HEIGHT     = 76;

function yrToPx(year: number): number {
  for (let i = 0; i < SEGMENTS.length; i++) {
    const seg = SEGMENTS[i];
    if (year >= seg.yearStart && year <= seg.yearEnd) {
      return SIDE_PAD + SEG_OFFSETS[i] + (year - seg.yearStart) * seg.pxPerYear;
    }
  }
  return SIDE_PAD + CONTENT_W; // past end
}

function pxToYr(px: number): number {
  const adj = px - SIDE_PAD;
  let cum = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    const seg = SEGMENTS[i];
    const segW = (seg.yearEnd - seg.yearStart) * seg.pxPerYear;
    if (adj <= cum + segW) {
      return seg.yearStart + (adj - cum) / seg.pxPerYear;
    }
    cum += segW;
  }
  return END_YEAR;
}

function parseYear(y: string): number {
  if (y.toLowerCase() === "now") return NOW_YEAR;
  const n = parseInt(y, 10);
  return isNaN(n) ? NOW_YEAR : n;
}

// ── Phase metadata (for axis coloring) ────────────────────────────────────────

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
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8", t1: "#1ae8a0",
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  activePhase:   string;
  onPhaseSelect: (phaseId: string) => void;
  onEventSelect: (event: TimelineEvent | null) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function GlobeTimeline({ activePhase, onPhaseSelect, onEventSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeEvt,  setActiveEvt]  = useState<TimelineEvent | null>(null);
  const [gateHov,    setGateHov]    = useState<DecisionGate | null>(null);
  const [scrollYear, setScrollYear] = useState(NOW_YEAR);

  // Scroll NOW into center on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = yrToPx(NOW_YEAR) - el.clientWidth * 0.5;
  }, []);

  // Wheel over timeline bar → horizontal scroll, prevent page scroll
  useEffect(() => {
    const container = containerRef.current;
    const scroller  = scrollRef.current;
    if (!container || !scroller) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scroller.scrollLeft += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const centerX    = el.scrollLeft + el.clientWidth / 2;
    const centerYear = pxToYr(centerX);
    setScrollYear(Math.round(centerYear));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const phase = PHASES.find(p => centerYear >= p.yearStart && centerYear < p.yearEnd);
      if (phase) onPhaseSelect(phase.id);

      let closest: TimelineEvent | null = null;
      let minDist = Infinity;
      for (const evt of TIMELINE_EVENTS) {
        const dist = Math.abs(parseYear(evt.year) - centerYear);
        if (dist < minDist) { minDist = dist; closest = evt; }
      }
      if (closest && minDist < 4) {
        setActiveEvt(closest);
        onEventSelect(closest);
      } else {
        setActiveEvt(null);
        onEventSelect(null);
      }
    }, 160);
  }, [onPhaseSelect, onEventSelect]);

  const activePhaseHex = PHASES.find(p => p.id === activePhase)?.hex ?? "#e84040";

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{
        height:     HEIGHT,
        background: "transparent",
      }}
    >
      {/* ── Playhead ── */}
      <div
        className="absolute top-0 bottom-0 left-1/2 z-20 pointer-events-none"
        style={{
          width: 1,
          transform: "translateX(-0.5px)",
          background: `linear-gradient(to bottom, transparent, ${activePhaseHex}66 40%, ${activePhaseHex}99 50%, ${activePhaseHex}66 60%, transparent)`,
          transition: "background 0.5s",
        }}
      />
      {/* Playhead top nub */}
      <div
        className="absolute top-0 left-1/2 z-20 pointer-events-none"
        style={{ transform: "translateX(-50%)" }}
      >
        <div style={{
          width: 0, height: 0,
          borderLeft: "3px solid transparent",
          borderRight: "3px solid transparent",
          borderTop: `4px solid ${activePhaseHex}88`,
          transition: "border-top-color 0.5s",
        }} />
      </div>

      {/* ── Year readout ── */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <p
          className="font-mono tabular-nums"
          style={{ fontSize: "7px", letterSpacing: ".1em", color: `${activePhaseHex}cc`, transition: "color 0.5s" }}
        >
          {scrollYear > NOW_YEAR ? `${scrollYear} ▸ forecast` : scrollYear < NOW_YEAR ? `◂ ${scrollYear}` : "▸ now  2026"}
        </p>
      </div>

      {/* ── Scrollable canvas ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-x-auto overflow-y-hidden"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
          scrollbarWidth: "none",        /* Firefox */
          msOverflowStyle: "none",       /* IE/Edge */
        } as React.CSSProperties}
      >
        <div className="relative" style={{ width: TOTAL_W, height: HEIGHT }}>

          {/* ── Axis line — colored per phase, no backgrounds ── */}
          {PHASES.map((p) => {
            const x = yrToPx(p.yearStart);
            const w = yrToPx(p.yearEnd) - x;
            const isActive = activePhase === p.id;
            return (
              <div
                key={p.id}
                className="absolute pointer-events-none"
                style={{
                  left: x, width: w,
                  top: AXIS_Y,
                  height: 1,
                  background: isActive
                    ? `linear-gradient(90deg, ${p.hex}20, ${p.hex}aa, ${p.hex}aa, ${p.hex}20)`
                    : `${p.hex}25`,
                  boxShadow: isActive ? `0 0 4px ${p.hex}55` : "none",
                  transition: "all 0.5s",
                }}
              />
            );
          })}

          {/* ── Phase labels — floating text only, no containers ── */}
          {PHASES.map((p) => {
            const x = yrToPx(p.yearStart);
            const isActive = activePhase === p.id;
            return (
              <p
                key={p.id + "-lbl"}
                className="absolute pointer-events-none font-mono whitespace-nowrap"
                style={{
                  left: x + 3,
                  top: 5,
                  fontSize: "5px",
                  letterSpacing: ".2em",
                  color: isActive ? `${p.hex}bb` : `${p.hex}38`,
                  transition: "color 0.4s",
                }}
              >
                {"isNow" in p && p.isNow ? "▶ " : ""}{p.label}
              </p>
            );
          })}

          {/* ── Era/decade ticks — sparse for compressed zones ── */}
          {[1945, 1950, 1960, 1970, 1980, 1990, 2000, 2005, 2010, 2015, 2018, 2020, 2022, 2024, 2026, 2028, 2030, 2032, 2035, 2038].map((yr) => {
            const isMajor = yr % 10 === 0 || yr === NOW_YEAR;
            return (
              <div key={yr} className="absolute pointer-events-none" style={{ left: yrToPx(yr) }}>
                <div style={{
                  position: "absolute",
                  top: AXIS_Y - (isMajor ? 4 : 2),
                  width: 1,
                  height: isMajor ? 8 : 4,
                  background: yr === NOW_YEAR ? "rgba(232,64,64,0.7)" : "rgba(255,255,255,0.1)",
                }} />
                {isMajor && yr !== NOW_YEAR && (
                  <p style={{
                    position: "absolute",
                    top: AXIS_Y + 7,
                    left: 2,
                    fontSize: "5px",
                    fontFamily: "monospace",
                    color: "rgba(90,110,130,0.38)",
                    whiteSpace: "nowrap",
                  }}>
                    {yr}
                  </p>
                )}
                {yr === NOW_YEAR && (
                  <p style={{
                    position: "absolute",
                    top: AXIS_Y + 7,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "5px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "rgba(232,64,64,0.7)",
                    whiteSpace: "nowrap",
                  }}>
                    {NOW_YEAR}
                  </p>
                )}
              </div>
            );
          })}

          {/* ── NOW glow mark ── */}
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: yrToPx(NOW_YEAR),
              top: AXIS_Y - 10,
              width: 1,
              height: 20,
              background: "linear-gradient(to bottom, transparent, #e84040dd, transparent)",
              boxShadow: "0 0 6px rgba(232,64,64,0.5)",
            }}
          />

          {/* ── Decision gate markers ── */}
          {GATES.map((gate, i) => {
            const gateYear = NOW_YEAR + 0.4 + i * 0.75;
            const x = yrToPx(gateYear);
            const col = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div
                key={gate.id}
                className="absolute z-20 cursor-pointer"
                style={{ left: x - 4, top: AXIS_Y - 14 }}
                onMouseEnter={() => setGateHov(gate)}
                onMouseLeave={() => setGateHov(null)}
              >
                <div style={{
                  width: 0, height: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `6px solid ${col}`,
                  filter: `drop-shadow(0 0 2px ${col}99)`,
                }} />
                <p style={{
                  position: "absolute",
                  fontSize: "5px", fontFamily: "monospace",
                  color: col, opacity: 0.7,
                  top: -8, left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", letterSpacing: ".1em",
                }}>
                  {gate.id}
                </p>
              </div>
            );
          })}

          {/* Gate tooltip — no box, just clean text */}
          {gateHov && (
            <div
              className="fixed bottom-[82px] left-1/2 -translate-x-1/2 z-50
                         rounded-xl px-3 py-2 pointer-events-none max-w-[260px]"
              style={{
                background: "rgba(6,8,14,0.97)",
                border: `1px solid ${TIER_HEX[gateHov.tier]}35`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
              }}
            >
              <p className="font-mono text-[7.5px] tracking-[.14em] uppercase mb-1"
                 style={{ color: TIER_HEX[gateHov.tier] }}>
                {gateHov.id} · {gateHov.tier.toUpperCase()} · {gateHov.window}
              </p>
              <p className="font-syne font-bold text-[11px] text-text-base mb-0.5">{gateHov.trigger}</p>
              <p className="font-mono text-[8.5px] text-text-dim leading-relaxed">{gateHov.action}</p>
            </div>
          )}

          {/* ── Event dots + floating labels — no boxes at all ── */}
          {TIMELINE_EVENTS.map((evt, i) => {
            const yr       = parseYear(evt.year);
            const x        = yrToPx(yr);
            const col      = EVENT_COLORS[evt.colKey] ?? "#c9a84c";
            const isActive = activeEvt === evt;
            const isPred   = evt.predicted === true;
            const above    = i % 2 === 0;

            const dotR     = isActive ? 4 : 2.5;
            const stemLen  = isActive ? 14 : 8;

            // Dot center
            const dotCY = above ? AXIS_Y - stemLen - dotR : AXIS_Y + stemLen + dotR;
            const stemTop = above ? dotCY + dotR : AXIS_Y;

            // Label positions (outer side, away from axis)
            const yearLabelY = above ? dotCY - dotR - 9  : dotCY + dotR + 2;
            const nameLabelY = above ? dotCY - dotR - 18 : dotCY + dotR + 11;

            return (
              <div key={i} className="absolute pointer-events-none z-20" style={{ left: x }}>

                {/* Stem */}
                <div
                  className="absolute transition-all duration-200"
                  style={{
                    left: 0, top: stemTop,
                    width: 1, height: stemLen,
                    background: isPred
                      ? `repeating-linear-gradient(to ${above ? "bottom":"top"},
                           ${col}${isActive?"77":"33"} 0,${col}${isActive?"77":"33"} 2px,
                           transparent 2px, transparent 4px)`
                      : `linear-gradient(to ${above?"bottom":"top"},
                           ${col}${isActive?"aa":"44"},${col}${isActive?"33":"10"})`,
                  }}
                />

                {/* NOW pulse halo */}
                {evt.isNow && (
                  <div className="absolute rounded-full animate-ping" style={{
                    left: -dotR * 2, top: dotCY - dotR * 2,
                    width: dotR * 4, height: dotR * 4,
                    background: col, opacity: 0.15,
                  }} />
                )}

                {/* Dot */}
                <div
                  className="absolute rounded-full transition-all duration-200"
                  style={{
                    left: -dotR, top: dotCY - dotR,
                    width: dotR * 2, height: dotR * 2,
                    background: isPred ? "transparent" : isActive ? col : `${col}aa`,
                    border: isPred
                      ? `1px dashed ${col}${isActive ? "cc" : "44"}`
                      : "none",
                    boxShadow: isActive ? `0 0 6px ${col}, 0 0 14px ${col}44` : `0 0 3px ${col}44`,
                    opacity: isPred && !isActive ? 0.45 : 1,
                  }}
                />

                {/* Year label — floating text, no background */}
                {(isActive || evt.isNow) && (
                  <p
                    className="absolute font-mono whitespace-nowrap"
                    style={{
                      fontSize: "6px", fontWeight: "bold",
                      color: col,
                      top: yearLabelY,
                      left: "50%", transform: "translateX(-50%)",
                      letterSpacing: ".08em",
                      textShadow: `0 0 8px ${col}88`,
                    }}
                  >
                    {evt.isNow ? "NOW" : `${yr}${isPred ? "~" : ""}`}
                  </p>
                )}

                {/* Event name — floating text, no background */}
                {isActive && !evt.isNow && (
                  <p
                    className="absolute font-syne whitespace-nowrap"
                    style={{
                      fontSize: "7px", fontWeight: "600",
                      color: `${col}cc`,
                      top: nameLabelY,
                      left: "50%", transform: "translateX(-50%)",
                      maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis",
                      textShadow: `0 0 12px ${col}55`,
                    }}
                  >
                    {evt.label.length > 18 ? evt.label.slice(0, 16) + "…" : evt.label}
                  </p>
                )}

                {/* Forecast year dim label */}
                {isPred && !isActive && (
                  <p
                    className="absolute font-mono whitespace-nowrap"
                    style={{
                      fontSize: "4.5px", color: `${col}35`,
                      top: yearLabelY, left: "50%", transform: "translateX(-50%)",
                    }}
                  >
                    {yr}~
                  </p>
                )}

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
