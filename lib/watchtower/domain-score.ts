// lib/watchtower/domain-score.ts
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import type { LivePrices }  from "@/lib/watchtower/prices-fetch";
import { ANCHORS }          from "@/lib/watchtower/score-anchors";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubIndex {
  label:        string;
  score:        number;  // 0–100
  weight:       number;  // 0.0–1.0; all sub-indices in a domain sum to 1.0
  contribution: number;  // Math.round(score × weight)
  source:       string;  // primary data source(s) for transparency
}

export interface DomainScore {
  live:       number;
  base:       number;
  delta:      number;
  subIndices: SubIndex[];
}

export interface DomainScores {
  geopolitical:  DomainScore;
  economic:      DomainScore;
  environmental: DomainScore;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Sum tier-weighted news pins matching the given categories. */
function pinSignal(
  pins: NewsFeedPin[],
  cats: NewsFeedPin["category"][],
  w: { t4: number; t3: number; t2: number },
): number {
  return pins
    .filter(p => cats.includes(p.category))
    .reduce((s, p) => s + (w[p.tier] ?? 0), 0);
}

/**
 * Doomsday Clock → nuclear risk sub-score (0–100).
 * Calibrated against the full 79-year history of the clock (2–17 min range).
 * 85 seconds = 68 (current, unprecedented territory).
 */
function clockScore(seconds: number): number {
  if (seconds >= 1020) return  5;  // 17 min — 1991 post-Cold War low
  if (seconds >= 600)  return 15;  // 10 min
  if (seconds >= 300)  return 30;  //  5 min
  if (seconds >= 180)  return 42;  //  3 min
  if (seconds >= 120)  return 55;  //  2 min
  if (seconds >= 100)  return 62;  // 100s
  if (seconds >=  90)  return 65;  //  90s (2023–24 level)
  if (seconds >=  85)  return 68;  //  85s (current, 2026 — all-time record)
  if (seconds >=  75)  return 78;  //  75s
  if (seconds >=  60)  return 88;  //  60s
  return 97;
}

/** Temperature anomaly (°C) → climate risk sub-score (0–100). */
function tempScore(anomalyC: number): number {
  // Scale: 0°C = 0, 1°C = 33, 1.5°C = 50, 2°C = 67, 3°C = 100
  return clamp(Math.round((anomalyC / 3.0) * 100), 0, 100);
}

// ── Main calculation ──────────────────────────────────────────────────────────

export function calcDomainScores(
  pins:   NewsFeedPin[],
  prices: LivePrices,
): DomainScores {
  const { vix, tbill, dxy } = prices;

  // ════════════════════════════════════════════════════════════════════════════
  // GEOPOLITICAL
  // ════════════════════════════════════════════════════════════════════════════

  // Nuclear Risk (30%)
  // The Doomsday Clock already incorporates treaty status — BAS set it to 85s
  // precisely because New START expired. Adding a separate treaty bonus is
  // double-counting. Small pin bonus only for breaking escalation events.
  const nuclear = clamp(
    clockScore(ANCHORS.doomsdayClockSeconds)
    + pinSignal(pins, ["nuclear"], { t4: 5, t3: 3, t2: 1 }),
    0, 88, // hard cap: 100 = nukes in the air; 88 = all-time danger, not active exchange
  );

  // Active Conflicts (30%)
  // Anchor: Ukraine war=20, Taiwan 50% crisis=18, Iran nuclear=12, Gaza=8, Houthi=5 → 63
  const conflicts = clamp(
    63
    + pinSignal(pins, ["war"], { t4: 6, t3: 4, t2: 2 }),
    0, 100,
  );

  // Cyber Threats (25%)
  const cyberAnchor =
    (ANCHORS.saltTyphoonActive        ? 35 : 0)
  + (ANCHORS.voltTyphoonPrepositioned ? 28 : 0);
  const cyber = clamp(
    cyberAnchor
    + pinSignal(pins, ["cyber"], { t4: 8, t3: 5, t2: 3 }),
    0, 100,
  );

  // Political Fracture (15%)
  // Anchor: multipolar restructuring=15, US political uncertainty=12 → 27
  const political = clamp(
    27
    + pinSignal(pins, ["political"], { t4: 6, t3: 4, t2: 2 }),
    0, 100,
  );

  const geoSubIndices: SubIndex[] = [
    {
      label: "Nuclear Risk",       score: nuclear,   weight: 0.30,
      contribution: Math.round(nuclear   * 0.30),
      source: "BAS Doomsday Clock (incl. treaty collapse) · nuclear news feed",
    },
    {
      label: "Active Conflicts",   score: conflicts, weight: 0.30,
      contribution: Math.round(conflicts * 0.30),
      source: "CFR Conflicts 2026 · Reuters / AP news feed",
    },
    {
      label: "Cyber Threats",      score: cyber,     weight: 0.25,
      contribution: Math.round(cyber     * 0.25),
      source: "CISA AA24-038A · FBI Feb 2026",
    },
    {
      label: "Political Fracture", score: political, weight: 0.15,
      contribution: Math.round(political * 0.15),
      source: "CFR · live news signal feed",
    },
  ];

  const geoLive = clamp(
    Math.round(geoSubIndices.reduce((s, si) => s + si.score * si.weight, 0)),
    1, 99,
  );

  // ════════════════════════════════════════════════════════════════════════════
  // ECONOMIC
  // ════════════════════════════════════════════════════════════════════════════

  // Debt Stress (35%)
  // Formula: (debt/GDP - 60) / 100 × 100 anchors the 60% = 0 risk, 160% = 100 risk scale
  const debtBase = clamp(Math.round((ANCHORS.usDebtGdpPct - 60) / 100 * 100), 0, 75);
  const debtBonus =
    (ANCHORS.usInterestRevenuePct >= 20 ? 10 : 5) // interest crowding out spending
  + 8; // CBO: on track to surpass 1946 wartime debt record
  const debt = clamp(debtBase + debtBonus, 0, 100);

  // Market Volatility (20%) — LIVE: VIX + T-bill yield
  const vixScore  = vix.ok
    ? clamp(Math.round((vix.price - 10) / 65 * 100), 0, 80)
    : 18; // fallback: moderate market stress
  const tbillAdd  = tbill.ok
    ? (tbill.price > 5 ? 15 : tbill.price > 4 ? 10 : tbill.price > 3 ? 5 : 0)
    : 8;  // fallback
  const volatility = clamp(vixScore + tbillAdd, 0, 100);

  // Currency / Dollar Risk (25%) — LIVE: DXY + static de-dollarization anchor
  // Static: BRICS+=22, Saudi yuan exploration=10, USD reserve share low=15, tariff shock=15 → 62
  const dxyAdd = dxy?.ok
    ? (dxy.price < 95 ? 15 : dxy.price < 100 ? 8 : dxy.price < 105 ? 3 : 0)
    : 3;  // fallback: DXY ~104 range
  const currency = clamp(62 + dxyAdd, 0, 100);

  // Banking Stress (20%)
  // Static: $306B unrealized losses=30, CRE defaults accelerating=15 → 45
  const banking = clamp(
    45
    + pinSignal(pins, ["economic"], { t4: 10, t3: 6, t2: 3 }),
    0, 100,
  );

  const ecoSubIndices: SubIndex[] = [
    {
      label: "Debt Stress",       score: debt,       weight: 0.35,
      contribution: Math.round(debt       * 0.35),
      source: `US debt ${ANCHORS.usDebtGdpPct}% GDP · CBO 2026 · Senate JEC`,
    },
    {
      label: "Market Volatility", score: volatility, weight: 0.20,
      contribution: Math.round(volatility * 0.20),
      source: "CBOE VIX (live) · 13-wk T-bill yield (live)",
    },
    {
      label: "Currency / Dollar", score: currency,   weight: 0.25,
      contribution: Math.round(currency   * 0.25),
      source: "DXY live · Atlantic Council CBDC Tracker",
    },
    {
      label: "Banking Stress",    score: banking,    weight: 0.20,
      contribution: Math.round(banking    * 0.20),
      source: "FDIC Q4 2025 · financial news feed",
    },
  ];

  const ecoLive = clamp(
    Math.round(ecoSubIndices.reduce((s, si) => s + si.score * si.weight, 0)),
    1, 99,
  );

  // ════════════════════════════════════════════════════════════════════════════
  // ENVIRONMENTAL
  // ════════════════════════════════════════════════════════════════════════════

  // Pandemic Risk (35%)
  const h5n1Animal =
    ANCHORS.h5n1AnimalStatus === "uncontrolled" ? 22 :
    ANCHORS.h5n1AnimalStatus === "spreading"    ? 15 : 5;
  const h5n1Human =
    ANCHORS.h5n1HumanCases > 100 ? 25 :
    ANCHORS.h5n1HumanCases > 10  ? 18 :
    ANCHORS.h5n1HumanCases > 0   ? 10 : 0;
  const pandemic = clamp(
    h5n1Animal
    + h5n1Human
    + 8 // no general-population vaccine stockpile
    + (ANCHORS.mpxvRecombinantDetected ? 12 : 0)
    + pinSignal(pins, ["health"], { t4: 8, t3: 5, t2: 3 }),
    0, 100,
  );

  // Climate Stress (30%)
  const climate = clamp(
    tempScore(ANCHORS.globalTempAnomalyC)
    + Math.round(ANCHORS.arcticIcePctBelowNorm * 0.4) // 20% below = +8
    + 5  // La Niña active Q1–Q2 2026
    + pinSignal(pins, ["climate"], { t4: 6, t3: 4, t2: 2 }),
    0, 100,
  );

  // Food & Water Security (20%)
  // Normalize acute hunger: 0M = 0, 200M = 100
  const foodBase = clamp(Math.round(ANCHORS.acuteHungerMillions / 200 * 100), 0, 60);
  const food = clamp(
    foodBase
    + 18 // 2.4B people in water-stressed regions
    + 12 // harvest disruptions (Argentina drought + Black Sea winterkill)
    + pinSignal(pins, ["climate", "health"], { t4: 4, t3: 3, t2: 2 }),
    0, 100,
  );

  // Antimicrobial Resistance (15%) — mostly static; changes on 5–10 year timescale
  // 1.27M deaths/yr now; WHO projects 10M/yr by 2050 — normalize to 10M ceiling
  const amr = clamp(
    Math.round(1.27 / 10 * 100)  // progress toward catastrophic threshold: 13
    + 25  // ESKAPE pathogens resistant in 89+ countries
    + 20, // accelerating trajectory — Lancet 2024
    0, 100,
  );

  const envSubIndices: SubIndex[] = [
    {
      label: "Pandemic Risk",         score: pandemic, weight: 0.35,
      contribution: Math.round(pandemic * 0.35),
      source: `CDC (${ANCHORS.h5n1HumanCases} H5N1 cases) · WHO DON Jan 2026`,
    },
    {
      label: "Climate Stress",        score: climate,  weight: 0.30,
      contribution: Math.round(climate  * 0.30),
      source: `WMO +${ANCHORS.globalTempAnomalyC}°C · NSIDC Mar 2026`,
    },
    {
      label: "Food & Water",          score: food,     weight: 0.20,
      contribution: Math.round(food     * 0.20),
      source: `WFP ${ANCHORS.acuteHungerMillions}M acute hunger · UNHCR`,
    },
    {
      label: "Antimicrobial Resist.", score: amr,      weight: 0.15,
      contribution: Math.round(amr      * 0.15),
      source: "Lancet 2024 · WHO projection to 2050",
    },
  ];

  const envLive = clamp(
    Math.round(envSubIndices.reduce((s, si) => s + si.score * si.weight, 0)),
    1, 99,
  );

  // ── Deltas vs 2020 baseline ───────────────────────────────────────────────
  // 2020 baseline: geo=58 (pre-Doomsday escalation), eco=52 (pre-tariff), env=49 (pre-H5N1)
  const geoBase = 58;
  const ecoBase = 52;
  const envBase = 49;

  return {
    geopolitical:  { live: geoLive, base: geoBase, delta: geoLive - geoBase, subIndices: geoSubIndices  },
    economic:      { live: ecoLive, base: ecoBase, delta: ecoLive - ecoBase, subIndices: ecoSubIndices  },
    environmental: { live: envLive, base: envBase, delta: envLive - envBase, subIndices: envSubIndices  },
  };
}
