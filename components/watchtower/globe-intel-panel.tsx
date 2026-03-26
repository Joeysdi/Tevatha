// components/watchtower/globe-intel-panel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SIGNALS, SCENARIOS, GEAR,
  PSYCH_PILLARS, PSYCH_THREATS, TIMELINE_EVENTS, GATES,
} from "@/lib/watchtower/data";
import type { SevCode } from "@/lib/watchtower/data";
import { useTranslation } from "@/lib/i18n/use-translation";

export type IntelTab = "scenarios" | "signals" | "gear" | "psych" | "timeline";

interface Props {
  open:        boolean;
  onClose:     () => void;
  activeTab:   IntelTab;
  onTabChange: (t: IntelTab) => void;
}

const TABS: { id: IntelTab; label: string }[] = [
  { id: "scenarios", label: "⚠ Scenarios" },
  { id: "signals",   label: "📡 Signals"  },
  { id: "gear",      label: "⚙ Gear"     },
  { id: "psych",     label: "🧠 Psych"   },
  { id: "timeline",  label: "◔ Timeline"  },
];

// ── Shared constants ──────────────────────────────────────────────────────────

const SEV_STYLES: Record<SevCode, string> = {
  EX: "bg-[rgba(255,0,85,0.18)] text-[#ff0055] border border-[rgba(255,0,85,0.3)]",
  CR: "bg-red-dim text-red-bright border border-red-protocol/28",
  HI: "bg-amber-dim text-amber-protocol border border-amber-DEFAULT/26",
  EL: "bg-blue-dim text-blue-DEFAULT border border-blue-DEFAULT/22",
  ME: "bg-[rgba(168,85,247,0.12)] text-purple-DEFAULT border border-purple-DEFAULT/22",
};
const SEV_LABELS: Record<SevCode, string> = {
  EX: "EXISTENTIAL", CR: "CRITICAL", HI: "HIGH", EL: "ELEVATED", ME: "MEDIUM",
};

const TIER_BADGE: Record<string, string> = {
  t4: "bg-red-protocol/25 text-red-bright border-red-protocol/30",
  t3: "bg-amber-dim text-amber-protocol border-amber-DEFAULT/20",
  t2: "bg-blue-dim text-blue-DEFAULT border-blue-DEFAULT/20",
  t1: "bg-green-dim text-green-bright border-green-bright/20",
};

const TIER_HEX: Record<string, string> = {
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8", t1: "#1ae8a0",
};

const EVT_COLORS: Record<string, string> = {
  red: "#e84040", warn: "#f0a500", info: "#38bdf8", pink: "#ff0055",
};

const PILLAR_COLORS: Record<string, { text: string; border: string }> = {
  purple: { text: "text-purple-DEFAULT", border: "border-l-purple-DEFAULT" },
  indigo: { text: "text-[#6366f1]",      border: "border-l-[#6366f1]"      },
  teal:   { text: "text-[#2dd4bf]",      border: "border-l-[#2dd4bf]"      },
  gold:   { text: "text-gold-protocol",  border: "border-l-gold-protocol"  },
  cyan:   { text: "text-cyan-DEFAULT",   border: "border-l-cyan-DEFAULT"   },
  red:    { text: "text-red-bright",     border: "border-l-red-bright"     },
};

const PHASES = [
  { id: "P1", yearStart: 1945, yearEnd: 1971, hex: "#38bdf8", label: "STABILITY" },
  { id: "P2", yearStart: 1971, yearEnd: 2008, hex: "#818cf8", label: "EXPANSION" },
  { id: "P3", yearStart: 2008, yearEnd: 2020, hex: "#fbbf24", label: "STRESS"    },
  { id: "P4", yearStart: 2020, yearEnd: 2027, hex: "#e84040", label: "NOW"       },
  { id: "P5", yearStart: 2027, yearEnd: 2032, hex: "#ff0055", label: "CASCADE"   },
  { id: "P6", yearStart: 2032, yearEnd: 2038, hex: "#64748b", label: "RESOLVE"   },
  { id: "P7", yearStart: 2038, yearEnd: 2059, hex: "#7c3aed", label: "EMERGENCE" },
  { id: "P8", yearStart: 2059, yearEnd: 2079, hex: "#374151", label: "DIVERGENCE" },
  { id: "P9", yearStart: 2079, yearEnd: 2100, hex: "#111827", label: "TERMINUS"  },
];

