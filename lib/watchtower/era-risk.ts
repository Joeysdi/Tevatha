// lib/watchtower/era-risk.ts
// Simplified country risk snapshots per historical era.
// Only countries that deviate from a neutral baseline are listed.
// Used by WorldRiskGlobe to recolor countries when the timeline is scrubbed.

export type EraPhase =
  | "PA" | "PB" | "PC" | "PD" | "PE" | "PF"
  | "P1" | "PG" | "P2" | "P3" | "P4";

export interface EraCountry {
  iso:   string;
  level: "CRITICAL" | "HIGH" | "ELEVATED";
  score: number;
  lat:   number;
  lon:   number;
  note:  string;
}

export const ERA_OVERRIDES: Record<EraPhase, EraCountry[]> = {

  // ── PA: Industrial Revolution 1800–1870 ───────────────────────────────────
  PA: [
    { iso:"372", level:"CRITICAL", score:96, lat:53.3,  lon:-8.0,  note:"Ireland — Great Famine (1845–52): 1M dead, 1M emigrated. British inaction. 25% population loss." },
    { iso:"840", level:"CRITICAL", score:94, lat:38.9,  lon:-77.0, note:"USA — Civil War (1861–65): 620,000–850,000 dead. Deadliest conflict in American history. Industrial warfare." },
    { iso:"356", level:"HIGH",     score:80, lat:20.6,  lon:78.9,  note:"India — British Raj consolidation. 1857 Sepoy Rebellion crushed. Systematic deindustrialisation." },
    { iso:"250", level:"HIGH",     score:74, lat:48.9,  lon:2.3,   note:"France — 1848 Revolution, Louis Napoleon coup (1851), Franco-Prussian War humiliation (1870)." },
    { iso:"826", level:"ELEVATED", score:55, lat:51.5,  lon:-0.1,  note:"UK — Chartist movement, factory system mass poverty, Corn Laws repeal. Industrial capitalism's ground zero." },
    { iso:"276", level:"ELEVATED", score:52, lat:52.5,  lon:13.4,  note:"Germany — unification wars (1864–71), Bismarck, rapid industrialisation, emerging great power." },
  ],

  // ── PB: Imperial Age 1870–1914 ────────────────────────────────────────────
  PB: [
    { iso:"180", level:"CRITICAL", score:99, lat:-4.3,  lon:15.3,  note:"Congo Free State — Leopold II's private colony. 10M dead via forced labour, mutilation, famine (1885–1908)." },
    { iso:"356", level:"CRITICAL", score:91, lat:20.6,  lon:78.9,  note:"India — Bengal Famine (1876–79): 6–10M dead. British export policy during drought." },
    { iso:"156", level:"HIGH",     score:82, lat:39.9,  lon:116.4, note:"China — Boxer Rebellion (1899–1901), Qing collapse. Eight-Nation Alliance sacks Beijing." },
    { iso:"643", level:"HIGH",     score:78, lat:55.7,  lon:37.6,  note:"Russia — 1905 Revolution, Russo-Japanese War defeat. Tsarist system begins terminal decline." },
    { iso:"710", level:"HIGH",     score:74, lat:-28.0, lon:25.0,  note:"South Africa — Anglo-Boer Wars (1880–81, 1899–1902). Britain invents the concentration camp." },
    { iso:"276", level:"ELEVATED", score:62, lat:52.5,  lon:13.4,  note:"Germany — Triple Alliance, naval arms race vs UK, colonial competition. Powder keg building." },
  ],

  // ── PC: World War I 1914–1919 ─────────────────────────────────────────────
  PC: [
    { iso:"276", level:"CRITICAL", score:98, lat:52.5,  lon:13.4,  note:"Germany — Schlieffen Plan, Western Front, unrestricted U-boat warfare. Versailles reparations to follow." },
    { iso:"792", level:"CRITICAL", score:95, lat:39.9,  lon:32.9,  note:"Ottoman Empire — Armenian Genocide (1915–17): 600K–1.5M dead. Empire dissolves 1918." },
    { iso:"040", level:"CRITICAL", score:92, lat:48.2,  lon:16.4,  note:"Austria-Hungary — assassinated archduke triggers the war. Empire collapses into nine successor states." },
    { iso:"643", level:"HIGH",     score:87, lat:55.7,  lon:37.6,  note:"Russia — 3M military dead. February + October Revolutions (1917). Bolsheviks seize power." },
    { iso:"250", level:"HIGH",     score:84, lat:48.9,  lon:2.3,   note:"France — 1.4M military dead. Verdun, the Somme. Western Front carved through French heartland." },
    { iso:"826", level:"HIGH",     score:79, lat:51.5,  lon:-0.1,  note:"UK — 900K military dead. Gallipoli failure. Empire mobilised globally for the first time." },
    { iso:"380", level:"ELEVATED", score:60, lat:41.9,  lon:12.5,  note:"Italy — 600K dead. Fought against former allies Austria. Versailles 'mutilated victory' fuels fascism." },
    { iso:"840", level:"ELEVATED", score:54, lat:38.9,  lon:-77.0, note:"USA — enters April 1917. 117K dead. Wilson's 14 Points become the basis (and failure) of Versailles." },
  ],

  // ── PD: Interwar 1919–1929 ────────────────────────────────────────────────
  PD: [
    { iso:"276", level:"CRITICAL", score:97, lat:52.5,  lon:13.4,  note:"Germany (Weimar) — hyperinflation (1923): 4.2 trillion marks per dollar. Reparations impossible. Hitler's Beer Hall Putsch." },
    { iso:"643", level:"CRITICAL", score:92, lat:55.7,  lon:37.6,  note:"USSR — Civil war ends (1922). Lenin dies (1924). Stalin consolidates. Collectivisation begins." },
    { iso:"380", level:"HIGH",     score:79, lat:41.9,  lon:12.5,  note:"Italy — Mussolini's March on Rome (1922). First fascist government. Template for Hitler." },
    { iso:"156", level:"HIGH",     score:76, lat:39.9,  lon:116.4, note:"China — warlord era. Nationalist-Communist tensions. Japanese encroachment in Manchuria." },
    { iso:"792", level:"HIGH",     score:74, lat:39.9,  lon:32.9,  note:"Turkey — Atatürk's secular revolution. Population exchanges with Greece. 1.5M displaced." },
    { iso:"616", level:"ELEVATED", score:58, lat:52.2,  lon:21.0,  note:"Poland — new state squeezed between Germany and USSR. Pilsudski's coup (1926). Existential fragility." },
  ],

  // ── PE: Great Depression 1929–1939 ────────────────────────────────────────
  PE: [
    { iso:"840", level:"CRITICAL", score:97, lat:38.9,  lon:-77.0, note:"USA — Black Tuesday (Oct 1929). 89% Dow collapse. 9,000 banks fail. 25% unemployment. Dust Bowl." },
    { iso:"276", level:"CRITICAL", score:99, lat:52.5,  lon:13.4,  note:"Germany — 30% unemployment. Hyperinflation memory weaponised by Hitler. NSDAP wins plurality (1932). Hitler Chancellor (Jan 1933)." },
    { iso:"392", level:"HIGH",     score:81, lat:35.7,  lon:139.7, note:"Japan — Great Depression collapses export markets. Military seizes Manchuria (1931). Militarism fills economic vacuum." },
    { iso:"380", level:"HIGH",     score:75, lat:41.9,  lon:12.5,  note:"Italy — Mussolini consolidates dictatorship. Ethiopia invasion (1935). Axis forms." },
    { iso:"724", level:"ELEVATED", score:68, lat:40.4,  lon:-3.7,  note:"Spain — Great Depression destabilises republic. Civil War (1936–39). Fascist vs Communist proxy war. 500K dead." },
    { iso:"826", level:"ELEVATED", score:55, lat:51.5,  lon:-0.1,  note:"UK — off gold standard (1931). Appeasement policy begins. Chamberlain/Hitler negotiations signal weakness." },
    { iso:"032", level:"ELEVATED", score:58, lat:-34.6, lon:-58.4, note:"Argentina — first default (1930). Coup ends democratic government. Latin America's debt template." },
  ],

  // ── PF: World War II 1939–1945 ────────────────────────────────────────────
  PF: [
    { iso:"276", level:"CRITICAL", score:99, lat:52.5,  lon:13.4,  note:"Germany — Holocaust: 6M Jews + 5M others systematically murdered. Total military dead: 5.5M. Utterly destroyed by 1945." },
    { iso:"392", level:"CRITICAL", score:98, lat:35.7,  lon:139.7, note:"Japan — Pearl Harbor (1941). Nanking Massacre: 200K–300K dead. Atomic bombs end the war. 2.1M military dead." },
    { iso:"643", level:"CRITICAL", score:97, lat:55.7,  lon:37.6,  note:"USSR — 27M dead (largest in any nation). Operation Barbarossa. Leningrad Siege: 900 days, 800K civilian dead." },
    { iso:"616", level:"CRITICAL", score:96, lat:52.2,  lon:21.0,  note:"Poland — occupied by both Germany and USSR. Warsaw Ghetto Uprising. 6M Polish citizens dead (20% of population)." },
    { iso:"156", level:"CRITICAL", score:93, lat:39.9,  lon:116.4, note:"China — Japanese occupation. Second Sino-Japanese War: 15–20M Chinese dead. Nanjing Massacre." },
    { iso:"250", level:"HIGH",     score:80, lat:48.9,  lon:2.3,   note:"France — falls in 6 weeks (June 1940). Vichy collaboration. 300K military dead. Liberation 1944." },
    { iso:"826", level:"HIGH",     score:74, lat:51.5,  lon:-0.1,  note:"UK — Battle of Britain. The Blitz: 43K civilians dead. Alone against Germany 1940–41. 383K military dead." },
    { iso:"840", level:"ELEVATED", score:58, lat:38.9,  lon:-77.0, note:"USA — Pearl Harbor December 7, 1941. Industrial mobilisation becomes decisive. Atom bomb ends Pacific war." },
  ],

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

  // ── PG: Détente 1971–1991 ─────────────────────────────────────────────────
  PG: [
    { iso:"116", level:"CRITICAL", score:99, lat:11.6,  lon:104.9, note:"Cambodia — Khmer Rouge genocide (1975–79): ~2M dead (25% of population). Pol Pot's Year Zero." },
    { iso:"364", level:"CRITICAL", score:93, lat:35.7,  lon:51.4,  note:"Iran — Islamic Revolution (1979), Shah ousted, US embassy siege. Iran-Iraq War: 500K–1M dead." },
    { iso:"004", level:"CRITICAL", score:91, lat:34.5,  lon:69.2,  note:"Afghanistan — Soviet invasion (1979): 1M+ dead, 5M refugees. US/Saudi-backed Mujahideen create Al-Qaeda precursor." },
    { iso:"368", level:"HIGH",     score:85, lat:33.3,  lon:44.4,  note:"Iraq — Ba'ath consolidation, Saddam Hussein. Iran-Iraq War (1980–88): chemical weapons used." },
    { iso:"422", level:"HIGH",     score:83, lat:33.9,  lon:35.5,  note:"Lebanon — civil war (1975–90): 150K dead. Israeli invasion (1982). Hezbollah creation." },
    { iso:"704", level:"HIGH",     score:78, lat:21.0,  lon:105.8, note:"Vietnam — US withdrawal, Fall of Saigon (1975). Re-education camps. 3M+ total war dead." },
    { iso:"643", level:"HIGH",     score:72, lat:55.7,  lon:37.6,  note:"USSR — Afghanistan quagmire, Chernobyl (1986), Gorbachev reforms accelerate collapse." },
    { iso:"616", level:"ELEVATED", score:62, lat:52.2,  lon:21.0,  note:"Poland — Solidarity movement (1980), martial law (1981). Walesa. First crack in Soviet bloc." },
    { iso:"558", level:"ELEVATED", score:55, lat:12.1,  lon:-86.3, note:"Nicaragua — Sandinista revolution (1979), Contra War. US-backed regime change." },
  ],

  // ── P2: Expansion / Post-Cold War 1991–2008 ───────────────────────────────
  P2: [
    { iso:"646", level:"CRITICAL", score:99, lat:-1.9,  lon:29.9,  note:"Rwanda — genocide (1994): 800,000 killed in 100 days; world watched, did nothing" },
    { iso:"004", level:"CRITICAL", score:93, lat:34.5,  lon:69.2,  note:"Afghanistan — Soviet aftermath: civil war, Taliban (1996), Al-Qaeda training camps" },
    { iso:"368", level:"CRITICAL", score:91, lat:33.3,  lon:44.4,  note:"Iraq — Gulf War (1991): 100K+ Iraqi casualties; UN sanctions kill 500K children" },
    { iso:"364", level:"HIGH",     score:83, lat:35.7,  lon:51.4,  note:"Iran — Hezbollah creation, nuclear programme begins, US sanctions tighten" },
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
