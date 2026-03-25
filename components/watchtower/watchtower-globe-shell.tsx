// components/watchtower/watchtower-globe-shell.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/use-translation";
import { WorldRiskGlobe }         from "./world-risk-globe";
import { GlobeProvisionerPanel }  from "./globe-provisioner-panel";
import { LiveClock }              from "./live-clock";

import type { ProvisionerTab }    from "./globe-provisioner-panel";
import { SIGNALS, DOMAINS, SCENARIOS, PSYCH_PILLARS, GEAR, GATES, TIMELINE_EVENTS } from "@/lib/watchtower/data";
import { SCENARIO_IMPACTS }       from "@/lib/watchtower/scenario-impacts";
import { DOMAIN_IMPACTS }         from "@/lib/watchtower/domain-impacts";

// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  P1: "Stability  1945–71",
  P2: "Expansion  1971–08",
  P3: "Stress  2008–20",
  P5: "Cascade  2027–32",
  P6: "Resolve  2032+",
};

const SCRUB_PHASES = [
  {
    id: "P1", hex: "#38bdf8", label: "STABILITY", yearRange: "1945–71",
    desc: "Bretton Woods-backed stability. USD becomes global reserve. Cold War nuclear standoff begins.",
    gateIds: [] as string[],
    yearStart: 1945, yearEnd: 1971,
  },
  {
    id: "P2", hex: "#818cf8", label: "EXPANSION", yearRange: "1971–08",
    desc: "Fiat era begins. Nixon Shock ends gold standard. Unlimited deficit spending enabled. Debt compounds.",
    gateIds: [] as string[],
    yearStart: 1971, yearEnd: 2008,
  },
  {
    id: "P3", hex: "#fbbf24", label: "STRESS", yearRange: "2008–20",
    desc: "GFC triggers unlimited QE. Fed balance sheet $900B → $9T. Systemic risk deferred, not resolved.",
    gateIds: [] as string[],
    yearStart: 2008, yearEnd: 2020,
  },
  {
    id: "P4", hex: "#e84040", label: "NOW", yearRange: "2020–27",
    desc: "COVID, Ukraine, Doomsday Clock at 85 seconds. Multiple simultaneous civilisation stressors active.",
    gateIds: ["G1","G2","G3","G4","G6","G7"],
    yearStart: 2020, yearEnd: 2027,
  },
  {
    id: "P5", hex: "#ff0055", label: "CASCADE", yearRange: "2027–32",
    desc: "China nuclear parity. Taiwan crisis window peaks. US debt $40T+. CBDC rollout. Three-way MAD calculus.",
    gateIds: ["G1","G2","G3","G4","G5","G6","G7","G8"],
    yearStart: 2027, yearEnd: 2032,
  },
  {
    id: "P6", hex: "#64748b", label: "RESOLVE", yearRange: "2032+",
    desc: "Post-USD multipolar order. Climate cascade locks in. AI autonomous weapons. New equilibrium or collapse.",
    gateIds: ["G1","G2","G3","G4","G5","G6","G7","G8"],
    yearStart: 2032, yearEnd: 2038,
  },
] as const;

const EVT_COLORS: Record<string, string> = {
  red: "#e84040", warn: "#f0a500", info: "#38bdf8", pink: "#ff0055",
};

const DOMAIN_COLORS: Record<string, string> = {
  "Nuclear / EMP":     "#e84040",
  "Cyber / Tech":      "#00d4ff",
  "Civil / Political": "#f0a500",
  "Economic":          "#c9a84c",
  "Biological":        "#1ae8a0",
  "Climate":           "#38bdf8",
};