const NOW_YEAR = 2026;

function parseEvtYear(y: string): number {
  if (y.toLowerCase() === "now") return NOW_YEAR;
  return parseInt(y, 10) || NOW_YEAR;
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function GlobeIntelPanel({ open, onClose, activeTab, onTabChange }: Props) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="intel-panel"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-0 inset-y-0 z-30 w-[360px] max-w-[88vw]
                     flex flex-col bg-void-1/97 backdrop-blur-md
                     border-r border-border-protocol overflow-hidden"
          style={{ boxShadow: "6px 0 48px rgba(0,0,0,0.7)" }}
        >
          {/* Red accent line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
               style={{ background: "linear-gradient(90deg,#e84040,rgba(232,64,64,0.2),transparent)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-border-protocol flex-shrink-0">
            <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-red-bright">
              Watchtower · {t("nav_intel")}
            </p>
            <button
              onClick={onClose}
              aria-label="Close intel panel"
              className="w-7 h-7 rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-border-bright/40
                         transition-colors font-mono text-[11px]
                         flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Tab strip — scrollable */}
          <div
            className="flex border-b border-border-protocol flex-shrink-0 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-shrink-0 px-3 py-2.5 font-mono text-[8.5px] font-bold
                            tracking-[.05em] transition-colors duration-150 whitespace-nowrap
                            ${activeTab === tab.id
                              ? "text-red-bright border-b-2 border-red-protocol bg-red-protocol/6"
                              : "text-text-mute2 hover:text-text-base border-b-2 border-transparent"
                            }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              >
                {activeTab === "scenarios" && <ScenariosTab />}
                {activeTab === "signals"   && <SignalsTab />}
                {activeTab === "gear"      && <GearTab />}
                {activeTab === "psych"     && <PsychTab />}
                {activeTab === "timeline"  && <TimelineTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ── SCENARIOS TAB ─────────────────────────────────────────────────────────────

function ScenariosTab() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-border-protocol/60">
      {SCENARIOS.map((s) => {
        const isOpen = openId === s.id;
        const sevCol = s.sev === "EX" || s.sev === "CR" ? "#e84040"
          : s.sev === "HI" ? "#f0a500" : "#38bdf8";
        return (
          <div key={s.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : s.id)}
              className="w-full text-left px-4 py-3 hover:bg-white/[0.018] transition-colors"
            >
              <div className="flex items-start gap-2 mb-1">
                <span className="text-[15px] flex-shrink-0 mt-0.5">{s.icon}</span>
                <span className="font-syne font-bold text-[11.5px] text-text-base flex-1 leading-snug">
                  {s.title}
                </span>
                <span className={`flex-shrink-0 font-mono text-[7px] font-bold
                                  px-1.5 py-0.5 rounded ${SEV_STYLES[s.sev]}`}>
                  {SEV_LABELS[s.sev]}
                </span>
              </div>
              <div className="flex items-center gap-3 pl-6">
                <span className="font-mono text-[7.5px] text-text-mute2">{s.window}</span>
                <span className="font-mono text-[8px] font-bold tabular-nums" style={{ color: sevCol }}>
                  {s.prob}% prob
                </span>
                <span className="font-mono text-[7px] text-text-mute2/70">prep: {s.prepTime}</span>
                <span className="ml-auto font-mono text-[8px] text-text-mute2/40 flex-shrink-0">
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-4 pb-3 bg-void-3/60 space-y-2.5">
                    <p className="font-mono text-[8.5px] text-text-dim leading-relaxed pt-2">
                      {s.summary}
                    </p>

                    {/* Triggers */}
                    <div>
                      <p className="font-mono text-[7px] tracking-[.16em] uppercase text-text-mute2/70 mb-1">
                        Triggers
                      </p>
                      {s.triggers.slice(0, 3).map((tr, i) => (
                        <div key={i} className="flex gap-1.5 py-0.5">
                          <span className="text-red-bright/70 font-mono text-[8px] flex-shrink-0">›</span>
                          <span className="font-mono text-[8px] text-text-dim leading-snug">{tr}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cascade */}
                    {s.cascade.length > 0 && (
                      <div>
                        <p className="font-mono text-[7px] tracking-[.16em] uppercase text-text-mute2/70 mb-1">
                          Cascade
                        </p>
                        {s.cascade.slice(0, 2).map((c, i) => (
                          <div key={i} className="flex gap-1.5 py-0.5">
                            <span className="text-amber-protocol/60 font-mono text-[8px] flex-shrink-0">›</span>
                            <span className="font-mono text-[8px] text-text-dim leading-snug">{c}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Top mitigation */}
                    <div>
                      <p className="font-mono text-[7px] tracking-[.16em] uppercase text-text-mute2/70 mb-1">
                        Mitigation
                      </p>
                      {s.mitigation.slice(0, 3).map((m, i) => (
                        <div key={i} className="flex items-baseline gap-1.5 py-0.5">
                          <span className={`flex-shrink-0 font-mono text-[6.5px] font-bold
                                            px-1 rounded border
                                            ${m.pri === "1"
                                              ? "text-red-bright border-red-protocol/30 bg-red-dim"
                                              : m.pri === "2"
                                              ? "text-amber-protocol border-amber-DEFAULT/25 bg-amber-dim"
                                              : "text-text-mute2 border-border-protocol"}`}>
                            P{m.pri}
                          </span>
                          <span className="font-mono text-[7.5px] text-text-dim leading-snug flex-1">
                            {m.action}
                          </span>
                          <span className="font-mono text-[7px] text-gold-protocol flex-shrink-0">
                            {m.cost}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── SIGNALS TAB ───────────────────────────────────────────────────────────────

function SignalsTab() {
  const sorted = [...SIGNALS].sort((a, b) => b.score - a.score);

  return (
    <div className="divide-y divide-border-protocol/40">
      {sorted.map((s, i) => (
        <div key={i} className="px-4 py-3 hover:bg-white/[0.018] transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded border
                             font-mono text-[7px] font-bold ${TIER_BADGE[s.tier] ?? TIER_BADGE.t2}`}>
              {s.tier.toUpperCase()}
            </span>
            <span className="font-mono text-[7.5px] text-text-mute2 flex-1 truncate">{s.domain}</span>
            <span className="font-mono text-[9px] font-bold text-red-bright tabular-nums flex-shrink-0">
              {s.score}
            </span>
          </div>
          <p className="font-mono text-[9px] text-text-base leading-relaxed mb-1.5">{s.sig}</p>
          <a
            href={s.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[7.5px] text-text-mute2/50 hover:text-amber-protocol/70
                       transition-colors"
          >
            {s.source} ↗
          </a>
        </div>
      ))}
    </div>
  );
}

// ── GEAR TAB ──────────────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold-protocol text-[9px] tracking-[1px]">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

function GearTab() {
  const [activeCat, setActiveCat] = useState(GEAR[0]?.cat ?? "");
  const current = GEAR.find((g) => g.cat === activeCat);

  return (
    <div>
      {/* Category pills */}
      <div className="flex flex-wrap gap-1 px-3 pt-3 pb-2.5
                      border-b border-border-protocol/50">
        {GEAR.map((g) => (
          <button
            key={g.cat}
            onClick={() => setActiveCat(g.cat)}
            className={`px-2.5 py-0.5 rounded-full border font-mono text-[7.5px]
                        transition-all duration-150
                        ${activeCat === g.cat
                          ? "bg-gold-glow border-gold-protocol text-gold-bright"
                          : "border-border-protocol text-text-mute2 hover:border-gold-protocol/30"
                        }`}
          >
            {g.cat}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="divide-y divide-border-protocol/40">
        {current?.items.map((item, i) => (
          <div key={i} className="px-4 py-3 hover:bg-white/[0.018] transition-colors">
            <div className="flex items-start gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className={`font-mono text-[7px] font-bold px-1.5 py-0.5 rounded border
                    ${item.tier === "T1"
                      ? "text-green-bright border-green-bright/25 bg-green-dim"
                      : item.tier === "T2"
                      ? "text-blue-DEFAULT border-blue-DEFAULT/25 bg-blue-dim"
                      : "text-purple-DEFAULT border-purple-DEFAULT/25"}`}>
                    {item.tier}
                  </span>
                  {item.critical && (
                    <span className="flex items-center gap-0.5 font-mono text-[7px] text-red-bright
                                     border border-red-protocol/25 bg-red-dim px-1.5 py-0.5 rounded">
                      <span className="w-1 h-1 rounded-full bg-red-bright animate-pulse" />
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="font-syne font-semibold text-[11px] text-text-base leading-snug">
                  {item.name}
                </p>
                <p className="font-mono text-[7.5px] text-text-mute2">{item.brand}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-mono text-[12px] font-bold text-gold-bright tabular-nums">
                  {item.price}
                </p>
                <Stars n={item.rating} />
              </div>
            </div>
            <p className="font-mono text-[8px] text-text-dim leading-relaxed line-clamp-2">
              {item.spec}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PSYCH TAB ─────────────────────────────────────────────────────────────────

type PsychSubTab = "pillars" | "threats";

function PsychTab() {
  const [sub, setSub] = useState<PsychSubTab>("pillars");

  return (
    <div>
      {/* Sub-tab strip */}
      <div className="flex border-b border-border-protocol/60 flex-shrink-0">
        {(["pillars", "threats"] as PsychSubTab[]).map((id) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className={`flex-1 py-2.5 font-mono text-[8.5px] font-bold tracking-[.05em]
                        transition-colors duration-150
                        ${sub === id
                          ? "text-gold-bright border-b-2 border-gold-protocol bg-gold-glow/40"
                          : "text-text-mute2 border-b-2 border-transparent hover:text-text-base"
                        }`}
          >
            {id === "pillars" ? "🧱 Six Pillars" : "⚠ Threat Matrix"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {sub === "pillars" && (
          <motion.div
            key="pillars"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="divide-y divide-border-protocol/40">
              {PSYCH_PILLARS.map((p) => {
                const colors = PILLAR_COLORS[p.colKey] ?? PILLAR_COLORS.gold;
                return (
                  <div key={p.name}
                       className={`px-4 py-3 border-l-2 ${colors.border}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[14px]">{p.icon}</span>
                      <span className={`font-syne font-bold text-[11px] ${colors.text}`}>
                        {p.name}
                      </span>
                    </div>
                    <p className="font-mono text-[8.5px] text-text-dim leading-relaxed mb-1.5">
                      {p.desc}
                    </p>
                    {p.tactics.slice(0, 3).map((tactic, i) => (
                      <div key={i}
                           className="flex gap-1.5 py-0.5 font-mono text-[8px] text-text-dim/80">
                        <span className={`flex-shrink-0 ${colors.text}`}>›</span>
                        {tactic}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {sub === "threats" && (
          <motion.div
            key="threats"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="divide-y divide-border-protocol/40">
              {PSYCH_THREATS.map((th) => (
                <div key={th.threat}
                     className="px-4 py-3 hover:bg-white/[0.018] transition-colors">
                  <div className="flex items-start gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-syne font-bold text-[11px] text-text-base mb-0.5 leading-snug">
                        {th.threat}
                      </p>
                      <p className="font-mono text-[7.5px] text-text-mute2">{th.onset}</p>
                    </div>
                    <span className={`flex-shrink-0 font-mono text-[7px] font-bold
                                      px-1.5 py-0.5 rounded ${SEV_STYLES[th.sev]}`}>
                      {SEV_LABELS[th.sev]}
                    </span>
                  </div>
                  <p className="font-mono text-[8px] text-text-dim leading-relaxed mb-1.5">
                    {th.signs}
                  </p>
                  <p className="font-mono text-[7.5px] text-cyan-DEFAULT/70 leading-relaxed">
                    {th.ark}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── TIMELINE TAB ──────────────────────────────────────────────────────────────

function TimelineTab() {
  const phaseGroups = PHASES.map((phase) => {
    const events = TIMELINE_EVENTS.filter((evt) => {
      const yr = parseEvtYear(evt.year);
      return yr >= phase.yearStart && yr < phase.yearEnd;
    });
    return { ...phase, events };
  }).filter((p) => p.events.length > 0);

  return (
    <div>
      {/* Decision gates */}
      {GATES.length > 0 && (
        <div className="px-4 py-3 border-b border-border-protocol/60"
             style={{ background: "rgba(232,64,64,0.04)" }}>
          <p className="font-mono text-[7px] tracking-[.18em] uppercase text-red-bright/60 mb-2">
            Decision Gates
          </p>
          <div className="space-y-2">
            {GATES.map((gate) => {
              const col = TIER_HEX[gate.tier] ?? "#c9a84c";
              return (
                <div key={gate.id} className="flex items-start gap-2">
                  <div className="flex-shrink-0 pt-0.5">
                    <span
                      className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded border"
                      style={{ color: col, borderColor: `${col}40`, background: `${col}12` }}
                    >
                      {gate.id}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-syne font-bold text-[10px] text-text-base leading-snug">
                      {gate.trigger}
                    </p>
                    <p className="font-mono text-[7.5px] text-text-mute2 mt-0.5 leading-snug">
                      {gate.action}
                    </p>
                  </div>
                  <span className="font-mono text-[6.5px] text-text-mute2/50 flex-shrink-0 mt-0.5">
                    {gate.window}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase-grouped events */}
      {phaseGroups.map((phase) => (
        <div key={phase.id} className="border-b border-border-protocol/40">
          {/* Phase header */}
          <div
            className="px-4 py-2 flex items-center gap-2 sticky top-0 z-10"
            style={{ background: `color-mix(in srgb, ${phase.hex} 8%, #06070e)` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: phase.hex }}
            />
            <span
              className="font-mono text-[7.5px] tracking-[.16em] uppercase font-bold"
              style={{ color: phase.hex }}
            >
              {phase.label} · {phase.yearStart}–{phase.yearEnd}
            </span>
          </div>

          {/* Events */}
          <div className="divide-y divide-border-protocol/20">
            {phase.events.map((evt, i) => {
              const col = EVT_COLORS[evt.colKey] ?? "#c9a84c";
              const yearStr = evt.year.toLowerCase() === "now" ? `${NOW_YEAR} NOW` : evt.year;
              return (
                <div
                  key={i}
                  className="px-4 py-2.5 hover:bg-white/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-mono tabular-nums text-[7.5px] font-bold flex-shrink-0"
                      style={{ color: col }}
                    >
                      {yearStr}{evt.predicted ? " ~" : ""}
                    </span>
                    <span
                      className="font-mono text-[6.5px] px-1 py-0.5 rounded"
                      style={{
                        color:      evt.sev === "critical" ? "#e84040" : evt.sev === "high" ? "#f0a500" : "#38bdf8",
                        background: evt.sev === "critical" ? "rgba(232,64,64,0.1)" : evt.sev === "high" ? "rgba(240,165,0,0.08)" : "rgba(56,189,248,0.08)",
                      }}
                    >
                      {evt.sev}
                    </span>
                  </div>
                  <p className="font-syne font-bold text-[11px] text-text-base leading-snug mb-0.5">
                    {evt.label}
                  </p>
                  <p className="font-mono text-[8px] text-text-dim leading-relaxed">
                    {evt.signal}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── LANGUAGE PICKER ───────────────────────────────────────────────────────────

function LanguagePicker() {
  const { locale, setLocale, locales, meta, t } = useTranslation();

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-3">
        <p className="font-mono text-[7.5px] tracking-[.2em] uppercase text-text-mute2">
          {t("language_label")}
        </p>
        <div className="flex-1 h-px bg-border-protocol/60" />
        <span className="font-mono text-[8px] text-text-mute2/50 uppercase tracking-[.1em]">
          {meta[locale].flag} {meta[locale].nativeName}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {locales.map((loc) => {
          const active = loc === locale;
          return (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`flex items-center gap-1.5 px-2 py-2 rounded-lg
                          border font-mono text-[8.5px] transition-all duration-150 text-left
                          ${active
                            ? "border-gold-protocol/55 bg-gold-glow text-gold-bright"
                            : "border-border-protocol/60 text-text-mute2 hover:border-border-bright/40 hover:text-text-base hover:bg-white/[0.025]"
                          }`}
            >
              <span className="text-[11px] leading-none flex-shrink-0">{meta[loc].flag}</span>
              <span className="leading-none truncate">{meta[loc].nativeName}</span>
            </button>
          );
        })}
      </div>

      <p className="font-mono text-[7px] text-text-mute2/35 mt-3 text-center tracking-[.1em]">
        UI ONLY · Intelligence data remains in English
      </p>
    </div>
  );
}
