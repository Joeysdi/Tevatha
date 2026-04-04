// components/watchtower/globe-info-cards.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { DOMAINS, SIGNALS, SCENARIOS, PSYCH_PILLARS, GATES } from "@/lib/watchtower/data";
import type { DomainScores } from "@/lib/watchtower/domain-score";
import { SubIndexPanel } from "./sub-index-bar";
import { type GateStatus } from "@/lib/watchtower/gate-status";
import { GEAR } from "@/lib/watchtower/data-gear";
import { DOMAIN_COLORS } from "@/lib/watchtower/domain-colors";
import { DomainLiveFeedCard } from "./domain-live-feed-card";
import { filterNewsByDomain, DOMAIN_ASSETS } from "@/lib/watchtower/domain-live-feed";
import { fetchLivePrices, type LivePrices, type AssetPrice } from "@/lib/watchtower/prices-fetch";
import { COMMODITY_PINS } from "@/lib/watchtower/commodity-pins";
import { NEWS_FEED_PINS } from "@/lib/watchtower/news-feed-pins";
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import { CITY_PINS_DATA } from "@/lib/watchtower/city-pins";
import { relativeTime } from "@/lib/watchtower/relative-time";

// ── Domain-to-gear category mapping ─────────────────────────────────────────
const DOMAIN_GEAR_CATS: Record<string, string[]> = {
  geopolitical:  ["Communications", "Energy", "Mobility"],
  economic:      ["Medical", "Energy"],
  environmental: ["Medical", "Energy"],
};

// ── Domain-to-gate mapping ───────────────────────────────────────────────────
const DOMAIN_GATES: Record<string, string[]> = {
  geopolitical:  ["G1", "G2", "G3", "G5"],
  economic:      ["G4", "G7", "G8"],
  environmental: ["G6"],
};

// ── Gate-specific gear mapping ───────────────────────────────────────────────
const GATE_GEAR: Record<string, { cats: string[]; provDomain: string; label: string }> = {
  G1: { cats: ["Communications", "Energy", "Mobility"], provDomain: "nuclear",  label: "Bug-out protocol"     },
  G2: { cats: ["Communications", "Energy", "Mobility"], provDomain: "nuclear",  label: "Bug-out protocol"     },
  G3: { cats: ["Communications", "Mobility"],           provDomain: "civil",    label: "Evacuation protocol"  },
  G4: { cats: ["Energy", "Communications"],             provDomain: "economic", label: "Financial protocol"   },
  G5: { cats: ["Communications", "Energy", "Medical"],  provDomain: "nuclear",  label: "Ark escalation"       },
  G6: { cats: ["Medical"],                              provDomain: "bio",      label: "Isolation protocol"   },
  G7: { cats: ["Energy", "Communications"],             provDomain: "economic", label: "Financial protocol"   },
  G8: { cats: ["Communications", "Energy"],             provDomain: "economic", label: "Sovereignty protocol" },
};

// ── Scenario domain mapping ──────────────────────────────────────────────────
const SCENARIO_DOMAIN: Record<string, string> = {
  S01: "economic",      S03: "economic",      S05: "geopolitical",
  S07: "geopolitical",  S09: "geopolitical",  S10: "environmental",
};

// ── Signal domain name → domain id ──────────────────────────────────────────
const SIGNAL_DOMAIN_ID: Record<string, string> = {
  Nuclear: "geopolitical", Cyber: "geopolitical", Economic: "economic",
  Geopolitical: "geopolitical", Biological: "environmental", Climate: "environmental",
};

// ── Geographic anchors — screen positions for default globe view (lat:20,lng:15)
// xPct/yPct = where the primary affected region appears on screen
// angle = fan direction (degrees, 0=right, 90=down) — opens cards toward globe center
const DOMAIN_GEO: Record<string, { xPct: number; yPct: number; angle: number }> = {
  geopolitical:  { xPct: 0.64, yPct: 0.28, angle: 180 }, // Middle East / Eurasia center — fan left
  economic:      { xPct: 0.50, yPct: 0.16, angle: 100 }, // US + EU (top center) — fan downward
  environmental: { xPct: 0.52, yPct: 0.50, angle: 240 }, // Africa / SE Asia — fan lower-left
};

const TIER_HEX: Record<string, string> = {
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8", t1: "#1ae8a0",
};


// ── Domain voice scripts ──────────────────────────────────────────────────────
const DOMAIN_VOICE: Record<string, string> = {
  geopolitical:
    "Geopolitical threat: Critical. 93 out of 100. " +
    "The Doomsday Clock stands at 85 seconds to midnight — an all-time record in 79 years. " +
    "New START expired February 2026. For the first time since 1972, no legally binding treaty " +
    "limits US or Russian nuclear arsenals. China, Russia, North Korea, and four other states " +
    "are simultaneously expanding their arsenals. Russia has lowered its nuclear use threshold " +
    "to any critical threat to sovereignty. " +
    "Salt Typhoon has confirmed persistent access inside nine or more major US telecoms. " +
    "The FBI confirms this campaign is still very much ongoing. Volt Typhoon is pre-positioned " +
    "inside US power grids and water systems for wartime activation — not espionage, disruption. " +
    "China conducted its most extensive Taiwan blockade drills ever in December 2025. " +
    "The Council on Foreign Relations rates a 2026 Taiwan Strait crisis at even money. " +
    "Ukraine enters its third year of war with no ceasefire. Iran is weeks from weapons-grade " +
    "uranium capability. Build your essential gear now at the Tevatha store.",

  economic:
    "Economic threat: High. 76 out of 100. " +
    "US national debt stands at 38.4 trillion dollars, growing 8 billion dollars every day. " +
    "Interest payments now consume 20 percent of all federal revenue. " +
    "Trump's 2025 tariff regime is the largest US tax increase as a percent of GDP since 1993. " +
    "137 nations are rolling out programmable central bank digital currencies — " +
    "money that can be blocked, expired, or restricted. " +
    "Secure your financial sovereignty at the Tevatha store.",

  environmental:
    "Environmental threat: High. 74 out of 100. " +
    "H5N1 avian influenza is described by scientists as completely out of control in animal reservoirs. " +
    "There are 70 confirmed US human cases. Its historical fatality rate is approximately 48 percent. " +
    "A novel recombinant Mpox strain combining both clade genomes was detected in India in January 2026, " +
    "with a 3 to 4 percent fatality rate — under active WHO investigation. " +
    "Any pathogen achieving sustained human-to-human transmission collapses health systems " +
    "within 8 weeks. " +
    "2024 was the hottest year ever recorded — the first calendar year to exceed " +
    "1.55 degrees Celsius above pre-industrial levels. Arctic sea ice volume is at a record low, " +
    "approximately 20 percent below 2024 levels. 96 million people face acute food insecurity. " +
    "Environmental cascades amplify every other threat vector. " +
    "Build your medical and resilience kit at the Tevatha store.",
};

// ── Voice utilities ───────────────────────────────────────────────────────────
function pickCommandVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Preferred: deep UK/US male voices
  const PREFERRED = [
    "Daniel",                                     // macOS — UK English, deep
    "Google UK English Male",                     // Chrome
    "Microsoft David - English (United States)",  // Windows
    "Microsoft Mark - English (United States)",   // Windows
    "Aaron",                                      // macOS
    "Google US English",
  ];
  for (const name of PREFERRED) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith("en")) ?? null;
}


