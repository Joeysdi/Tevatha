// lib/watchtower/gate-status.ts
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import type { LivePrices }  from "@/lib/watchtower/prices-fetch";

export type GateStatusLevel = "monitoring" | "warning" | "triggered";

export interface GateStatus {
  id:         string;
  status:     GateStatusLevel;
  confidence: number; // 0–1
  reason:     string; // short human-readable explanation
}

// ── Weights ───────────────────────────────────────────────────────────────────
const TIER_W: Record<string, number> = { t4: 1.0, t3: 0.6, t2: 0.3 };

// Bonus added per pin when any keyword matches in headline + summary
const KEYWORD_BONUS = 0.65;

function statusFromConf(conf: number): GateStatusLevel {
  if (conf >= 0.70) return "triggered";
  if (conf >= 0.30) return "warning";
  return "monitoring";
}

/**
 * Combined category + keyword scorer.
 *
 * Every pin whose category is in `catWeights` contributes a base signal
 * (catWeight × tierWeight), regardless of keywords. If any keyword also
 * matches that pin's headline/summary, an additional KEYWORD_BONUS × tierWeight
 * is added. This means:
 *   - Enough category-relevant pins alone can push a gate to "warning"
 *   - A single strong keyword match on a t4 pin pushes toward "triggered"
 */
