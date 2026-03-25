// components/watchtower/globe-info-cards.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { RefObject } from "react";
import { DOMAINS, SIGNALS, SCENARIOS, PSYCH_PILLARS, GEAR, GATES } from "@/lib/watchtower/data";

// ── Domain-to-gear category mapping ─────────────────────────────────────────
const DOMAIN_GEAR_CATS: Record<string, string[]> = {
  nuclear:  ["Communications", "Energy"],
  cyber:    ["Communications", "Energy"],
  civil:    ["Communications", "Mobility"],
  economic: ["Medical", "Energy"],
  bio:      ["Medical"],
  climate:  ["Energy", "Medical"],
};

// ── Domain-to-gate mapping ───────────────────────────────────────────────────
const DOMAIN_GATES: Record<string, string[]> = {
  nuclear:  ["G1", "G2", "G5"],
  cyber:    ["G2", "G3"],
  civil:    ["G3", "G2"],
  economic: ["G4", "G7", "G8"],
  bio:      ["G6"],
  climate:  ["G6"],
};

// ── Scenario domain mapping ──────────────────────────────────────────────────
const SCENARIO_DOMAIN: Record<string, string> = {
  S01: "economic", S03: "economic", S05: "cyber",
  S07: "civil",    S09: "civil",    S10: "bio",
};

// ── Signal domain name → domain id ──────────────────────────────────────────
const SIGNAL_DOMAIN_ID: Record<string, string> = {
  Nuclear: "nuclear", Cyber: "cyber", Economic: "economic",
  Geopolitical: "civil", Biological: "bio", Climate: "climate",
};

// ── Geographic anchors — screen positions for default globe view (lat:20,lng:15)
// xPct/yPct = where the primary affected region appears on screen
// angle = fan direction (degrees, 0=right, 90=down) — opens cards toward globe center
const DOMAIN_GEO: Record<string, { xPct: number; yPct: number; angle: number }> = {
  nuclear:  { xPct: 0.74, yPct: 0.20, angle: 210 }, // Russia + N. Korea — upper right → fan lower-left
  cyber:    { xPct: 0.22, yPct: 0.28, angle:  30 }, // USA (left face) — fan lower-right
  civil:    { xPct: 0.64, yPct: 0.38, angle: 185 }, // Middle East / Taiwan — fan left
  economic: { xPct: 0.50, yPct: 0.16, angle: 100 }, // US + EU (top center) — fan downward
  bio:      { xPct: 0.56, yPct: 0.58, angle: 280 }, // Africa + SE Asia — fan upward
  climate:  { xPct: 0.44, yPct: 0.10, angle: 105 }, // Arctic (top) — fan downward
};

const TIER_HEX: Record<string, string> = {
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8", t1: "#1ae8a0",
};

const DOMAIN_COLORS: Record<string, string> = {
  nuclear: "#e84040", cyber: "#00d4ff", civil: "#f0a500",
  economic: "#c9a84c", bio: "#1ae8a0", climate: "#38bdf8",
};