// Watchtower domain → provisioner gear page domain
const DOMAIN_PROV_MAP: Record<string, string> = {
  geopolitical:  "nuclear",
  economic:      "economic",
  environmental: "bio",
};

// ── Gear lookup ───────────────────────────────────────────────────────────────
function getDomainGear(domainId: string, limit = 4) {
  const cats = DOMAIN_GEAR_CATS[domainId] ?? [];
  return GEAR
    .filter((c) => cats.includes(c.cat))
    .flatMap((c) => c.items.filter((i) => i.critical))
    .slice(0, limit);
}

function getDomainGearTotal(domainId: string): number {
  const cats = DOMAIN_GEAR_CATS[domainId] ?? [];
  return GEAR
    .filter((c) => cats.includes(c.cat))
    .reduce((sum, c) => sum + c.items.length, 0);
}

function getGateGear(gateId: string, limit = 2) {
  const config = GATE_GEAR[gateId];
  if (!config) return [];
  return GEAR
    .filter(c => config.cats.includes(c.cat))
    .flatMap(c => c.items.filter(i => i.critical))
    .slice(0, limit);
}

function getGateDomain(gateId: string): string {
  for (const [domain, ids] of Object.entries(DOMAIN_GATES)) {
    if (ids.includes(gateId)) return domain;
  }
  return "cyber";
}