export function WatchtowerGlobeShell() {
  const { t, locale, setLocale, locales, meta } = useTranslation();
  const searchParams = useSearchParams();
  const router       = useRouter();

  // ── URL-sync helper ────────────────────────────────────────────────────────
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null) params.delete(key);
      else params.set(key, val);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [searchParams, router]);

  // ── State (initialized from URL params) ────────────────────────────────────
  const [provisionerOpen, setProvisionerOpen] = useState(() => searchParams.get("panel") === "shop");
  const [provisionerTab,  setProvisionerTab]  = useState<ProvisionerTab>("products");
  const [eraPhase,          setEraPhase]          = useState(() => searchParams.get("era") ?? "P4");
  const [livePhase,         setLivePhase]         = useState(() => searchParams.get("era") ?? "P4");
  const [scrubVelocity,     setScrubVelocity]     = useState(0);

  const [scenarioId,        setScenarioId]        = useState<string | null>(() => searchParams.get("scenario"));
  const [showSignals,       setShowSignals]       = useState(() => searchParams.get("signals") === "1");
  const [psychologyMode,    setPsychologyMode]    = useState(() => searchParams.get("psych") === "1");
  const [selectedSignalIdx, setSelectedSignalIdx] = useState<number | null>(null);
  const [domainId,          setDomainId]          = useState<string | null>(() => searchParams.get("domain"));
  const [selectedPsychZone, setSelectedPsychZone] = useState<{ region: string; threat: string; note: string } | null>(null);
  const [selectedGateId,    setSelectedGateId]    = useState<string | null>(null);

  const isHistorical = eraPhase !== "P4";

  return (
    <div className="w-full h-full flex flex-col bg-void-0">

      {/* ── Globe area ───────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* Globe */}
        <WorldRiskGlobe
          eraPhase={eraPhase}
          scenarioId={scenarioId}
          showSignals={showSignals}
          psychologyMode={psychologyMode}
          domainId={domainId}
          gatePhase={eraPhase}
          scrubVelocity={scrubVelocity}
          onSignalPinClick={setSelectedSignalIdx}
          onPsychZoneClick={setSelectedPsychZone}
          onGatePinClick={setSelectedGateId}
        />

        {/* ── Provisioner (right) panel trigger ──────────────────────────── */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
          <PanelTrigger
            open={provisionerOpen}
            onClick={(e) => {
              e.stopPropagation();
              const next = !provisionerOpen;
              setProvisionerOpen(next);
              updateUrl({ panel: next ? "shop" : null });
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
                           hover:text-amber-protocol transition-colors ml-1 min-h-[44px] sm:min-h-0 px-2"
                aria-label={t("nav_back_to_now")}
                onClick={(e) => {
                  e.stopPropagation();
                  setEraPhase("P4");
                  setLivePhase("P4");
                  updateUrl({ era: null });
                }}
              >
                ✕ {t("nav_back_to_now")}
              </button>
            </div>
          </div>
        )}

        {/* ── Globe mode controls — desktop only ───────────────────────────── */}
        <div className="hidden sm:flex absolute left-4 z-20 flex-col gap-1.5" style={{ top: "48px" }}>

          {/* Threat domains */}
          <div
            className="rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-mono text-[6.5px] tracking-[.2em] uppercase text-text-mute2/60 px-2.5 pt-2 pb-1">
              Threat Domains
            </p>
            <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">
              {DOMAINS.map((d) => {
                const active = domainId === d.id;
                const col    = DOMAIN_COLORS[d.label] ?? "#c9a84c";
                return (
                  <button
                    key={d.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = active ? null : d.id;
                      setDomainId(next);
                      updateUrl({ domain: next });
                    }}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-left
                                transition-all duration-150 font-mono text-[8px]
                                ${active ? "border" : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04] border border-transparent"}`}
                    style={active ? { color: col, background: `${col}18`, borderColor: `${col}40` } : {}}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: active ? col : "rgba(150,165,180,0.3)", boxShadow: active ? `0 0 6px ${col}` : "none" }}
                    />
                    <span className="text-[10px] leading-none">{d.icon}</span>
                    <span className="truncate max-w-[90px]">{d.label}</span>
                    <span className="ml-auto font-bold tabular-nums" style={{ color: active ? col : undefined }}>{d.score}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = active ? null : s.id;
                      setScenarioId(next);
                      updateUrl({ scenario: next });
                    }}
                    aria-pressed={active}
                    aria-label={`${active ? "Deactivate" : "Activate"} scenario: ${s.title}`}
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
            onClick={(e) => {
              e.stopPropagation();
              const next = !psychologyMode;
              setPsychologyMode(next);
              updateUrl({ psych: next ? "1" : null });
            }}
            aria-pressed={psychologyMode}
            aria-label={`${psychologyMode ? "Disable" : "Enable"} psychology mode`}
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
            onClick={(e) => {
              e.stopPropagation();
              const next = !showSignals;
              setShowSignals(next);
              updateUrl({ signals: next ? "1" : null });
            }}
            aria-pressed={showSignals}
            aria-label={`${showSignals ? "Hide" : "Show"} signal pins`}
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

          {/* Language picker */}
          <div
            className="rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-mono text-[6.5px] tracking-[.2em] uppercase text-text-mute2/60 px-2.5 pt-2 pb-1">
              {t("language_label")}
            </p>
            <div className="grid grid-cols-3 gap-0.5 px-1.5 pb-1.5">
              {locales.map((loc) => {
                const active = loc === locale;
                return (
                  <button
                    key={loc}
                    onClick={(e) => { e.stopPropagation(); setLocale(loc); }}
                    className={`flex items-center justify-center p-1.5 rounded font-mono text-[7.5px] transition-all
                                ${active ? "border border-gold-protocol/55 bg-gold-glow text-gold-bright" : "text-text-mute2 hover:bg-white/[0.04] border border-transparent"}`}
                  >
                    <span className="text-[11px] leading-none">{meta[loc].flag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Signal info overlay ──────────────────────────────────────────── */}
        {selectedSignalIdx !== null && SIGNALS[selectedSignalIdx] && (
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20 w-[340px] max-w-[92vw]"
            style={{ bottom: "80px" }}
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
                  <button onClick={() => setSelectedSignalIdx(null)} aria-label="Close signal details" className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center sm:min-w-0 sm:min-h-0">✕</button>
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

        {/* ── Domain info overlay ──────────────────────────────────────────── */}
        {domainId && (() => {
          const domain = DOMAINS.find(d => d.id === domainId);
          const impact = DOMAIN_IMPACTS.find(d => d.id === domainId);
          if (!domain) return null;
          const col = DOMAIN_COLORS[domain.label] ?? "#c9a84c";
          const primaryCount   = impact?.countries.filter(c => c.role === "primary").length ?? 0;
          const secondaryCount = impact?.countries.filter(c => c.role === "secondary").length ?? 0;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 z-20 w-[380px] max-w-[92vw]"
              style={{ bottom: "80px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-xl overflow-hidden backdrop-blur-md"
                style={{ background: "rgba(11,13,24,0.96)", border: `1px solid ${col}44`, boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 24px ${col}0a` }}
              >
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] leading-none">{domain.icon}</span>
                      <div>
                        <p className="font-mono text-[7px] tracking-[.18em] uppercase mb-0.5" style={{ color: col }}>
                          ARK SCORE · {domain.score} · {domain.trend}
                        </p>
                        <p className="font-syne font-bold text-[13px] text-text-base leading-none">{domain.label}</p>
                      </div>
                      <span
                        className="font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold ml-2"
                        style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
                      >
                        {domain.level}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDomainId(null); updateUrl({ domain: null }); }}
                      aria-label="Close domain overlay"
                      className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >✕</button>
                  </div>
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed mb-2.5">{domain.summary}</p>
                  <div className="space-y-1 mb-3">
                    {domain.drivers.slice(0, 2).map((drv, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="font-mono text-[8px] flex-shrink-0 mt-0.5" style={{ color: col }}>→</span>
                        <p className="font-mono text-[8px] text-text-mute2 leading-relaxed">{drv}</p>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const DOMAIN_GEAR_CATS: Record<string, string[]> = {
                      nuclear:   ["Communications"],
                      cyber:     ["Communications", "Energy"],
                      civil:     ["Communications", "Mobility"],
                      economic:  ["Medical", "Energy"],
                      bio:       ["Medical"],
                      climate:   ["Energy", "Medical"],
                    };
                    const cats = DOMAIN_GEAR_CATS[domainId] ?? [];
                    const gearItems = GEAR
                      .filter(cat => cats.includes(cat.cat))
                      .flatMap(cat => cat.items.filter(item => item.critical))
                      .slice(0, 3);
                    if (gearItems.length === 0) return null;
                    return (
                      <div className="space-y-1 mb-2.5">
                        <p className="font-mono text-[7px] tracking-[.12em] uppercase text-text-mute2/60 mb-1">Key Gear</p>
                        {gearItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="font-mono text-[7px] px-1 py-0.5 rounded text-text-mute2 border border-border-protocol bg-void-3">
                              {item.tier}
                            </span>
                            <span className="font-mono text-[8px] text-text-base flex-1 truncate">{item.name}</span>
                            <span className="font-mono text-[7.5px] text-gold-protocol flex-shrink-0">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <span className="font-mono text-[8px] text-text-mute2">
                      <span className="font-bold" style={{ color: col }}>{primaryCount}</span> primary · <span className="font-bold text-amber-protocol">{secondaryCount}</span> secondary
                    </span>
                    <span className="font-mono text-[8px] text-text-mute2/50 ml-auto">click country for detail</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* ── Scenario detail card ──────────────────────────────────────────── */}
        {scenarioId && (() => {
          const si = SCENARIO_IMPACTS.find(s => s.id === scenarioId);
          const sc = SCENARIOS.find(s => s.id === scenarioId);
          if (!si || !sc) return null;
          const sevCol = sc.sev === "EX" || sc.sev === "CR" ? "#e84040" : sc.sev === "HI" ? "#f0a500" : "#38bdf8";
          return (
            <motion.div
              key={scenarioId}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="absolute z-20 hidden sm:block"
              style={{ right: "1rem", top: "5rem", width: 300, maxHeight: "calc(100vh - 160px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-xl overflow-hidden backdrop-blur-md flex flex-col"
                style={{ background: "rgba(11,13,24,0.96)", border: `1px solid ${sevCol}40`, boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 24px ${sevCol}0a`, maxHeight: "inherit" }}
              >
                <div className="h-px w-full flex-shrink-0" style={{ background: `linear-gradient(90deg,${sevCol},transparent)` }} />
                <div className="px-3.5 py-3 flex-shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{sc.icon}</span>
                      <div>
                        <p className="font-mono text-[7px] tracking-[.16em] uppercase mb-0.5" style={{ color: sevCol }}>
                          {sc.prob}% PROB · {sc.window}
                        </p>
                        <p className="font-syne font-bold text-[13px] text-text-base leading-none">{sc.title}</p>
                      </div>
                    </div>
                    <button onClick={() => setScenarioId(null)} className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0">✕</button>
                  </div>
                </div>
                <div className="overflow-y-auto px-3.5 pb-3 space-y-3 flex-1" style={{ scrollbarWidth: "thin" }}>
                  <p className="font-mono text-[8.5px] text-text-dim leading-relaxed">{sc.summary}</p>
                  <div>
                    <p className="font-mono text-[7px] tracking-[.14em] uppercase mb-1.5" style={{ color: sevCol }}>Triggers</p>
                    <div className="space-y-1">
                      {sc.triggers.map((tr, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="font-mono text-[8px] flex-shrink-0 mt-0.5" style={{ color: sevCol }}>→</span>
                          <p className="font-mono text-[8px] text-text-mute2 leading-relaxed">{tr}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[7px] tracking-[.14em] uppercase mb-1.5 text-amber-protocol">Cascade</p>
                    <div className="flex flex-wrap gap-1">
                      {sc.cascade.map((c, i) => (
                        <span key={i} className="font-mono text-[7.5px] px-1.5 py-0.5 rounded border border-amber-DEFAULT/25 bg-amber-dim text-amber-protocol">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[7px] tracking-[.14em] uppercase mb-1.5 text-green-protocol">Mitigation</p>
                    <div className="space-y-1">
                      {sc.mitigation.map((m, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="font-mono text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                                style={{ color: m.pri === "1" ? "#e84040" : m.pri === "2" ? "#f0a500" : "#38bdf8",
                                         background: m.pri === "1" ? "rgba(232,64,64,0.1)" : m.pri === "2" ? "rgba(240,165,0,0.1)" : "rgba(56,189,248,0.1)" }}>
                            P{m.pri}
                          </span>
                          <div>
                            <p className="font-mono text-[8px] text-text-dim leading-snug">{m.action}</p>
                            <p className="font-mono text-[7px] text-text-mute2">{m.cost}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* ── Psych zone detail card ────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedPsychZone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 hidden sm:block"
              style={{ right: "1rem", bottom: "80px", width: 280, maxWidth: "calc(100vw - 80px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-xl overflow-hidden backdrop-blur-md"
                style={{ background: "rgba(11,13,24,0.96)", border: "1px solid rgba(138,43,226,0.45)", boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(138,43,226,0.08)" }}
              >
                <div className="h-px w-full" style={{ background: "linear-gradient(90deg,rgba(138,43,226,0.9),transparent)" }} />
                <div className="px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-mono text-[7px] tracking-[.16em] uppercase text-purple-300/70 mb-0.5">🧠 PSYCH THREAT</p>
                      <p className="font-syne font-bold text-[13px] text-text-base">{selectedPsychZone.region}</p>
                      <p className="font-mono text-[8px] text-purple-300 mt-0.5">{selectedPsychZone.threat}</p>
                    </div>
                    <button onClick={() => setSelectedPsychZone(null)} className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0">✕</button>
                  </div>
                  <p className="font-mono text-[8.5px] text-text-dim leading-relaxed mb-3">{selectedPsychZone.note}</p>
                  <div className="border-t border-white/[0.05] pt-2.5">
                    <p className="font-mono text-[7px] tracking-[.12em] uppercase text-purple-300/60 mb-2">Ark Response</p>
                    <div className="space-y-1.5">
                      {PSYCH_PILLARS.slice(0, 2).map((p) => (
                        <div key={p.name} className="flex items-start gap-1.5">
                          <span className="text-[10px] flex-shrink-0">{p.icon}</span>
                          <div>
                            <p className="font-mono text-[8px] font-bold text-text-base">{p.name}</p>
                            <p className="font-mono text-[7.5px] text-text-mute2 leading-snug">{p.tactics[0]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Gate detail card ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedGateId && (() => {
            const gate = GATES.find(g => g.id === selectedGateId);
            if (!gate) return null;
            const col = gate.tier === "t4" ? "#e84040" : gate.tier === "t3" ? "#f0a500" : "#38bdf8";
            return (
              <motion.div
                key={selectedGateId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-20"
                style={{ left: "1rem", bottom: "80px", width: 300, maxWidth: "calc(100vw - 80px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="rounded-xl overflow-hidden backdrop-blur-md"
                  style={{ background: "rgba(11,13,24,0.96)", border: `1px solid ${col}45`, boxShadow: `0 8px 40px rgba(0,0,0,0.7)` }}
                >
                  <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />
                  <div className="px-3.5 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[7.5px] px-1.5 py-0.5 rounded border font-bold"
                              style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}>
                          {gate.id} · {gate.tier.toUpperCase()}
                        </span>
                        <span className="font-mono text-[7px] text-text-mute2">{gate.window}</span>
                      </div>
                      <button onClick={() => setSelectedGateId(null)} className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0">✕</button>
                    </div>
                    <p className="font-mono text-[8px] tracking-[.08em] uppercase mb-2 font-bold" style={{ color: col }}>
                      TRIGGER
                    </p>
                    <p className="font-mono text-[9px] text-text-base leading-relaxed mb-3">{gate.trigger}</p>
                    <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <p className="font-mono text-[7px] tracking-[.1em] uppercase text-text-mute2 mb-1">Action</p>
                      <p className="font-mono text-[9px] font-bold leading-relaxed" style={{ color: col }}>{gate.action}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* ── UTC clock — desktop only ─────────────────────────────────────── */}
        <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
          <LiveClock />
        </div>

        {/* ── Side panels ──────────────────────────────────────────────────── */}
        <GlobeProvisionerPanel open={provisionerOpen} onClose={() => setProvisionerOpen(false)} activeTab={provisionerTab} onTabChange={setProvisionerTab} />

        {/* ── Era detail card — floats above scrubber when not at P4 ─────────── */}
        <AnimatePresence>
          {livePhase !== "P4" && (() => {
            const sp = SCRUB_PHASES.find(p => p.id === livePhase);
            if (!sp) return null;
            const events = TIMELINE_EVENTS.filter(e => {
              const yr = e.year.toLowerCase() === "now" ? 2026 : parseInt(e.year, 10) || 2026;
              return yr >= sp.yearStart && yr < sp.yearEnd;
            }).slice(0, 4);
            const gateDetails = GATES.filter(g => (sp.gateIds as readonly string[]).includes(g.id));
            return (
              <motion.div
                key={livePhase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute left-1/2 -translate-x-1/2 z-25 w-[360px] max-w-[calc(100vw-80px)]"
                style={{ bottom: "108px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="rounded-xl overflow-hidden backdrop-blur-md"
                  style={{
                    background: "rgba(6,7,14,0.96)",
                    border: `1px solid ${sp.hex}33`,
                    borderLeft: `2px solid ${sp.hex}`,
                    boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 20px ${sp.hex}08`,
                  }}
                >
                  {/* Header */}
                  <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ background: sp.hex, transform: "rotate(45deg)", boxShadow: `0 0 8px ${sp.hex}` }}
                      />
                      <span className="font-mono text-[8px] tracking-[.2em] uppercase font-bold" style={{ color: sp.hex }}>
                        {sp.label}
                      </span>
                      <span className="font-mono text-[7px] text-text-mute2">{sp.yearRange}</span>
                    </div>
                    <button
                      onClick={() => { setEraPhase("P4"); setLivePhase("P4"); updateUrl({ era: null }); }}
                      className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0"
                    >✕</button>
                  </div>
                  <div className="px-3.5 pb-3 space-y-2.5">
                    <p className="font-mono text-[8.5px] text-text-dim leading-relaxed">{sp.desc}</p>

                    {/* Key events */}
                    {events.length > 0 && (
                      <div>
                        <p className="font-mono text-[6.5px] tracking-[.16em] uppercase mb-1.5" style={{ color: `${sp.hex}88` }}>
                          Key Events
                        </p>
                        <div className="space-y-1">
                          {events.map((evt, i) => {
                            const col = EVT_COLORS[evt.colKey] ?? "#c9a84c";
                            const yr = evt.year.toLowerCase() === "now" ? "2026 NOW" : evt.year + (evt.predicted ? "~" : "");
                            return (
                              <div key={i} className="flex items-start gap-2">
                                <span className="font-mono text-[7.5px] font-bold flex-shrink-0 tabular-nums" style={{ color: col }}>{yr}</span>
                                <span className="font-mono text-[8px] text-text-mute2 leading-snug">{evt.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Decision gates */}
                    {gateDetails.length > 0 && (
                      <div className="border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <p className="font-mono text-[6.5px] tracking-[.16em] uppercase text-red-bright/50 mb-1.5">
                          Decision Gates
                        </p>
                        <div className="space-y-1">
                          {gateDetails.slice(0, 4).map((gate) => {
                            const col = gate.tier === "t4" ? "#e84040" : gate.tier === "t3" ? "#f0a500" : "#38bdf8";
                            return (
                              <div key={gate.id} className="flex items-start gap-2">
                                <span
                                  className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                                  style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
                                >
                                  {gate.id}
                                </span>
                                <span className="font-mono text-[7.5px] text-text-mute2 leading-snug flex-1">{gate.trigger}</span>
                                <span className="font-mono text-[7px] text-text-mute2/50 flex-shrink-0">{gate.window}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* ── Timeline scrubber — bottom-center of globe ───────────────────── */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-25"
          onClick={(e) => e.stopPropagation()}
        >
          <TimelineScrubber
            activePhase={eraPhase}
            onPhaseChange={(id) => {
              setEraPhase(id);
              setLivePhase(id);
              updateUrl({ era: id !== "P4" ? id : null });
            }}
            onLivePhase={setLivePhase}
            onVelocityChange={setScrubVelocity}
          />
        </div>
      </div>

      {/* ── Mobile control bar (hidden sm+) ──────────────────────────────── */}
      <div className="flex sm:hidden flex-shrink-0 items-center gap-1.5 px-2 py-1.5
                      bg-void-1 border-t border-border-protocol/60 overflow-x-auto"
           style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>

        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />

        {/* Domain buttons (mobile) */}
        {DOMAINS.map((d) => {
          const active = domainId === d.id;
          const col    = DOMAIN_COLORS[d.label] ?? "#c9a84c";
          return (
            <button key={d.id}
              onClick={() => {
                const next = active ? null : d.id;
                setDomainId(next);
                updateUrl({ domain: next });
              }}
              aria-pressed={active}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]`}
              style={active
                ? { color: col, background: `${col}18`, borderColor: `${col}40` }
                : { background: undefined }}
            >
              <span className="text-[12px] leading-none">{d.icon}</span>
            </button>
          );
        })}

        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />

        {SCENARIO_IMPACTS.map((s) => {
          const active = scenarioId === s.id;
          return (
            <button key={s.id}
              onClick={() => {
                const next = active ? null : s.id;
                setScenarioId(next);
                updateUrl({ scenario: next });
              }}
              aria-pressed={active}
              aria-label={`${active ? "Deactivate" : "Activate"} scenario ${s.id}`}
              className={`flex-shrink-0 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]
                          ${active ? "bg-red-protocol/20 border-red-protocol/40 text-red-bright" : "bg-void-3 border-border-protocol text-text-mute2"}`}>
              {s.id}
            </button>
          );
        })}

        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />

        <button
          onClick={() => {
            const next = !psychologyMode;
            setPsychologyMode(next);
            updateUrl({ psych: next ? "1" : null });
          }}
          aria-pressed={psychologyMode}
          aria-label={`${psychologyMode ? "Disable" : "Enable"} psychology mode`}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]
                      ${psychologyMode ? "border-purple-500/50 text-purple-300" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: psychologyMode ? "rgba(138,43,226,0.15)" : undefined }}>
          🧠 {t("nav_psychology")}
        </button>

        <button
          onClick={() => {
            const next = !showSignals;
            setShowSignals(next);
            updateUrl({ signals: next ? "1" : null });
          }}
          aria-pressed={showSignals}
          aria-label={`${showSignals ? "Hide" : "Show"} signal pins`}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]
                      ${showSignals ? "border-red-protocol/50 text-red-bright" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: showSignals ? "rgba(232,64,64,0.12)" : undefined }}>
          📡 {t("nav_signals")}
        </button>

      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

// ── Timeline scrubber ─────────────────────────────────────────────────────────

const SCRUB_PAD = 20; // px padding on each side of track

function TimelineScrubber({
  activePhase,
  onPhaseChange,
  onLivePhase,
  onVelocityChange,
}: {
  activePhase:      string;
  onPhaseChange:    (id: string) => void;
  onLivePhase:      (id: string) => void;
  onVelocityChange: (vel: number) => void;
}) {
  const trackRef    = useRef<HTMLDivElement>(null);
  const [trackW,   setTrackW]   = useState(300);
  const [dragIdx,  setDragIdx]  = useState<number | null>(null);
  const isDragging  = useRef(false);
  const lastX       = useRef(0);
  const velRef      = useRef(0);
  const velTimer    = useRef<ReturnType<typeof setInterval> | null>(null);

  const N          = SCRUB_PHASES.length - 1; // 5
  const activeIdx  = SCRUB_PHASES.findIndex((p) => p.id === activePhase);
  const displayIdx = dragIdx ?? activeIdx;
  const phase      = SCRUB_PHASES[displayIdx];

  // Measure track width
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrackW(el.offsetWidth));
    ro.observe(el);
    setTrackW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Cleanup
  useEffect(() => () => { if (velTimer.current) clearInterval(velTimer.current); }, []);

  const innerW = Math.max(0, trackW - SCRUB_PAD * 2);
  const stopX  = (i: number) => SCRUB_PAD + (i / N) * innerW;

  const getFrac = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return activeIdx / N;
    return Math.max(0, Math.min(1, (clientX - rect.left - SCRUB_PAD) / innerW));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    lastX.current = e.clientX;
    velRef.current = 0;
    if (velTimer.current) clearInterval(velTimer.current);
    const idx = Math.round(getFrac(e.clientX) * N);
    setDragIdx(idx);
    onLivePhase(SCRUB_PHASES[idx].id);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const frac = getFrac(e.clientX);
    const idx  = Math.round(frac * N);
    setDragIdx(idx);
    onLivePhase(SCRUB_PHASES[idx].id);
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    velRef.current = dx * 0.18;
    onVelocityChange(velRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const finalIdx = dragIdx ?? activeIdx;
    onPhaseChange(SCRUB_PHASES[finalIdx].id);
    setDragIdx(null);
    // Decay rotation velocity
    velTimer.current = setInterval(() => {
      velRef.current *= 0.72;
      onVelocityChange(velRef.current);
      if (Math.abs(velRef.current) < 0.02) {
        onVelocityChange(0);
        clearInterval(velTimer.current!);
      }
    }, 50);
  };

  return (
    <div
      className="select-none touch-none"
      style={{ width: "min(340px, calc(100vw - 96px))" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Container card */}
      <div
        className="rounded-2xl px-2 py-2"
        style={{
          background: "rgba(6,7,14,0.88)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
      >
        {/* Phase label + year */}
        <div className="flex items-center justify-center gap-2 mb-2 pointer-events-none">
          <motion.span
            key={phase.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[8px] tracking-[.22em] uppercase font-bold"
            style={{ color: phase.hex }}
          >
            {phase.label}
          </motion.span>
          <span className="font-mono text-[7px] text-text-mute2/60">{phase.yearRange}</span>
        </div>

        {/* Track */}
        <div ref={trackRef} className="relative h-8">
          {/* Background track line */}
          <div
            className="absolute top-1/2 pointer-events-none"
            style={{
              left: SCRUB_PAD, right: SCRUB_PAD,
              height: 1,
              background: "rgba(255,255,255,0.10)",
              transform: "translateY(-50%)",
            }}
          />

          {/* Active segment — from P1 stop to current stop */}
          <div
            className="absolute top-1/2 pointer-events-none transition-all duration-200"
            style={{
              left: stopX(0),
              width: Math.max(0, stopX(displayIdx) - stopX(0)),
              height: 2,
              background: `linear-gradient(90deg, ${SCRUB_PHASES[0].hex}44, ${phase.hex}cc)`,
              transform: "translateY(-50%)",
              borderRadius: 1,
            }}
          />

          {/* Phase stops */}
          {SCRUB_PHASES.map((p, i) => {
            const isActive = i === displayIdx;
            return (
              <div
                key={p.id}
                className="absolute top-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center"
                style={{ left: stopX(i), transform: "translateX(-50%) translateY(-50%)" }}
              >
                {/* Stop dot */}
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? 6 : 4,
                    height: isActive ? 6 : 4,
                    background: isActive ? p.hex : `${p.hex}55`,
                    boxShadow: isActive ? `0 0 8px ${p.hex}` : "none",
                  }}
                />
              </div>
            );
          })}

          {/* Phase labels — below track */}
          {SCRUB_PHASES.map((p, i) => {
            const isActive = i === displayIdx;
            return (
              <div
                key={p.id + "-lbl"}
                className="absolute pointer-events-none"
                style={{
                  left: stopX(i),
                  top: "calc(50% + 8px)",
                  transform: "translateX(-50%)",
                }}
              >
                <p
                  className="font-mono whitespace-nowrap transition-all duration-200"
                  style={{
                    fontSize: "6.5px",
                    letterSpacing: ".1em",
                    color: isActive ? `${p.hex}cc` : `${p.hex}44`,
                    fontWeight: isActive ? "700" : "400",
                  }}
                >
                  {p.label === "NOW" ? "NOW" : p.yearRange.split("–")[0]}
                </p>
              </div>
            );
          })}

          {/* Draggable diamond handle */}
          <motion.div
            className="absolute top-1/2 pointer-events-none z-10"
            animate={{ left: stopX(displayIdx) }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{ translateX: "-50%", translateY: "-50%" }}
          >
            <div
              style={{
                width: 14, height: 14,
                background: phase.hex,
                transform: "rotate(45deg)",
                borderRadius: 2,
                boxShadow: `0 0 14px ${phase.hex}aa, 0 0 4px ${phase.hex}`,
                border: "1.5px solid rgba(255,255,255,0.4)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PanelTrigger({
  open, onClick, label, openColor, side,
}: {
  open: boolean; onClick: (e: React.MouseEvent) => void;
  label: string; openColor: "red" | "gold" | "cyan"; side: "left" | "right";
}) {
  const { t } = useTranslation();
  const colorMap = {
    red:  { active: "bg-red-protocol/18 border-red-protocol/55 text-red-bright",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-red-protocol/30 hover:text-text-base" },
    gold: { active: "bg-gold-glow border-gold-protocol/55 text-gold-bright",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-gold-protocol/30 hover:text-text-base" },
    cyan: { active: "bg-cyan-DEFAULT/12 border-cyan-border text-cyan-DEFAULT",
            idle:   "bg-void-1/78 border-border-protocol text-text-mute2 hover:border-cyan-border/40 hover:text-text-base" },
  };
  const cls     = colorMap[openColor];
  const rounded = side === "left" ? "rounded-r-xl border-r border-y" : "rounded-l-xl border-l border-y";
  const arrow   = side === "left" ? (open ? "◄" : "►") : (open ? "►" : "◄");

  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? t("nav_close") : label}
      className={`py-3 sm:py-5 px-2.5 min-h-[44px] ${rounded} flex flex-col items-center gap-1.5
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
