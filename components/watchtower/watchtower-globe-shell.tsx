// components/watchtower/watchtower-globe-shell.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/use-translation";
import { WorldRiskGlobe }         from "./world-risk-globe";
import { GlobeIntelPanel }        from "./globe-intel-panel";
import { GlobeProvisionerPanel }  from "./globe-provisioner-panel";
import { GlobeTimeline }          from "./globe-timeline";
import { GlobeProtocolPanel }     from "./globe-protocol-panel";
import { LiveClock }              from "./live-clock";

import type { IntelTab }          from "./globe-intel-panel";
import type { ProvisionerTab }    from "./globe-provisioner-panel";
import type { TimelineEvent }     from "@/lib/watchtower/data";
import { SIGNALS }                from "@/lib/watchtower/data";
import { SCENARIO_IMPACTS }       from "@/lib/watchtower/scenario-impacts";

// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  P1: "Stability  1945–71",
  P2: "Expansion  1971–08",
  P3: "Stress  2008–20",
  P5: "Cascade  2027–32",
  P6: "Resolve  2032+",
};

const EVT_COLORS: Record<string, string> = {
  red: "#e84040", warn: "#f0a500", info: "#38bdf8", pink: "#ff0055",
};

export function WatchtowerGlobeShell() {
  const { t } = useTranslation();
  const [intelOpen,         setIntelOpen]         = useState(false);
  const [provisionerOpen,   setProvisionerOpen]   = useState(false);
  const [intelTab,          setIntelTab]          = useState<IntelTab>("hub");
  const [provisionerTab,    setProvisionerTab]    = useState<ProvisionerTab>("products");
  const [eraPhase,          setEraPhase]          = useState("P4");
  const [timelineEvent,     setTimelineEvent]     = useState<TimelineEvent | null>(null);
  const [timelineOpen,      setTimelineOpen]      = useState(false);

  const [scenarioId,        setScenarioId]        = useState<string | null>(null);
  const [showSignals,       setShowSignals]       = useState(false);
  const [psychologyMode,    setPsychologyMode]    = useState(false);
  const [protocolOpen,      setProtocolOpen]      = useState(false);
  const [selectedSignalIdx, setSelectedSignalIdx] = useState<number | null>(null);

  const toggleIntel = () => {
    if (intelOpen) { setIntelOpen(false); return; }
    setIntelOpen(true);
    setProvisionerOpen(false);
  };

  const closeTimeline = () => {
    setTimelineOpen(false);
    setTimelineEvent(null);
    setEraPhase("P4");
  };

  const isHistorical = eraPhase !== "P4";

  return (
    <div className="w-full h-full flex flex-col bg-void-0">

      {/* ── Globe area ───────────────────────────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden min-h-0"
        onClick={() => { if (timelineOpen) closeTimeline(); }}
      >
        {/* Globe */}
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
            onClick={(e) => { e.stopPropagation(); toggleIntel(); }}
            label={t("nav_intel")}
            openColor="red"
            side="left"
          />
        </div>

        {/* ── Provisioner (right) panel trigger ──────────────────────────── */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
          <PanelTrigger
            open={provisionerOpen}
            onClick={(e) => {
              e.stopPropagation();
              if (provisionerOpen) { setProvisionerOpen(false); return; }
              setProvisionerOpen(true);
              setIntelOpen(false);
            }}
            label={t("nav_shop")}
            openColor="gold"
            side="right"
          />
        </div>

        {/* ── Historical era badge ─────────────────────────────────────────── */}
        {isHistorical && !scenarioId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
              style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(251,191,36,0.4)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-DEFAULT animate-pulse" />
              <p className="font-mono text-[8.5px] tracking-[.14em] uppercase text-amber-protocol">
                {t("badge_historical")} · {PHASE_LABELS[eraPhase] ?? eraPhase}
              </p>
              <button
                className="pointer-events-auto font-mono text-[9px] text-text-mute2
                           hover:text-amber-protocol transition-colors ml-1"
                onClick={(e) => { e.stopPropagation(); setEraPhase("P4"); setTimelineEvent(null); }}
              >
                ✕ {t("nav_back_to_now")}
              </button>
            </div>
          </div>
        )}

        {/* ── Timeline event card — floats on globe while timeline is open ── */}
        <AnimatePresence>
          {timelineOpen && timelineEvent && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute z-25 pointer-events-none"
              style={{ top: isHistorical ? "5rem" : "1rem", left: "1rem", width: 260, maxWidth: "calc(100vw - 80px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const col = EVT_COLORS[timelineEvent.colKey] ?? "#c9a84c";
                return (
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      background: "rgba(6,7,14,0.90)",
                      borderLeft: `2px solid ${col}`,
                      borderTop:  `1px solid ${col}22`,
                      borderRight:"1px solid rgba(255,255,255,0.05)",
                      borderBottom:"1px solid rgba(255,255,255,0.05)",
                      boxShadow:  `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${col}0a`,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="px-3.5 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="font-mono tabular-nums text-[7.5px] tracking-[.16em] font-bold"
                          style={{ color: col }}
                        >
                          {timelineEvent.isNow ? "NOW · 2026" : timelineEvent.year}
                          {timelineEvent.predicted ? " ~forecast" : ""}
                        </span>
                        <span
                          className="font-mono text-[6px] tracking-[.1em] px-1.5 py-0.5 rounded"
                          style={{
                            color: timelineEvent.sev === "critical" ? "#e84040" : timelineEvent.sev === "high" ? "#f0a500" : "#38bdf8",
                            background: timelineEvent.sev === "critical" ? "rgba(232,64,64,0.12)" : "rgba(240,165,0,0.1)",
                          }}
                        >
                          {timelineEvent.sev}
                        </span>
                      </div>
                      <p
                        className="font-syne font-bold leading-snug mb-1.5"
                        style={{ fontSize: "12px", color: "rgba(215,220,230,0.95)" }}
                      >
                        {timelineEvent.label}
                      </p>
                      <p className="font-mono text-[8.5px] text-text-dim leading-relaxed">
                        {timelineEvent.signal}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Protocol trigger — bottom left (desktop only) ────────────────── */}
        <div
          className="hidden sm:block absolute left-3 z-30"
          style={{ bottom: timelineOpen ? "12px" : "44px", transition: "bottom 0.3s" }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setProtocolOpen(!protocolOpen); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                        border font-mono text-[8px] tracking-[.1em] uppercase
                        transition-all duration-200 backdrop-blur-sm
                        ${protocolOpen
                          ? "bg-cyan-DEFAULT/12 border-cyan-border text-cyan-DEFAULT"
                          : "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-cyan-border/40 hover:text-text-base"
                        }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${protocolOpen ? "bg-cyan-DEFAULT animate-pulse" : "bg-text-mute2/40"}`} />
            {t("nav_protocol")}
          </button>
        </div>

        {/* ── Globe mode controls — desktop only ───────────────────────────── */}
        <div className="hidden sm:flex absolute left-4 z-20 flex-col gap-1.5" style={{ top: "48px" }}>
          <div
            className="rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-mono text-[6.5px] tracking-[.2em] uppercase text-text-mute2/60 px-2.5 pt-2 pb-1">
              {t("nav_scenarios")}
            </p>
            <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">
              {SCENARIO_IMPACTS.map((s) => {
                const active = scenarioId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); setScenarioId(active ? null : s.id); }}
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

          <button
            onClick={(e) => { e.stopPropagation(); setPsychologyMode(!psychologyMode); }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl backdrop-blur-sm
                        border font-mono text-[8px] transition-all duration-150
                        ${psychologyMode
                          ? "border-purple-500/50 text-purple-300"
                          : "border-border-protocol text-text-mute2 hover:border-purple-500/30 hover:text-text-base"
                        }`}
            style={{ background: psychologyMode ? "rgba(138,43,226,0.15)" : "rgba(11,13,24,0.88)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${psychologyMode ? "bg-purple-400 animate-pulse" : "bg-text-mute2/30"}`} />
            🧠 {t("nav_psychology")}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShowSignals(!showSignals); }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl backdrop-blur-sm
                        border font-mono text-[8px] transition-all duration-150
                        ${showSignals
                          ? "border-red-protocol/50 text-red-bright"
                          : "border-border-protocol text-text-mute2 hover:border-red-protocol/30 hover:text-text-base"
                        }`}
            style={{ background: showSignals ? "rgba(232,64,64,0.12)" : "rgba(11,13,24,0.88)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${showSignals ? "bg-red-bright animate-pulse" : "bg-text-mute2/30"}`} />
            📡 {t("nav_signals")}
          </button>
        </div>

        {/* ── Signal info overlay ──────────────────────────────────────────── */}
        {selectedSignalIdx !== null && SIGNALS[selectedSignalIdx] && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20 w-[340px] max-w-[92vw]"
            style={{ bottom: timelineOpen ? "12px" : "60px", transition: "bottom 0.3s" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-xl overflow-hidden backdrop-blur-md"
              style={{ background: "rgba(11,13,24,0.95)", border: "1px solid rgba(240,165,0,0.35)", boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
            >
              <div className="h-px w-full" style={{ background: "linear-gradient(90deg,#f0a500,transparent)" }} />
              <div className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold
                      ${SIGNALS[selectedSignalIdx].tier === "t4" ? "text-red-bright border-red-protocol/40 bg-red-protocol/10"
                        : SIGNALS[selectedSignalIdx].tier === "t3" ? "text-amber-protocol border-amber-DEFAULT/30 bg-amber-dim"
                        : "text-blue-DEFAULT border-blue-DEFAULT/30 bg-blue-dim"}`}>
                      {SIGNALS[selectedSignalIdx].tier.toUpperCase()}
                    </span>
                    <p className="font-mono text-[7.5px] tracking-[.14em] uppercase text-text-mute2">
                      {SIGNALS[selectedSignalIdx].domain} · Score {SIGNALS[selectedSignalIdx].score}
                    </p>
                  </div>
                  <button onClick={() => setSelectedSignalIdx(null)} className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0">✕</button>
                </div>
                <p className="font-mono text-[10px] text-text-base leading-relaxed mb-2">{SIGNALS[selectedSignalIdx].sig}</p>
                <a href={SIGNALS[selectedSignalIdx].sourceUrl} target="_blank" rel="noopener noreferrer"
                   className="font-mono text-[8px] text-text-mute2/60 hover:text-amber-protocol/70 transition-colors">
                  {SIGNALS[selectedSignalIdx].source} ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── UTC clock — desktop only ─────────────────────────────────────── */}
        <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
          <LiveClock />
        </div>

        {/* ── Side panels ──────────────────────────────────────────────────── */}
        <GlobeIntelPanel open={intelOpen} onClose={() => setIntelOpen(false)} activeTab={intelTab} onTabChange={setIntelTab} />
        <GlobeProvisionerPanel open={provisionerOpen} onClose={() => setProvisionerOpen(false)} activeTab={provisionerTab} onTabChange={setProvisionerTab} />
        <GlobeProtocolPanel open={protocolOpen} onClose={() => setProtocolOpen(false)} />

        {/* ── Timeline trigger tab — bottom center ─────────────────────────── */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); setTimelineOpen((o) => !o); }}
            className="flex items-center gap-2 px-5 py-1.5 rounded-t-xl transition-all duration-200 backdrop-blur-sm"
            style={{
              background:   timelineOpen ? "rgba(232,64,64,0.14)" : "rgba(8,10,20,0.82)",
              border:       `1px solid ${timelineOpen ? "rgba(232,64,64,0.35)" : "rgba(255,255,255,0.08)"}`,
              borderBottom: "none",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
              style={{ background: timelineOpen ? "#e84040" : "rgba(150,165,180,0.4)" }}
            />
            <span
              className="font-mono text-[8px] tracking-[.22em] uppercase transition-colors"
              style={{ color: timelineOpen ? "#e84040cc" : "rgba(140,155,170,0.65)" }}
            >
              {t("nav_timeline")}
            </span>
            <motion.span
              animate={{ rotate: timelineOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="text-[8px]"
              style={{ color: timelineOpen ? "#e84040aa" : "rgba(140,155,170,0.45)" }}
            >
              ▲
            </motion.span>
          </button>
        </div>
      </div>

      {/* ── Timeline slide-up panel ───────────────────────────────────────── */}
      <AnimatePresence>
        {timelineOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 144 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 overflow-hidden"
            style={{ background: "rgba(5,6,13,0.99)", borderTop: "1px solid rgba(232,64,64,0.2)" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
                 style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-protocol animate-pulse" />
                <span className="font-mono text-[7.5px] tracking-[.22em] uppercase text-red-bright/60">
                  {t("nav_timeline")} · {t("timeline_scroll_hint")}
                </span>
              </div>
              <button
                onClick={closeTimeline}
                className="font-mono text-[11px] text-text-mute2/50 hover:text-text-mute2 transition-colors leading-none"
              >
                ✕
              </button>
            </div>

            {/* Timeline bar */}
            <GlobeTimeline
              activePhase={eraPhase}
              onPhaseSelect={setEraPhase}
              onEventSelect={setTimelineEvent}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile control bar (hidden sm+) ──────────────────────────────── */}
      <div className="flex sm:hidden flex-shrink-0 items-center gap-1.5 px-2 py-1.5
                      bg-void-1 border-t border-border-protocol/60 overflow-x-auto"
           style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>

        <button
          onClick={() => setProtocolOpen(!protocolOpen)}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] transition-all
                      ${protocolOpen ? "bg-cyan-DEFAULT/12 border-cyan-border text-cyan-DEFAULT" : "bg-void-3 border-border-protocol text-text-mute2"}`}
        >
          <span className={`w-1 h-1 rounded-full flex-shrink-0 ${protocolOpen ? "bg-cyan-DEFAULT animate-pulse" : "bg-text-mute2/40"}`} />
          {t("nav_protocol")}
        </button>

        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />

        {SCENARIO_IMPACTS.map((s) => {
          const active = scenarioId === s.id;
          return (
            <button key={s.id} onClick={() => setScenarioId(active ? null : s.id)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] transition-all
                          ${active ? "bg-red-protocol/20 border-red-protocol/40 text-red-bright" : "bg-void-3 border-border-protocol text-text-mute2"}`}>
              {s.id}
            </button>
          );
        })}

        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />

        <button onClick={() => setPsychologyMode(!psychologyMode)}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] transition-all
                      ${psychologyMode ? "border-purple-500/50 text-purple-300" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: psychologyMode ? "rgba(138,43,226,0.15)" : undefined }}>
          🧠 {t("nav_psychology")}
        </button>

        <button onClick={() => setShowSignals(!showSignals)}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] transition-all
                      ${showSignals ? "border-red-protocol/50 text-red-bright" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: showSignals ? "rgba(232,64,64,0.12)" : undefined }}>
          📡 {t("nav_signals")}
        </button>

        {/* Mobile timeline toggle */}
        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />
        <button onClick={() => setTimelineOpen((o) => !o)}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] transition-all
                      ${timelineOpen ? "bg-red-protocol/15 border-red-protocol/40 text-red-bright" : "bg-void-3 border-border-protocol text-text-mute2"}`}>
          ◐ {t("nav_timeline")}
        </button>
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PanelTrigger({
  open, onClick, label, openColor, side,
}: {
  open: boolean; onClick: (e: React.MouseEvent) => void;
  label: string; openColor: "red" | "gold"; side: "left" | "right";
}) {
  const { t } = useTranslation();
  const colorMap = {
    red:  { active: "bg-red-protocol/18 border-red-protocol/55 text-red-bright",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-red-protocol/30 hover:text-text-base" },
    gold: { active: "bg-gold-glow border-gold-protocol/55 text-gold-bright",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-gold-protocol/30 hover:text-text-base" },
  };
  const cls     = colorMap[openColor];
  const rounded = side === "left" ? "rounded-r-xl border-r border-y" : "rounded-l-xl border-l border-y";
  const arrow   = side === "left" ? (open ? "◄" : "►") : (open ? "►" : "◄");

  return (
    <button
      onClick={onClick}
      className={`py-3 sm:py-5 px-2.5 ${rounded} flex flex-col items-center gap-1.5
                  transition-all duration-200 backdrop-blur-sm
                  ${open ? cls.active : cls.idle}`}
    >
      <span className="font-mono text-[7.5px] [writing-mode:vertical-rl] rotate-180 tracking-[.18em] uppercase leading-none">
        {open ? t("nav_close") : label}
      </span>
      <span className="text-[9px]">{arrow}</span>
    </button>
  );
}