// ── Close button ──────────────────────────────────────────────────────────────
function CloseBtn({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[11px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-white/[0.06]"
    >
      ✕
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ text, col }: { text: string; col: string }) {
  return (
    <p className="font-mono text-[10px] tracking-[.18em] uppercase mb-2" style={{ color: `${col}99` }}>
      {text}
    </p>
  );
}

// ── Domain info card ──────────────────────────────────────────────────────────
function DomainInfoCard({
  domainId, col,
}: {
  domainId: string;
  col: string;
}) {
  const domain = DOMAINS.find((d) => d.id === domainId);
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const script = DOMAIN_VOICE[domainId];
    if (!script) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(script);
    utt.lang   = "en-US";
    utt.rate   = 0.82;
    utt.pitch  = 0.65;
    utt.volume = 1;
    // Load voices — they may not be available immediately
    const trySetVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = pickCommandVoice(voices);
      if (voice) utt.voice = voice;
    };
    trySetVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { trySetVoice(); window.speechSynthesis.onvoiceschanged = null; };
    }
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  if (!domain) return null;

  return (
    <div className="px-4 py-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px] leading-none flex-shrink-0">{domain.icon}</span>
          <div>
            <p className="font-mono text-[10px] tracking-[.16em] uppercase mb-0.5" style={{ color: col }}>
              ARK SCORE · {domain.score}/100 · {domain.trend}
            </p>
            <p className="font-syne font-bold text-[14px] text-text-base leading-none">{domain.label}</p>
            <span
              className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold"
              style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
            >
              {domain.level}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Voice button */}
          <button
            onClick={handleSpeak}
            title={speaking ? "Stop narration" : "Play domain briefing"}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[10px] transition-all duration-150 flex-shrink-0"
            style={speaking
              ? { color: col, borderColor: `${col}60`, background: `${col}18` }
              : { color: "rgba(150,165,180,0.6)", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
            }
          >
            {speaking ? (
              <>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  style={{ color: col }}
                >
                  ■
                </motion.span>
                <span style={{ color: col }}>STOP</span>
              </>
            ) : (
              <>🔊 <span>BRIEF</span></>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <p className="font-mono text-[12px] text-text-dim leading-relaxed mb-3">{domain.summary}</p>

      {/* Drivers */}
      <div>
        <SectionLabel text="Key Drivers" col={col} />
        <div className="space-y-1.5">
          {domain.drivers.slice(0, 3).map((drv, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-mono text-[11px] flex-shrink-0 mt-0.5 font-bold" style={{ color: col }}>→</span>
              <p className="font-mono text-[11px] text-text-mute2 leading-snug">{drv}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Domain gates card ─────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, string> = {
  monitoring: "rgba(150,165,180,0.4)",
  warning:    "#f0a500",
  triggered:  "#e84040",
};

function DomainGatesCard({ domainId, col, gateStatuses, showShop, onOpenShop }: { domainId: string; col: string; gateStatuses?: GateStatus[]; showShop?: boolean; onOpenShop?: () => void }) {
  const gateIds = DOMAIN_GATES[domainId] ?? [];
  const gates = GATES.filter((g) => gateIds.includes(g.id));
  if (gates.length === 0) return null;
  const statusMap = Object.fromEntries((gateStatuses ?? []).map(s => [s.id, s]));

  // Pre-compute item names already surfaced in per-gate strips so we can deduplicate the domain list
  const shownInStrips = new Set<string>();
  for (const gate of gates) {
    const gs = statusMap[gate.id];
    if (gs?.status === "warning" || gs?.status === "triggered") {
      getGateGear(gate.id).forEach(item => shownInStrips.add(item.name));
    }
  }

  const allDomainItems = showShop ? getDomainGear(domainId, 8) : [];
  const shopItems = allDomainItems.filter(item => !shownInStrips.has(item.name)).slice(0, 4);
  const shopTotal = showShop ? getDomainGearTotal(domainId) : 0;
  const provDomain = DOMAIN_PROV_MAP[domainId] ?? "nuclear";

  return (
    <div className="px-4 py-3.5">
      <SectionLabel text="⚡ Response Protocol" col={col} />
      <div className="space-y-2.5">
        {gates.map((gate) => {
          const gc  = TIER_HEX[gate.tier] ?? "#c9a84c";
          const gs  = statusMap[gate.id];
          const dot = STATUS_DOT[gs?.status ?? "monitoring"];
          const pulse = gs?.status === "triggered";
          return (
            <div key={gate.id} className="border-b last:border-b-0 pb-2.5 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
                  style={{ background: dot, boxShadow: pulse ? `0 0 6px ${dot}` : "none" }}
                />
                <span
                  className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                  style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}
                >
                  {gate.id} · {gate.tier.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-text-mute2/60">{gate.window}</span>
                {gs && gs.confidence > 0 && (
                  <span
                    className="ml-auto font-mono text-[8px] tabular-nums flex-shrink-0"
                    style={{ color: dot }}
                  >
                    {Math.round(gs.confidence * 100)}%
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] text-text-base leading-snug mb-1">{gate.trigger}</p>
              {gs && (gs.status !== "monitoring" || gs.id === "G5") && gs.reason && (
                <p className="font-mono text-[9px] leading-snug mb-1 italic" style={{ color: `${dot}cc` }}>
                  {gs.reason}
                </p>
              )}
              <p className="font-mono text-[11px] font-bold leading-snug" style={{ color: gc }}>{gate.action}</p>
              {(gs?.status === "warning" || gs?.status === "triggered") && (() => {
                const items = getGateGear(gate.id);
                const config = GATE_GEAR[gate.id];
                if (!items.length || !config) return null;
                return (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="font-mono text-[7px] tracking-[.14em] uppercase mb-1.5" style={{ color: `${dot}80` }}>
                      {config.label}
                    </p>
                    <div className="space-y-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-mono text-[7px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">
                            {item.tier}
                          </span>
                          <p className="font-mono text-[9px] text-text-base flex-1 truncate">{item.name}</p>
                          <span className="font-mono text-[8px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
      {showShop && (shopItems.length > 0 || shopTotal > 0) && (
        <div className="-mx-4 mt-3.5 px-4 pt-3.5 pb-0.5"
             style={{ background: "rgba(201,168,76,0.04)", borderTop: "1px solid rgba(201,168,76,0.10)" }}>
          {shopItems.length > 0 && (
            <div className="space-y-2 mb-3.5">
              {shopItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">
                    {item.tier}
                  </span>
                  <p className="font-mono text-[11px] text-text-base flex-1 truncate">{item.name}</p>
                  <span className="font-mono text-[10px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
                </div>
              ))}
            </div>
          )}
          <Link
            href={`/provisioner/gear?domain=${provDomain}`}
            onClick={(e) => e.stopPropagation()}
            className="block w-full text-center font-mono text-[10px] font-bold py-2.5 rounded-lg border border-gold-dim bg-gold-glow text-gold-bright hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(201,168,76,0.35)] transition-all duration-150 mb-3.5"
          >
            {shopTotal} items ready for this threat →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Gear strip (inline, embedded at the bottom of info cards) ─────────────────
function GearStrip({ domainId, col }: { domainId: string; col: string; onOpenShop: () => void }) {
  const items = getDomainGear(domainId, 3);
  const total = getDomainGearTotal(domainId);
  const provDomain = DOMAIN_PROV_MAP[domainId] ?? "nuclear";
  if (items.length === 0) return null;
  return (
    <div className="border-t mt-3 pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <SectionLabel text="⚙ Fix the Risk" col={col} />
      <div className="space-y-2 mb-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-[9px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">
              {item.tier}
            </span>
            <p className="font-mono text-[11px] text-text-base flex-1 truncate">{item.name}</p>
            <span className="font-mono text-[10px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
          </div>
        ))}
      </div>
      <Link
        href={`/provisioner/gear?domain=${provDomain}`}
        onClick={(e) => e.stopPropagation()}
        className="block w-full text-center font-mono text-[9px] font-bold py-2 rounded-lg
                   border border-gold-dim bg-gold-glow text-gold-bright hover:-translate-y-px
                   hover:shadow-[0_4px_16px_rgba(201,168,76,0.25)] transition-all duration-150"
      >
        {total} items ready for this threat →
      </Link>
    </div>
  );
}

// ── Scenario cards ────────────────────────────────────────────────────────────
function ScenarioOverviewCard({
  scenarioId, col, domainId,
}: {
  scenarioId: string;
  col: string;
  domainId: string;
}) {
  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  if (!sc) return null;
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[18px] leading-none">{sc.icon}</span>
          <div>
            <p className="font-mono text-[10px] tracking-[.14em] uppercase mb-0.5" style={{ color: col }}>
              {sc.prob}% PROBABILITY · {sc.window}
            </p>
            <p className="font-syne font-bold text-[14px] text-text-base leading-none">{sc.title}</p>
            <p className="font-mono text-[10px] text-text-mute2 mt-0.5">Prep time: {sc.prepTime}</p>
          </div>
        </div>
      </div>
      <p className="font-mono text-[12px] text-text-dim leading-relaxed mb-3">{sc.summary}</p>
      <div>
        <SectionLabel text="Cascade Effects" col={col} />
        <div className="flex flex-wrap gap-1.5">
          {sc.cascade.map((c, i) => (
            <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-DEFAULT/25 bg-amber-dim text-amber-protocol">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScenarioMitigationCard({ scenarioId, col }: { scenarioId: string; col: string }) {
  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  if (!sc) return null;
  return (
    <div className="px-4 py-3.5">
      <SectionLabel text="🛡 Triggers + Mitigation" col={col} />
      <div className="space-y-1.5 mb-3">
        {sc.triggers.map((tr, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="font-mono text-[11px] flex-shrink-0 mt-0.5 font-bold" style={{ color: col }}>→</span>
            <p className="font-mono text-[11px] text-text-mute2 leading-snug">{tr}</p>
          </div>
        ))}
      </div>
      <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <SectionLabel text="Priority Actions" col={col} />
        <div className="space-y-2">
          {sc.mitigation.filter((m) => m.pri === "1").slice(0, 4).map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-mono text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ color: "#e84040", background: "rgba(232,64,64,0.1)" }}>P1</span>
              <div>
                <p className="font-mono text-[11px] text-text-dim leading-snug">{m.action}</p>
                <p className="font-mono text-[10px] text-text-mute2">{m.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Signal cards ──────────────────────────────────────────────────────────────
function SignalDetailCard({
  signalIdx, col, domainId,
}: {
  signalIdx: number;
  col: string;
  domainId: string;
}) {
  const sig = SIGNALS[signalIdx];
  if (!sig) return null;
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold flex-shrink-0
              ${sig.tier === "t4" ? "text-red-bright border-red-protocol/40 bg-red-protocol/10"
                : sig.tier === "t3" ? "text-amber-protocol border-amber-DEFAULT/30 bg-amber-dim"
                : "text-blue-DEFAULT border-blue-DEFAULT/30 bg-blue-dim"}`}
          >
            {sig.tier.toUpperCase()}
          </span>
          <p className="font-mono text-[10px] tracking-[.12em] uppercase text-text-mute2">
            {sig.domain} · Score {sig.score}
          </p>
        </div>
      </div>
      <p className="font-mono text-[12px] text-text-base leading-relaxed mb-3">{sig.sig}</p>
      <a
        href={sig.sourceUrl} target="_blank" rel="noopener noreferrer"
        className="font-mono text-[8px] text-text-mute2/60 hover:text-amber-protocol/80 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {sig.source} ↗
      </a>
    </div>
  );
}

function SignalGateCard({ signalIdx, col }: { signalIdx: number; col: string }) {
  const sig = SIGNALS[signalIdx];
  if (!sig) return null;
  const domainId = SIGNAL_DOMAIN_ID[sig.domain] ?? null;
  const gateIds = domainId ? (DOMAIN_GATES[domainId] ?? []).slice(0, 2) : [];
  const gates = GATES.filter((g) => gateIds.includes(g.id));
  if (gates.length === 0) return null;
  return (
    <div className="px-4 py-3.5">
      <SectionLabel text="🔑 Related Gates" col={col} />
      <div className="space-y-2.5">
        {gates.map((gate) => {
          const gc = TIER_HEX[gate.tier] ?? "#c9a84c";
          return (
            <div key={gate.id} className="border-b last:border-b-0 pb-2.5 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                  style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}
                >
                  {gate.id}
                </span>
                <span className="font-mono text-[10px] text-text-mute2/60">{gate.window}</span>
              </div>
              <p className="font-mono text-[11px] text-text-base leading-snug mb-1">{gate.trigger}</p>
              <p className="font-mono text-[11px] font-bold leading-snug" style={{ color: gc }}>{gate.action}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Psych cards ───────────────────────────────────────────────────────────────
function PsychDetailCard({
  psychZone, onClose,
}: {
  psychZone: { region: string; threat: string; note: string };
  onClose: () => void;
}) {
  const col = "#8b2be2";
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[.14em] uppercase text-purple-300/70 mb-0.5">🧠 PSYCH THREAT</p>
          <p className="font-syne font-bold text-[14px] text-text-base leading-none">{psychZone.region}</p>
          <p className="font-mono text-[11px] text-purple-300 mt-1">{psychZone.threat}</p>
        </div>
      </div>
      <p className="font-mono text-[12px] text-text-dim leading-relaxed mb-3">{psychZone.note}</p>
      <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <SectionLabel text="Ark Response" col={col} />
        <div className="space-y-2">
          {PSYCH_PILLARS.slice(0, 3).map((p) => (
            <div key={p.name} className="flex items-start gap-2">
              <span className="text-[11px] flex-shrink-0 mt-0.5">{p.icon}</span>
              <div>
                <p className="font-mono text-[11px] font-bold text-text-base">{p.name}</p>
                <p className="font-mono text-[10px] text-text-mute2 leading-snug">{p.tactics[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Gate detail card ──────────────────────────────────────────────────────────
function GateDetailCard({
  gateId, onClose,
}: {
  gateId: string;
  onClose: () => void;
}) {
  const gate = GATES.find((g) => g.id === gateId);
  if (!gate) return null;
  const col = TIER_HEX[gate.tier] ?? "#c9a84c";
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold"
          style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
        >
          {gate.id} · {gate.tier.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-text-mute2">{gate.window}</span>
      </div>
      <p className="font-mono text-[10px] tracking-[.1em] uppercase mb-2" style={{ color: `${col}99` }}>TRIGGER</p>
      <p className="font-mono text-[11px] text-text-base leading-relaxed mb-3">{gate.trigger}</p>
      <div className="rounded-lg px-3 py-2.5" style={{ background: `${col}12`, border: `1px solid ${col}30` }}>
        <p className="font-mono text-[9px] tracking-[.1em] uppercase text-text-mute2 mb-1">Action on trigger</p>
        <p className="font-mono text-[12px] font-bold leading-snug" style={{ color: col }}>{gate.action}</p>
      </div>
    </div>
  );
}

// ── City threat color (duplicated from world-risk-globe for locality) ─────────
function cityThreatColor(score: number): string {
  if (score >= 80) return "#e84040";
  if (score >= 60) return "#f0a500";
  if (score >= 40) return "#38bdf8";
  return "#1ae8a0";
}

// ── City detail card ──────────────────────────────────────────────────────────
function CityDetailCard({ cityIdx, onClose }: { cityIdx: number; onClose: () => void }) {
  const pin = CITY_PINS_DATA[cityIdx];
  if (!pin) return null;
  const col = cityThreatColor(pin.threatScore);
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-[.18em] uppercase mb-1" style={{ color: `${col}99` }}>
            {pin.flag} {pin.country} · CITY INTEL
          </p>
          <p className="font-syne font-bold text-[15px] text-text-base leading-none">{pin.name}</p>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="font-syne font-extrabold text-[26px] leading-none tabular-nums" style={{ color: col }}>
              {pin.threatScore}
            </div>
            <div className="font-mono text-[9px] text-text-mute2">threat</div>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
      </div>

        {/* Score bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 rounded-full bg-void-3 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pin.threatScore}%`, background: col, boxShadow: `0 0 8px ${col}99` }} />
          </div>
          <span className="font-mono text-[9px] text-text-mute2 flex-shrink-0">/100</span>
        </div>

        {/* Population */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border-protocol/30">
          <span className="font-mono text-[10px] text-text-mute2 tracking-[.14em] uppercase">Population</span>
          <span className="font-mono text-[11px] font-bold text-text-base ml-auto tabular-nums">
            {pin.pop >= 10 ? `${pin.pop.toFixed(0)}M` : `${pin.pop.toFixed(1)}M`}
          </span>
        </div>

        <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg,${col}44,transparent)` }} />

        <SectionLabel text="Active Intel" col={col} />
        <div className="flex items-start gap-1.5 mb-3">
          <span className="font-mono text-[9px] mt-[2px] flex-shrink-0" style={{ color: col }}>▸</span>
          <p className="font-mono text-[11px] text-text-dim leading-relaxed">{pin.note}</p>
        </div>

        <div className="flex flex-col gap-1.5 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <a href={`https://news.google.com/search?q=${encodeURIComponent(pin.name + " security threat attack")}`}
             target="_blank" rel="noopener noreferrer"
             className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-150"
             style={{ border: "1px solid rgba(232,64,64,0.3)", background: "rgba(232,64,64,0.06)", color: "#e05050" }}
             onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(232,64,64,0.12)"; }}
             onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(232,64,64,0.06)"; }}
             onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-[11px] font-bold">☢ Threat News</span>
            <span className="text-[10px] opacity-70">↗</span>
          </a>
          <a href={`https://news.google.com/search?q=${encodeURIComponent(pin.name + " " + pin.country)}`}
             target="_blank" rel="noopener noreferrer"
             className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-150 font-mono text-[11px] text-text-mute2 hover:text-text-base"
             style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
             onClick={(e) => e.stopPropagation()}
          >
            <span>🌐 All News</span>
            <span className="text-[10px] opacity-60">↗</span>
          </a>
        </div>
    </div>
  );
}

// ── Commodity detail card ─────────────────────────────────────────────────────
function CommodityCard({ commodityId, onClose }: { commodityId: string; onClose: () => void }) {
  const pin = COMMODITY_PINS.find((p) => p.id === commodityId);
  if (!pin) return null;
  const up  = pin.change >= 0;
  const col = up ? "#1ae8a0" : "#e84040";
  const CAT_LABEL: Record<string, string> = {
    grain: "GRAIN MARKET", energy: "ENERGY MARKET", metal: "METALS MARKET", index: "GLOBAL INDEX",
  };
  return (
    <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-mono text-[10px] tracking-[.18em] uppercase mb-1" style={{ color: `${col}99` }}>
              {CAT_LABEL[pin.category] ?? "COMMODITY"} · {pin.exchange}
            </p>
            <p className="font-syne font-bold text-[15px] text-text-base leading-none">{pin.name}</p>
            <p className="font-mono text-[10px] text-text-mute2 mt-0.5">{pin.symbol}</p>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>

        {/* Price + change */}
        <div className="flex items-end gap-3 mb-3">
          <div>
            <p className="font-mono font-bold text-[28px] leading-none tabular-nums" style={{ color: col, textShadow: `0 0 20px ${col}44` }}>
              {pin.price}
            </p>
            <p className="font-mono text-[11px] text-text-mute2 mt-0.5">{pin.unit}</p>
          </div>
          <div className="pb-1">
            <p className="font-mono font-bold text-[13px]" style={{ color: col }}>
              {up ? "▲" : "▼"} {Math.abs(pin.change).toFixed(1)}%
            </p>
            <p className="font-mono text-[10px] text-text-mute2">24h change</p>
          </div>
        </div>

        <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg,${col}44,transparent)` }} />

        <SectionLabel text="Market Context" col={col} />
        <p className="font-mono text-[11px] text-text-dim leading-relaxed mb-3">{pin.note}</p>

        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: col }} />
          <p className="font-mono text-[10px] tracking-[.1em]" style={{ color: `${col}80` }}>
            LIVE · {pin.exchange.toUpperCase()}
          </p>
        </div>
    </div>
  );
}

// ── News feed detail card ──────────────────────────────────────────────────────
function NewsFeedCard({ newsId, onClose, pins }: { newsId: string; onClose: () => void; pins: NewsFeedPin[] }) {
  const pin = pins.find((p) => p.id === newsId);
  if (!pin) return null;
  const tierCol = pin.tier === "t4" ? "#e84040" : pin.tier === "t3" ? "#f0a500" : "#38bdf8";
  const CAT_LABEL: Record<string, string> = {
    war: "CONFLICT", economic: "ECONOMICS", nuclear: "NUCLEAR", health: "HEALTH",
    climate: "CLIMATE", political: "POLITICAL",
  };
  const CAT_ICON: Record<string, string> = {
    war: "⚔", economic: "📉", nuclear: "☢", health: "⚕", climate: "🌡", political: "🏛",
  };
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold flex-shrink-0"
            style={{ color: tierCol, borderColor: `${tierCol}40`, background: `${tierCol}15` }}
          >
            {pin.tier.toUpperCase()} · {CAT_ICON[pin.category]} {CAT_LABEL[pin.category] ?? pin.category.toUpperCase()}
          </span>
          <span className="font-mono text-[9px] text-text-mute2/60">{relativeTime(pin.date)}</span>
        </div>
        <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
      </div>

      <a
        href={pin.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block font-syne font-bold text-[13px] leading-snug mb-3 transition-colors"
        style={{ color: "var(--color-text-base)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = tierCol)}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-base)")}
        onClick={(e) => e.stopPropagation()}
      >
        {pin.headline}
      </a>

      <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg,${tierCol}44,transparent)` }} />

      <p className="font-mono text-[12px] text-text-dim leading-relaxed mb-3">{pin.summary}</p>

      <a
        href={pin.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 rounded border transition-all"
        style={{ color: tierCol, borderColor: `${tierCol}40`, background: `${tierCol}10` }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${tierCol}20`; e.currentTarget.style.borderColor = `${tierCol}80`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${tierCol}10`; e.currentTarget.style.borderColor = `${tierCol}40`; }}
        onClick={(e) => e.stopPropagation()}
      >
        <span>READ FULL STORY</span>
        <span>↗</span>
      </a>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />;
}

function PanelShopFooter({ domainId, col, onOpenShop }: { domainId: string; col: string; onOpenShop: () => void }) {
  const items = getDomainGear(domainId, 4);
  const total = getDomainGearTotal(domainId);
  const provDomain = DOMAIN_PROV_MAP[domainId] ?? "nuclear";
  if (items.length === 0) return null;
  return (
    <div
      className="px-4 py-3.5"
      style={{
        background: "rgba(201,168,76,0.04)",
        borderTop: "1px solid rgba(201,168,76,0.10)",
      }}
    >
      <SectionLabel text="⚡ Fix the Risk" col="#c9a84c" />
      <div className="space-y-2 mb-3.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-mono text-[9px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">
              {item.tier}
            </span>
            <p className="font-mono text-[11px] text-text-base flex-1 truncate">{item.name}</p>
            <span className="font-mono text-[10px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
          </div>
        ))}
      </div>
      <Link
        href={`/provisioner/gear?domain=${provDomain}`}
        onClick={(e) => e.stopPropagation()}
        className="block w-full text-center font-mono text-[10px] font-bold py-2.5 rounded-lg
                   border border-gold-dim bg-gold-glow text-gold-bright
                   hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(201,168,76,0.35)]
                   transition-all duration-150"
      >
        {total} items ready for this threat →
      </Link>
    </div>
  );
}

// ── Score color helper (mirrors sub-index-bar) ────────────────────────────────
function scoreCol(score: number): string {
  if (score >= 80) return "#e84040";
  if (score >= 65) return "#f0a500";
  if (score >= 45) return "#c9a84c";
  return "#1ae8a0";
}

// ── Score methodology — one entry per sub-index label ────────────────────────
// formula: concise explanation of the calculation inputs shown in the UI
const SCORE_METHODOLOGY: Record<string, {
  subIndexFormulas: Record<string, string>;
  liveFeeds: string[];
  staticNote: string;
  anchorDate: string;
}> = {
  geopolitical: {
    subIndexFormulas: {
      "Nuclear Risk":      "BAS Clock(85s)=68 + nuclear news tier-weights · cap 88",
      "Active Conflicts":  "30pt baseline (global minimum) + war news tier-weights · cap 82",
      "Cyber Threats":     "22pt always-on baseline + cyber news tier-weights · cap 95",
      "Political Fracture":"35pt (multipolar erosion base) + political news tier-weights",
    },
    liveFeeds: ["News feed (nuclear · war · cyber · political)", "BTC/USD — CoinGecko", "USD/RUB — open.er-api.com"],
    staticNote: "BAS Doomsday Clock · CFR Conflicts 2026 · CISA/FBI Typhoon advisories · V-Dem 2026",
    anchorDate: "Mar 2026",
  },
  economic: {
    subIndexFormulas: {
      "Debt Stress":       "US debt 124% GDP → (124−60)/150×100=43 + interest-crowding +17 (static)",
      "Market Volatility": "LIVE: VIX(CBOE) score + T-bill yield tier-add — polls every 60s",
      "Currency / Dollar": "48pt (BRICS/de-dollarization base) + LIVE DXY level tier-add",
      "Banking Stress":    "32pt ($306B unrealized losses base) + economic news tier-weights",
    },
    liveFeeds: ["VIX — CBOE (via /api/watchtower/prices)", "T-bill yield — Fed (via server API)", "DXY — Yahoo Finance (via server API)", "XAU · WTI · BTC · USD/RUB", "News feed (economic)"],
    staticNote: "Senate JEC Jan 2026 · CBO 2026 baseline · FDIC Q4 2025 · Atlantic Council CBDC Tracker",
    anchorDate: "Mar 2026",
  },
  environmental: {
    subIndexFormulas: {
      "Pandemic Risk":          "H5N1: 18(animal) + 12(70 human cases) + 6(no vaccine) + 8(MPXV) + health news",
      "Climate Stress":         "WMO +1.55°C → 52pts + Arctic ice −20%→+8 + La Niña +5 (static)",
      "Food & Water":           "WFP 96M → 27pts + water-stress +12 + harvest +8 + health/climate news",
      "Antimicrobial Resist.":  "1.27M deaths/10M threshold + ESKAPE spread + trajectory (fully static)",
    },
    liveFeeds: ["WTI — Yahoo Finance (via server API)", "News feed (health · climate)"],
    staticNote: "CDC Bird Flu summary · WMO 2024 · NSIDC Mar 2026 · WFP 2026 · WHO DON Jan 2026 · Lancet 2024",
    anchorDate: "Mar 2026",
  },
};

// ── Unified domain panel ───────────────────────────────────────────────────────
// One seamless narrative: Threat → Score Intelligence → Live Signals → Action
function DomainUnifiedPanel({
  domainId,
  col,
  domainScores,
  newsFeedPins,
  onNewsClick,
  gateStatuses,
  onOpenShop,
}: {
  domainId:    string;
  col:         string;
  domainScores?: DomainScores;
  newsFeedPins: NewsFeedPin[];
  onNewsClick:  (newsId: string) => void;
  gateStatuses?: GateStatus[];
  onOpenShop:  () => void;
}) {
  const domain    = DOMAINS.find((d) => d.id === domainId);
  const scores    = domainScores?.[domainId as keyof DomainScores];
  const gateIds   = DOMAIN_GATES[domainId] ?? [];
  const gates     = GATES.filter((g) => gateIds.includes(g.id));
  const statusMap = Object.fromEntries((gateStatuses ?? []).map(s => [s.id, s]));
  const provDomain = DOMAIN_PROV_MAP[domainId] ?? "nuclear";
  const shopItems  = getDomainGear(domainId, 4);
  const shopTotal  = getDomainGearTotal(domainId);
  const assetKeys  = DOMAIN_ASSETS[domainId] ?? [];
  const newsItems  = filterNewsByDomain(newsFeedPins, domainId).slice(0, 5);

  const [prices, setPrices]   = useState<LivePrices | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try { const p = await fetchLivePrices(); if (!cancelled) setPrices(p); } catch {}
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const script = DOMAIN_VOICE[domainId];
    if (!script) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(script);
    utt.lang = "en-US"; utt.rate = 0.82; utt.pitch = 0.65; utt.volume = 1;
    const trySetVoice = () => {
      const v = window.speechSynthesis.getVoices();
      const voice = pickCommandVoice(v);
      if (voice) utt.voice = voice;
    };
    trySetVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => { trySetVoice(); window.speechSynthesis.onvoiceschanged = null; };
    }
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  };

  if (!domain) return null;

  return (
    <div className="flex flex-col">

      {/* ── 1. THREAT HEADER ──────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[20px] leading-none flex-shrink-0">{domain.icon}</span>
            <div>
              <p className="font-mono text-[10px] tracking-[.16em] uppercase mb-0.5" style={{ color: col }}>
                ARK SCORE · {domain.score}/100 · {domain.trend}
              </p>
              <p className="font-syne font-bold text-[14px] text-text-base leading-none">{domain.label}</p>
              <span
                className="inline-block mt-1 font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold"
                style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
              >
                {domain.level}
              </span>
            </div>
          </div>
          <button
            onClick={handleSpeak}
            title={speaking ? "Stop narration" : "Play domain briefing"}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[10px] transition-all duration-150 flex-shrink-0"
            style={speaking
              ? { color: col, borderColor: `${col}60`, background: `${col}18` }
              : { color: "rgba(150,165,180,0.6)", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
            }
          >
            {speaking ? (
              <>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ color: col }}>■</motion.span>
                <span style={{ color: col }}>STOP</span>
              </>
            ) : (
              <>🔊 <span>BRIEF</span></>
            )}
          </button>
        </div>
        <p className="font-mono text-[11.5px] text-text-dim leading-relaxed">{domain.summary}</p>
      </div>

      {/* ── 2. SCORE INTELLIGENCE — bars + driving signals woven together ── */}
      <div
        className="mx-3 mb-3 rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Section header */}
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full" style={{ background: col }} />
            <span className="font-mono text-[9px] tracking-[.16em] uppercase" style={{ color: `${col}99` }}>
              Score Intelligence
            </span>
          </div>
          {scores && (
            <span className="font-mono text-[9px] text-text-mute2/50">
              COMPOSITE <span className="text-text-dim font-bold">{scores.live}/100</span>
            </span>
          )}
        </div>

        {/* Sub-index bars */}
        {scores?.subIndices.map((si, i) => {
          const formula = SCORE_METHODOLOGY[domainId]?.subIndexFormulas[si.label];
          return (
            <div
              key={si.label}
              className="px-3 pt-2.5 pb-2.5"
              style={{ borderBottom: i < (scores.subIndices.length - 1) ? "1px solid rgba(255,255,255,0.04)" : undefined }}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9.5px] text-text-dim tracking-[.04em]">{si.label}</span>
                  {si.isLive ? (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[7px] tracking-[.1em] px-1 py-px rounded"
                      style={{ background: "rgba(26,232,160,0.12)", color: "#1ae8a0" }}>
                      <span className="w-1 h-1 rounded-full bg-[#1ae8a0] animate-pulse inline-block" />
                      LIVE
                    </span>
                  ) : (
                    <span className="font-mono text-[7px] tracking-[.1em] px-1 py-px rounded"
                      style={{ background: "rgba(150,165,180,0.08)", color: "rgba(150,165,180,0.5)" }}>
                      STATIC
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8.5px] text-text-mute2/50">×{Math.round(si.weight * 100)}%</span>
                  <span className="font-mono text-[10px] font-bold tabular-nums w-6 text-right"
                    style={{ color: scoreCol(si.score) }}>{si.score}</span>
                </div>
              </div>

              {/* Score bar */}
              <div className="relative h-1 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${si.score}%`, background: `linear-gradient(90deg,${scoreCol(si.score)}66,${scoreCol(si.score)})` }}
                />
              </div>

              {/* Data source */}
              <p className="font-mono text-[7.5px] text-text-mute2/45 leading-snug mb-1">{si.source}</p>

              {/* Formula breakdown */}
              {formula && (
                <p className="font-mono text-[7px] leading-snug" style={{ color: "rgba(150,165,180,0.35)" }}>
                  <span style={{ color: "rgba(150,165,180,0.5)" }}>formula: </span>{formula}
                </p>
              )}
            </div>
          );
        })}

        {/* Contribution row */}
        {scores && (
          <div className="px-3 py-2 flex items-center justify-between flex-wrap gap-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
            <div className="flex gap-1.5 flex-wrap">
              {scores.subIndices.map((si) => (
                <span key={si.label} className="font-mono text-[8px] text-text-mute2/50">
                  <span style={{ color: scoreCol(si.score) }}>{si.contribution}</span>
                  <span className="text-text-mute2/30"> +</span>
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px] font-bold" style={{ color: col }}>= {scores.live}</span>
          </div>
        )}

        {/* Methodology footer */}
        {SCORE_METHODOLOGY[domainId] && (() => {
          const m = SCORE_METHODOLOGY[domainId];
          return (
            <div className="px-3 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.12)" }}>
              <p className="font-mono text-[7.5px] tracking-[.14em] uppercase text-text-mute2/40 mb-1.5">
                Data Sources &amp; Refresh Rate
              </p>
              {/* Live feeds list */}
              <div className="mb-1.5">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-1 h-1 rounded-full bg-[#1ae8a0] animate-pulse flex-shrink-0" />
                  <span className="font-mono text-[7.5px] text-[#1ae8a0]/70 tracking-[.08em]">LIVE — refreshes every 60s</span>
                </div>
                {m.liveFeeds.map((feed, i) => (
                  <p key={i} className="font-mono text-[7px] text-text-mute2/40 leading-snug pl-2">· {feed}</p>
                ))}
              </div>
              {/* Static anchors */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(150,165,180,0.4)" }} />
                  <span className="font-mono text-[7.5px] tracking-[.08em]" style={{ color: "rgba(150,165,180,0.5)" }}>
                    STATIC anchors — last reviewed {m.anchorDate}
                  </span>
                </div>
                <p className="font-mono text-[7px] text-text-mute2/35 leading-snug pl-2">{m.staticNote}</p>
              </div>
            </div>
          );
        })()}

        {/* Active signals — driving the scores above */}
        {newsItems.length > 0 && (
          <div style={{ borderTop: `2px solid ${col}30` }}>
            <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: col, boxShadow: `0 0 4px ${col}` }} />
              <span className="font-mono text-[9px] tracking-[.16em] uppercase" style={{ color: `${col}99` }}>
                Signals Driving This Score
              </span>
            </div>
            <div className="px-3 pb-2.5 space-y-0">
              {newsItems.map((pin) => {
                const tierCol = TIER_HEX[pin.tier] ?? "#c9a84c";
                const time    = typeof pin.date === "string" && pin.date.includes("T")
                  ? relativeTime(pin.date) : pin.date;
                return (
                  <button
                    key={pin.id}
                    onClick={(e) => { e.stopPropagation(); onNewsClick(pin.id); }}
                    className="w-full flex items-start gap-2 py-1.5 text-left rounded transition-colors hover:bg-white/[0.04] group"
                  >
                    <span className="font-mono text-[8px] flex-shrink-0 mt-0.5" style={{ color: col }}>▸</span>
                    <span className="font-mono text-[8.5px] text-text-dim leading-snug flex-1 min-w-0 group-hover:text-text-base transition-colors line-clamp-2">
                      {pin.headline}
                    </span>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-1">
                      <span className="font-mono text-[7px] text-text-mute2/50">{time}</span>
                      <span className="font-mono text-[6.5px] px-1 py-0.5 rounded border font-bold leading-none"
                        style={{ color: tierCol, borderColor: `${tierCol}40`, background: `${tierCol}12` }}>
                        {pin.tier.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Market signals (price tickers) */}
        {assetKeys.length > 0 && prices && (
          <div className="px-3 py-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
            <p className="font-mono text-[8px] tracking-[.14em] uppercase text-text-mute2/40 mb-1">Market Signals</p>
            {assetKeys.map((key) => {
              const p     = prices[key as keyof LivePrices] as AssetPrice | undefined;
              const ok    = p?.ok ?? false;
              const val   = p?.price ?? 0;
              const chg   = p?.change ?? 0;
              const label = key === "xau" ? "XAU" : key === "wti" ? "WTI" : key === "btc" ? "BTC" : key === "usdRub" ? "USD/RUB" : key.toUpperCase();
              let displayVal = "--";
              if (ok) {
                if (key === "btc") displayVal = `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
                else if (key === "usdRub") displayVal = val.toFixed(2);
                else displayVal = `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              }
              const up = chg > 0;
              const chgCol = up ? "#1ae8a0" : "#e84040";
              return (
                <div key={key} className="flex items-center justify-between gap-2 py-0.5">
                  <span className="font-mono text-[8.5px] text-text-mute2/70 tracking-[.08em]">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] tabular-nums font-bold"
                      style={{ color: ok ? "#c9c9c9" : "rgba(150,165,180,0.35)" }}>{displayVal}</span>
                    {ok && key !== "usdRub" && chg !== 0 && (
                      <span className="font-mono text-[8px]" style={{ color: chgCol }}>
                        {up ? "▲" : "▼"}{Math.abs(chg).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. KEY DRIVERS ───────────────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <p className="font-mono text-[9px] tracking-[.16em] uppercase mb-2" style={{ color: `${col}80` }}>
          Key Drivers
        </p>
        <div className="space-y-1.5">
          {domain.drivers.slice(0, 3).map((drv, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-mono text-[11px] flex-shrink-0 mt-0.5 font-bold" style={{ color: col }}>→</span>
              <p className="font-mono text-[11px] text-text-mute2 leading-snug">{drv}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. RESPONSE PROTOCOL + SHOP ──────────────────────────────────── */}
      {gates.length > 0 ? (
        <div className="px-4 pb-4">
          <p className="font-mono text-[9px] tracking-[.16em] uppercase mb-2.5" style={{ color: `${col}80` }}>
            ⚡ Response Protocol
          </p>
          <div className="space-y-2.5">
            {gates.map((gate) => {
              const gc  = TIER_HEX[gate.tier] ?? "#c9a84c";
              const gs  = statusMap[gate.id];
              const dot = gs?.status === "triggered" ? "#e84040" : gs?.status === "warning" ? "#f0a500" : "rgba(150,165,180,0.4)";
              const pulse = gs?.status === "triggered";
              return (
                <div key={gate.id} className="rounded-lg px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${gc}18`, borderLeft: `2px solid ${gc}60` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
                      style={{ background: dot, boxShadow: pulse ? `0 0 6px ${dot}` : "none" }} />
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                      style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}>
                      {gate.id} · {gate.tier.toUpperCase()}
                    </span>
                    <span className="font-mono text-[9.5px] text-text-mute2/60">{gate.window}</span>
                    {gs && gs.confidence > 0 && (
                      <span className="ml-auto font-mono text-[8px] tabular-nums flex-shrink-0" style={{ color: dot }}>
                        {Math.round(gs.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10.5px] text-text-base leading-snug mb-0.5">{gate.trigger}</p>
                  {gs && (gs.status !== "monitoring" || gs.id === "G5") && gs.reason && (
                    <p className="font-mono text-[9px] leading-snug mb-0.5 italic" style={{ color: `${dot}cc` }}>{gs.reason}</p>
                  )}
                  <p className="font-mono text-[10.5px] font-bold leading-snug" style={{ color: gc }}>{gate.action}</p>
                  {(gs?.status === "warning" || gs?.status === "triggered") && (() => {
                    const items  = getGateGear(gate.id);
                    const config = GATE_GEAR[gate.id];
                    if (!items.length || !config) return null;
                    return (
                      <div className="mt-2 pt-2 border-t space-y-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="font-mono text-[7px] tracking-[.14em] uppercase mb-1" style={{ color: `${dot}80` }}>{config.label}</p>
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="font-mono text-[7px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">{item.tier}</span>
                            <p className="font-mono text-[9px] text-text-base flex-1 truncate">{item.name}</p>
                            <span className="font-mono text-[8px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {/* Shop CTA woven into the protocol section */}
          {shopItems.length > 0 && (
            <div className="mt-3 pt-3.5 -mx-4 px-4 pb-0"
              style={{ background: "rgba(201,168,76,0.04)", borderTop: "1px solid rgba(201,168,76,0.10)" }}>
              <p className="font-mono text-[9px] tracking-[.14em] uppercase mb-2" style={{ color: "rgba(201,168,76,0.6)" }}>
                Fix the Risk — Critical Gear
              </p>
              <div className="space-y-2 mb-3.5">
                {shopItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-mono text-[9px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">{item.tier}</span>
                    <p className="font-mono text-[11px] text-text-base flex-1 truncate">{item.name}</p>
                    <span className="font-mono text-[10px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/provisioner/gear?domain=${provDomain}`}
                onClick={(e) => e.stopPropagation()}
                className="block w-full text-center font-mono text-[10px] font-bold py-2.5 rounded-lg
                           border border-gold-dim bg-gold-glow text-gold-bright
                           hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(201,168,76,0.35)]
                           transition-all duration-150 mb-3.5"
              >
                {shopTotal} items ready for this threat →
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* No gates — just the shop CTA */
        shopItems.length > 0 && (
          <div className="px-4 pt-0 pb-4"
            style={{ background: "rgba(201,168,76,0.04)", borderTop: "1px solid rgba(201,168,76,0.10)" }}>
            <p className="font-mono text-[9px] tracking-[.14em] uppercase mb-2 pt-3.5" style={{ color: "rgba(201,168,76,0.6)" }}>
              Fix the Risk — Critical Gear
            </p>
            <div className="space-y-2 mb-3.5">
              {shopItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">{item.tier}</span>
                  <p className="font-mono text-[11px] text-text-base flex-1 truncate">{item.name}</p>
                  <span className="font-mono text-[10px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
                </div>
              ))}
            </div>
            <Link
              href={`/provisioner/gear?domain=${provDomain}`}
              onClick={(e) => e.stopPropagation()}
              className="block w-full text-center font-mono text-[10px] font-bold py-2.5 rounded-lg
                         border border-gold-dim bg-gold-glow text-gold-bright
                         hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(201,168,76,0.35)]
                         transition-all duration-150"
            >
              {shopTotal} items ready for this threat →
            </Link>
          </div>
        )
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface GlobeRightPanelProps {
  containerH:          number;
  panelScale:          number;
  domainId:            string | null;
  scenarioId:          string | null;
  selectedSignalIdx:   number | null;
  selectedPsychZone:   { region: string; threat: string; note: string } | null;
  selectedGateId:      string | null;
  selectedCommodityId: string | null;
  selectedNewsId:      string | null;
  selectedCityIdx:     number | null;
  onClose:             () => void;
  onCloseCommodity:    () => void;
  onCloseNews:         () => void;
  onCloseCity:         () => void;
  onOpenShop:          () => void;
  newsFeedPins:        NewsFeedPin[];
  onNewsClick:         (newsId: string) => void;
  gateStatuses?:       GateStatus[];
  domainScores?:       DomainScores;
}

export function GlobeRightPanel({
  containerH, panelScale,
  domainId, scenarioId, selectedSignalIdx, selectedPsychZone, selectedGateId,
  selectedCommodityId, selectedNewsId, selectedCityIdx,
  onClose,
  onCloseCommodity, onCloseNews, onCloseCity,
  onOpenShop, newsFeedPins, onNewsClick,
  gateStatuses, domainScores,
}: GlobeRightPanelProps) {
  const hasAny = !!(domainId || scenarioId || selectedSignalIdx !== null
    || selectedPsychZone || selectedGateId || selectedCommodityId
    || selectedNewsId || selectedCityIdx !== null);

  const activeCol = domainId ? (DOMAIN_COLORS[domainId] ?? "#c9a84c") : "#e84040";

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <AnimatePresence>
      {hasAny && (
        <motion.div
          key="right-panel"
          initial={isMobile ? { y: "100%" } : { opacity: 0, x: 16 }}
          animate={isMobile ? { y: 0 } : { opacity: 1, x: 0 }}
          exit={isMobile ? { y: "100%" } : { opacity: 0, x: 16 }}
          transition={isMobile ? { type: "spring", damping: 30, stiffness: 280 } : { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={isMobile ? "fixed left-0 right-0 z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden rounded-t-2xl" : "absolute right-0 top-0 bottom-0 z-20 flex flex-col [&::-webkit-scrollbar]:hidden"}
          style={isMobile ? {
            top: "calc(44dvh + 50px)",
            bottom: 0,
            borderTop: `2px solid ${activeCol}`,
            boxShadow: "0 -8px 40px rgba(0,0,0,0.75)",
          } : {
            width: "360px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              background: "rgba(6,7,14,0.97)",
              borderLeft: `2px solid ${activeCol}`,
              backdropFilter: "blur(12px)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
            }}
          >
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-border-protocol" />
              </div>
            )}
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeCol }} />
                <p className="font-mono text-[9px] tracking-[.18em] uppercase" style={{ color: `${activeCol}99` }}>
                  INTEL
                </p>
              </div>
              <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
            </div>

            {/* Scrollable content body */}
            <div
              className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {selectedCityIdx !== null && (
                <CityDetailCard cityIdx={selectedCityIdx} onClose={onCloseCity} />
              )}
              {selectedCommodityId && !selectedCityIdx && (
                <CommodityCard commodityId={selectedCommodityId} onClose={onCloseCommodity} />
              )}
              {selectedNewsId && !selectedCityIdx && !selectedCommodityId && (
                <NewsFeedCard newsId={selectedNewsId} onClose={onCloseNews} pins={newsFeedPins} />
              )}
              {selectedGateId && !selectedCityIdx && !selectedCommodityId && !selectedNewsId && (() => {
                const gate = GATES.find(g => g.id === selectedGateId);
                const col = TIER_HEX[gate?.tier ?? ''] ?? '#c9a84c';
                const gearDomain = getGateDomain(selectedGateId);
                return (
                  <>
                    <GateDetailCard gateId={selectedGateId} onClose={() => {}} />
                    <Divider />
                    <PanelShopFooter domainId={gearDomain} col={col} onOpenShop={onOpenShop} />
                  </>
                );
              })()}
              {selectedPsychZone && !selectedGateId && !selectedCityIdx && !selectedCommodityId && !selectedNewsId && (
                <>
                  <PsychDetailCard psychZone={selectedPsychZone} onClose={() => {}} />
                  <Divider />
                  <PanelShopFooter domainId="bio" col="#8b2be2" onOpenShop={onOpenShop} />
                </>
              )}
              {selectedSignalIdx !== null && !selectedGateId && !selectedPsychZone && !selectedCityIdx && !selectedCommodityId && !selectedNewsId && (() => {
                const sig = SIGNALS[selectedSignalIdx];
                const domId = SIGNAL_DOMAIN_ID[sig?.domain ?? ''] ?? 'cyber';
                const col = DOMAIN_COLORS[domId] ?? '#c9a84c';
                return (
                  <>
                    <SignalDetailCard signalIdx={selectedSignalIdx} col={col} domainId={domId} />
                    <Divider />
                    <SignalGateCard signalIdx={selectedSignalIdx} col={col} />
                    <Divider />
                    <PanelShopFooter domainId={domId} col={col} onOpenShop={onOpenShop} />
                  </>
                );
              })()}
              {scenarioId && !selectedSignalIdx && !selectedGateId && !selectedPsychZone && !selectedCityIdx && !selectedCommodityId && !selectedNewsId && (() => {
                const gearDomain = SCENARIO_DOMAIN[scenarioId] ?? 'cyber';
                const col = "#e84040";
                return (
                  <>
                    <ScenarioOverviewCard scenarioId={scenarioId} col={col} domainId={gearDomain} />
                    <Divider />
                    <ScenarioMitigationCard scenarioId={scenarioId} col={col} />
                    <Divider />
                    <PanelShopFooter domainId={gearDomain} col={col} onOpenShop={onOpenShop} />
                  </>
                );
              })()}
              {domainId && !scenarioId && !selectedSignalIdx && !selectedGateId && !selectedPsychZone && !selectedCityIdx && !selectedCommodityId && !selectedNewsId && (
                <DomainUnifiedPanel
                  domainId={domainId}
                  col={DOMAIN_COLORS[domainId] ?? '#c9a84c'}
                  domainScores={domainScores}
                  newsFeedPins={newsFeedPins}
                  onNewsClick={onNewsClick}
                  gateStatuses={gateStatuses}
                  onOpenShop={onOpenShop}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
