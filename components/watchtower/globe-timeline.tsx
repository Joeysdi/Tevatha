// components/watchtower/globe-timeline.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";
import type { TimelineEvent, DecisionGate } from "@/lib/watchtower/data";

// ── Constants ──────────────────────────────────────────────────────────────────

const PX_PER_YEAR = 28;   // ~14 years visible on a 390px phone screen
const START_YEAR  = 1942;
const END_YEAR    = 2038;
const NOW_YEAR    = 2026;
const AXIS_Y      = 38;   // horizontal axis position within 68px container
const HEIGHT      = 68;
const TOTAL_W     = (END_YEAR - START_YEAR) * PX_PER_YEAR + 80;

function yrToPx(y: number) { return (y - START_YEAR) * PX_PER_YEAR; }
function parseYear(y: string) {
  if (y.toLowerCase() === "now") return NOW_YEAR;
  const n = parseInt(y, 10);
  return isNaN(n) ? NOW_YEAR : n;
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

  // Wheel over entire timeline bar → horizontal scroll, no page scroll
  useEffect(() => {
    const container = containerRef.current;
    const scroller  = scrollRef.current;
    if (!container || !scroller) return;
    const onWheel = (e: WheelEvent) => {
      // Convert vertical OR diagonal wheel to horizontal scroll
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
    const centerYear = centerX / PX_PER_YEAR + START_YEAR;
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
      if (closest && minDist < 3.5) {
        setActiveEvt(closest);
        onEventSelect(closest);
      } else {
        setActiveEvt(null);
        onEventSelect(null);
      }
    }, 180);
  }, [onPhaseSelect, onEventSelect]);

  const activePhaseHex = PHASES.find(p => p.id === activePhase)?.hex ?? "#e84040";

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 relative overflow-hidden select-none"
      style={{ height: HEIGHT, background: "rgba(4,5,10,0.98)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* ── Playhead line (fixed center marker) ── */}
      <div
        className="absolute top-0 bottom-0 left-1/2 z-20 pointer-events-none"
        style={{
          width: 1,
          transform: "translateX(-0.5px)",
          background: `linear-gradient(to bottom, transparent 0%, ${activePhaseHex}55 30%, ${activePhaseHex}88 50%, ${activePhaseHex}55 70%, transparent 100%)`,
          transition: "background 0.5s",
        }}
      />

      {/* Playhead top tick */}
      <div
        className="absolute top-0 left-1/2 z-20 pointer-events-none"
        style={{ transform: "translateX(-50%)" }}
      >
        <div style={{
          width: 0, height: 0,
          borderLeft: "3px solid transparent",
          borderRight: "3px solid transparent",
          borderTop: `4px solid ${activePhaseHex}99`,
          transition: "border-top-color 0.5s",
        }} />
      </div>

      {/* ── Year readout — floats at playhead ── */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <p
          className="font-mono tabular-nums"
          style={{
            fontSize: "7.5px",
            letterSpacing: ".1em",
            color: `${activePhaseHex}cc`,
            transition: "color 0.5s",
          }}
        >
          {scrollYear > NOW_YEAR
            ? `${scrollYear} ▸ FORECAST`
            : scrollYear < NOW_YEAR
            ? `◂ ${scrollYear}`
            : "▸ NOW 2026"}
        </p>
      </div>

      {/* ── Drag hint ── */}
      <div className="absolute top-1 right-3 z-20 pointer-events-none">
        <p className="font-mono text-[6px] tracking-[.18em] text-text-mute2/18">← drag →</p>
      </div>

      {/* ── Scrollable canvas ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" } as React.CSSProperties}
      >
        <div className="relative" style={{ width: TOTAL_W, height: HEIGHT }}>

          {/* ── Axis line — multi-segment with phase color ── */}
          {PHASES.map((p) => {
            const x = yrToPx(p.yearStart);
            const w = yrToPx(p.yearEnd) - x;
            const isActive = activePhase === p.id;
            return (
              <div
                key={p.id + "-axis"}
                className="absolute pointer-events-none"
                style={{
                  left: x, width: w,
                  top: AXIS_Y,
                  height: 1,
                  background: isActive
                    ? `linear-gradient(90deg, ${p.hex}22, ${p.hex}bb, ${p.hex}bb, ${p.hex}22)`
                    : `${p.hex}28`,
                  boxShadow: isActive ? `0 0 4px ${p.hex}66` : "none",
                  transition: "background 0.6s, box-shadow 0.6s",
                }}
              />
            );
          })}

          {/* ── Phase boundary marks + labels ── */}
          {PHASES.map((p, i) => {
            const x = yrToPx(p.yearStart);
            const isActive = activePhase === p.id;
            return (
              <div key={p.id + "-mark"} className="absolute pointer-events-none" style={{ left: x }}>
                {/* Boundary tick */}
                {i > 0 && (
                  <div style={{
                    position: "absolute",
                    top: AXIS_Y - 8,
                    left: 0,
                    width: 1,
                    height: 16,
                    background: `linear-gradient(to bottom, transparent, ${p.hex}${isActive ? "60" : "28"}, transparent)`,
                    transition: "background 0.4s",
                  }} />
                )}
                {/* Phase label — floats above axis */}
                <p
                  className="absolute font-mono whitespace-nowrap"
                  style={{
                    fontSize: "5.5px",
                    letterSpacing: ".18em",
                    top: 6,
                    left: i === 0 ? 2 : 4,
                    color: isActive ? `${p.hex}cc` : `${p.hex}40`,
                    transition: "color 0.4s",
                  }}
                >
                  {"isNow" in p && p.isNow ? "▶ " : ""}{p.label}
                </p>
              </div>
            );
          })}

          {/* ── Decade tick marks ── */}
          {Array.from({ length: Math.ceil((END_YEAR - START_YEAR) / 10) }, (_, i) => {
            const yr = Math.ceil(START_YEAR / 10) * 10 + i * 10;
            if (yr <= START_YEAR || yr >= END_YEAR) return null;
            return (
              <div key={yr} className="absolute pointer-events-none" style={{ left: yrToPx(yr) }}>
                <div style={{
                  position: "absolute",
                  top: AXIS_Y - 3,
                  width: 1, height: 6,
                  background: "rgba(255,255,255,0.1)",
                }} />
                <p style={{
                  position: "absolute",
                  top: AXIS_Y + 5,
                  left: 2,
                  fontSize: "5px",
                  fontFamily: "monospace",
                  color: "rgba(90,110,130,0.38)",
                  letterSpacing: ".03em",
                  whiteSpace: "nowrap",
                }}>
                  {yr}
                </p>
              </div>
            );
          })}

          {/* ── NOW vertical glow ── */}
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: yrToPx(NOW_YEAR),
              top: AXIS_Y - 10,
              width: 1, height: 20,
              background: "linear-gradient(to bottom, transparent, #e84040dd, transparent)",
              boxShadow: "0 0 6px rgba(232,64,64,0.55)",
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
                style={{ left: x - 4, top: AXIS_Y - 15 }}
                onMouseEnter={() => setGateHov(gate)}
                onMouseLeave={() => setGateHov(null)}
              >
                <div style={{
                  width: 0, height: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: `6px solid ${col}`,
                  filter: `drop-shadow(0 0 2px ${col}aa)`,
                }} />
                <p style={{
                  position: "absolute",
                  fontSize: "5px",
                  fontFamily: "monospace",
                  color: col,
                  opacity: 0.7,
                  top: -9,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  letterSpacing: ".1em",
                }}>
                  {gate.id}
                </p>
              </div>
            );
          })}

          {/* Gate tooltip */}
          {gateHov && (
            <div
              className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-50
                         rounded-xl px-3 py-2.5 pointer-events-none max-w-[260px]"
              style={{
                background: "rgba(8,10,18,0.97)",
                border: `1px solid ${TIER_HEX[gateHov.tier]}45`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
              }}
            >
              <p className="font-mono text-[8px] tracking-[.14em] uppercase mb-1"
                 style={{ color: TIER_HEX[gateHov.tier] }}>
                {gateHov.id} · {gateHov.tier.toUpperCase()} · {gateHov.window}
              </p>
              <p className="font-syne font-bold text-[11px] text-text-base mb-1">{gateHov.trigger}</p>
              <p className="font-mono text-[9px] text-text-dim leading-relaxed">{gateHov.action}</p>
            </div>
          )}

          {/* ── Event dots with stems — alternating above/below ── */}
          {TIMELINE_EVENTS.map((evt, i) => {
            const yr       = parseYear(evt.year);
            const x        = yrToPx(yr);
            const col      = EVENT_COLORS[evt.colKey] ?? "#c9a84c";
            const isActive = activeEvt === evt;
            const isPred   = evt.predicted === true;

            // Alternate above / below axis
            const above    = i % 2 === 0;
            const stemLen  = isActive ? 14 : 9;
            const dotR     = isActive ? 4 : 3;

            // Dot center Y
            const dotCY = above
              ? AXIS_Y - stemLen - dotR
              : AXIS_Y + stemLen + dotR;

            // Stem span
            const stemTop    = above ? dotCY + dotR : AXIS_Y;
            const stemHeight = stemLen;

            // Label Y (outer side of dot, away from axis)
            const labelY = above ? dotCY - dotR - 8 : dotCY + dotR + 2;

            return (
              <div key={i} className="absolute pointer-events-none z-20" style={{ left: x }}>

                {/* Stem */}
                <div
                  className="absolute transition-all duration-200"
                  style={{
                    left: 0,
                    top: stemTop,
                    width: 1,
                    height: stemHeight,
                    background: isPred
                      ? `repeating-linear-gradient(to ${above ? "bottom" : "top"},
                           ${col}${isActive ? "88" : "40"} 0px,
                           ${col}${isActive ? "88" : "40"} 2px,
                           transparent 2px, transparent 4px)`
                      : `linear-gradient(to ${above ? "bottom" : "top"},
                           ${col}${isActive ? "bb" : "55"},
                           ${col}${isActive ? "44" : "18"})`,
                  }}
                />

                {/* NOW pulse halo */}
                {evt.isNow && (
                  <div
                    className="absolute rounded-full animate-ping"
                    style={{
                      left: -dotR * 2,
                      top: dotCY - dotR * 2,
                      width: dotR * 4,
                      height: dotR * 4,
                      background: col,
                      opacity: 0.18,
                    }}
                  />
                )}

                {/* Dot */}
                <div
                  className="absolute rounded-full transition-all duration-200"
                  style={{
                    left: -dotR,
                    top: dotCY - dotR,
                    width: dotR * 2,
                    height: dotR * 2,
                    background: isPred ? "transparent" : isActive ? col : `${col}cc`,
                    border: isPred
                      ? `1.5px dashed ${col}${isActive ? "ee" : "55"}`
                      : `1px solid rgba(4,5,10,0.5)`,
                    boxShadow: isActive
                      ? `0 0 8px ${col}, 0 0 18px ${col}44`
                      : `0 0 3px ${col}44`,
                    opacity: isPred && !isActive ? 0.48 : 1,
                  }}
                />

                {/* Year + name label — only when active or isNow */}
                {(isActive || evt.isNow) && (
                  <p
                    className="absolute font-mono whitespace-nowrap text-center transition-all duration-200"
                    style={{
                      fontSize: "5.5px",
                      color: col,
                      fontWeight: "bold",
                      top: labelY,
                      left: "50%",
                      transform: "translateX(-50%)",
                      letterSpacing: ".07em",
                      textShadow: `0 0 8px ${col}88`,
                    }}
                  >
                    {evt.isNow ? "NOW" : `${yr}${isPred ? "~" : ""}`}
                  </p>
                )}

                {/* Inactive predicted year (dimmed) */}
                {isPred && !isActive && (
                  <p
                    className="absolute font-mono whitespace-nowrap text-center"
                    style={{
                      fontSize: "5px",
                      color: `${col}40`,
                      top: labelY,
                      left: "50%",
                      transform: "translateX(-50%)",
                      letterSpacing: ".04em",
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
