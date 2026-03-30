// components/watchtower/globe-timeline.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { GATES } from "@/lib/watchtower/data";
import { TIMELINE_EVENTS } from "@/lib/watchtower/data-timeline";
import type { TimelineEvent, DecisionGate } from "@/lib/watchtower/data";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { TranslationKey } from "@/lib/i18n/translations";

// ── Non-linear scale ───────────────────────────────────────────────────────────
// Dense around NOW, compressed for distant past/future

const SEGMENTS = [
  { yearStart: 1942, yearEnd: 2000, pxPerYear: 5  },
  { yearStart: 2000, yearEnd: 2015, pxPerYear: 10 },
  { yearStart: 2015, yearEnd: 2022, pxPerYear: 24 },
  { yearStart: 2022, yearEnd: 2028, pxPerYear: 36 },
  { yearStart: 2028, yearEnd: 2035, pxPerYear: 16 },
  { yearStart: 2035, yearEnd: 2050, pxPerYear: 20 },
  { yearStart: 2050, yearEnd: 2075, pxPerYear: 16 },
  { yearStart: 2075, yearEnd: 2100, pxPerYear: 12 },
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
const END_YEAR   = 2100;
const AXIS_Y     = 52;   // px from container top — axis position
const HEIGHT     = 100;

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

// ── Resolved event positions — fractional year offsets for same-year events ──
// Events sharing a year get spread at 0.4-year intervals so each has its own scroll stop.

const RESOLVED_EVENTS: Array<{ evt: TimelineEvent; displayYear: number }> = (() => {
  const counts = new Map<number, number>();
  return TIMELINE_EVENTS.map((evt) => {
    const yr  = parseYear(evt.year);
    const idx = counts.get(yr) ?? 0;
    counts.set(yr, idx + 1);
    return { evt, displayYear: yr + idx * 0.4 };
  });
})();

// ── Phase metadata (for axis coloring) ────────────────────────────────────────

const PHASES = [
  { id:"P1", labelKey:"era_stability" as TranslationKey, yearStart:1945, yearEnd:1971, hex:"#38bdf8" },
  { id:"P2", labelKey:"era_expansion" as TranslationKey, yearStart:1971, yearEnd:2008, hex:"#818cf8" },
  { id:"P3", labelKey:"era_stress"    as TranslationKey, yearStart:2008, yearEnd:2020, hex:"#fbbf24" },
  { id:"P4", labelKey:null,                              yearStart:2020, yearEnd:2027, hex:"#e84040", isNow:true },
  { id:"P5", labelKey:"era_cascade"   as TranslationKey, yearStart:2027, yearEnd:2032, hex:"#ff0055" },
  { id:"P6", labelKey:"era_resolve"   as TranslationKey, yearStart:2032, yearEnd:2038, hex:"#64748b" },
  { id:"P7", labelKey:"era_emergence" as TranslationKey, yearStart:2038, yearEnd:2059, hex:"#7c3aed" },
  { id:"P8", labelKey:"era_divergence" as TranslationKey, yearStart:2059, yearEnd:2079, hex:"#374151" },
  { id:"P9", labelKey:"era_terminus"  as TranslationKey, yearStart:2079, yearEnd:2100, hex:"#111827" },
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

const GATE_YEARS: Record<string, number> = {
  G1: 2026.2,  // nuclear detonation — ongoing risk NOW
  G2: 2026.5,  // DEFCON 2
  G6: 2026.9,  // WHO PHEIC — H5N1 window
  G3: 2027.3,  // NATO Article 5
  G7: 2027.7,  // repo rate >5% sustained
  G4: 2028.3,  // bank bail-in
  G8: 2029.0,  // CBDC mandatory (EU Digital Euro 2029)
  G5: 2030.0,  // Doomsday Clock 75s
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  activePhase:   string;
  onPhaseSelect: (phaseId: string) => void;
  onEventSelect: (event: TimelineEvent | null) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function GlobeTimeline({ activePhase, onPhaseSelect, onEventSelect }: Props) {
  const { t } = useTranslation();
  const containerRef  = useRef<HTMLDivElement>(null);
  const scrollRef     = useRef<HTMLDivElement>(null);
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging     = useRef(false);
  const dragStartX     = useRef(0);
  const dragScrollLeft = useRef(0);
  const isSnapping     = useRef(false);
  const [activeEvt,  setActiveEvt]  = useState<TimelineEvent | null>(null);
  const [gateHov,    setGateHov]    = useState<DecisionGate | null>(null);
  const [evtHov,     setEvtHov]     = useState<TimelineEvent | null>(null);
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

  // Mouse drag — click-and-drag horizontal scroll
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current   = true;
      dragStartX.current   = e.pageX - scroller.offsetLeft;
      dragScrollLeft.current = scroller.scrollLeft;
      scroller.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x    = e.pageX - scroller.offsetLeft;
      const walk = x - dragStartX.current;
      scroller.scrollLeft = dragScrollLeft.current - walk;
    };
    const onMouseUp = () => {
      isDragging.current    = false;
      scroller.style.cursor = "grab";
    };

    scroller.style.cursor = "grab";
    scroller.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      scroller.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleScroll = useCallback(() => {
    if (isSnapping.current) return;
    const el = scrollRef.current;
    if (!el) return;

    const centerX    = el.scrollLeft + el.clientWidth / 2;
    const centerYear = pxToYr(centerX);
    setScrollYear(Math.round(centerYear));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const phase = PHASES.find(p => centerYear >= p.yearStart && centerYear < p.yearEnd);
      if (phase) onPhaseSelect(phase.id);

      // Find nearest resolved event
      let closestR = RESOLVED_EVENTS[0];
      let minDist  = Infinity;
      for (const r of RESOLVED_EVENTS) {
        const dist = Math.abs(r.displayYear - centerYear);
        if (dist < minDist) { minDist = dist; closestR = r; }
      }
      if (minDist < 3) {
        setActiveEvt(closestR.evt);
        onEventSelect(closestR.evt);
      } else {
        setActiveEvt(null);
        onEventSelect(null);
      }

      // Snap to nearest event
      const targetLeft = yrToPx(closestR.displayYear) - el.clientWidth / 2;
      if (Math.abs(targetLeft - el.scrollLeft) > 4) {
        setScrollYear(Math.round(closestR.displayYear));
        isSnapping.current = true;
        el.scrollTo({ left: targetLeft, behavior: "smooth" });
        setTimeout(() => { isSnapping.current = false; }, 800);
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
        {scrollYear === NOW_YEAR ? (
          <span className="inline-flex items-center gap-1 font-mono tabular-nums"
                style={{ fontSize: "10px", letterSpacing: ".12em", color: "#e84040" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#e84040" }} />
            NOW · 2026
          </span>
        ) : (
          <p
            className="font-mono tabular-nums"
            style={{ fontSize: "10px", letterSpacing: ".1em", color: `${activePhaseHex}cc`, transition: "color 0.5s" }}
          >
            {scrollYear > NOW_YEAR ? `${scrollYear} ▸ ${t("timeline_forecast")}` : `◂ ${scrollYear}`}
          </p>
        )}
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
                  height: isActive ? 2 : 1,
                  background: isActive
                    ? `linear-gradient(90deg, ${p.hex}20, ${p.hex}aa, ${p.hex}aa, ${p.hex}20)`
                    : `${p.hex}25`,
                  boxShadow: isActive
                    ? p.id === "P4"
                      ? `0 0 8px ${p.hex}88, 0 0 16px ${p.hex}33`
                      : `0 0 4px ${p.hex}55`
                    : "none",
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
                  top: 6,
                  fontSize: p.id === "P4" && isActive ? "9px" : "8px",
                  fontWeight: p.id === "P4" && isActive ? "bold" : undefined,
                  letterSpacing: ".2em",
                  color: isActive ? `${p.hex}cc` : `${p.hex}55`,
                  transition: "color 0.4s",
                }}
              >
                {p.id === "P4" && isActive
                  ? "▶ NOW · CRITICAL"
                  : p.id === "P4"
                  ? "▶ NOW"
                  : p.labelKey ? t(p.labelKey) : "NOW"}
              </p>
            );
          })}

          {/* ── Era/decade ticks — sparse for compressed zones ── */}
          {[1945, 1950, 1960, 1970, 1980, 1990, 2000, 2005, 2010, 2015, 2018, 2020, 2022, 2024, 2026, 2028, 2030, 2032, 2035, 2038, 2040, 2045, 2050, 2055, 2060, 2065, 2070, 2075, 2080, 2085, 2090, 2095, 2100].map((yr) => {
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
                    fontSize: "7px",
                    fontFamily: "monospace",
                    color: "rgba(90,110,130,0.6)",
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
                    fontSize: "7px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "rgba(232,64,64,0.85)",
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
              top: 0,
              width: 1,
              height: HEIGHT,
              background: "linear-gradient(to bottom, transparent 0%, #e84040cc 45%, #e84040cc 55%, transparent 100%)",
              boxShadow: "0 0 6px rgba(232,64,64,0.5)",
            }}
          />

          {/* ── Decision gate markers ── */}
          {GATES.map((gate) => {
            const gateYear = GATE_YEARS[gate.id] ?? NOW_YEAR + 1;
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
                  fontSize: "7px", fontFamily: "monospace",
                  color: col, opacity: 0.8,
                  top: -10, left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", letterSpacing: ".1em",
                }}>
                  {gate.id}
                </p>
              </div>
            );
          })}

          {/* Gate tooltip */}
          {gateHov && (
            <div
              className="fixed bottom-[82px] left-1/2 -translate-x-1/2 z-50
                         rounded-xl px-3 py-2.5 pointer-events-none max-w-[300px]"
              style={{
                background: "rgba(6,8,14,0.97)",
                border: `1px solid ${TIER_HEX[gateHov.tier]}35`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
              }}
            >
              {/* Header: ID · tier badge · window */}
              <div className="flex items-center gap-1.5 mb-1.5 font-mono tracking-[.14em] uppercase"
                   style={{ fontSize: "7.5px", color: TIER_HEX[gateHov.tier] }}>
                <span>{gateHov.id}</span>
                <span
                  className="px-1.5 py-0.5 rounded font-bold"
                  style={{
                    fontSize: "7px",
                    ...(gateHov.tier === "t4"
                      ? { background: "rgba(232,64,64,0.2)", color: "#e05050", border: "1px solid rgba(232,64,64,0.3)" }
                      : gateHov.tier === "t3"
                      ? { background: "rgba(240,165,0,0.15)", color: "#f0c842", border: "1px solid rgba(240,165,0,0.25)" }
                      : { background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }),
                  }}
                >
                  {gateHov.tier.toUpperCase()} TIER
                </span>
                <span>· {gateHov.window}</span>
              </div>
              {/* Trigger */}
              <p className="font-syne font-bold text-text-base mb-1.5" style={{ fontSize: "12px" }}>{gateHov.trigger}</p>
              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "6px" }} />
              {/* Action */}
              <p className="font-mono text-text-dim leading-relaxed mb-1.5" style={{ fontSize: "8.5px" }}>{gateHov.action}</p>
              {/* Expected window */}
              <p className="font-mono tracking-[.1em]" style={{ fontSize: "7px", color: "#c9a84c" }}>
                EXPECTED WINDOW: ~{Math.floor(GATE_YEARS[gateHov.id] ?? NOW_YEAR + 1)}
              </p>
            </div>
          )}

          {/* Event tooltip */}
          {evtHov && (
            <div
              className="fixed bottom-[82px] left-1/2 -translate-x-1/2 z-50
                         rounded-xl px-3 py-2.5 pointer-events-none max-w-[300px]"
              style={{
                background: "rgba(6,8,14,0.97)",
                border: `1px solid ${EVENT_COLORS[evtHov.colKey]}35`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
              }}
            >
              {/* Header: year + sev badge */}
              <div className="flex items-center gap-1.5 mb-1.5 font-mono tracking-[.14em] uppercase"
                   style={{ fontSize: "7.5px", color: EVENT_COLORS[evtHov.colKey] }}>
                <span>{evtHov.predicted ? "~" : ""}{evtHov.year}</span>
                <span
                  className="px-1.5 py-0.5 rounded font-bold"
                  style={{
                    fontSize: "7px",
                    background: `${EVENT_COLORS[evtHov.colKey]}20`,
                    color: EVENT_COLORS[evtHov.colKey],
                    border: `1px solid ${EVENT_COLORS[evtHov.colKey]}35`,
                  }}
                >
                  {evtHov.sev.toUpperCase()}
                </span>
              </div>
              {/* Label */}
              <p className="font-syne font-bold text-text-base mb-1.5" style={{ fontSize: "12px" }}>{evtHov.label}</p>
              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "6px" }} />
              {/* Signal */}
              <p className="font-mono text-text-dim leading-relaxed" style={{ fontSize: "8.5px" }}>{evtHov.signal}</p>
            </div>
          )}

          {/* ── Event dots + floating labels — no boxes at all ── */}
          {RESOLVED_EVENTS.map(({ evt, displayYear }, i) => {
            const x        = yrToPx(displayYear);
            const col      = EVENT_COLORS[evt.colKey] ?? "#c9a84c";
            const isActive = activeEvt === evt;
            const isPred   = evt.predicted === true;
            const above    = i % 2 === 0;
            const baseYear = parseYear(evt.year);

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
                  className="absolute rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    pointerEvents: "auto",
                    left: -dotR, top: dotCY - dotR,
                    width: dotR * 2, height: dotR * 2,
                    background: isPred ? "transparent" : isActive ? col : `${col}aa`,
                    border: isPred
                      ? `1px dashed ${col}${isActive ? "cc" : "44"}`
                      : "none",
                    boxShadow: isActive ? `0 0 6px ${col}, 0 0 14px ${col}44` : `0 0 3px ${col}44`,
                    opacity: isPred && !isActive ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setEvtHov(evt)}
                  onMouseLeave={() => setEvtHov(null)}
                />

                {/* Year label — floating text, no background */}
                {(isActive || evt.isNow) && (
                  <p
                    className="absolute font-mono whitespace-nowrap"
                    style={{
                      fontSize: "8px", fontWeight: "bold",
                      color: col,
                      top: yearLabelY,
                      left: "50%", transform: "translateX(-50%)",
                      letterSpacing: ".08em",
                      textShadow: `0 0 8px ${col}88`,
                    }}
                  >
                    {evt.isNow ? "NOW" : `${baseYear}${isPred ? "~" : ""}`}
                  </p>
                )}

                {/* Event name — floating text, no background */}
                {isActive && !evt.isNow && (
                  <p
                    className="absolute font-syne whitespace-nowrap"
                    style={{
                      fontSize: "9px", fontWeight: "600",
                      color: `${col}cc`,
                      top: nameLabelY,
                      left: "50%", transform: "translateX(-50%)",
                      maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis",
                      textShadow: `0 0 12px ${col}55`,
                    }}
                  >
                    {evt.label.length > 22 ? evt.label.slice(0, 20) + "…" : evt.label}
                  </p>
                )}

                {/* Forecast year dim label */}
                {isPred && !isActive && (
                  <p
                    className="absolute font-mono whitespace-nowrap"
                    style={{
                      fontSize: "6px", color: `${col}50`,
                      top: yearLabelY, left: "50%", transform: "translateX(-50%)",
                    }}
                  >
                    {baseYear}~
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
