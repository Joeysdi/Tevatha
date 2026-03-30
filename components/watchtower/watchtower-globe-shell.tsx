// components/watchtower/watchtower-globe-shell.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/use-translation";
import { WorldRiskGlobe }         from "./world-risk-globe";
import { GlobeInfoCards }         from "./globe-info-cards";

import { DOMAINS, SCENARIOS, TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";
import { SCENARIO_IMPACTS }       from "@/lib/watchtower/scenario-impacts";
import { NEWS_FEED_PINS }         from "@/lib/watchtower/news-feed-pins";
import type { NewsFeedPin }       from "@/lib/watchtower/news-feed-pins";
import { fetchGdeltPins }         from "@/lib/watchtower/gdelt-fetch";

// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  PA: "Industrial  1800–70",
  PB: "Imperial  1870–1914",
  PC: "World War I  1914–19",
  PD: "Interwar  1919–29",
  PE: "Depression  1929–39",
  PF: "World War II  1939–45",
  P1: "Cold War  1945–71",
  PG: "Détente  1971–91",
  P2: "Unipolar  1991–08",
  P3: "Stress  2008–20",
  P5: "Cascade  2027–32",
  P6: "Reckoning  2032–38",
  P7: "AI Threshold  2038–45",
  PH: "Post-Labor  2045–59",
  P8: "Divergence  2059–79",
  PI: "Longevity  2079–90",
  P9: "Terminus  2090–2100",
};

