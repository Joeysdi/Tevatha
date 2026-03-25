// components/watchtower/globe-info-cards.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
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

// ── Scenario domain mapping (for gear lookup) ────────────────────────────────
const SCENARIO_DOMAIN: Record<string, string> = {
  S01: "economic", S03: "economic", S05: "cyber",
  S07: "civil",    S09: "civil",    S10: "bio",
};

// ── Signal domain name → domain id ──────────────────────────────────────────
const SIGNAL_DOMAIN_ID: Record<string, string> = {
  Nuclear: "nuclear", Cyber: "cyber", Economic: "economic",
  Geopolitical: "civil", Biological: "bio", Climate: "climate",
};

// ── Start angles for card spread (domain-geography-inspired) ─────────────────
const DOMAIN_ANGLE: Record<string, number> = {
  nuclear: -55, cyber: -80, civil: -15,
  economic: 15, bio: 90,   climate: 125,
};

const TIER_HEX: Record<string, string> = {
  t4: "#e84040", t3: "#f0a500", t2: "#38bdf8", t1: "#1ae8a0",
};

const DOMAIN_COLORS: Record<string, string> = {
  nuclear: "#e84040", cyber: "#00d4ff", civil: "#f0a500",
  economic: "#c9a84c", bio: "#1ae8a0", climate: "#38bdf8",
};

// ── Spread positions ──────────────────────────────────────────────────────────
function spreadPositions(
  n: number,
  startAngle: number,
  containerW: number,
  containerH: number,
  cardW = 272,
  cardH = 230,
) {
  const cx = containerW / 2;
  const cy = containerH / 2;
  const radius = Math.min(containerW, containerH) * 0.31;
  const totalSpread = n <= 1 ? 0 : 80;
  const step = n <= 1 ? 0 : totalSpread / (n - 1);
  const offset = -totalSpread / 2;
  return Array.from({ length: n }, (_, i) => {
    const deg = startAngle + offset + i * step;
    const rad = (deg * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad) - cardW / 2;
    const y = cy + radius * Math.sin(rad) - cardH / 2;
    return {
      x: Math.max(6, Math.min(containerW - cardW - 6, x)),
      y: Math.max(6, Math.min(containerH - cardH - 6, y)),
    };
  });
}

// ── Helper: get gear items for a domain ──────────────────────────────────────
function getDomainGear(domainId: string, limit = 4) {
  const cats = DOMAIN_GEAR_CATS[domainId] ?? [];
  return GEAR
    .filter((c) => cats.includes(c.cat))
    .flatMap((c) => c.items.filter((i) => i.critical))
    .slice(0, limit);
}

