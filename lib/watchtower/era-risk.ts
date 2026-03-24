// lib/watchtower/era-risk.ts
// Simplified country risk snapshots per historical era.
// Only countries that deviate from a neutral baseline are listed.
// Used by WorldRiskGlobe to recolor countries when the timeline is scrubbed.

export type EraPhase = "P1" | "P2" | "P3" | "P4";

export interface EraCountry {
  iso:   string;
  level: "CRITICAL" | "HIGH" | "ELEVATED";
  score: number;
  lat:   number;
  lon:   number;
  note:  string;
}

export const ERA_OVERRIDES: Record<EraPhase, EraCountry[]> = {

  // ── P1: Cold War Stability 1945–1971 ──────────────────────────────────────
  P1: [
    { iso:"643", level:"CRITICAL", score:95, lat:55.7,  lon:37.6,  note:"Soviet Union — nuclear standoff, Berlin Blockade (1948), Korean War proxy" },
    { iso:"408", level:"CRITICAL", score:92, lat:40.0,  lon:127.0, note:"North Korea — Korean War (1950–53), 4M+ casualties, armistice only" },
    { iso:"156", level:"HIGH",     score:81, lat:39.9,  lon:116.4, note:"China — Korean War entry, Great Leap Forward famine 35–55M dead (1959–61)" },
    { iso:"704", level:"HIGH",     score:80, lat:21.0,  lon:105.8, note:"Vietnam — French Indochina War → US escalation, Gulf of Tonkin (1964)" },
    { iso:"192", level:"HIGH",     score:78, lat:23.1,  lon:-82.4, note:"Cuba — Bay of Pigs invasion (1961), Missile Crisis (1962) — closest to WWIII" },
    { iso:"276", level:"ELEVATED", score:58, lat:52.5,  lon:13.4,  note:"Germany (divided) — Berlin Wall (1961), nuclear front line of Cold War" },
    { iso:"116", level:"ELEVATED", score:60, lat:11.6,  lon:104.9, note:"Cambodia — Khmer Rouge rising, US carpet bombing campaigns" },
    { iso:"840", level:"ELEVATED", score:52, lat:38.9,  lon:-77.0, note:"USA — civil rights unrest, JFK / RFK / MLK assassinations, anti-war protests" },
    { iso:"410", level:"ELEVATED", score:55, lat:37.5,  lon:127.0, note:"South Korea — post-Korean War fragile armistice, permanent DMZ threat" },
  ],

  // ── P2: Expansion / Post-Cold War 1971–2008 ───────────────────────────────
  P2: [
    { iso:"646", level:"CRITICAL", score:99, lat:-1.9,  lon:29.9,  note:"Rwanda — genocide (1994): 800,000 killed in 100 days; world watched, did nothing" },
    { iso:"004", level:"CRITICAL", score:93, lat:34.5,  lon:69.2,  note:"Afghanistan — Soviet invasion (1979): 1M+ dead, 5M refugees; US-backed Mujahideen" },
    { iso:"368", level:"CRITICAL", score:91, lat:33.3,  lon:44.4,  note:"Iraq — Iran-Iraq War (1980–88): 1M+ dead; Gulf War (1991): 100K+ Iraqi casualties" },
    { iso:"364", level:"HIGH",     score:83, lat:35.7,  lon:51.4,  note:"Iran — Islamic Revolution (1979), Iran-Iraq War, Hezbollah creation, US embassy siege" },
    { iso:"706", level:"HIGH",     score:81, lat:2.0,   lon:45.3,  note:"Somalia — state collapse (1991), Black Hawk Down (1993), ongoing famine" },
    { iso:"180", level:"HIGH",     score:77, lat:-4.3,  lon:15.3,  note:"DR Congo — Rwandan genocide spillover, First + Second Congo Wars" },
    { iso:"643", level:"HIGH",     score:74, lat:55.7,  lon:37.6,  note:"Russia — Soviet collapse chaos, Chechen Wars (1994, 1999): 100K+ dead" },
    { iso:"275", level:"HIGH",     score:79, lat:31.9,  lon:35.2,  note:"Palestine — First Intifada (1987), Oslo failure, Second Intifada (2000): 6,000 dead" },
    { iso:"703", level:"ELEVATED", score:68, lat:44.8,  lon:20.5,  note:"Serbia/Yugoslavia — Balkan Wars (1991–95), Srebrenica massacre: 8,000 killed" },
    { iso:"818", level:"HIGH",     score:75, lat:30.0,  lon:31.2,  note:"Egypt — 1973 Yom Kippur War, oil embargo, Camp David, Gulf War coalition" },
    { iso:"710", level:"ELEVATED", score:62, lat:-28.0, lon:25.0,  note:"South Africa — apartheid peak, MK insurgency, township violence, sanctions" },
  ],

  // ── P3: Stress / Arab Spring 2008–2020 ────────────────────────────────────
  P3: [
    { iso:"760", level:"CRITICAL", score:97, lat:33.5,  lon:36.3,  note:"Syria — civil war (2011+): 500K dead, 6M refugees, chemical weapons, Russian/Iran intervention" },
    { iso:"887", level:"CRITICAL", score:91, lat:15.5,  lon:48.5,  note:"Yemen — Houthi rebellion + Saudi intervention (2015+): worst humanitarian crisis in world" },
    { iso:"368", level:"CRITICAL", score:88, lat:33.3,  lon:44.4,  note:"Iraq — ISIS caliphate (2014–17): Mosul fall, 3M displaced, US re-intervention" },
    { iso:"434", level:"HIGH",     score:83, lat:32.9,  lon:13.2,  note:"Libya — NATO intervention (2011), Gaddafi fall, ongoing civil war, 2 rival governments" },
    { iso:"804", level:"HIGH",     score:78, lat:49.0,  lon:31.5,  note:"Ukraine — Euromaidan (2014), Crimea annexation, Donbas war begins: 14K dead by 2022" },
    { iso:"004", level:"HIGH",     score:84, lat:34.5,  lon:69.2,  note:"Afghanistan — Taliban resurgence, US surge (2009–11), ISIS-K formation, opium record" },
    { iso:"408", level:"HIGH",     score:82, lat:40.0,  lon:127.0, note:"North Korea — six nuclear tests (2006–17), ICBM development, Kim Jong-un consolidation" },
    { iso:"643", level:"HIGH",     score:76, lat:55.7,  lon:37.6,  note:"Russia — Crimea annexation, cyberwarfare escalation (US election 2016), Wagner Group" },
    { iso:"275", level:"HIGH",     score:85, lat:31.9,  lon:35.2,  note:"Palestine — Operation Protective Edge (2014), 2,200 killed; blockade tightens" },
    { iso:"729", level:"HIGH",     score:80, lat:15.5,  lon:32.5,  note:"Sudan — Darfur genocide aftermath, South Sudan independence war, Al-Bashir era" },
    { iso:"566", level:"ELEVATED", score:58, lat:9.1,   lon:8.7,   note:"Nigeria — Boko Haram insurgency (2009+), 37K dead; Chibok schoolgirls abduction (2014)" },
  ],

  // ── P4: Acceleration 2020–present ────────────────────────────────────────
  // Empty — WorldRiskGlobe falls through to current COUNTRY_RISK data.
  P4: [],
};

// Fill color for countries not in the era override (neutral historical baseline)
export const ERA_NEUTRAL_FILL     = "#0a160c"; // very dark olive — "not notable this era"
export const ERA_NEUTRAL_FILL_DIM = "#0d1a10"; // slightly lighter for context