const SCRUB_PHASES = [
  {
    id: "PA", hex: "#78350f", label: "INDUSTRIAL", yearRange: "1800–70",
    desc: "Steam power reshapes production, labour, and capital. Urbanisation creates mass poverty alongside new wealth. The first globalised trade networks emerge — and with them, the first synchronised financial panics. Ireland starves while Britain industrialises.",
    gateIds: [] as string[],
    yearStart: 1800, yearEnd: 1870,
  },
  {
    id: "PB", hex: "#92400e", label: "IMPERIAL", yearRange: "1870–1914",
    desc: "European powers partition the world. Leopold II's Congo kills 10M. The Long Depression of 1873 proves interconnected capital markets amplify shocks globally — a lesson ignored for 135 years. Arms races and colonial competition build a pressure system with no release valve.",
    gateIds: [] as string[],
    yearStart: 1870, yearEnd: 1914,
  },
  {
    id: "PC", hex: "#7f1d1d", label: "WW1", yearRange: "1914–19",
    desc: "Industrial-scale killing redefines warfare. 20 million dead. Four empires collapse in four years. Chemical weapons, mass mobilisation, and trench warfare set the template for 20th-century state violence. The war to end all wars creates every condition for the next one.",
    gateIds: [] as string[],
    yearStart: 1914, yearEnd: 1919,
  },
  {
    id: "PD", hex: "#52525b", label: "INTERWAR", yearRange: "1919–29",
    desc: "Versailles imposes impossible reparations on a broken Germany. Weimar hyperinflation reaches 4.2 trillion marks per dollar. The Roaring Twenties mask a debt-fuelled fragility. Every condition for the Depression and fascism is assembled in this decade.",
    gateIds: [] as string[],
    yearStart: 1919, yearEnd: 1929,
  },
  {
    id: "PE", hex: "#b45309", label: "DEPRESSION", yearRange: "1929–39",
    desc: "Black Tuesday wipes 89% off the Dow. 9,000 US banks fail. Global trade collapses 66%. Unemployment hits 25% in the US, 30% in Germany. Economic desperation fills the vacuum with fascism. The playbook for every debt-deflation spiral and authoritarian resurgence since.",
    gateIds: [] as string[],
    yearStart: 1929, yearEnd: 1939,
  },
  {
    id: "PF", hex: "#991b1b", label: "WW2", yearRange: "1939–45",
    desc: "70–85 million dead. The Holocaust: 6 million Jews systematically murdered. Two atomic bombs end the Pacific war and launch the nuclear age. Bretton Woods creates the dollar-dominated post-war order. The world Tevatha monitors is a direct consequence of this era.",
    gateIds: [] as string[],
    yearStart: 1939, yearEnd: 1945,
  },
  {
    id: "P1", hex: "#38bdf8", label: "COLD WAR", yearRange: "1945–71",
    desc: "Bretton Woods-backed stability. USD becomes global reserve currency. Cold War nuclear standoff begins. Korean War, Cuban Missile Crisis — the system survives by the narrowest margins. MAD doctrine holds.",
    gateIds: [] as string[],
    yearStart: 1945, yearEnd: 1971,
  },
  {
    id: "PG", hex: "#818cf8", label: "DÉTENTE", yearRange: "1971–91",
    desc: "Nixon Shock ends the gold standard. Unlimited deficit financing begins. Oil shocks reshape geopolitics. Iranian Revolution, Soviet Afghanistan. The Cold War de-escalates — then the USSR dissolves in 18 months. The unipolar moment is born.",
    gateIds: [] as string[],
    yearStart: 1971, yearEnd: 1991,
  },
  {
    id: "P2", hex: "#6366f1", label: "UNIPOLAR", yearRange: "1991–08",
    desc: "US declares end of history. NATO expands east. Dot-com bubble. 9/11 triggers permanent surveillance state and $2T+ wars on false premises. US credibility as rules enforcer permanently degraded. Seeds of multipolar fracture planted here.",
    gateIds: [] as string[],
    yearStart: 1991, yearEnd: 2008,
  },
  {
    id: "P3", hex: "#fbbf24", label: "STRESS", yearRange: "2008–20",
    desc: "GFC triggers unlimited QE. Fed balance sheet $900B → $9T. Systemic risk deferred, not resolved. Arab Spring, Crimea, ISIS, Brexit, Trump — institutional erosion accelerates across every domain simultaneously.",
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
    desc: "China nuclear parity. Taiwan crisis window peaks. US debt $40T+. CBDC rollout. Three-way MAD calculus begins.",
    gateIds: ["G1","G2","G3","G4","G5","G6","G7","G8"],
    yearStart: 2027, yearEnd: 2032,
  },
  {
    id: "P6", hex: "#64748b", label: "RECKONING", yearRange: "2032–38",
    desc: "Post-USD multipolar order emerges. Climate cascade locks in. AI autonomous weapons deployed. Either a new equilibrium forms — or the dominoes continue falling.",
    gateIds: ["G1","G2","G3","G4","G5","G6","G7","G8"],
    yearStart: 2032, yearEnd: 2038,
  },
  {
    id: "P7", hex: "#7c3aed", label: "AI THRESHOLD", yearRange: "2038–45",
    desc: "AGI threshold crossed. AI systems exceed human capability across all domains. Post-labor economic restructuring begins. Nation-state model begins giving way to new power structures that have no historical precedent.",
    gateIds: [] as string[],
    yearStart: 2038, yearEnd: 2045,
  },
  {
    id: "PH", hex: "#8b5cf6", label: "POST-LABOR", yearRange: "2045–59",
    desc: "Universal automation displaces most human work. Off-world colonies attempted. Engineered biology democratized. Political systems designed for scarcity begin failing under post-scarcity conditions.",
    gateIds: [] as string[],
    yearStart: 2045, yearEnd: 2059,
  },
  {
    id: "P8", hex: "#374151", label: "DIVERGENCE", yearRange: "2059–79",
    desc: "Humanity splits into augmented and unaugmented tracks. Longevity escape velocity for elites. AI legal personhood. Post-scarcity energy. Two civilizations begin to drift irreconcilably apart.",
    gateIds: [] as string[],
    yearStart: 2059, yearEnd: 2079,
  },
  {
    id: "PI", hex: "#1e293b", label: "LONGEVITY", yearRange: "2079–90",
    desc: "Life extension technology scales beyond elites. The first generation of near-indefinite lifespans emerges. Political systems built on generational turnover begin structurally failing. Death as a social moderator ends.",
    gateIds: [] as string[],
    yearStart: 2079, yearEnd: 2090,
  },
  {
    id: "P9", hex: "#111827", label: "TERMINUS", yearRange: "2090–2100",
    desc: "Final verdict on the human civilizational arc. Climate outcome determined. Neural interface merger normalized. Whether this resolves as survival, transcendence, or extinction becomes clear in this decade.",
    gateIds: [] as string[],
    yearStart: 2090, yearEnd: 2100,
  },
] as const;