// ── Drag card shell ───────────────────────────────────────────────────────────
function DragCard({
  x, y, containerRef, width = 272, children,
}: {
  x: number;
  y: number;
  containerRef: RefObject<HTMLElement>;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.04}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ position: "absolute", left: x, top: y, width, zIndex: 25, userSelect: "none", touchAction: "none" }}
      whileDrag={{ zIndex: 30 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

// ── Visual card frame ─────────────────────────────────────────────────────────
function Frame({ col, children }: { col: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden backdrop-blur-md"
      style={{
        background: "rgba(6,7,14,0.96)",
        border: `1px solid ${col}44`,
        borderLeft: `2px solid ${col}`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 20px ${col}08`,
        cursor: "grab",
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg,${col},transparent)` }} />
      {children}
    </div>
  );
}

// ── Gear card (shared) ────────────────────────────────────────────────────────
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
      <div className="px-3.5 py-3">
        <p className="font-mono text-[7px] tracking-[.18em] uppercase mb-2" style={{ color: col }}>
          ⚙ CRITICAL GEAR
        </p>
        {items.length === 0 ? (
          <p className="font-mono text-[8px] text-text-mute2 mb-3">No critical items mapped.</p>
        ) : (
          <div className="space-y-1.5 mb-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[6.5px] px-1 py-0.5 rounded border border-border-protocol bg-void-3 text-text-mute2 flex-shrink-0">
                  {item.tier}
                </span>
                <span className="font-mono text-[8px] text-text-base flex-1 min-w-0 truncate">{item.name}</span>
                <span className="font-mono text-[7.5px] text-gold-protocol flex-shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onOpenShop(); }}
          className="w-full font-mono text-[8px] font-bold py-1.5 rounded-lg border border-gold-dim
                     bg-gold-glow text-gold-bright hover:-translate-y-px
                     hover:shadow-[0_4px_12px_rgba(201,168,76,0.25)] transition-all duration-150"
        >
          Browse in Shop →
        </button>
      </div>
    </Frame>
  );
}

// ── Domain cards ──────────────────────────────────────────────────────────────
function DomainInfoCard({
  domainId, col, onClose,
}: {
  domainId: string;
  col: string;
  onClose: () => void;
}) {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) return null;
  return (
    <Frame col={col}>
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[16px] leading-none">{domain.icon}</span>
            <div>
              <p className="font-mono text-[7px] tracking-[.16em] uppercase mb-0.5" style={{ color: col }}>
                ARK SCORE · {domain.score} · {domain.trend}
              </p>
              <p className="font-syne font-bold text-[13px] text-text-base leading-none">{domain.label}</p>
            </div>
            <span
              className="font-mono text-[6.5px] px-1.5 py-0.5 rounded border font-bold flex-shrink-0"
              style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
            >
              {domain.level}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center"
          >✕</button>
        </div>
        <p className="font-mono text-[8.5px] text-text-dim leading-relaxed mb-2.5 line-clamp-3">{domain.summary}</p>
        <div className="space-y-1">
          {domain.drivers.slice(0, 2).map((drv, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="font-mono text-[8px] flex-shrink-0 mt-0.5" style={{ color: col }}>→</span>
              <p className="font-mono text-[7.5px] text-text-mute2 leading-snug line-clamp-2">{drv}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function DomainGatesCard({ domainId, col }: { domainId: string; col: string }) {
  const gateIds = DOMAIN_GATES[domainId] ?? [];
  const gates = GATES.filter((g) => gateIds.includes(g.id));
  if (gates.length === 0) return null;
  return (
    <Frame col={col}>
      <div className="px-3.5 py-3">
        <p className="font-mono text-[7px] tracking-[.18em] uppercase mb-2.5" style={{ color: col }}>
          🔑 DECISION GATES
        </p>
        <div className="space-y-2">
          {gates.map((gate) => {
            const gc = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div key={gate.id} className="border-b last:border-b-0 pb-2 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-mono text-[6.5px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}
                  >
                    {gate.id} · {gate.tier.toUpperCase()}
                  </span>
                  <span className="font-mono text-[7px] text-text-mute2/60">{gate.window}</span>
                </div>
                <p className="font-mono text-[7.5px] text-text-mute2 leading-snug">{gate.trigger}</p>
                <p className="font-mono text-[7px] font-bold mt-0.5 leading-snug" style={{ color: gc }}>{gate.action}</p>
              </div>
            );
          })}
        </div>
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
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[16px] leading-none">{sc.icon}</span>
            <div>
              <p className="font-mono text-[7px] tracking-[.16em] uppercase mb-0.5" style={{ color: col }}>
                {sc.prob}% PROB · {sc.window}
              </p>
              <p className="font-syne font-bold text-[13px] text-text-base leading-none">{sc.title}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center"
          >✕</button>
        </div>
        <p className="font-mono text-[8.5px] text-text-dim leading-relaxed line-clamp-4">{sc.summary}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {sc.cascade.slice(0, 3).map((c, i) => (
            <span key={i} className="font-mono text-[7px] px-1.5 py-0.5 rounded border border-amber-DEFAULT/25 bg-amber-dim text-amber-protocol">{c}</span>
          ))}
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
      <div className="px-3.5 py-3">
        <p className="font-mono text-[7px] tracking-[.16em] uppercase mb-2" style={{ color: col }}>
          🛡 TRIGGERS + MITIGATION
        </p>
        <div className="space-y-1 mb-2.5">
          {sc.triggers.slice(0, 2).map((tr, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="font-mono text-[8px] flex-shrink-0 mt-0.5" style={{ color: col }}>→</span>
              <p className="font-mono text-[7.5px] text-text-mute2 leading-snug line-clamp-2">{tr}</p>
            </div>
          ))}
        </div>
        <div className="border-t pt-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="font-mono text-[6.5px] tracking-[.12em] uppercase text-green-protocol/60 mb-1.5">P1 Actions</p>
          <div className="space-y-1">
            {sc.mitigation.filter((m) => m.pri === "1").slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="font-mono text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                      style={{ color: "#e84040", background: "rgba(232,64,64,0.1)" }}>P1</span>
                <div>
                  <p className="font-mono text-[7.5px] text-text-dim leading-snug">{m.action}</p>
                  <p className="font-mono text-[7px] text-text-mute2">{m.cost}</p>
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
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold flex-shrink-0
                ${sig.tier === "t4" ? "text-red-bright border-red-protocol/40 bg-red-protocol/10"
                  : sig.tier === "t3" ? "text-amber-protocol border-amber-DEFAULT/30 bg-amber-dim"
                  : "text-blue-DEFAULT border-blue-DEFAULT/30 bg-blue-dim"}`}
            >
              {sig.tier.toUpperCase()}
            </span>
            <p className="font-mono text-[7px] tracking-[.12em] uppercase text-text-mute2">
              {sig.domain} · {sig.score}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center"
          >✕</button>
        </div>
        <p className="font-mono text-[8.5px] text-text-base leading-relaxed mb-2 line-clamp-4">{sig.sig}</p>
        <a
          href={sig.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="font-mono text-[7.5px] text-text-mute2/60 hover:text-amber-protocol/70 transition-colors"
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
      <div className="px-3.5 py-3">
        <p className="font-mono text-[7px] tracking-[.18em] uppercase mb-2.5" style={{ color: col }}>
          🔑 RELATED GATES
        </p>
        <div className="space-y-2">
          {gates.map((gate) => {
            const gc = TIER_HEX[gate.tier] ?? "#c9a84c";
            return (
              <div key={gate.id}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-mono text-[6.5px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
                    style={{ color: gc, borderColor: `${gc}40`, background: `${gc}15` }}
                  >
                    {gate.id}
                  </span>
                  <span className="font-mono text-[7px] text-text-mute2/60">{gate.window}</span>
                </div>
                <p className="font-mono text-[7.5px] text-text-mute2 leading-snug">{gate.trigger}</p>
                <p className="font-mono text-[7px] font-bold mt-0.5" style={{ color: gc }}>{gate.action}</p>
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
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-mono text-[7px] tracking-[.14em] uppercase text-purple-300/70 mb-0.5">🧠 PSYCH THREAT</p>
            <p className="font-syne font-bold text-[13px] text-text-base leading-none">{psychZone.region}</p>
            <p className="font-mono text-[8px] text-purple-300 mt-0.5">{psychZone.threat}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center"
          >✕</button>
        </div>
        <p className="font-mono text-[8.5px] text-text-dim leading-relaxed mb-2.5 line-clamp-3">{psychZone.note}</p>
        <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="font-mono text-[6.5px] tracking-[.12em] uppercase text-purple-300/60 mb-1.5">Ark Response</p>
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
    </Frame>
  );
}

// ── Gate cards ────────────────────────────────────────────────────────────────
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
      <div className="px-3.5 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[7px] px-1.5 py-0.5 rounded border font-bold"
              style={{ color: col, borderColor: `${col}40`, background: `${col}15` }}
            >
              {gate.id} · {gate.tier.toUpperCase()}
            </span>
            <span className="font-mono text-[7px] text-text-mute2">{gate.window}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center"
          >✕</button>
        </div>
        <p className="font-mono text-[7px] tracking-[.1em] uppercase mb-1.5" style={{ color: col }}>TRIGGER</p>
        <p className="font-mono text-[9px] text-text-base leading-relaxed mb-2.5">{gate.trigger}</p>
        <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="font-mono text-[7px] tracking-[.1em] uppercase text-text-mute2 mb-1">Action</p>
          <p className="font-mono text-[9px] font-bold leading-relaxed" style={{ color: col }}>{gate.action}</p>
        </div>
      </div>
    </Frame>
  );
}

// ── Gate domain lookup (for gear card) ───────────────────────────────────────
function getGateDomain(gateId: string): string {
  for (const [domain, gateIds] of Object.entries(DOMAIN_GATES)) {
    if (gateIds.includes(gateId)) return domain;
  }
  return "cyber";
}

// ── Main component ────────────────────────────────────────────────────────────

interface GlobeInfoCardsProps {
  containerRef:     RefObject<HTMLElement>;
  containerW:       number;
  containerH:       number;
  // Active modes
  domainId:         string | null;
  scenarioId:       string | null;
  selectedSignalIdx: number | null;
  selectedPsychZone: { region: string; threat: string; note: string } | null;
  selectedGateId:   string | null;
  // Dismiss callbacks
  onCloseDomain:    () => void;
  onCloseScenario:  () => void;
  onCloseSignal:    () => void;
  onClosePsych:     () => void;
  onCloseGate:      () => void;
  // Shop
  onOpenShop:       () => void;
}

export function GlobeInfoCards({
  containerRef, containerW, containerH,
  domainId, scenarioId, selectedSignalIdx, selectedPsychZone, selectedGateId,
  onCloseDomain, onCloseScenario, onCloseSignal, onClosePsych, onCloseGate,
  onOpenShop,
}: GlobeInfoCardsProps) {

  // ── Domain cards ───────────────────────────────────────────────────────────
  const domainCards = (() => {
    if (!domainId) return null;
    const col = DOMAIN_COLORS[domainId] ?? "#c9a84c";
    const angle = DOMAIN_ANGLE[domainId] ?? -45;
    const hasGates = (DOMAIN_GATES[domainId] ?? []).length > 0;
    const n = hasGates ? 3 : 2;
    const pos = spreadPositions(n, angle, containerW, containerH);
    return (
      <>
        <DragCard key="domain-info" x={pos[0].x} y={pos[0].y} containerRef={containerRef}>
          <DomainInfoCard domainId={domainId} col={col} onClose={onCloseDomain} />
        </DragCard>
        {hasGates && (
          <DragCard key="domain-gates" x={pos[1].x} y={pos[1].y} containerRef={containerRef}>
            <DomainGatesCard domainId={domainId} col={col} />
          </DragCard>
        )}
        <DragCard key="domain-gear" x={pos[n - 1].x} y={pos[n - 1].y} containerRef={containerRef}>
          <GearCard domainId={domainId} col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Scenario cards ─────────────────────────────────────────────────────────
  const scenarioCards = (() => {
    if (!scenarioId) return null;
    const col = "#e84040";
    const sc = SCENARIOS.find((s) => s.id === scenarioId);
    if (!sc) return null;
    const gearDomain = SCENARIO_DOMAIN[scenarioId] ?? "cyber";
    const pos = spreadPositions(3, -40, containerW, containerH);
    return (
      <>
        <DragCard key="sc-overview" x={pos[0].x} y={pos[0].y} containerRef={containerRef}>
          <ScenarioOverviewCard scenarioId={scenarioId} col={col} onClose={onCloseScenario} />
        </DragCard>
        <DragCard key="sc-mitigation" x={pos[1].x} y={pos[1].y} containerRef={containerRef}>
          <ScenarioMitigationCard scenarioId={scenarioId} col={col} />
        </DragCard>
        <DragCard key="sc-gear" x={pos[2].x} y={pos[2].y} containerRef={containerRef}>
          <GearCard domainId={gearDomain} col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Signal cards ───────────────────────────────────────────────────────────
  const signalCards = (() => {
    if (selectedSignalIdx === null || !SIGNALS[selectedSignalIdx]) return null;
    const sig = SIGNALS[selectedSignalIdx];
    const domId = SIGNAL_DOMAIN_ID[sig.domain] ?? "cyber";
    const col = DOMAIN_COLORS[domId] ?? "#c9a84c";
    const angle = DOMAIN_ANGLE[domId] ?? -60;
    const hasGate = (DOMAIN_GATES[domId] ?? []).length > 0;
    const n = hasGate ? 3 : 2;
    const pos = spreadPositions(n, angle, containerW, containerH);
    return (
      <>
        <DragCard key="sig-detail" x={pos[0].x} y={pos[0].y} containerRef={containerRef}>
          <SignalDetailCard signalIdx={selectedSignalIdx} col={col} onClose={onCloseSignal} />
        </DragCard>
        {hasGate && (
          <DragCard key="sig-gate" x={pos[1].x} y={pos[1].y} containerRef={containerRef}>
            <SignalGateCard signalIdx={selectedSignalIdx} col={col} />
          </DragCard>
        )}
        <DragCard key="sig-gear" x={pos[n - 1].x} y={pos[n - 1].y} containerRef={containerRef}>
          <GearCard domainId={domId} col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Psych cards ────────────────────────────────────────────────────────────
  const psychCards = (() => {
    if (!selectedPsychZone) return null;
    const col = "#8b2be2";
    const pos = spreadPositions(2, 160, containerW, containerH);
    return (
      <>
        <DragCard key="psych-detail" x={pos[0].x} y={pos[0].y} containerRef={containerRef}>
          <PsychDetailCard psychZone={selectedPsychZone} onClose={onClosePsych} />
        </DragCard>
        <DragCard key="psych-gear" x={pos[1].x} y={pos[1].y} containerRef={containerRef}>
          <GearCard domainId="bio" col={col} onOpenShop={onOpenShop} />
        </DragCard>
      </>
    );
  })();

  // ── Gate cards ─────────────────────────────────────────────────────────────
  const gateCards = (() => {
    if (!selectedGateId) return null;
    const gate = GATES.find((g) => g.id === selectedGateId);
    if (!gate) return null;
    const col = TIER_HEX[gate.tier] ?? "#c9a84c";
    const gearDomain = getGateDomain(selectedGateId);
    const pos = spreadPositions(2, -60, containerW, containerH);
    return (
      <>
        <DragCard key="gate-detail" x={pos[0].x} y={pos[0].y} containerRef={containerRef}>
          <GateDetailCard gateId={selectedGateId} onClose={onCloseGate} />
        </DragCard>
        <DragCard key="gate-gear" x={pos[1].x} y={pos[1].y} containerRef={containerRef}>
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
