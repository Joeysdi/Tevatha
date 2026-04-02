// lib/watchtower/score-anchors.ts
// Static world-state anchors — manually updated when major events occur.
// Each anchor is sourced and dated. These are the "structural" inputs that
// don't change daily; live market data (VIX, DXY, news pins) handles the rest.

export interface ScoreAnchors {
  // ── Nuclear ──────────────────────────────────────────────────────────────
  /** BAS Doomsday Clock position in seconds to midnight */
  doomsdayClockSeconds:     number;
  /** Active arms control treaty status */
  armsControlStatus:        "active" | "expired" | "none";

  // ── Economic ─────────────────────────────────────────────────────────────
  /** US debt held by public as % of GDP */
  usDebtGdpPct:             number;
  /** Federal interest payments as % of total federal revenue */
  usInterestRevenuePct:     number;

  // ── Geopolitical ─────────────────────────────────────────────────────────
  /** Salt Typhoon (China MSS) — active inside 9+ US telecoms */
  saltTyphoonActive:        boolean;
  /** Volt Typhoon (China PLA) — pre-positioned in US grid/water/transport */
  voltTyphoonPrepositioned: boolean;

  // ── Environmental ────────────────────────────────────────────────────────
  /** Global mean surface temp anomaly in °C above pre-industrial (WMO) */
  globalTempAnomalyC:       number;
  /** Arctic sea ice volume % below the 1981–2010 baseline average */
  arcticIcePctBelowNorm:    number;
  /** Confirmed US human H5N1 cases (CDC) */
  h5n1HumanCases:           number;
  /** H5N1 spread status in animal reservoirs */
  h5n1AnimalStatus:         "contained" | "spreading" | "uncontrolled";
  /** Novel recombinant MPXV (clade Ib+IIb) detected */
  mpxvRecombinantDetected:  boolean;
  /** WFP acute hunger count in millions */
  acuteHungerMillions:      number;

  /** ISO date this anchor set was last reviewed */
  lastUpdated: string;
}

/**
 * Current world-state anchors — last reviewed March 2026.
 *
 * Sources:
 *  Doomsday Clock:   BAS Jan 27, 2026  — https://thebulletin.org/doomsday-clock/2026-statement/
 *  New START:        US State Dept, expired Feb 5, 2026
 *  US Debt/GDP:      Senate JEC Jan 2026 — $38.43T / ~124% GDP
 *  Interest/Revenue: CBO 2026 baseline — ~20% of federal revenue
 *  Salt/Volt:        CISA AA24-038A + FBI Feb 2026
 *  Temp anomaly:     WMO 2024 annual report — +1.55°C
 *  Arctic ice:       NSIDC Mar 2026 — ~20% below 1981-2010 baseline
 *  H5N1:             CDC Bird Flu Summary Jan 2026 — 70 US cases, "completely out of control"
 *  MPXV:             WHO DON Jan 13, 2026 — clade Ib+IIb detected India
 *  Acute hunger:     WFP Global Hunger Crisis 2026 — 96M
 */
export const ANCHORS: ScoreAnchors = {
  doomsdayClockSeconds:     85,
  armsControlStatus:        "none",
  usDebtGdpPct:             124,
  usInterestRevenuePct:     20,
  saltTyphoonActive:        true,
  voltTyphoonPrepositioned: true,
  globalTempAnomalyC:       1.55,
  arcticIcePctBelowNorm:    20,
  h5n1HumanCases:           70,
  h5n1AnimalStatus:         "uncontrolled",
  mpxvRecombinantDetected:  true,
  acuteHungerMillions:      96,
  lastUpdated:              "2026-03-15",
};