// ── Domain voice scripts ──────────────────────────────────────────────────────
const DOMAIN_VOICE: Record<string, string> = {
  nuclear:
    "Nuclear and EMP threat: Critical. 93 out of 100. " +
    "New START expired February 2026. No nuclear arms control treaty is in force " +
    "for the first time in over 50 years. The Doomsday Clock stands at 85 seconds to midnight — " +
    "an all-time record. China, Russia, North Korea, and four other states are simultaneously " +
    "expanding their arsenals. Russia has lowered its nuclear use threshold to any critical threat " +
    "to sovereignty. Head to the Tevatha store and build your essential gear now.",

  cyber:
    "Cyber and technology threat: Critical. 85 out of 100. " +
    "Salt Typhoon has confirmed persistent access inside nine or more major US telecoms. " +
    "The FBI confirms this campaign is still ongoing. Volt Typhoon is pre-positioned inside " +
    "US power grids and water systems for wartime activation — not espionage, disruption. " +
    "A grid-down event would cut food distribution within 72 hours, water pumping within 96. " +
    "Build your communications and power resilience at the Tevatha store.",

  civil:
    "Civil and political threat: High. 78 out of 100. " +
    "China conducted its most extensive Taiwan blockade drills ever in December 2025. " +
    "The Council on Foreign Relations rates a 2026 Taiwan Strait crisis at even money. " +
    "Iran is three weeks from weapons-grade uranium capability. Sudan is the world's largest " +
    "displacement crisis. Political scientists assess a 30 to 35 percent probability of active " +
    "civil violence in the United States through 2026. Prepare now at the Tevatha store.",

  economic:
    "Economic threat: High. 76 out of 100. " +
    "US national debt stands at 38.4 trillion dollars, growing 8 billion dollars every day. " +
    "Interest payments now consume 20 percent of all federal revenue. " +
    "Trump's 2025 tariff regime is the largest US tax increase as a percent of GDP since 1993. " +
    "137 nations are rolling out programmable central bank digital currencies — " +
    "money that can be blocked, expired, or restricted. " +
    "Secure your financial sovereignty at the Tevatha store.",

  bio:
    "Biological threat: High. 74 out of 100. " +
    "H5N1 avian influenza is described by scientists as completely out of control in animal reservoirs. " +
    "There are 70 confirmed US human cases. Its historical fatality rate is approximately 48 percent. " +
    "A novel recombinant Mpox strain combining two clade genomes was detected in India, January 2026, " +
    "with a 3 to 4 percent fatality rate. " +
    "Any pathogen achieving sustained human-to-human transmission collapses health systems " +
    "within 8 weeks. Get your medical kit at the Tevatha store now.",

  climate:
    "Climate threat: Elevated. 69 out of 100. " +
    "2024 was the hottest year ever recorded — the first calendar year to exceed " +
    "1.55 degrees Celsius above pre-industrial levels. Arctic sea ice volume is at a record low, " +
    "approximately 20 percent below 2024 levels. 96 million people face acute food insecurity, " +
    "triple the number from 2020. 2.4 billion live in water-stressed countries. " +
    "Climate cascades amplify every other threat vector. " +
    "Build your resilience at the Tevatha store.",
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
  domainId, col, onClose,
}: {
  domainId: string;
  col: string;
  onClose: () => void;
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

// ── Gear card ─────────────────────────────────────────────────────────────────
function GearCard({
  domainId, col, onOpenShop,
}: {
  domainId: string;
  col: string;
  onOpenShop: () => void;
}) {
  const items = getDomainGear(domainId);
  return (
    <Frame col={col}>
      <div className="px-4 py-3.5">
        <SectionLabel text="⚙ Critical Gear" col={col} />
        {items.length === 0 ? (
          <p className="font-mono text-[9px] text-text-mute2 mb-3">No critical items mapped.</p>
        ) : (
          <div className="space-y-2 mb-3.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-[7px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0 mt-0.5">
                  {item.tier}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] text-text-base truncate">{item.name}</p>
                  <p className="font-mono text-[7.5px] text-text-mute2 leading-snug line-clamp-1">{item.spec}</p>
                </div>
                <span className="font-mono text-[8px] text-gold-protocol flex-shrink-0 tabular-nums">{item.price}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onOpenShop(); }}
          className="w-full font-mono text-[9px] font-bold py-2 rounded-lg border border-gold-dim
                     bg-gold-glow text-gold-bright hover:-translate-y-px
                     hover:shadow-[0_4px_16px_rgba(201,168,76,0.25)] transition-all duration-150"
        >
          Browse in Shop →
        </button>
      </div>
    </Frame>
  );
}

