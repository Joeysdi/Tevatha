// components/watchtower/globe-info-cards.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { RefObject } from "react";
import { DOMAINS, SIGNALS, SCENARIOS, PSYCH_PILLARS, GATES } from "@/lib/watchtower/data";
import { GEAR } from "@/lib/watchtower/data-gear";
import { DOMAIN_COLORS } from "@/lib/watchtower/domain-colors";
import { DomainLiveFeedCard } from "./domain-live-feed-card";
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

// ── Anti-overlap spread ───────────────────────────────────────────────────────
function spreadPositions(
  n: number,
  startAngle: number,
  containerW: number,
  containerH: number,
  cardW = 288,
  cardH = 260,
  anchorX?: number, // pixel anchor override (default: container center)
  anchorY?: number,
) {
  const cx = anchorX ?? containerW / 2;
  const cy = anchorY ?? containerH / 2;
  // Smaller radius when near a geo anchor — cards cluster around the region
  const radius = anchorX !== undefined
    ? Math.min(containerW, containerH) * 0.18
    : Math.min(containerW, containerH) * 0.32;
  const totalSpread = n <= 1 ? 0 : 95;
  const step = n <= 1 ? 0 : totalSpread / (n - 1);
  const offset = -totalSpread / 2;

  let pos = Array.from({ length: n }, (_, i) => {
    const deg = startAngle + offset + i * step;
    const rad = (deg * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad) - cardW / 2;
    const y = cy + radius * Math.sin(rad) - cardH / 2;
    return {
      x: Math.max(6, Math.min(containerW - cardW - 6, x)),
      y: Math.max(6, Math.min(containerH - cardH - 6, y)),
    };
  });

  // Iterative separation pass
  const PAD = 14;
  for (let iter = 0; iter < 12; iter++) {
    let moved = false;
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x;
        const dy = pos[j].y - pos[i].y;
        const overlapX = cardW + PAD - Math.abs(dx);
        const overlapY = cardH + PAD - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          moved = true;
          // Push along the smaller overlap axis
          if (overlapX < overlapY) {
            const push = overlapX / 2 + 1;
            const sign = dx >= 0 ? 1 : -1;
            pos[i] = { ...pos[i], x: pos[i].x - sign * push };
            pos[j] = { ...pos[j], x: pos[j].x + sign * push };
          } else {
            const push = overlapY / 2 + 1;
            const sign = dy >= 0 ? 1 : -1;
            pos[i] = { ...pos[i], y: pos[i].y - sign * push };
            pos[j] = { ...pos[j], y: pos[j].y + sign * push };
          }
          // Re-clamp
          for (const k of [i, j]) {
            pos[k].x = Math.max(6, Math.min(containerW - cardW - 6, pos[k].x));
            pos[k].y = Math.max(6, Math.min(containerH - cardH - 6, pos[k].y));
          }
        }
      }
    }
    if (!moved) break;
  }
  return pos;
}

// ── Gear lookup ───────────────────────────────────────────────────────────────
function getDomainGear(domainId: string, limit = 4) {
  const cats = DOMAIN_GEAR_CATS[domainId] ?? [];
  return GEAR
    .filter((c) => cats.includes(c.cat))
    .flatMap((c) => c.items.filter((i) => i.critical))
    .slice(0, limit);
}

function getGateDomain(gateId: string): string {
  for (const [domain, ids] of Object.entries(DOMAIN_GATES)) {
    if (ids.includes(gateId)) return domain;
  }
  return "cyber";
}

