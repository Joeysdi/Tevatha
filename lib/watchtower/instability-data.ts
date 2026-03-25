// lib/watchtower/instability-data.ts
// Political instability scores 0-100 (higher = more unstable)
// Composite of: governance failure, armed conflict intensity, protest index,
// economic stress, coup risk, and displacement pressure.
// Keyed by ISO 3166-1 numeric code (as string, matching TopoJSON feature IDs).

export const INSTABILITY_SCORES: Record<string, number> = {
  "729": 96,  // Sudan          — SAF/RSF civil war, world's largest displacement crisis
  "706": 95,  // Somalia        — 33yr failed state, Al-Shabaab, piracy
  "887": 94,  // Yemen          — 10yr conflict, famine, Houthi control of capital
  "275": 93,  // Palestine      — total infrastructure collapse, active combat
  "728": 93,  // South Sudan    — persistent civil conflict, ethnic violence
  "760": 91,  // Syria          — 14yr war, 13M displaced, no reconstruction
  "140": 91,  // CAR            — Wagner-backed junta, widespread militia violence
  "4":   90,  // Afghanistan    — Taliban control, ISKP active, collapsed economy
  "408": 89,  // North Korea    — total information blackout, nuclear escalation
  "332": 88,  // Haiti          — gang state capture, no functioning government
  "804": 88,  // Ukraine        — active warzone, Russian occupation of 18% territory
  "104": 87,  // Myanmar        — military junta vs resistance, 3M displaced
  "434": 86,  // Libya          — split government, militia control, oil wars
  "148": 85,  // Chad           — coup succession crisis, Sahel insurgency spillover
  "180": 85,  // DR Congo       — M23 eastern advance, FDLR, 7M displaced
  "178": 78,  // Congo          — opposition crackdowns, border tension with DRC
  "466": 84,  // Mali           — junta, Wagner Group, Al-Qaeda/JNIM insurgency
  "854": 83,  // Burkina Faso   — junta, 40% territory under jihadist influence
  "562": 82,  // Niger          — post-coup junta, Sahel insurgency expansion
  "862": 82,  // Venezuela      — authoritarian collapse, 7.7M diaspora
  "422": 80,  // Lebanon        — economic collapse, Hezbollah state-within-state
  "231": 76,  // Ethiopia       — Tigray post-war fragility, Amhara uprising
  "716": 74,  // Zimbabwe       — economic dysfunction, ZANU-PF repression
  "364": 74,  // Iran           — nuclear standoff, Green Movement suppression
  "508": 72,  // Mozambique     — RENAMO tension, ISIS-linked Cabo Delgado insurgency
  "368": 68,  // Iraq           — PMF militia influence, ISIS resurgence in north
  "324": 70,  // Guinea         — post-coup military junta, mining sector conflict
  "586": 71,  // Pakistan       — PTI crackdown, IMF cliff, TTP border violence
  "566": 69,  // Nigeria        — Boko Haram, ISWAP, Biafra separatism, oil theft
  "762": 64,  // Tajikistan     — authoritarian control, Gorno-Badakhshan tensions
  "112": 65,  // Belarus        — Lukashenko isolation, opposition in exile
  "120": 71,  // Cameroon       — Anglophone separatist war (Ambazonia)
  "818": 62,  // Egypt          — Nile dam standoff, Sinai insurgency, debt stress
  "192": 62,  // Cuba           — economic collapse, mass emigration, power blackouts
  "484": 60,  // Mexico         — cartel state capture, judicial crisis, femicide
  "170": 56,  // Colombia       — FARC dissident groups, coca economy, peace talks
  "788": 55,  // Tunisia        — Saied autocratic consolidation, economic stagnation
  "144": 55,  // Sri Lanka      — post-2022 debt crisis fragility, political instability
  "792": 54,  // Türkiye        — Kurdish conflict, inflation, Erdogan consolidation
  "417": 58,  // Kyrgyzstan     — recurring coup cycle, Tajikistan border clashes
  "76":  52,  // Brazil         — Bolsonarist movement, Amazon governance failure
  "68":  52,  // Bolivia        — Morales vs Arce factional conflict, economic drift
  "50":  48,  // Bangladesh     — student revolution aftermath, transition government
  "860": 50,  // Uzbekistan     — autocratic stability, Karakalpakstan suppressed
  "834": 45,  // Tanzania       — ruling party consolidation, media restrictions
  "356": 42,  // India          — CAA tensions, Manipur ethnic conflict, farmer protests
  "643": 58,  // Russia         — war economy, opposition eliminated, elite fractures
  "398": 42,  // Kazakhstan     — post-2022 uprising fragility, Russian dependency
};

// Score for countries not in the record above
export const INSTABILITY_DEFAULT = 15;

// Color for globe polygon when instability layer is active
export function instabilityFill(score: number, hover = false): string {
  if (score >= 80) return hover ? "#e05200" : "#b84000";   // severe   — deep orange-red
  if (score >= 60) return hover ? "#d08000" : "#a06000";   // high     — amber
  if (score >= 40) return hover ? "#908000" : "#706000";   // moderate — muted gold
  if (score >= 20) return hover ? "#2c3545" : "#1c2535";   // low      — dark steel
  return hover ? "#1a2030" : "#0f1420";                    // minimal  — near void
}