const EVT_COLORS: Record<string, string> = {
  red: "#e84040", warn: "#f0a500", info: "#38bdf8", pink: "#ff0055",
};

const DOMAIN_COLORS: Record<string, string> = {
  "Geopolitical":  "#e84040",
  "Economic":      "#c9a84c",
  "Environmental": "#1ae8a0",
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
  const { t } = useTranslation();
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
const [eraPhase,          setEraPhase]          = useState(() => searchParams.get("era") ?? "P4");
  const [livePhase,         setLivePhase]         = useState(() => searchParams.get("era") ?? "P4");
  const [scrubVelocity,     setScrubVelocity]     = useState(0);

  const [scenarioId,        setScenarioId]        = useState<string | null>(() => searchParams.get("scenario"));
  const [selectedSignalIdx, setSelectedSignalIdx] = useState<number | null>(null);
  const [domainId,          setDomainId]          = useState<string | null>(() => searchParams.get("domain"));
  const [selectedPsychZone, setSelectedPsychZone] = useState<{ region: string; threat: string; note: string } | null>(null);
  const [selectedGateId,    setSelectedGateId]    = useState<string | null>(null);

  // ── New layer toggles ───────────────────────────────────────────────────────
  const [showCommodities,   setShowCommodities]   = useState(false);
  const [newsPins,          setNewsPins]          = useState<NewsFeedPin[]>(NEWS_FEED_PINS);
  const [newsFeedStatus,    setNewsFeedStatus]    = useState<"loading" | "ok" | "error">("loading");
  const [selectedCommodityId, setSelectedCommodityId] = useState<string | null>(null);
  const [selectedNewsId,    setSelectedNewsId]    = useState<string | null>(null);
  const [selectedCityIdx,   setSelectedCityIdx]   = useState<number | null>(null);

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

  // ── Live news feed fetch ──────────────────────────────────────────────────
  useEffect(() => {
    fetchGdeltPins()
      .then((pins) => {
        setNewsPins(pins.length > 0 ? pins : NEWS_FEED_PINS);
        setNewsFeedStatus(pins.length > 0 ? "ok" : "error");
      })
      .catch(() => {
        setNewsPins(NEWS_FEED_PINS);
        setNewsFeedStatus("error");
      });
  }, []);

  // ── Zoom-neutral panel scale ──────────────────────────────────────────────
  // Tracks browser zoom via devicePixelRatio changes and computes an inverse
  // scale so the left-side control panel stays the same physical size on screen
  // regardless of Ctrl+/Ctrl- zoom level.
  const baseDPR = useRef<number>(1);
  const [panelScale, setPanelScale] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    baseDPR.current = window.devicePixelRatio;

    let unwatch: (() => void) | undefined;
    const watch = () => {
      const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      const handler = () => {
        setPanelScale(baseDPR.current / window.devicePixelRatio);
        unwatch?.();
        unwatch = watch();
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    };
    unwatch = watch();
    return () => unwatch?.();
  }, []);

  const isHistorical = eraPhase !== "P4";

  const pairedScenarioIds = useMemo(
    () => new Set(DOMAINS.flatMap(d => d.scenarioIds ?? [])),
    []
  );

  return (
    <div className="w-full h-full flex flex-col bg-void-0">

      {/* ── Globe area ───────────────────────────────────────────────────── */}
      <div ref={globeContainerRef} className="flex-1 relative overflow-hidden min-h-0">
        {/* Globe */}
        <WorldRiskGlobe
          eraPhase={eraPhase}
          scenarioId={scenarioId}
          domainId={domainId}
          gatePhase={eraPhase}
          scrubVelocity={scrubVelocity}
          showCommodities={showCommodities}

          showNewsFeed={true}
          newsFeedPins={newsPins}
          onSignalPinClick={setSelectedSignalIdx}
          onPsychZoneClick={setSelectedPsychZone}
          onGatePinClick={setSelectedGateId}
          onCityPinClick={setSelectedCityIdx}
          onCommodityPinClick={setSelectedCommodityId}
          onNewsFeedPinClick={setSelectedNewsId}
        />

        {/* ── News feed offline badge ──────────────────────────────────────── */}
        {newsFeedStatus === "error" && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
                 style={{ background: "rgba(11,13,24,0.90)", border: "1px solid rgba(232,64,64,0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-protocol animate-pulse" />
              <p className="font-mono text-[8.5px] tracking-[.14em] uppercase text-red-protocol">
                NEWS FEED OFFLINE
              </p>
            </div>
          </div>
        )}

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
        <div
          className="hidden sm:flex absolute left-4 z-20 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{
            top: "48px",
            maxHeight: `${Math.max(200, (containerH - 64) / panelScale)}px`,
            scrollbarWidth: "none" as const,
            transform: `scale(${panelScale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Unified Palantir-style module */}
          <div
            style={{
              background: "rgba(6,7,14,0.42)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 4,
              backdropFilter: "blur(4px)",
              minWidth: "164px",
            }}
          >
            {/* ── Threat Domains ───────────────────────────────────── */}
            <div className="pt-2.5 pb-1">
              <div className="flex items-center gap-1.5 px-2.5 mb-1">
                <div className="w-[2px] h-2.5 rounded-full bg-red-protocol/60 flex-shrink-0" />
                <p className="font-mono text-[6.5px] tracking-[.2em] uppercase text-text-mute2/50">Threat Domains</p>
              </div>
              <div className="flex flex-col">
                {DOMAINS.map((d) => {
                  const active = domainId === d.id;
                  const col    = DOMAIN_COLORS[d.label] ?? "#c9a84c";
                  return (
                    <React.Fragment key={d.id}>
                      <Link
                        href={buildUrl(searchParams, { domain: active ? null : d.id })}
                        replace
                        onClick={(e) => { e.stopPropagation(); setDomainId(active ? null : d.id); }}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 pl-3 pr-2.5 py-1 min-h-[44px] text-left
                                    transition-all duration-150 font-mono text-[8px] border-l-2
                                    ${active ? "" : "text-text-mute2 hover:text-text-base"}`}
                        style={active ? { color: col, borderLeftColor: col } : { borderLeftColor: "transparent" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: active ? col : "rgba(150,165,180,0.25)", boxShadow: active ? `0 0 5px ${col}` : "none" }}
                        />
                        <span className="text-[10px] leading-none">{d.icon}</span>
                        <span className="truncate max-w-[80px]">{d.label}</span>
                        <span className="ml-auto font-bold tabular-nums text-[7.5px]" style={{ color: active ? col : "rgba(150,165,180,0.35)" }}>{d.score}</span>
                      </Link>
                      {(d.scenarioIds ?? []).map(sid => {
                        const sc     = SCENARIOS.find(s => s.id === sid);
                        const impact = SCENARIO_IMPACTS.find(s => s.id === sid);
                        if (!sc || !impact) return null;
                        const scActive = scenarioId === sid;
                        return (
                          <Link
                            key={sid}
                            href={buildUrl(searchParams, { scenario: scActive ? null : sid })}
                            replace
                            onClick={(e) => { e.stopPropagation(); setScenarioId(scActive ? null : sid); }}
                            className={`flex items-center gap-1.5 pl-7 pr-2.5 py-1 min-h-[36px] text-left
                                        transition-all duration-150 font-mono text-[8px] border-l border-l-transparent
                                        ${scActive ? "" : "text-text-mute2 hover:text-text-base"}`}
                            style={scActive ? { color: col, borderLeftColor: `${col}80` } : {}}
                          >
                            <span className="text-text-mute2/40 text-[8px] mr-0.5">└</span>
                            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${scActive ? "animate-pulse" : ""}`}
                                  style={{ background: scActive ? col : "rgba(150,165,180,0.2)" }} />
                            <span className="text-[9px] leading-none">{sc.icon}</span>
                            <span className="truncate">{sc.title}</span>
                          </Link>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

            {/* ── Shop ─────────────────────────────────────────────── */}
            <div className="pb-1">
              <Link
                href="/provisioner"
                className="flex items-center gap-1.5 pl-3 pr-2.5 py-1 min-h-[44px]
                           transition-all duration-150 font-mono text-[8px] border-l-2
                           text-text-mute2 hover:text-gold-protocol"
                style={{ borderLeftColor: "transparent" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = "#c9a84c80"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent"; }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-text-mute2/25" />
                <span className="text-[10px] leading-none">🛒</span>
                <span className="truncate">Shop</span>
                <span className="ml-auto text-[8px] text-text-mute2/30">◄</span>
              </Link>
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
          onOpenShop={() => router.push("/provisioner")}
          selectedCommodityId={selectedCommodityId}
          selectedNewsId={selectedNewsId}
          onCloseCommodity={() => setSelectedCommodityId(null)}
          onCloseNews={() => setSelectedNewsId(null)}
          selectedCityIdx={selectedCityIdx}
          onCloseCity={() => setSelectedCityIdx(null)}
          newsFeedPins={newsPins}
          onNewsClick={setSelectedNewsId}
        />


        {/* ── Era detail card — floats above scrubber when not at P4 ─────────── */}
        <AnimatePresence>
          {livePhase !== "P4" && (() => {
            const sp = SCRUB_PHASES.find(p => p.id === livePhase);
            if (!sp) return null;
            const events = TIMELINE_EVENTS.filter(e => {
              const yr = e.year.toLowerCase() === "now" ? 2026 : parseInt(e.year, 10) || 2026;
              const inPhase = yr >= sp.yearStart && yr < sp.yearEnd;
              const inDomain = !domainId || (e.domain ?? []).includes(domainId);
              return inPhase && inDomain;
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
                      {domainId && (() => {
                        const dom = DOMAINS.find(d => d.id === domainId);
                        const col = dom ? (DOMAIN_COLORS[dom.label] ?? "#c9a84c") : "#c9a84c";
                        return (
                          <span className="font-mono text-[6.5px] px-1.5 py-0.5 rounded" style={{ color: col, background: `${col}22`, border: `1px solid ${col}44` }}>
                            {dom?.icon} {dom?.label}
                          </span>
                        );
                      })()}
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
                    {events.length > 0 ? (
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
                    ) : domainId ? (
                      <p className="font-mono text-[8px] text-text-mute2/50 italic">
                        No {DOMAINS.find(d => d.id === domainId)?.label ?? domainId} events recorded in this era.
                      </p>
                    ) : null}

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
          className="absolute bottom-3 z-25"
          style={{ left: "50%", transform: `translateX(-50%) scale(${panelScale})`, transformOrigin: "bottom center" }}
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
            activeDomainId={domainId}
            domainColor={domainId ? (DOMAIN_COLORS[DOMAINS.find(d => d.id === domainId)?.label ?? ""] ?? null) : null}
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
  activeDomainId,
  domainColor,
}: {
  activePhase:      string;
  onPhaseChange:    (id: string) => void;
  onLivePhase:      (id: string) => void;
  onVelocityChange: (vel: number) => void;
  activeDomainId:   string | null;
  domainColor:      string | null;
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

  const domainPhaseIds = useMemo(() => {
    if (!activeDomainId) return null;
    const ids = new Set<string>();
    for (const p of SCRUB_PHASES) {
      const hasEvent = TIMELINE_EVENTS.some(e => {
        const yr = e.year.toLowerCase() === "now" ? 2026 : parseInt(e.year, 10) || 2026;
        return yr >= p.yearStart && yr < p.yearEnd && (e.domain ?? []).includes(activeDomainId);
      });
      if (hasEvent) ids.add(p.id);
    }
    return ids;
  }, [activeDomainId]);

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
      style={{ width: "calc(100vw - 700px)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Track wrapper — ghost/transparent Palantir style */}
      <div
        className="px-2 py-1"
        style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
      >
        {/* Phase label + year */}
        <div className="flex items-center justify-center gap-2 mb-2 pointer-events-none">
          <motion.span
            key={phase.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[8px] tracking-[.22em] uppercase font-bold"
            style={{ color: phase.hex, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            {phase.label}
          </motion.span>
          <span className="font-mono text-[7px] text-text-mute2/70" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>{phase.yearRange}</span>
        </div>

        {/* Track */}
        <div ref={trackRef} className="relative h-8">
          {/* Background track line */}
          <div
            className="absolute top-1/2 pointer-events-none"
            style={{
              left: SCRUB_PAD, right: SCRUB_PAD,
              height: 1,
              background: "rgba(255,255,255,0.22)",
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
              background: domainColor
                ? `linear-gradient(90deg, ${domainColor}44, ${domainColor}cc)`
                : `linear-gradient(90deg, ${SCRUB_PHASES[0].hex}44, ${phase.hex}cc)`,
              transform: "translateY(-50%)",
              borderRadius: 1,
            }}
          />

          {/* Phase stops */}
          {SCRUB_PHASES.map((p, i) => {
            const isActive = i === displayIdx;
            const inDomain = domainPhaseIds ? domainPhaseIds.has(p.id) : null;
            const effectiveColor = domainColor && inDomain ? domainColor : p.hex;
            return (
              <div
                key={p.id}
                className="absolute top-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center transition-opacity duration-300"
                style={{
                  left: stopX(i),
                  transform: "translateX(-50%) translateY(-50%)",
                  opacity: inDomain === false ? 0.18 : 1,
                }}
              >
                {/* Stop dot */}
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? 6 : 4,
                    height: isActive ? 6 : 4,
                    background: inDomain === false
                      ? "#6b728055"
                      : isActive ? effectiveColor : `${effectiveColor}55`,
                    boxShadow: isActive
                      ? `0 0 8px ${effectiveColor}`
                      : inDomain === true && domainColor ? `0 0 5px ${domainColor}` : "none",
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
                    color: `${p.hex}cc`,
                    fontWeight: "700",
                    opacity: isActive ? 1 : 0,
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
                background: domainColor ?? phase.hex,
                transform: "rotate(45deg)",
                borderRadius: 2,
                boxShadow: `0 0 14px ${(domainColor ?? phase.hex)}aa, 0 0 4px ${domainColor ?? phase.hex}`,
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
  const accentHex = openColor === "gold" ? "#c9a84c" : openColor === "cyan" ? "#00d4ff" : "#e84040";
  const rounded   = side === "left" ? "rounded-r border-r border-y" : "rounded-l border-l border-y";
  const arrow     = side === "left" ? (open ? "◄" : "►") : (open ? "►" : "◄");

  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? t("nav_close") : label}
      className={`py-3 sm:py-5 px-2 min-h-[44px] min-w-[44px] ${rounded} flex flex-col items-center gap-1.5
                  transition-all duration-200
                  ${open ? "text-text-base" : "text-text-mute2 hover:text-text-base"}`}
      style={{
        background: open ? `${accentHex}0f` : "rgba(6,7,14,0.40)",
        borderColor: open ? `${accentHex}40` : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(4px)",
      }}
    >
      <span className="font-mono text-[7.5px] [writing-mode:vertical-rl] rotate-180 tracking-[.18em] uppercase leading-none"
            style={{ color: open ? accentHex : undefined }}>
        {open ? t("nav_close") : label}
      </span>
      <span className="text-[9px]" style={{ color: open ? accentHex : undefined }}>{arrow}</span>
    </button>
  );
}