function scoreGate(
  pins:       NewsFeedPin[],
  catWeights: Partial<Record<NewsFeedPin["category"], number>>,
  keywords:   string[],
): { confidence: number; matchedHeadline: string; categoryCount: number } {
  let conf = 0;
  let matchedHeadline = "";
  let categoryCount   = 0;

  for (const pin of pins) {
    const base = (catWeights[pin.category] ?? 0);
    if (base === 0) continue;

    const tw = TIER_W[pin.tier] ?? 0.3;
    conf += base * tw;
    categoryCount++;

    // Check keywords on this pin (one bonus per pin max)
    const text = (pin.headline + " " + pin.summary).toLowerCase();
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        conf += KEYWORD_BONUS * tw;
        if (!matchedHeadline) matchedHeadline = pin.headline;
        break;
      }
    }
  }

  return { confidence: Math.min(1, conf), matchedHeadline, categoryCount };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function calcGateStatuses(pins: NewsFeedPin[], prices: LivePrices): GateStatus[] {
  const { vix, tbill } = prices;

  // ── G1 — Any nuclear detonation ───────────────────────────────────────────
  // Low base (nuclear tension ≠ detonation). Needs keyword to warn/trigger.
  const g1 = scoreGate(pins,
    { nuclear: 0.10, war: 0.03 },
    [
      "nuclear detonation", "nuclear explosion", "nuclear strike", "nuclear attack",
      "atomic bomb", "nuclear blast", "mushroom cloud", "warhead detonated",
      "nuclear weapon used", "nuclear weapon fired", "nuclear exchange",
      "nuclear bomb dropped", "nuclear warhead",
    ],
  );
  const g1Status = statusFromConf(g1.confidence);

  // ── G2 — DEFCON 2 / nuclear alert raised ──────────────────────────────────
  // Higher base — two active nuclear crises (Iran + DPRK) + multiple wars
  // legitimately warrant monitoring → warning even without exact phrases.
  const g2 = scoreGate(pins,
    { nuclear: 0.14, war: 0.05 },
    [
      "DEFCON 2", "DEFCON 3", "DEFCON 1", "launch on warning",
      "nuclear alert", "nuclear readiness elevated", "nuclear posture elevated",
      "highest alert", "nuclear standoff", "imminent nuclear", "nuclear war footing",
      "nuclear weapons ready", "nuclear forces raised", "strategic alert",
    ],
  );
  const g2Status = statusFromConf(g2.confidence);

  // ── G3 — NATO Article 5 formally invoked ──────────────────────────────────
  // Multiple active wars provide genuine base signal; invocation needs keyword.
  const g3 = scoreGate(pins,
    { war: 0.07, political: 0.04 },
    [
      "Article 5", "article five", "collective defense invoked",
      "NATO invoked", "NATO Article 5", "NATO war clause",
      "mutual defense triggered", "NATO triggers", "invokes collective defense",
      "collective self-defense", "NATO activation",
    ],
  );
  const g3Status = statusFromConf(g3.confidence);

  // ── G4 — G7 bank bail-in; VIX > 40 adds soft signal ──────────────────────
  const g4 = scoreGate(pins,
    { economic: 0.05, political: 0.02 },
    [
      "bail-in", "bank bail-in", "depositor haircut", "bail in",
      "bank resolution", "deposit freeze", "systemic banking failure",
      "bank failure", "bank run", "bank collapse", "banking crisis",
      "depositor losses", "G7 bank", "financial system collapse",
    ],
  );
  let g4Conf   = g4.confidence;
  let g4Reason = g4.matchedHeadline;
  if (vix.ok && vix.price > 40) {
    g4Conf = Math.min(1, g4Conf + 0.25);
    if (!g4Reason) g4Reason = `VIX at ${vix.price.toFixed(1)} — financial stress threshold >40`;
  }
  const g4Status = statusFromConf(g4Conf);

  // ── G5 — Doomsday Clock at 75s (hardcoded — BAS updates annually) ─────────
  const CLOCK_NOW = 85;       // BAS Jan 2026
  const CLOCK_THRESHOLD = 75;
  const g5: GateStatus = {
    id:         "G5",
    status:     "monitoring",
    confidence: 0,
    reason:     `Current: ${CLOCK_NOW}s · threshold: ${CLOCK_THRESHOLD}s (BAS 2026)`,
  };

  // ── G6 — WHO PHEIC for respiratory pathogen ───────────────────────────────
  // Health category base is meaningful — multiple health crises = warning.
  // Gaza pin (famine/hospital) contributes base but won't hit respiratory keywords.
  const g6 = scoreGate(pins,
    { health: 0.15 },
    [
      "PHEIC", "pandemic declared", "public health emergency",
      "H5N1 human", "respiratory outbreak", "novel coronavirus",
      "influenza pandemic", "WHO declares", "global health emergency",
      "H5N1", "mpox", "MPXV", "bird flu human", "avian influenza human",
      "outbreak declared", "epidemic declared", "novel pathogen",
      "respiratory pathogen", "disease outbreak", "pandemic alert",
      "health emergency declared", "WHO emergency",
    ],
  );
  const g6Status = statusFromConf(g6.confidence);

  // ── G7 — Overnight repo rate >5% (13-week T-bill proxy) ───────────────────
  let g7Status: GateStatusLevel = "monitoring";
  let g7Conf   = 0;
  let g7Reason = tbill.ok
    ? `13-week T-bill: ${tbill.price.toFixed(2)}% (trigger >5.0%)`
    : "Rate data unavailable";
  if (tbill.ok) {
    if (tbill.price > 5.0) {
      g7Status = "triggered"; g7Conf = 1.0;
      g7Reason = `13-week T-bill at ${tbill.price.toFixed(2)}% — above 5.0% trigger`;
    } else if (tbill.price > 4.5) {
      g7Status = "warning"; g7Conf = 0.55;
      g7Reason = `13-week T-bill at ${tbill.price.toFixed(2)}% — approaching 5.0% trigger`;
    }
  }

  // ── G8 — CBDC mandatory adoption timeline announced ───────────────────────
  // Low base — CBDC economic news is common; mandate is the specific trigger.
  const g8 = scoreGate(pins,
    { economic: 0.04, political: 0.05 },
    [
      "CBDC mandatory", "digital currency mandate", "cash ban", "ban cash",
      "digital euro mandatory", "CBDC rollout", "central bank digital currency mandatory",
      "programmable money mandatory", "digital currency law", "cash restrictions",
      "mandatory digital currency", "CBDC legal tender", "ban on cash",
      "digital yuan mandatory", "e-CNY mandatory",
    ],
  );
  const g8Status = statusFromConf(g8.confidence);

  // ── Build reason strings ───────────────────────────────────────────────────
  function reason(
    gs: { matchedHeadline: string; categoryCount: number; confidence: number },
    fallback: string,
    catDesc: string,
  ): string {
    if (gs.matchedHeadline) return gs.matchedHeadline;
    if (gs.categoryCount > 0) return `${gs.categoryCount} active ${catDesc} signal${gs.categoryCount > 1 ? "s" : ""} (${Math.round(gs.confidence * 100)}% aggregate)`;
    return fallback;
  }

  return [
    { id: "G1", status: g1Status, confidence: g1.confidence, reason: reason(g1, "No confirmed detonation signal",    "nuclear/war") },
    { id: "G2", status: g2Status, confidence: g2.confidence, reason: reason(g2, "No DEFCON escalation signal",       "nuclear/war") },
    { id: "G3", status: g3Status, confidence: g3.confidence, reason: reason(g3, "No Article 5 invocation signal",    "war/political") },
    { id: "G4", status: g4Status, confidence: g4Conf,        reason: g4Reason || reason(g4, "No bail-in signal",     "economic") },
    g5,
    { id: "G6", status: g6Status, confidence: g6.confidence, reason: reason(g6, "No active PHEIC signal",            "health") },
    { id: "G7", status: g7Status, confidence: g7Conf,        reason: g7Reason },
    { id: "G8", status: g8Status, confidence: g8.confidence, reason: reason(g8, "No CBDC mandate signal",            "economic/political") },
  ];
}
