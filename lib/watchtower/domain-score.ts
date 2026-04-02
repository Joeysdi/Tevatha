// lib/watchtower/domain-score.ts
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import type { LivePrices }  from "@/lib/watchtower/prices-fetch";
import { ANCHORS }          from "@/lib/watchtower/score-anchors";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubIndex {
  label:        string;
  score:        number;   // 0–100
  weight:       number;   // 0.0–1.0; all sub-indices in a domain sum to 1.0
  contribution: number;   // Math.round(score × weight)
  source:       string;   // primary data source(s) for transparency
  isLive:       boolean;  // true = value updates with live market or feed data
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

/**
 * Sum tier-weighted news pins matching the given categories.
 * Pins ARE live data — they update with the news feed.
 */
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
 * Calibrated against the full 79-year history (2 min – 17 min range).
 * 85 seconds = 68, meaning: historically unprecedented danger, not active exchange.
 * Scale anchor: 0s (hypothetical) = 100 (nukes in the air), 17 min = 5 (post-Cold War low).
 */
function clockScore(seconds: number): number {
  if (seconds >= 1020) return  5;  // 17 min — 1991 post-Cold War low
  if (seconds >= 600)  return 15;  // 10 min
  if (seconds >= 300)  return 30;  //  5 min
  if (seconds >= 180)  return 42;  //  3 min
  if (seconds >= 120)  return 55;  //  2 min (2023 Cold War level)
  if (seconds >= 100)  return 62;  // 100s
  if (seconds >=  90)  return 65;  //  90s (2023–24 level)
  if (seconds >=  85)  return 68;  //  85s (2026 — all-time record)
  if (seconds >=  75)  return 78;  //  75s
  if (seconds >=  60)  return 88;  //  60s
  return 97;
}

/** Temperature anomaly (°C) → climate risk sub-score (0–100). */
function tempScore(anomalyC: number): number {
  // 0°C = 0, 1°C = 33, 1.5°C = 50, 2°C = 67, 3°C = 100
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
  // Doomsday Clock already prices in treaty collapse (BAS set it to 85s
  // precisely because New START expired). Pins add breaking escalation events
  // on top of that baseline. Cap at 88 — 100 means nukes already launched.
  const nuclear = clamp(
    clockScore(ANCHORS.doomsdayClockSeconds)    // 68 at current 85s
    + pinSignal(pins, ["nuclear"], { t4: 4, t3: 2, t2: 1 }),  // Iran +4, NK +4
    0, 88,
  );
  // Expected with current pins: 68 + 8 = 76

  // Active Conflicts (30%)
  // Base = structural baseline only (some wars exist globally at all times).
  // News pins carry the current conflict landscape — prevents double-counting
  // Ukraine/Gaza/Taiwan in both base AND pins.
  // Cap: 82 = major nuclear power direct conventional war. 100 = WW3.
  const conflicts = clamp(
    30    // always-on baseline: 2010–2014 "relatively peaceful" world level
    + pinSignal(pins, ["war"], { t4: 7, t3: 4, t2: 2 }),
    0, 82,
  );
  // Expected: 30 + (N01+N03+N11 t4=21) + (N04+N07+N13 t3=12) = 63

  // Cyber Threats (25%)
  // Static anchor = always-on nation-state espionage/probe baseline.
  // Named campaigns (Salt Typhoon, Volt Typhoon) flow through news pins C01/C02
  // to avoid counting them twice in both anchor and pins.
  const cyber = clamp(
    22    // always-on: state IP theft, infrastructure probes, supply chain ops
    + pinSignal(pins, ["cyber"], { t4: 8, t3: 5, t2: 2 }),
    0, 95,
  );
  // Expected: 22 + (C01+C02 t4=16) + (C03+C04+C05 t3=15) = 53

  // Political Fracture (15%)
  // Anchor: multipolar restructuring=15, democratic erosion in 30+ countries=12,
  // US institutional stress=8 → 35. Pins add breaking events.
  const political = clamp(
    35
    + pinSignal(pins, ["political"], { t4: 6, t3: 4, t2: 2 }),
    0, 95,
  );
  // Expected: 35 + N12(4) + N14(2) = 41

  const geoSubIndices: SubIndex[] = [
    {
      label: "Nuclear Risk",
      score: nuclear, weight: 0.30,
      contribution: Math.round(nuclear * 0.30),
      source: `BAS Doomsday Clock ${ANCHORS.doomsdayClockSeconds}s · nuclear news feed`,
      isLive: true,
    },
    {
      label: "Active Conflicts",
      score: conflicts, weight: 0.30,
      contribution: Math.round(conflicts * 0.30),
      source: "CFR Conflicts 2026 · live war/conflict news feed",
      isLive: true,
    },
    {
      label: "Cyber Threats",
      score: cyber, weight: 0.25,
      contribution: Math.round(cyber * 0.25),
      source: "CISA · FBI · live cyber news feed",
      isLive: true,
    },
    {
      label: "Political Fracture",
      score: political, weight: 0.15,
      contribution: Math.round(political * 0.15),
      source: "V-Dem 2026 · live political news feed",
      isLive: true,
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
  // Normalized over a 150-point range (60% safe zone → 210% = terminal).
  // 100% debt/GDP ≈ Japan-level concern; 124% = serious but not collapse;
  // 200% = systemic crisis; 100 = Venezuela-style sovereign default.
  const debtBase  = clamp(Math.round((ANCHORS.usDebtGdpPct - 60) / 150 * 100), 0, 65);
  const debtBonus =
    (ANCHORS.usInterestRevenuePct >= 20 ? 10 : 5)  // interest crowding out discretionary
  + 7;  // CBO: on track to surpass 1946 wartime debt record
  const debt = clamp(debtBase + debtBonus, 0, 100);
  // Expected: (124-60)/150×100 = 43 + 10 + 7 = 60

  // Market Volatility (20%) — FULLY LIVE: VIX + T-bill yield
  const vixScore = vix.ok
    ? clamp(Math.round((vix.price - 10) / 65 * 100), 0, 85)
    : 22;  // fallback: moderate stress
  const tbillAdd = tbill.ok
    ? (tbill.price > 5 ? 15 : tbill.price > 4 ? 8 : tbill.price > 3 ? 4 : 0)
    : 6;   // fallback
  const volatility = clamp(vixScore + tbillAdd, 0, 100);
  const vixLabel   = vix.ok   ? `VIX ${vix.price.toFixed(1)}`     : "VIX unavail.";
  const tbillLabel = tbill.ok ? `T-bill ${tbill.price.toFixed(2)}%` : "T-bill unavail.";
  // Expected at VIX≈40: (40-10)/65×100=46 + 8 = 54

  // Currency / Dollar Risk (25%) — LIVE: DXY level
  // Static base: BRICS expansion, yuan invoicing, USD reserve-share declining → 48
  // DXY live add: dollar weakness = more de-dollarization pressure
  const dxyAdd = dxy?.ok
    ? (dxy.price < 95 ? 15 : dxy.price < 100 ? 10 : dxy.price < 105 ? 4 : 0)
    : 4;   // fallback: DXY ~104
  const currency  = clamp(48 + dxyAdd, 0, 100);
  const dxyLabel  = dxy?.ok ? `DXY ${dxy.price.toFixed(1)}` : "DXY unavail.";
  // Expected at DXY≈100: 48 + 10 = 58

  // Banking Stress (20%)
  // Static: $306B unrealized losses at US banks=20, CRE defaults accelerating=12 → 32
  // Economic news pins add macro stress signals on top (these are different events).
  const banking = clamp(
    32
    + pinSignal(pins, ["economic"], { t4: 8, t3: 4, t2: 2 }),
    0, 100,
  );
  // Expected: 32 + (N08+N09+N10+N15 t3=4×4=16) = 48

  const ecoSubIndices: SubIndex[] = [
    {
      label: "Debt Stress",
      score: debt, weight: 0.35,
      contribution: Math.round(debt * 0.35),
      source: `US debt ${ANCHORS.usDebtGdpPct}% GDP · CBO 2026 · Senate JEC`,
      isLive: false,
    },
    {
      label: "Market Volatility",
      score: volatility, weight: 0.20,
      contribution: Math.round(volatility * 0.20),
      source: `${vixLabel} · ${tbillLabel} — CBOE / Fed`,
      isLive: true,
    },
    {
      label: "Currency / Dollar",
      score: currency, weight: 0.25,
      contribution: Math.round(currency * 0.25),
      source: `${dxyLabel} · Atlantic Council CBDC Tracker`,
      isLive: dxy?.ok ?? false,
    },
    {
      label: "Banking Stress",
      score: banking, weight: 0.20,
      contribution: Math.round(banking * 0.20),
      source: "FDIC Q4 2025 · $306B unrealized · financial news feed",
      isLive: true,
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
  // H5N1: uncontrolled in animals + 70 confirmed human cases + no mass vaccine.
  // MPXV recombinant: adds risk but not a confirmed pandemic. Calibrated to
  // reflect genuine concern without treating 70 cases as imminent human pandemic.
  const h5n1Animal =
    ANCHORS.h5n1AnimalStatus === "uncontrolled" ? 18 :
    ANCHORS.h5n1AnimalStatus === "spreading"    ? 12 : 4;
  const h5n1Human =
    ANCHORS.h5n1HumanCases > 500 ? 22 :
    ANCHORS.h5n1HumanCases > 100 ? 18 :
    ANCHORS.h5n1HumanCases > 10  ? 12 :
    ANCHORS.h5n1HumanCases > 0   ?  6 : 0;
  const pandemic = clamp(
    h5n1Animal
    + h5n1Human  // 70 cases = 12
    + 6   // no general-population vaccine stockpile exists
    + (ANCHORS.mpxvRecombinantDetected ? 8 : 0)   // recombinant concern, not outbreak
    + pinSignal(pins, ["health"], { t4: 8, t3: 5, t2: 3 }),
    0, 100,
  );
  // Expected: 18+12+6+8+8(N02) = 52

  // Climate Stress (30%)
  // 1.55°C anomaly (WMO 2024) already past 1.5°C Paris target.
  // Arctic ice 20% below norm amplifies feedback loops.
  const climate = clamp(
    tempScore(ANCHORS.globalTempAnomalyC)            // 52 at 1.55°C
    + Math.round(ANCHORS.arcticIcePctBelowNorm * 0.4) // 20% below → +8
    + 5   // La Niña active Q1–Q2 2026, worsening regional extremes
    + pinSignal(pins, ["climate"], { t4: 6, t3: 4, t2: 2 }),
    0, 100,
  );
  // Expected: 52+8+5 = 65

  // Food & Water Security (20%)
  // Normalize 96M acute hungry against 350M threshold (WFP "global crisis" benchmark).
  // Water stress + harvest disruptions add structural pressure.
  const foodBase = clamp(Math.round(ANCHORS.acuteHungerMillions / 350 * 100), 0, 40);
  const food = clamp(
    foodBase            // 96/350×100 = 27
    + 12  // 2.4B people in water-stressed regions (WWAP 2024)
    + 8   // harvest disruptions: Argentina drought + Black Sea winterkill
    + pinSignal(pins, ["climate", "health"], { t4: 4, t3: 2, t2: 1 }),
    0, 100,
  );
  // Expected: 27+12+8+4(N02 health t4) = 51

  // Antimicrobial Resistance (15%)
  // Slow-moving structural threat — changes on 5–10 year timescale.
  // 1.27M deaths/yr today; WHO projects 10M/yr by 2050.
  const amr = clamp(
    Math.round(1.27 / 10 * 100)  // 13: progress toward catastrophic 10M/yr threshold
    + 20  // ESKAPE pathogens resistant across 89+ countries (WHO 2023)
    + 18, // accelerating trajectory: resistance doubling every 10 yrs (Lancet 2024)
    0, 100,
  );
  // Static: 13+20+18 = 51

  const envSubIndices: SubIndex[] = [
    {
      label: "Pandemic Risk",
      score: pandemic, weight: 0.35,
      contribution: Math.round(pandemic * 0.35),
      source: `CDC (${ANCHORS.h5n1HumanCases} H5N1 human cases) · WHO DON Jan 2026`,
      isLive: true,
    },
    {
      label: "Climate Stress",
      score: climate, weight: 0.30,
      contribution: Math.round(climate * 0.30),
      source: `WMO +${ANCHORS.globalTempAnomalyC}°C · NSIDC Arctic ice · La Niña`,
      isLive: false,
    },
    {
      label: "Food & Water",
      score: food, weight: 0.20,
      contribution: Math.round(food * 0.20),
      source: `WFP ${ANCHORS.acuteHungerMillions}M acute hunger · WWAP 2024`,
      isLive: true,
    },
    {
      label: "Antimicrobial Resist.",
      score: amr, weight: 0.15,
      contribution: Math.round(amr * 0.15),
      source: "Lancet 2024 · WHO ESKAPE surveillance",
      isLive: false,
    },
  ];

  const envLive = clamp(
    Math.round(envSubIndices.reduce((s, si) => s + si.score * si.weight, 0)),
    1, 99,
  );

  // ── Deltas vs 2020 baseline ───────────────────────────────────────────────
  const geoBase = 58;  // 2020: pre-clock-escalation, New START still active
  const ecoBase = 52;  // 2020: pre-tariff shock, pre-CRE crisis
  const envBase = 49;  // 2020: pre-H5N1 animal outbreak, pre-MPXV recombinant

  return {
    geopolitical:  { live: geoLive, base: geoBase, delta: geoLive - geoBase, subIndices: geoSubIndices  },
    economic:      { live: ecoLive, base: ecoBase, delta: ecoLive - ecoBase, subIndices: ecoSubIndices  },
    environmental: { live: envLive, base: envBase, delta: envLive - envBase, subIndices: envSubIndices  },
  };
}
