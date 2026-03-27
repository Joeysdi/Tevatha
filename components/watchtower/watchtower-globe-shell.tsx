// components/watchtower/watchtower-globe-shell.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/use-translation";
import { WorldRiskGlobe }         from "./world-risk-globe";
import { GlobeProvisionerPanel }  from "./globe-provisioner-panel";
import { GlobeProtocolPanel }     from "./globe-protocol-panel";
import { GlobeInfoCards }         from "./globe-info-cards";
import { LiveClock }              from "./live-clock";

import type { ProvisionerTab }    from "./globe-provisioner-panel";
import { DOMAINS, TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";
import { SCENARIO_IMPACTS }       from "@/lib/watchtower/scenario-impacts";

// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  P1: "Stability  1945–71",
  P2: "Expansion  1971–08",
  P3: "Stress  2008–20",
  P5: "Cascade  2027–32",
  P6: "Resolve  2032–38",
  P7: "Emergence  2038–59",
  P8: "Divergence  2059–79",
  P9: "Terminus  2079–2100",
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
    id: "P6", hex: "#64748b", label: "RESOLVE", yearRange: "2032–38",
    desc: "Post-USD multipolar order. Climate cascade locks in. AI autonomous weapons. New equilibrium or collapse.",
    gateIds: ["G1","G2","G3","G4","G5","G6","G7","G8"],
    yearStart: 2032, yearEnd: 2038,
  },
  {
    id: "P7", hex: "#7c3aed", label: "EMERGENCE", yearRange: "2038–59",
    desc: "AGI threshold crossed. Post-labor economy restructures. Off-world colonies attempt. Engineered biology democratized. Nation-state model gives way to new power structures.",
    gateIds: [] as string[],
    yearStart: 2038, yearEnd: 2059,
  },
  {
    id: "P8", hex: "#374151", label: "DIVERGENCE", yearRange: "2059–79",
    desc: "Humanity splits into augmented and unaugmented tracks. Longevity escape velocity for elites. AI legal personhood. Post-scarcity energy. Two civilizations begin to drift irreconcilably apart.",
    gateIds: [] as string[],
    yearStart: 2059, yearEnd: 2079,
  },
  {
    id: "P9", hex: "#111827", label: "TERMINUS", yearRange: "2079–2100",
    desc: "Final verdict on the human civilizational arc. Neural interface merger normalized. Climate outcome determined. Whether this resolves as survival, transcendence, or extinction becomes clear.",
    gateIds: [] as string[],
    yearStart: 2079, yearEnd: 2100,
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

/** Build a ?-prefixed URL string by applying updates to existing search params. */
function buildUrl(
  current: ReturnType<typeof useSearchParams>,
  updates: Record<string, string | null>,
): string {
  const p = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(updates)) {
    if (v === null) p.delete(k); else p.set(k, v);
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
}

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
  const [protocolOpen,    setProtocolOpen]    = useState(false);
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

  // ── New layer toggles ───────────────────────────────────────────────────────
  const [showCommodities,   setShowCommodities]   = useState(false);
  const [showInstability,   setShowInstability]   = useState(false);
  const [showNewsFeed,      setShowNewsFeed]      = useState(false);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string | null>(null);
  const [selectedNewsId,    setSelectedNewsId]    = useState<string | null>(null);

  const globeContainerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(800);
  const [containerH, setContainerH] = useState(600);

  useEffect(() => {
    const el = globeContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerW(el.offsetWidth);
      setContainerH(el.offsetHeight);
    });
    ro.observe(el);
    setContainerW(el.offsetWidth);
    setContainerH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const isHistorical = eraPhase !== "P4";

  return (
    <div className="w-full h-full flex flex-col bg-void-0">

      {/* ── Globe area ───────────────────────────────────────────────────── */}
      <div ref={globeContainerRef} className="flex-1 relative overflow-hidden min-h-0">
        {/* Globe */}
        <WorldRiskGlobe
          eraPhase={eraPhase}
          scenarioId={scenarioId}
          showSignals={showSignals}
          psychologyMode={psychologyMode}
          domainId={domainId}
          gatePhase={eraPhase}
          scrubVelocity={scrubVelocity}
          showCommodities={showCommodities}
          showInstability={showInstability}
          showNewsFeed={showNewsFeed}
          onSignalPinClick={setSelectedSignalIdx}
          onPsychZoneClick={setSelectedPsychZone}
          onGatePinClick={setSelectedGateId}
          onCommodityPinClick={setSelectedCommodityId}
          onNewsFeedPinClick={setSelectedNewsId}
        />

        {/* ── Protocol (left) panel trigger ───────────────────────────────── */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0.5">
          <PanelTrigger
            open={protocolOpen}
            onClick={(e) => {
              e.stopPropagation();
              setProtocolOpen((v) => !v);
            }}
            label="⬡ Protocol"
            openColor="cyan"
            side="left"
          />
        </div>

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
                  <Link
                    key={d.id}
                    href={buildUrl(searchParams, { domain: active ? null : d.id })}
                    replace
                    onClick={(e) => {
                      e.stopPropagation();
                      setDomainId(active ? null : d.id);
                    }}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-2 py-1 min-h-[44px] rounded-lg text-left
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
                  </Link>
                );
              })}
            </div>
          </div>

          <nav
            aria-label="Scenario navigation"
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
                  <Link
                    key={s.id}
                    href={buildUrl(searchParams, { scenario: active ? null : s.id })}
                    replace
                    onClick={(e) => {
                      e.stopPropagation();
                      setScenarioId(active ? null : s.id);
                    }}
                    aria-pressed={active}
                    aria-label={`${active ? "Deactivate" : "Activate"} scenario: ${s.title}`}
                    className={`flex items-center gap-1.5 px-2 py-1 min-h-[44px] rounded-lg text-left
                                transition-all duration-150 font-mono text-[8px]
                                ${active
                                  ? "bg-red-protocol/20 text-red-bright border border-red-protocol/40"
                                  : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04] border border-transparent"
                                }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-red-bright animate-pulse" : "bg-text-mute2/30"}`} />
                    {s.title}
                  </Link>
                );
              })}
            </div>
          </nav>

          <Link
            href={buildUrl(searchParams, { psych: psychologyMode ? null : "1" })}
            replace
            onClick={(e) => {
              e.stopPropagation();
              setPsychologyMode(!psychologyMode);
            }}
            aria-pressed={psychologyMode}
            aria-label={`${psychologyMode ? "Disable" : "Enable"} psychology mode`}
            className={`flex items-center gap-2 px-2.5 py-1.5 min-h-[44px] rounded-xl backdrop-blur-sm
                        border font-mono text-[8px] transition-all duration-150
                        ${psychologyMode
                          ? "border-purple-500/50 text-purple-300"
                          : "border-border-protocol text-text-mute2 hover:border-purple-500/30 hover:text-text-base"
                        }`}
            style={{ background: psychologyMode ? "rgba(138,43,226,0.15)" : "rgba(11,13,24,0.88)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${psychologyMode ? "bg-purple-400 animate-pulse" : "bg-text-mute2/30"}`} />
            🧠 {t("nav_psychology")}
          </Link>

          <Link
            href={buildUrl(searchParams, { signals: showSignals ? null : "1" })}
            replace
            onClick={(e) => {
              e.stopPropagation();
              setShowSignals(!showSignals);
            }}
            aria-pressed={showSignals}
            aria-label={`${showSignals ? "Hide" : "Show"} signal pins`}
            className={`flex items-center gap-2 px-2.5 py-1.5 min-h-[44px] rounded-xl backdrop-blur-sm
                        border font-mono text-[8px] transition-all duration-150
                        ${showSignals
                          ? "border-red-protocol/50 text-red-bright"
                          : "border-border-protocol text-text-mute2 hover:border-red-protocol/30 hover:text-text-base"
                        }`}
            style={{ background: showSignals ? "rgba(232,64,64,0.12)" : "rgba(11,13,24,0.88)" }}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${showSignals ? "bg-red-bright animate-pulse" : "bg-text-mute2/30"}`} />
            📡 {t("nav_signals")}
          </Link>

          {/* ── New layer group ─────────────────────────────────────────── */}
          <div
            className="rounded-xl overflow-hidden backdrop-blur-sm"
            style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="font-mono text-[6.5px] tracking-[.2em] uppercase text-text-mute2/60 px-2.5 pt-2 pb-1">
              Live Layers
            </p>
            <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">

              {/* Commodity Prices */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowCommodities(v => !v); }}
                aria-pressed={showCommodities}
                className={`flex items-center gap-1.5 px-2 py-1 min-h-[44px] rounded-lg text-left
                            transition-all duration-150 font-mono text-[8px]
                            ${showCommodities
                              ? "border border-emerald-500/40 text-emerald-400"
                              : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04] border border-transparent"
                            }`}
                style={showCommodities ? { background: "rgba(16,185,129,0.10)" } : {}}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${showCommodities ? "bg-emerald-400 animate-pulse" : "bg-text-mute2/30"}`} />
                📊 Prices
              </button>

              {/* World Instability */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowInstability(v => !v); }}
                aria-pressed={showInstability}
                className={`flex items-center gap-1.5 px-2 py-1 min-h-[44px] rounded-lg text-left
                            transition-all duration-150 font-mono text-[8px]
                            ${showInstability
                              ? "border border-amber-500/40 text-amber-protocol"
                              : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04] border border-transparent"
                            }`}
                style={showInstability ? { background: "rgba(240,165,0,0.10)" } : {}}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${showInstability ? "bg-amber-protocol animate-pulse" : "bg-text-mute2/30"}`} />
                🌡 Instability
              </button>

              {/* World News */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowNewsFeed(v => !v); }}
                aria-pressed={showNewsFeed}
                className={`flex items-center gap-1.5 px-2 py-1 min-h-[44px] rounded-lg text-left
                            transition-all duration-150 font-mono text-[8px]
                            ${showNewsFeed
                              ? "border border-sky-500/40 text-sky-300"
                              : "text-text-mute2 hover:text-text-base hover:bg-white/[0.04] border border-transparent"
                            }`}
                style={showNewsFeed ? { background: "rgba(56,189,248,0.10)" } : {}}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${showNewsFeed ? "bg-sky-300 animate-pulse" : "bg-text-mute2/30"}`} />
                📰 News
              </button>

            </div>
          </div>

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
                    className={`flex items-center justify-center p-1.5 min-h-[44px] min-w-[44px] rounded font-mono text-[7.5px] transition-all
                                ${active ? "border border-gold-protocol/55 bg-gold-glow text-gold-bright" : "text-text-mute2 hover:bg-white/[0.04] border border-transparent"}`}
                  >
                    <span className="text-[11px] leading-none">{meta[loc].flag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Globe info cards (draggable multi-card system) ────────────────── */}
        <GlobeInfoCards
          containerRef={globeContainerRef as React.RefObject<HTMLElement>}
          containerW={containerW}
          containerH={containerH}
          domainId={domainId}
          scenarioId={scenarioId}
          selectedSignalIdx={selectedSignalIdx}
          selectedPsychZone={selectedPsychZone}
          selectedGateId={selectedGateId}
          onCloseDomain={() => { setDomainId(null); updateUrl({ domain: null }); }}
          onCloseScenario={() => { setScenarioId(null); updateUrl({ scenario: null }); }}
          onCloseSignal={() => setSelectedSignalIdx(null)}
          onClosePsych={() => setSelectedPsychZone(null)}
          onCloseGate={() => setSelectedGateId(null)}
          onOpenShop={() => { setProvisionerOpen(true); updateUrl({ panel: "shop" }); }}
          selectedCommodityId={selectedCommodityId}
          selectedNewsId={selectedNewsId}
          onCloseCommodity={() => setSelectedCommodityId(null)}
          onCloseNews={() => setSelectedNewsId(null)}
        />

        {/* ── UTC clock — desktop only ─────────────────────────────────────── */}
        <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
          <LiveClock />
        </div>

        {/* ── Side panels ──────────────────────────────────────────────────── */}
        <GlobeProtocolPanel   open={protocolOpen}    onClose={() => setProtocolOpen(false)} />
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
                      aria-label="Return to present"
                      className="min-w-[44px] min-h-[44px] font-mono text-[9px] text-text-mute2
                                 hover:text-text-base transition-colors flex-shrink-0
                                 flex items-center justify-center"
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

        <nav aria-label="Scenario navigation" className="flex items-center gap-1.5">
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
        </nav>

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

        <div className="w-px h-4 bg-border-protocol/60 flex-shrink-0" />

        <button
          onClick={() => setShowCommodities(v => !v)}
          aria-pressed={showCommodities}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]
                      ${showCommodities ? "border-emerald-500/40 text-emerald-400" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: showCommodities ? "rgba(16,185,129,0.10)" : undefined }}>
          📊
        </button>

        <button
          onClick={() => setShowInstability(v => !v)}
          aria-pressed={showInstability}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]
                      ${showInstability ? "border-amber-500/40 text-amber-protocol" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: showInstability ? "rgba(240,165,0,0.10)" : undefined }}>
          🌡
        </button>

        <button
          onClick={() => setShowNewsFeed(v => !v)}
          aria-pressed={showNewsFeed}
          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2.5 rounded-lg border font-mono text-[9px] transition-all min-h-[44px]
                      ${showNewsFeed ? "border-sky-500/40 text-sky-300" : "bg-void-3 border-border-protocol text-text-mute2"}`}
          style={{ background: showNewsFeed ? "rgba(56,189,248,0.10)" : undefined }}>
          📰
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
      className={`py-3 sm:py-5 px-2.5 min-h-[44px] min-w-[44px] ${rounded} flex flex-col items-center gap-1.5
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