// ── Card registry types ───────────────────────────────────────────────────────
interface RegistryEntry {
  initX: number;
  initY: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

// ── Drag card wrapper (registry-aware) ───────────────────────────────────────
function DragCard({
  cardKey, initX, initY, containerRef, width = 288, children,
  onRegister, onUnregister, onCardDrag,
}: {
  cardKey:      string;
  initX:        number;
  initY:        number;
  containerRef: RefObject<HTMLElement>;
  width?:       number;
  children:     React.ReactNode;
  onRegister:   (key: string, entry: RegistryEntry) => void;
  onUnregister: (key: string) => void;
  onCardDrag:   (key: string) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Register motion values with parent so repulsion can write to them
  useEffect(() => {
    onRegister(cardKey, { initX, initY, x, y });
    return () => onUnregister(cardKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardKey, initX, initY]);

  // Reset offset when spawn position changes (mode switch)
  useEffect(() => { x.set(0); y.set(0); }, [initX, initY, x, y]);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.04}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.84 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.84 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ position: "absolute", left: initX, top: initY, x, y, width, zIndex: 25, userSelect: "none", touchAction: "none" }}
      whileDrag={{ zIndex: 30 }}
      onDrag={() => onCardDrag(cardKey)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

// ── Card frame ────────────────────────────────────────────────────────────────
function Frame({ col, children }: { col: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        background: "rgba(6,7,14,0.97)",
        border: `1px solid ${col}44`,
        borderLeft: `2px solid ${col}`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.75), 0 0 24px ${col}08`,
        cursor: "grab",
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />
      {children}
    </div>
  );
}

// ── Close button ──────────────────────────────────────────────────────────────
function CloseBtn({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[10px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-white/[0.06]"
    >
      ✕
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ text, col }: { text: string; col: string }) {
  return (
    <p className="font-mono text-[7.5px] tracking-[.18em] uppercase mb-2" style={{ color: `${col}99` }}>
      {text}
    </p>
  );
}

// ── Domain info card ──────────────────────────────────────────────────────────
function DomainInfoCard({
  domainId, col, onClose, onOpenShop,
}: {
  domainId: string;
  col: string;
  onClose: () => void;
  onOpenShop: () => void;
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
    <Frame col={col}>
      <div className="px-4 py-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[20px] leading-none flex-shrink-0">{domain.icon}</span>
            <div>
              <p className="font-mono text-[7.5px] tracking-[.16em] uppercase mb-0.5" style={{ color: col }}>
                ARK SCORE · {domain.score}/100 · {domain.trend}
              </p>
              <p className="font-syne font-bold text-[14px] text-text-base leading-none">{domain.label}</p>
              <span
                className="inline-block mt-1 font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold"
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
              className="flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[8px] transition-all duration-150 flex-shrink-0"
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
            <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
          </div>
        </div>

        {/* Summary */}
        <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mb-3">{domain.summary}</p>

        {/* Drivers */}
        <div>
          <SectionLabel text="Key Drivers" col={col} />
          <div className="space-y-1.5">
            {domain.drivers.slice(0, 3).map((drv, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-[9px] flex-shrink-0 mt-0.5 font-bold" style={{ color: col }}>→</span>
                <p className="font-mono text-[8.5px] text-text-mute2 leading-snug">{drv}</p>
              </div>
            ))}
          </div>
        </div>
        <GearStrip domainId={domainId} col={col} onOpenShop={onOpenShop} />
      </div>
    </Frame>
  );
}

// ── Domain gates card ─────────────────────────────────────────────────────────
function DomainGatesCard({ domainId, col }: { domainId: string; col: string }) {
  const gateIds = DOMAIN_GATES[domainId] ?? [];
  const gates = GATES.filter((g) => gateIds.includes(g.id));
  if (gates.length === 0) return null;
  return (
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <SectionLabel text="🔑 Decision Gates" col={col} />
        <div className="space-y-2.5">
          {gates.map((gate) => {
            const gc = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div key={gate.id} className="border-b last:border-b-0 pb-2.5 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}
                  >
                    {gate.id} · {gate.tier.toUpperCase()}
                  </span>
                  <span className="font-mono text-[7.5px] text-text-mute2/60">{gate.window}</span>
                </div>
                <p className="font-mono text-[9px] text-text-base leading-snug mb-1">{gate.trigger}</p>
                <p className="font-mono text-[8.5px] font-bold leading-snug" style={{ color: gc }}>{gate.action}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

// ── Gear strip (inline, embedded at the bottom of info cards) ─────────────────
function GearStrip({ domainId, col, onOpenShop }: { domainId: string; col: string; onOpenShop: () => void }) {
  const items = getDomainGear(domainId, 3);
  if (items.length === 0) return null;
  return (
    <div className="border-t mt-3 pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <SectionLabel text="⚙ Fix the Risk" col={col} />
      <div className="space-y-2 mb-3">
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
      <button
        onClick={(e) => { e.stopPropagation(); onOpenShop(); }}
        className="w-full font-mono text-[9px] font-bold py-2 rounded-lg border border-gold-dim
                   bg-gold-glow text-gold-bright hover:-translate-y-px
                   hover:shadow-[0_4px_16px_rgba(201,168,76,0.25)] transition-all duration-150"
      >
        Browse in Shop →
      </button>
    </div>
  );
}

// ── Scenario cards ────────────────────────────────────────────────────────────
function ScenarioOverviewCard({
  scenarioId, col, onClose, domainId, onOpenShop,
}: {
  scenarioId: string;
  col: string;
  onClose: () => void;
  domainId: string;
  onOpenShop: () => void;
}) {
  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  if (!sc) return null;
  return (
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[18px] leading-none">{sc.icon}</span>
            <div>
              <p className="font-mono text-[7.5px] tracking-[.14em] uppercase mb-0.5" style={{ color: col }}>
                {sc.prob}% PROBABILITY · {sc.window}
              </p>
              <p className="font-syne font-bold text-[14px] text-text-base leading-none">{sc.title}</p>
              <p className="font-mono text-[8px] text-text-mute2 mt-0.5">Prep time: {sc.prepTime}</p>
            </div>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
        <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mb-3">{sc.summary}</p>
        <div>
          <SectionLabel text="Cascade Effects" col={col} />
          <div className="flex flex-wrap gap-1.5">
            {sc.cascade.map((c, i) => (
              <span key={i} className="font-mono text-[7.5px] px-1.5 py-0.5 rounded border border-amber-DEFAULT/25 bg-amber-dim text-amber-protocol">{c}</span>
            ))}
          </div>
        </div>
        <GearStrip domainId={domainId} col={col} onOpenShop={onOpenShop} />
      </div>
    </Frame>
  );
}

function ScenarioMitigationCard({ scenarioId, col }: { scenarioId: string; col: string }) {
  const sc = SCENARIOS.find((s) => s.id === scenarioId);
  if (!sc) return null;
  return (
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <SectionLabel text="🛡 Triggers + Mitigation" col={col} />
        <div className="space-y-1.5 mb-3">
          {sc.triggers.map((tr, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-mono text-[9px] flex-shrink-0 mt-0.5 font-bold" style={{ color: col }}>→</span>
              <p className="font-mono text-[8.5px] text-text-mute2 leading-snug">{tr}</p>
            </div>
          ))}
        </div>
        <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <SectionLabel text="Priority Actions" col={col} />
          <div className="space-y-2">
            {sc.mitigation.filter((m) => m.pri === "1").slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ color: "#e84040", background: "rgba(232,64,64,0.1)" }}>P1</span>
                <div>
                  <p className="font-mono text-[8.5px] text-text-dim leading-snug">{m.action}</p>
                  <p className="font-mono text-[7.5px] text-text-mute2">{m.cost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ── Signal cards ──────────────────────────────────────────────────────────────
function SignalDetailCard({
  signalIdx, col, onClose, domainId, onOpenShop,
}: {
  signalIdx: number;
  col: string;
  onClose: () => void;
  domainId: string;
  onOpenShop: () => void;
}) {
  const sig = SIGNALS[signalIdx];
  if (!sig) return null;
  return (
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold flex-shrink-0
                ${sig.tier === "t4" ? "text-red-bright border-red-protocol/40 bg-red-protocol/10"
                  : sig.tier === "t3" ? "text-amber-protocol border-amber-DEFAULT/30 bg-amber-dim"
                  : "text-blue-DEFAULT border-blue-DEFAULT/30 bg-blue-dim"}`}
            >
              {sig.tier.toUpperCase()}
            </span>
            <p className="font-mono text-[7.5px] tracking-[.12em] uppercase text-text-mute2">
              {sig.domain} · Score {sig.score}
            </p>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
        <p className="font-mono text-[9.5px] text-text-base leading-relaxed mb-3">{sig.sig}</p>
        <a
          href={sig.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="font-mono text-[8px] text-text-mute2/60 hover:text-amber-protocol/80 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {sig.source} ↗
        </a>
        <GearStrip domainId={domainId} col={col} onOpenShop={onOpenShop} />
      </div>
    </Frame>
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
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <SectionLabel text="🔑 Related Gates" col={col} />
        <div className="space-y-2.5">
          {gates.map((gate) => {
            const gc = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div key={gate.id} className="border-b last:border-b-0 pb-2.5 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}
                  >
                    {gate.id}
                  </span>
                  <span className="font-mono text-[7.5px] text-text-mute2/60">{gate.window}</span>
                </div>
                <p className="font-mono text-[9px] text-text-base leading-snug mb-1">{gate.trigger}</p>
                <p className="font-mono text-[8.5px] font-bold leading-snug" style={{ color: gc }}>{gate.action}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
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
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-mono text-[7.5px] tracking-[.14em] uppercase text-purple-300/70 mb-0.5">🧠 PSYCH THREAT</p>
            <p className="font-syne font-bold text-[14px] text-text-base leading-none">{psychZone.region}</p>
            <p className="font-mono text-[9px] text-purple-300 mt-1">{psychZone.threat}</p>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
        <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mb-3">{psychZone.note}</p>
        <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <SectionLabel text="Ark Response" col={col} />
          <div className="space-y-2">
            {PSYCH_PILLARS.slice(0, 3).map((p) => (
              <div key={p.name} className="flex items-start gap-2">
                <span className="text-[11px] flex-shrink-0 mt-0.5">{p.icon}</span>
                <div>
                  <p className="font-mono text-[9px] font-bold text-text-base">{p.name}</p>
                  <p className="font-mono text-[8px] text-text-mute2 leading-snug">{p.tactics[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
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
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[7.5px] px-1.5 py-0.5 rounded border font-bold"
              style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
            >
              {gate.id} · {gate.tier.toUpperCase()}
            </span>
            <span className="font-mono text-[8px] text-text-mute2">{gate.window}</span>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
        <p className="font-mono text-[7.5px] tracking-[.1em] uppercase mb-2" style={{ color: `${col}99` }}>TRIGGER</p>
        <p className="font-mono text-[10px] text-text-base leading-relaxed mb-3">{gate.trigger}</p>
        <div className="rounded-lg px-3 py-2.5" style={{ background: `${col}12`, border: `1px solid ${col}30` }}>
          <p className="font-mono text-[7px] tracking-[.1em] uppercase text-text-mute2 mb-1">Action on trigger</p>
          <p className="font-mono text-[9.5px] font-bold leading-snug" style={{ color: col }}>{gate.action}</p>
        </div>
      </div>
    </Frame>
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
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[7.5px] tracking-[.18em] uppercase mb-1" style={{ color: `${col}99` }}>
              {pin.flag} {pin.country} · CITY INTEL
            </p>
            <p className="font-syne font-bold text-[15px] text-text-base leading-none">{pin.name}</p>
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="font-syne font-extrabold text-[26px] leading-none tabular-nums" style={{ color: col }}>
                {pin.threatScore}
              </div>
              <div className="font-mono text-[7px] text-text-mute2">threat</div>
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
          <span className="font-mono text-[8px] text-text-mute2 tracking-[.14em] uppercase">Population</span>
          <span className="font-mono text-[11px] font-bold text-text-base ml-auto tabular-nums">
            {pin.pop >= 10 ? `${pin.pop.toFixed(0)}M` : `${pin.pop.toFixed(1)}M`}
          </span>
        </div>

        <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg,${col}44,transparent)` }} />

        <SectionLabel text="Active Intel" col={col} />
        <div className="flex items-start gap-1.5 mb-3">
          <span className="font-mono text-[9px] mt-[2px] flex-shrink-0" style={{ color: col }}>▸</span>
          <p className="font-mono text-[9px] text-text-dim leading-relaxed">{pin.note}</p>
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
            <span className="font-mono text-[9px] font-bold">☢ Threat News</span>
            <span className="text-[10px] opacity-70">↗</span>
          </a>
          <a href={`https://news.google.com/search?q=${encodeURIComponent(pin.name + " " + pin.country)}`}
             target="_blank" rel="noopener noreferrer"
             className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-150 font-mono text-[9px] text-text-mute2 hover:text-text-base"
             style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
             onClick={(e) => e.stopPropagation()}
          >
            <span>🌐 All News</span>
            <span className="text-[10px] opacity-60">↗</span>
          </a>
        </div>
      </div>
    </Frame>
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
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-mono text-[7.5px] tracking-[.18em] uppercase mb-1" style={{ color: `${col}99` }}>
              {CAT_LABEL[pin.category] ?? "COMMODITY"} · {pin.exchange}
            </p>
            <p className="font-syne font-bold text-[15px] text-text-base leading-none">{pin.name}</p>
            <p className="font-mono text-[8px] text-text-mute2 mt-0.5">{pin.symbol}</p>
          </div>
          <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>

        {/* Price + change */}
        <div className="flex items-end gap-3 mb-3">
          <div>
            <p className="font-mono font-bold text-[28px] leading-none tabular-nums" style={{ color: col, textShadow: `0 0 20px ${col}44` }}>
              {pin.price}
            </p>
            <p className="font-mono text-[9px] text-text-mute2 mt-0.5">{pin.unit}</p>
          </div>
          <div className="pb-1">
            <p className="font-mono font-bold text-[13px]" style={{ color: col }}>
              {up ? "▲" : "▼"} {Math.abs(pin.change).toFixed(1)}%
            </p>
            <p className="font-mono text-[7.5px] text-text-mute2">24h change</p>
          </div>
        </div>

        <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg,${col}44,transparent)` }} />

        <SectionLabel text="Market Context" col={col} />
        <p className="font-mono text-[9px] text-text-dim leading-relaxed mb-3">{pin.note}</p>

        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: col }} />
          <p className="font-mono text-[7.5px] tracking-[.1em]" style={{ color: `${col}80` }}>
            LIVE · {pin.exchange.toUpperCase()}
          </p>
        </div>
      </div>
    </Frame>
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
    <Frame col={tierCol}>
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold flex-shrink-0"
              style={{ color: tierCol, borderColor: `${tierCol}40`, background: `${tierCol}15` }}
            >
              {pin.tier.toUpperCase()} · {CAT_ICON[pin.category]} {CAT_LABEL[pin.category] ?? pin.category.toUpperCase()}
            </span>
            <span className="font-mono text-[7px] text-text-mute2/60">{relativeTime(pin.date)}</span>
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

        <p className="font-mono text-[9.5px] text-text-dim leading-relaxed mb-3">{pin.summary}</p>

        <a
          href={pin.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[8px] px-2 py-1 rounded border transition-all"
          style={{ color: tierCol, borderColor: `${tierCol}40`, background: `${tierCol}10` }}
          onMouseEnter={(e) => { e.currentTarget.style.background = `${tierCol}20`; e.currentTarget.style.borderColor = `${tierCol}80`; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = `${tierCol}10`; e.currentTarget.style.borderColor = `${tierCol}40`; }}
          onClick={(e) => e.stopPropagation()}
        >
          <span>READ FULL STORY</span>
          <span>↗</span>
        </a>
      </div>
    </Frame>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface GlobeInfoCardsProps {
  containerRef:      RefObject<HTMLElement>;
  containerW:        number;
  containerH:        number;
  domainId:          string | null;
  scenarioId:        string | null;
  selectedSignalIdx: number | null;
  selectedPsychZone: { region: string; threat: string; note: string } | null;
  selectedGateId:    string | null;
  onCloseDomain:     () => void;
  onCloseScenario:   () => void;
  onCloseSignal:     () => void;
  onClosePsych:      () => void;
  onCloseGate:       () => void;
  onOpenShop:        () => void;
  selectedCommodityId: string | null;
  selectedNewsId:      string | null;
  onCloseCommodity:    () => void;
  onCloseNews:         () => void;
  selectedCityIdx:     number | null;
  onCloseCity:         () => void;
  newsFeedPins:        NewsFeedPin[];
  onNewsClick:         (newsId: string) => void;
}

export function GlobeInfoCards({
  containerRef, containerW, containerH,
  domainId, scenarioId, selectedSignalIdx, selectedPsychZone, selectedGateId,
  onCloseDomain, onCloseScenario, onCloseSignal, onClosePsych, onCloseGate,
  onOpenShop,
  selectedCommodityId, selectedNewsId, onCloseCommodity, onCloseNews,
  selectedCityIdx, onCloseCity,
  newsFeedPins, onNewsClick,
}: GlobeInfoCardsProps) {
  // ── Card registry for real-time repulsion ─────────────────────────────────
  const registryRef = useRef<Map<string, RegistryEntry>>(new Map());
  const CARD_W = 288, CARD_H = 260, PAD = 12;

  const registerCard = useCallback((key: string, entry: RegistryEntry) => {
    registryRef.current.set(key, entry);
  }, []);

  const unregisterCard = useCallback((key: string) => {
    registryRef.current.delete(key);
  }, []);

  const handleCardDrag = useCallback((movingKey: string) => {
    const moving = registryRef.current.get(movingKey);
    if (!moving) return;
    const mx = moving.initX + moving.x.get();
    const my = moving.initY + moving.y.get();

    for (const [key, entry] of registryRef.current) {
      if (key === movingKey) continue;
      const ex = entry.initX + entry.x.get();
      const ey = entry.initY + entry.y.get();
      const overlapX = CARD_W + PAD - Math.abs(mx - ex);
      const overlapY = CARD_H + PAD - Math.abs(my - ey);
      if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
          const sign = ex >= mx ? 1 : -1;
          entry.x.set(entry.x.get() + sign * Math.min(overlapX * 0.18, 8));
        } else {
          const sign = ey >= my ? 1 : -1;
          entry.y.set(entry.y.get() + sign * Math.min(overlapY * 0.18, 8));
        }
      }
    }
  }, [CARD_W, CARD_H, PAD]);

  // Shorthand so every DragCard gets the same three callbacks
  const dragProps = { onRegister: registerCard, onUnregister: unregisterCard, onCardDrag: handleCardDrag };

  // ── Memoized card positions (O(n²) spread only runs when layout deps change) ─
  const domainPos = useMemo(() => {
    if (!domainId) return null;
    const geo = DOMAIN_GEO[domainId] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    const n = (DOMAIN_GATES[domainId] ?? []).length > 0 ? 3 : 2;
    return { pos: spreadPositions(n, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY), n };
  }, [domainId, containerW, containerH]);

  const scenarioPos = useMemo(() => {
    if (!scenarioId) return null;
    const gearDomain = SCENARIO_DOMAIN[scenarioId] ?? "cyber";
    const geo = DOMAIN_GEO[gearDomain] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    return { pos: spreadPositions(2, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY), gearDomain };
  }, [scenarioId, containerW, containerH]);

  const signalPos = useMemo(() => {
    if (selectedSignalIdx === null || !SIGNALS[selectedSignalIdx]) return null;
    const sig = SIGNALS[selectedSignalIdx];
    const domId = SIGNAL_DOMAIN_ID[sig.domain] ?? "cyber";
    const geo = DOMAIN_GEO[domId] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    const n = (DOMAIN_GATES[domId] ?? []).length > 0 ? 2 : 1;
    return { pos: spreadPositions(n, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY), domId, n };
  }, [selectedSignalIdx, containerW, containerH]);

  // ── Domain ─────────────────────────────────────────────────────────────────
  const domainCards = (() => {
    if (!domainId || !domainPos) return null;
    const col = DOMAIN_COLORS[domainId] ?? "#c9a84c";
    const { pos, n } = domainPos;
    const hasGates = n === 3;
    return (
      <>
        <DragCard key="domain-info" cardKey="domain-info" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <DomainInfoCard domainId={domainId} col={col} onClose={onCloseDomain} onOpenShop={onOpenShop} />
        </DragCard>
        {hasGates && (
          <DragCard key="domain-gates" cardKey="domain-gates" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
            <DomainGatesCard domainId={domainId} col={col} />
          </DragCard>
        )}
        <DragCard key="domain-live-feed" cardKey="domain-live-feed" initX={pos[n - 1].x} initY={pos[n - 1].y} containerRef={containerRef} {...dragProps}>
          <DomainLiveFeedCard domainId={domainId} newsFeedPins={newsFeedPins} onNewsClick={onNewsClick} col={col} />
        </DragCard>
      </>
    );
  })();

  // ── Scenario ───────────────────────────────────────────────────────────────
  const scenarioCards = (() => {
    if (!scenarioId || !scenarioPos) return null;
    const sc = SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return null;
    const col = "#e84040";
    const { pos, gearDomain } = scenarioPos;
    return (
      <>
        <DragCard key="sc-overview" cardKey="sc-overview" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <ScenarioOverviewCard scenarioId={scenarioId} col={col} onClose={onCloseScenario} domainId={gearDomain} onOpenShop={onOpenShop} />
        </DragCard>
        <DragCard key="sc-mitigation" cardKey="sc-mitigation" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
          <ScenarioMitigationCard scenarioId={scenarioId} col={col} />
        </DragCard>
      </>
    );
  })();

  // ── Signal ─────────────────────────────────────────────────────────────────
  const signalCards = (() => {
    if (selectedSignalIdx === null || !signalPos) return null;
    const { pos, domId, n } = signalPos;
    const col = DOMAIN_COLORS[domId] ?? "#c9a84c";
    const hasGate = n === 2;
    return (
      <>
        <DragCard key="sig-detail" cardKey="sig-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <SignalDetailCard signalIdx={selectedSignalIdx} col={col} onClose={onCloseSignal} domainId={domId} onOpenShop={onOpenShop} />
        </DragCard>
        {hasGate && (
          <DragCard key="sig-gate" cardKey="sig-gate" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
            <SignalGateCard signalIdx={selectedSignalIdx} col={col} />
          </DragCard>
        )}
      </>
    );
  })();

  // ── Psych ──────────────────────────────────────────────────────────────────
  const psychCards = (() => {
    if (!selectedPsychZone) return null;
    const col = "#8b2be2";
    const anchorX = containerW * 0.52;
    const anchorY = containerH * 0.30;
    const pos = spreadPositions(2, 120, containerW, containerH, 288, 260, anchorX, anchorY);
    return (
      <>
        <DragCard key="psych-detail" cardKey="psych-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <PsychDetailCard psychZone={selectedPsychZone} onClose={onClosePsych} />
        </DragCard>
        <DragCard key="psych-gear" cardKey="psych-gear" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
          <GearCard domainId="bio" col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Gate ───────────────────────────────────────────────────────────────────
  const gateCards = (() => {
    if (!selectedGateId) return null;
    const gate = GATES.find((g) => g.id === selectedGateId);
    if (!gate) return null;
    const col = TIER_HEX[gate.tier] ?? "#c9a84c";
    const gearDomain = getGateDomain(selectedGateId);
    const geo = DOMAIN_GEO[gearDomain] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    const pos = spreadPositions(2, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY);
    return (
      <>
        <DragCard key="gate-detail" cardKey="gate-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <GateDetailCard gateId={selectedGateId} onClose={onCloseGate} />
        </DragCard>
        <DragCard key="gate-gear" cardKey="gate-gear" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
          <GearCard domainId={gearDomain} col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── City ───────────────────────────────────────────────────────────────────
  const cityCards = (() => {
    if (selectedCityIdx === null) return null;
    const pos = spreadPositions(1, 100, containerW, containerH, 288, 260, containerW * 0.5, containerH * 0.35);
    return (
      <DragCard key="city-detail" cardKey="city-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
        <CityDetailCard cityIdx={selectedCityIdx} onClose={onCloseCity} />
      </DragCard>
    );
  })();

  // ── Commodity ──────────────────────────────────────────────────────────────
  const commodityCards = (() => {
    if (!selectedCommodityId) return null;
    const col = "#1ae8a0";
    const pos = spreadPositions(1, 100, containerW, containerH, 288, 260, containerW * 0.5, containerH * 0.35);
    return (
      <DragCard key="commodity-detail" cardKey="commodity-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
        <CommodityCard commodityId={selectedCommodityId} onClose={onCloseCommodity} />
      </DragCard>
    );
  })();

  // ── News ───────────────────────────────────────────────────────────────────
  const newsCards = (() => {
    if (!selectedNewsId) return null;
    const pos = spreadPositions(1, 100, containerW, containerH, 288, 260, containerW * 0.5, containerH * 0.35);
    return (
      <DragCard key="news-detail" cardKey="news-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
        <NewsFeedCard newsId={selectedNewsId} onClose={onCloseNews} pins={newsFeedPins} />
      </DragCard>
    );
  })();

  const hasAny = !!(domainId || scenarioId || selectedSignalIdx !== null || selectedPsychZone || selectedGateId || selectedCommodityId || selectedNewsId || selectedCityIdx !== null);

  return (
    <AnimatePresence>
      {hasAny && (
        <>
          {domainCards}
          {scenarioCards}
          {signalCards}
          {psychCards}
          {gateCards}
          {cityCards}
          {commodityCards}
          {newsCards}
        </>
      )}
    </AnimatePresence>
  );
}