// ── Scenario cards ────────────────────────────────────────────────────────────
function ScenarioOverviewCard({
  scenarioId, col, onClose,
}: {
  scenarioId: string;
  col: string;
  onClose: () => void;
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
  signalIdx, col, onClose,
}: {
  signalIdx: number;
  col: string;
  onClose: () => void;
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
}

export function GlobeInfoCards({
  containerRef, containerW, containerH,
  domainId, scenarioId, selectedSignalIdx, selectedPsychZone, selectedGateId,
  onCloseDomain, onCloseScenario, onCloseSignal, onClosePsych, onCloseGate,
  onOpenShop,
}: GlobeInfoCardsProps) {
  // ── Card registry for real-time repulsion ─────────────────────────────────
  const registryRef = useRef<Map<string, RegistryEntry>>(new Map());
  const CARD_W = 288, CARD_H = 260, PAD = 18;

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
          entry.x.set(entry.x.get() + sign * Math.min(overlapX / 2 + 2, 22));
        } else {
          const sign = ey >= my ? 1 : -1;
          entry.y.set(entry.y.get() + sign * Math.min(overlapY / 2 + 2, 22));
        }
      }
    }
  }, [CARD_W, CARD_H, PAD]);

  // Shorthand so every DragCard gets the same three callbacks
  const dragProps = { onRegister: registerCard, onUnregister: unregisterCard, onCardDrag: handleCardDrag };

  // ── Domain ─────────────────────────────────────────────────────────────────
  const domainCards = (() => {
    if (!domainId) return null;
    const col = DOMAIN_COLORS[domainId] ?? "#c9a84c";
    const geo = DOMAIN_GEO[domainId] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    const hasGates = (DOMAIN_GATES[domainId] ?? []).length > 0;
    const n = hasGates ? 3 : 2;
    const pos = spreadPositions(n, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY);
    return (
      <>
        <DragCard key="domain-info" cardKey="domain-info" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <DomainInfoCard domainId={domainId} col={col} onClose={onCloseDomain} />
        </DragCard>
        {hasGates && (
          <DragCard key="domain-gates" cardKey="domain-gates" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
            <DomainGatesCard domainId={domainId} col={col} />
          </DragCard>
        )}
        <DragCard key="domain-gear" cardKey="domain-gear" initX={pos[n - 1].x} initY={pos[n - 1].y} containerRef={containerRef} {...dragProps}>
          <GearCard domainId={domainId} col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Scenario ───────────────────────────────────────────────────────────────
  const scenarioCards = (() => {
    if (!scenarioId) return null;
    const sc = SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return null;
    const col = "#e84040";
    const gearDomain = SCENARIO_DOMAIN[scenarioId] ?? "cyber";
    const geo = DOMAIN_GEO[gearDomain] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    const pos = spreadPositions(3, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY);
    return (
      <>
        <DragCard key="sc-overview" cardKey="sc-overview" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <ScenarioOverviewCard scenarioId={scenarioId} col={col} onClose={onCloseScenario} />
        </DragCard>
        <DragCard key="sc-mitigation" cardKey="sc-mitigation" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
          <ScenarioMitigationCard scenarioId={scenarioId} col={col} />
        </DragCard>
        <DragCard key="sc-gear" cardKey="sc-gear" initX={pos[2].x} initY={pos[2].y} containerRef={containerRef} {...dragProps}>
          <GearCard domainId={gearDomain} col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Signal ─────────────────────────────────────────────────────────────────
  const signalCards = (() => {
    if (selectedSignalIdx === null || !SIGNALS[selectedSignalIdx]) return null;
    const sig = SIGNALS[selectedSignalIdx];
    const domId = SIGNAL_DOMAIN_ID[sig.domain] ?? "cyber";
    const col = DOMAIN_COLORS[domId] ?? "#c9a84c";
    const geo = DOMAIN_GEO[domId] ?? { xPct: 0.5, yPct: 0.5, angle: 100 };
    const anchorX = geo.xPct * containerW;
    const anchorY = geo.yPct * containerH;
    const hasGate = (DOMAIN_GATES[domId] ?? []).length > 0;
    const n = hasGate ? 3 : 2;
    const pos = spreadPositions(n, geo.angle, containerW, containerH, 288, 260, anchorX, anchorY);
    return (
      <>
        <DragCard key="sig-detail" cardKey="sig-detail" initX={pos[0].x} initY={pos[0].y} containerRef={containerRef} {...dragProps}>
          <SignalDetailCard signalIdx={selectedSignalIdx} col={col} onClose={onCloseSignal} />
        </DragCard>
        {hasGate && (
          <DragCard key="sig-gate" cardKey="sig-gate" initX={pos[1].x} initY={pos[1].y} containerRef={containerRef} {...dragProps}>
            <SignalGateCard signalIdx={selectedSignalIdx} col={col} />
          </DragCard>
        )}
        <DragCard key="sig-gear" cardKey="sig-gear" initX={pos[n - 1].x} initY={pos[n - 1].y} containerRef={containerRef} {...dragProps}>
          <GearCard domainId={domId} col={col} onOpenShop={onOpenShop} />
        </DragCard>
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

  const hasAny = !!(domainId || scenarioId || selectedSignalIdx !== null || selectedPsychZone || selectedGateId);

  return (
    <AnimatePresence>
      {hasAny && (
        <>
          {domainCards}
          {scenarioCards}
          {signalCards}
          {psychCards}
          {gateCards}
        </>
      )}
    </AnimatePresence>
  );
}
