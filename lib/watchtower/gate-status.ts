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

// ── Tier weights (same as domain-score) ──────────────────────────────────────
const TIER_W: Record<string, number> = { t4: 1.0, t3: 0.6, t2: 0.3 };

function statusFromConf(conf: number): GateStatusLevel {
  if (conf >= 0.70) return "triggered";
  if (conf >= 0.30) return "warning";
  return "monitoring";
}

// keyword_strength: exact phrase in headline → 1.0; partial word match → 0.5
function scanPins(
  pins:     NewsFeedPin[],
  cats:     NewsFeedPin["category"][],
  keywords: string[],
): { confidence: number; matchedHeadline: string } {
  const catSet = new Set(cats);
  let conf = 0;
  let matchedHeadline = "";

  for (const pin of pins) {
    if (!catSet.has(pin.category)) continue;
    const text = (pin.headline + " " + pin.summary).toLowerCase();
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        const contrib = (TIER_W[pin.tier] ?? 0.3) * 1.0;
        conf += contrib;
        if (!matchedHeadline) matchedHeadline = pin.headline;
        break; // one match per pin per gate
      }
    }
  }

  return { confidence: Math.min(1, conf), matchedHeadline };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function calcGateStatuses(pins: NewsFeedPin[], prices: LivePrices): GateStatus[] {
  const { vix, tbill } = prices;

  // G1 — Nuclear detonation
  const g1 = scanPins(pins, ["war", "nuclear"], [
    "nuclear detonation", "nuclear explosion", "nuclear strike",
    "atomic bomb", "nuclear blast", "mushroom cloud",
  ]);
  const g1Status = statusFromConf(g1.confidence);

  // G2 — DEFCON 2 / nuclear alert
  const g2 = scanPins(pins, ["war", "nuclear"], [
    "DEFCON 2", "DEFCON 3", "launch on warning",
    "nuclear alert", "nuclear readiness", "nuclear posture elevated",
  ]);
  const g2Status = statusFromConf(g2.confidence);

  // G3 — NATO Article 5
  const g3 = scanPins(pins, ["war", "political"], [
    "Article 5", "article five", "collective defense invoked",
    "NATO invoked", "NATO Article 5",
  ]);
  const g3Status = statusFromConf(g3.confidence);

  // G4 — Bank bail-in; VIX > 40 adds soft signal
  const g4 = scanPins(pins, ["economic"], [
    "bail-in", "bank bail-in", "depositor haircut",
    "bail in", "bank resolution", "deposit freeze",
  ]);
  let g4Conf = g4.confidence;
  let g4Reason = g4.matchedHeadline;
  if (vix.ok && vix.price > 40) {
    g4Conf = Math.min(1, g4Conf + 0.25);
    if (!g4Reason) g4Reason = `VIX at ${vix.price.toFixed(1)} (stress threshold >40)`;
  }
  const g4Status = statusFromConf(g4Conf);

  // G5 — Doomsday Clock 75s (hardcoded — BAS updates annually)
  const CLOCK_NOW = 85; // seconds — BAS Jan 2026
  const CLOCK_THRESHOLD = 75;
  const g5: GateStatus = {
    id:         "G5",
    status:     "monitoring",
    confidence: 0,
    reason:     `Current: ${CLOCK_NOW}s · threshold: ${CLOCK_THRESHOLD}s (BAS 2026)`,
  };

  // G6 — WHO PHEIC / respiratory outbreak
  const g6 = scanPins(pins, ["health"], [
    "PHEIC", "pandemic declared", "public health emergency",
    "H5N1 human", "respiratory outbreak", "novel coronavirus",
    "influenza pandemic", "WHO declares", "global health emergency",
    "H5N1", "mpox", "MPXV",
  ]);
  const g6Status = statusFromConf(g6.confidence);

  // G7 — Overnight repo rate (13-week T-bill proxy)
  let g7Status: GateStatusLevel = "monitoring";
  let g7Conf = 0;
  let g7Reason = tbill.ok
    ? `13-week T-bill: ${tbill.price.toFixed(2)}% (trigger >5.0%)`
    : "Rate data unavailable";
  if (tbill.ok) {
    if (tbill.price > 5.0)      { g7Status = "triggered"; g7Conf = 1.0;  g7Reason = `13-week T-bill at ${tbill.price.toFixed(2)}% — above 5.0% trigger`; }
    else if (tbill.price > 4.5) { g7Status = "warning";   g7Conf = 0.55; g7Reason = `13-week T-bill at ${tbill.price.toFixed(2)}% — approaching 5.0% trigger`; }
  }

  // G8 — CBDC mandatory adoption
  const g8 = scanPins(pins, ["economic", "political"], [
    "CBDC mandatory", "digital currency mandate", "cash ban",
    "ban cash", "digital euro mandatory", "CBDC rollout",
    "mandatory digital", "programmable money",
  ]);
  const g8Status = statusFromConf(g8.confidence);

  return [
    { id: "G1", status: g1Status, confidence: g1.confidence, reason: g1.matchedHeadline || "No confirmed detonation signal" },
    { id: "G2", status: g2Status, confidence: g2.confidence, reason: g2.matchedHeadline || "No DEFCON escalation signal" },
    { id: "G3", status: g3Status, confidence: g3.confidence, reason: g3.matchedHeadline || "No Article 5 invocation signal" },
    { id: "G4", status: g4Status, confidence: g4Conf,        reason: g4Reason           || "No bail-in signal" },
    g5,
    { id: "G6", status: g6Status, confidence: g6.confidence, reason: g6.matchedHeadline || "No active PHEIC signal" },
    { id: "G7", status: g7Status, confidence: g7Conf,        reason: g7Reason },
    { id: "G8", status: g8Status, confidence: g8.confidence, reason: g8.matchedHeadline || "No CBDC mandate signal" },
  ];
}
