// components/watchtower/watchtower-globe-shell.tsx
"use client";

import { useState } from "react";
import { WorldRiskGlobe }         from "./world-risk-globe";
import { GlobeIntelPanel }        from "./globe-intel-panel";
import { GlobeProvisionerPanel }  from "./globe-provisioner-panel";
import { GlobeTimeline }          from "./globe-timeline";
import { GlobeProtocolPanel }     from "./globe-protocol-panel";
import { LiveClock }              from "./live-clock";
import { SignalTicker }           from "./signal-ticker";
import type { IntelTab }          from "./globe-intel-panel";
import type { ProvisionerTab }    from "./globe-provisioner-panel";
import type { TimelineEvent }     from "@/lib/watchtower/data";
import { SIGNALS, TICKER_TEXT }   from "@/lib/watchtower/data";
import { SCENARIO_IMPACTS }       from "@/lib/watchtower/scenario-impacts";

// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  P1: "Stability  1945–71",
  P2: "Expansion  1971–08",
  P3: "Stress  2008–20",
  P5: "Cascade  2025–32",
  P6: "Resolve  2030+",
};

export function WatchtowerGlobeShell() {
  const [intelOpen,        setIntelOpen]        = useState(false);
  const [provisionerOpen,  setProvisionerOpen]  = useState(false);
  const [intelTab,         setIntelTab]         = useState<IntelTab>("hub");
  const [provisionerTab,   setProvisionerTab]   = useState<ProvisionerTab>("gear");
  const [eraPhase,         setEraPhase]         = useState("P4");
  const [timelineEvent,    setTimelineEvent]    = useState<TimelineEvent | null>(null);

  const [scenarioId,       setScenarioId]       = useState<string | null>(null);
  const [showSignals,      setShowSignals]      = useState(false);
  const [psychologyMode,   setPsychologyMode]   = useState(false);
  const [protocolOpen,     setProtocolOpen]     = useState(false);
  const [selectedSignalIdx, setSelectedSignalIdx] = useState<number | null>(null);

  const toggleIntel = () => {
    if (intelOpen) { setIntelOpen(false); return; }
    setIntelOpen(true);
    setProvisionerOpen(false);
  };

  const isHistorical = eraPhase !== "P4";

  return (
    <div className="w-full h-full flex flex-col bg-void-0">

      {/* ── Globe area ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-0">

        {/* Globe itself */}
        <WorldRiskGlobe
          eraPhase={eraPhase}
          timelineEvent={timelineEvent}
          scenarioId={scenarioId}
          showSignals={showSignals}
          psychologyMode={psychologyMode}
          onSignalPinClick={setSelectedSignalIdx}
        />

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

        {/* ── Provisioner (right) panel trigger ──────────────────────────── */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
          <PanelTrigger
            open={provisionerOpen}
            onClick={() => {
              if (provisionerOpen) { setProvisionerOpen(false); return; }
              setProvisionerOpen(true);
              setIntelOpen(false);
            }}
            label="Shop"
            openColor="gold"
            side="right"
          />
        </div>

        {/* ── Keyboard shortcut hints (bottom-center, show on first load) ── */}
        {!intelOpen && !provisionerOpen && (
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-10
                          flex items-center gap-3 pointer-events-none">
            <KeyHint label="◄ INTEL" onClick={() => {}} />
            <KeyHint label="TIMELINE ▼" onClick={() => {}} />
            <KeyHint label="SHOP ►" onClick={() => {}} />
          </div>
        )}

        {/* ── Historical era badge (top-center when not P4) ──────────────── */}
        {isHistorical && !scenarioId && (
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
        {timelineEvent && !intelOpen && !provisionerOpen && (
          <TimelineEventOverlay
            event={timelineEvent}
            onClose={() => { setTimelineEvent(null); setEraPhase("P4"); }}
          />
        )}

        {/* ── Protocol trigger — bottom left ──────────────────────────────── */}
        <div className="absolute bottom-[92px] left-3 z-20">
          <button
            onClick={() => setProtocolOpen(!protocolOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                        border font-mono text-[8px] tracking-[.1em] uppercase
                        transition-all duration-200 backdrop-blur-sm
                        ${protocolOpen
                          ? "bg-cyan-DEFAULT/12 border-cyan-border text-cyan-DEFAULT"
                          : "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-cyan-border/40 hover:text-text-base"
                        }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${protocolOpen ? "bg-cyan-DEFAULT animate-pulse" : "bg-text-mute2/40"}`} />
            Protocol
          </button>
        </div>

        {/* ── Globe mode controls — scenario + psychology + signals ─────────── */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5" style={{ top: "48px" }}>
          {/* Scenario selector */}
          <div
            className="rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-mono text-[6.5px] tracking-[.2em] uppercase text-text-mute2/60 px-2.5 pt-2 pb-1">
              Scenarios
            </p>
            <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">
              {SCENARIO_IMPACTS.map((s) => {
                const active = scenarioId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setScenarioId(active ? null : s.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-left
                                transition-all duration-150 font-mono text-[8px]
                                ${active
                                  ? "bg-red-protocol/20 text-red-bright border border-red-protocol/40"
                                  : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04] border border-transparent"
                                }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-red-bright animate-pulse" : "bg-text-mute2/30"}`} />
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Psychology toggle */}
          <button
            onClick={() => setPsychologyMode(!psychologyMode)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl backdrop-blur-sm
                        border font-mono text-[8px] transition-all duration-150
                        ${psychologyMode
                          ? "border-purple-500/50 text-purple-300"
                          : "border-border-protocol text-text-mute2 hover:border-purple-500/30 hover:text-text-base"
                        }`}
            style={{ background: psychologyMode ? "rgba(138,43,226,0.15)" : "rgba(11,13,24,0.88)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${psychologyMode ? "bg-purple-400 animate-pulse" : "bg-text-mute2/30"}`} />
            🧠 Psychology
          </button>

          {/* Signals pin toggle */}
          <button
            onClick={() => setShowSignals(!showSignals)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl backdrop-blur-sm
                        border font-mono text-[8px] transition-all duration-150
                        ${showSignals
                          ? "border-red-protocol/50 text-red-bright"
                          : "border-border-protocol text-text-mute2 hover:border-red-protocol/30 hover:text-text-base"
                        }`}
            style={{ background: showSignals ? "rgba(232,64,64,0.12)" : "rgba(11,13,24,0.88)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${showSignals ? "bg-red-bright animate-pulse" : "bg-text-mute2/30"}`} />
            📡 Signals
          </button>
        </div>

        {/* ── Signal info overlay (shown when signal pin clicked) ────────────── */}
        {selectedSignalIdx !== null && SIGNALS[selectedSignalIdx] && (
          <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 z-20 w-[340px] max-w-[90vw]">
            <div
              className="rounded-xl overflow-hidden backdrop-blur-md"
              style={{
                background: "rgba(11,13,24,0.95)",
                border:     "1px solid rgba(240,165,0,0.35)",
                boxShadow:  "0 8px 40px rgba(0,0,0,0.7)",
              }}
            >
              <div className="h-px w-full" style={{ background: "linear-gradient(90deg,#f0a500,transparent)" }} />
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold
                      ${SIGNALS[selectedSignalIdx].tier === "t4"
                        ? "text-red-bright border-red-protocol/40 bg-red-protocol/10"
                        : SIGNALS[selectedSignalIdx].tier === "t3"
                        ? "text-amber-protocol border-amber-DEFAULT/30 bg-amber-dim"
                        : "text-blue-DEFAULT border-blue-DEFAULT/30 bg-blue-dim"
                      }`}>
                      {SIGNALS[selectedSignalIdx].tier.toUpperCase()}
                    </span>
                    <p className="font-mono text-[7.5px] tracking-[.14em] uppercase text-text-mute2">
                      {SIGNALS[selectedSignalIdx].domain} · Score {SIGNALS[selectedSignalIdx].score}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSignalIdx(null)}
                    className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0"
                  >✕</button>
                </div>
                <p className="font-mono text-[10px] text-text-base leading-relaxed mb-2">
                  {SIGNALS[selectedSignalIdx].sig}
                </p>
                <a
                  href={SIGNALS[selectedSignalIdx].sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[8px] text-text-mute2/60 hover:text-amber-protocol/70 transition-colors"
                >
                  {SIGNALS[selectedSignalIdx].source} ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── UTC clock overlay — top-right of globe ──────────────────────── */}
        <LiveClock />

        {/* ── Panels ──────────────────────────────────────────────────────── */}
        <GlobeIntelPanel
          open={intelOpen}
          onClose={() => setIntelOpen(false)}
          activeTab={intelTab}
          onTabChange={setIntelTab}
        />
        <GlobeProvisionerPanel
          open={provisionerOpen}
          onClose={() => setProvisionerOpen(false)}
          activeTab={provisionerTab}
          onTabChange={setProvisionerTab}
        />
        <GlobeProtocolPanel open={protocolOpen} onClose={() => setProtocolOpen(false)} />
      </div>

      {/* ── Signal ticker strip (above timeline) ────────────────────────── */}
      <SignalTicker text={TICKER_TEXT} />

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
