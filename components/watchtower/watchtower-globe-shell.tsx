// components/watchtower/watchtower-globe-shell.tsx
"use client";

import { useState } from "react";
import { WorldRiskGlobe }   from "./world-risk-globe";
import { GlobeIntelPanel }  from "./globe-intel-panel";
import { GlobePrepPanel }   from "./globe-prep-panel";
import { GlobeTimeline }    from "./globe-timeline";
import type { IntelTab }    from "./globe-intel-panel";
import type { PrepTab }     from "./globe-prep-panel";
import type { TimelineEvent } from "@/lib/watchtower/data";

// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  P1: "Stability  1945–71",
  P2: "Expansion  1971–08",
  P3: "Stress  2008–20",
  P5: "Cascade  2025–32",
  P6: "Resolve  2030+",
};

export function WatchtowerGlobeShell() {
  const [intelOpen, setIntelOpen] = useState(false);
  const [prepOpen,  setPrepOpen]  = useState(false);
  const [intelTab,  setIntelTab]  = useState<IntelTab>("hub");
  const [prepTab,   setPrepTab]   = useState<PrepTab>("gear");
  const [eraPhase,  setEraPhase]  = useState("P4");
  const [timelineEvent, setTimelineEvent] = useState<TimelineEvent | null>(null);

  const openIntel = (tab?: IntelTab) => {
    if (tab) setIntelTab(tab);
    setIntelOpen(true);
    setPrepOpen(false);
  };

  const openPrep = (tab?: PrepTab) => {
    if (tab) setPrepTab(tab);
    setPrepOpen(true);
    setIntelOpen(false);
  };

  const toggleIntel = () => {
    if (intelOpen) { setIntelOpen(false); return; }
    openIntel();
  };

  const togglePrep = () => {
    if (prepOpen) { setPrepOpen(false); return; }
    openPrep();
  };

  const isHistorical = eraPhase !== "P4";

  return (
    <div className="w-full h-full flex flex-col bg-void-0">

      {/* ── Globe area ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-0">

        {/* Globe itself */}
        <WorldRiskGlobe eraPhase={eraPhase} timelineEvent={timelineEvent} />

        {/* ── Intel (left) panel trigger ─────────────────────────────────── */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
          <PanelTrigger
            open={intelOpen}
            onClick={toggleIntel}
            label="Intel"
            openColor="red"
            side="left"
          />
        </div>

        {/* ── Prep (right) panel trigger ─────────────────────────────────── */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
          <PanelTrigger
            open={prepOpen}
            onClick={togglePrep}
            label="Prep"
            openColor="gold"
            side="right"
          />
        </div>

        {/* ── Keyboard shortcut hints (bottom-center, show on first load) ── */}
        {!intelOpen && !prepOpen && (
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-10
                          flex items-center gap-3 pointer-events-none">
            <KeyHint label="◄ INTEL" onClick={() => openIntel()} />
            <KeyHint label="TIMELINE ▼" onClick={() => {}} />
            <KeyHint label="PREP ►" onClick={() => openPrep()} />
          </div>
        )}

        {/* ── Historical era badge (top-center when not P4) ──────────────── */}
        {isHistorical && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
              style={{
                background: "rgba(11,13,24,0.88)",
                border:     "1px solid rgba(251,191,36,0.4)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-DEFAULT animate-pulse" />
              <p className="font-mono text-[8.5px] tracking-[.14em] uppercase text-amber-protocol">
                Historical  ·  {PHASE_LABELS[eraPhase] ?? eraPhase}
              </p>
              <button
                className="pointer-events-auto font-mono text-[9px] text-text-mute2
                           hover:text-amber-protocol transition-colors ml-1"
                onClick={() => { setEraPhase("P4"); setTimelineEvent(null); }}
              >
                ✕ back to now
              </button>
            </div>
          </div>
        )}

        {/* ── Timeline event card overlay (shows above the globe) ─────────── */}
        {timelineEvent && !intelOpen && !prepOpen && (
          <TimelineEventOverlay
            event={timelineEvent}
            onClose={() => { setTimelineEvent(null); setEraPhase("P4"); }}
          />
        )}

        {/* ── Panels ──────────────────────────────────────────────────────── */}
        <GlobeIntelPanel
          open={intelOpen}
          onClose={() => setIntelOpen(false)}
          activeTab={intelTab}
          onTabChange={setIntelTab}
        />
        <GlobePrepPanel
          open={prepOpen}
          onClose={() => setPrepOpen(false)}
          activeTab={prepTab}
          onTabChange={setPrepTab}
        />
      </div>

      {/* ── Timeline bar ─────────────────────────────────────────────────── */}
      <GlobeTimeline
        activePhase={eraPhase}
        onPhaseSelect={(phase) => {
          setEraPhase(phase);
          if (phase !== "P4") setTimelineEvent(null);
        }}
        onEventSelect={setTimelineEvent}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PanelTrigger({
  open,
  onClick,
  label,
  openColor,
  side,
}: {
  open:       boolean;
  onClick:    () => void;
  label:      string;
  openColor:  "red" | "gold";
  side:       "left" | "right";
}) {
  const colorMap = {
    red:  { active: "bg-red-protocol/18 border-red-protocol/55 text-red-bright",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-red-protocol/30 hover:text-text-base" },
    gold: { active: "bg-gold-glow border-gold-protocol/55 text-gold-bright",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-gold-protocol/30 hover:text-text-base" },
  };
  const cls = colorMap[openColor];
  const rounded = side === "left" ? "rounded-r-xl border-r border-y" : "rounded-l-xl border-l border-y";
  const arrow   = side === "left"
    ? (open ? "◄" : "►")
    : (open ? "►" : "◄");

  return (
    <button
      onClick={onClick}
      className={`py-5 px-2.5 ${rounded} flex flex-col items-center gap-1.5
                  transition-all duration-200 backdrop-blur-sm
                  ${open ? cls.active : cls.idle}`}
    >
      <span className="font-mono text-[7.5px] [writing-mode:vertical-rl] rotate-180
                       tracking-[.18em] uppercase leading-none">
        {open ? "Close" : label}
      </span>
      <span className="text-[9px]">{arrow}</span>
    </button>
  );
}

function KeyHint({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[7.5px] tracking-[.12em] uppercase text-text-mute2/35
                 hover:text-text-mute2/60 transition-colors"
    >
      {label}
    </button>
  );
}

const EVENT_COLORS: Record<string, string> = {
  red:  "#e84040",
  warn: "#f0a500",
  info: "#38bdf8",
  pink: "#ff0055",
};

function TimelineEventOverlay({
  event,
  onClose,
}: {
  event:   TimelineEvent;
  onClose: () => void;
}) {
  const col = EVENT_COLORS[event.colKey] ?? "#c9a84c";
  return (
    <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-20 w-[320px] max-w-[90vw]">
      <div
        className="rounded-xl overflow-hidden backdrop-blur-md"
        style={{
          background: "rgba(11,13,24,0.93)",
          border:     `1px solid ${col}44`,
          boxShadow:  `0 8px 40px rgba(0,0,0,0.7)`,
        }}
      >
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="font-mono text-[8px] tracking-[.2em] uppercase" style={{ color: col }}>
              {event.year === "2026" || event.isNow ? "NOW · 2026" : event.year}
            </p>
            <button
              onClick={onClose}
              className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors"
            >
              ✕
            </button>
          </div>
          <h3 className="font-syne font-bold text-[12px] text-text-base leading-snug mb-1.5">
            {event.label}
          </h3>
          <p className="font-mono text-[9.5px] text-text-dim leading-relaxed">
            {event.signal}
          </p>
        </div>
      </div>
    </div>
  );
}
