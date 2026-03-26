// lib/watchtower/data.ts
// Pure data module — no framework imports, safe for any server/client context

export type ThreatLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE";
export type TierClass   = "t4" | "t3" | "t2" | "t1";
export type SevCode     = "EX" | "CR" | "HI" | "EL" | "ME";
export type TrendDir    = "↑" | "→" | "↓";

export interface ThreatDomain {
  id:      string;
  label:   string;
  score:   number;
  level:   ThreatLevel;
  icon:    string;
  trend:   TrendDir;
  summary: string;    // one-sentence current situation
  drivers: string[];  // 3 scored sub-factors driving the Ark Score
}

export interface Signal {
  sig:       string;
  domain:    string;
  score:     number;
  tier:      TierClass;
  source:    string;     // display name of primary source
  sourceUrl: string;     // direct URL to source document
}

export interface CollapseClass {
  cls:   string;
  name:  string;
  prob:  number;
  sev:   SevCode;
  n:     number;
  basis: string;  // two-line probability basis summary
}

export interface MitigationRow {
  action: string;
  pri:    "1" | "2" | "3";
  cost:   string;
}

export interface Scenario {
  id:         string;
  cls:        string;
  icon:       string;
  title:      string;
  window:     string;
  prob:       number;
  sev:        SevCode;
  prepTime:   string;
  summary:    string;
  triggers:   string[];
  cascade:    string[];
  mitigation: MitigationRow[];
}

export interface TimelineEvent {
  year:       string;
  label:      string;
  sev:        "critical" | "high" | "low";
  colKey:     "red" | "warn" | "info" | "pink";
  isNow?:     boolean;
  predicted?: boolean;
  signal:     string;
}

export interface DecisionGate {
  id:      string;
  trigger: string;
  window:  string;
  tier:    TierClass;
  action:  string;
}

export interface GearItem {
  name:     string;
  brand:    string;
  price:    string;
  tier:     "T1" | "T2" | "T3";
  rating:   1 | 2 | 3 | 4 | 5;
  critical: boolean;
  spec:     string;
  note:     string;
}

export interface GearCategory {
  cat:   string;
  items: GearItem[];
}

export interface PsychPillar {
  icon:    string;
  name:    string;
  colKey:  string;
  desc:    string;
  tactics: string[];
}

export interface PsychThreat {
  threat:  string;
  onset:   string;
  sev:     SevCode;
  signs:   string;
  ark:     string;
}

export interface AlarmItem {
  sig:    string;
  tier:   TierClass;
  action: string;
}

export interface AlarmCategory {
  cat:   string;
  items: AlarmItem[];
}

// ─────────────────────────────────────────────────────────────────────
// THREAT DOMAINS
// ─────────────────────────────────────────────────────────────────────

export const DOMAINS: ThreatDomain[] = [
  {
    id:"nuclear", label:"Nuclear / EMP", score:93, level:"CRITICAL", icon:"☢️", trend:"↑",
    summary:"New START expired Feb 5, 2026 — no nuclear arms control treaty in force for the first time in 50+ years. Doomsday Clock at 85s (all-time record). China racing to 1,000 warheads by 2030. Five nuclear states now simultaneously expanding arsenals.",
    drivers:[
      "Treaty collapse: New START lapse removes all legal limits on US-Russia arsenals — first time since 1972",
      "China ICBM build-up: 600+ warheads now (SIPRI 2025) → 1,000+ by 2030, constructing hundreds of new silos in Xinjiang, Gansu, Qinghai",
      "Russia doctrine shift (Nov 2024): use threshold lowered from 'state existence' to 'critical threat to sovereignty' — materially broader trigger",
      "North Korea: ~50 assembled warheads (SIPRI 2025) + fissile material for 40 more; Kim pledged 'exponential' expansion; ICBM range now covers CONUS",
      "NATO forward deployment: 125–130 US B61-12 nuclear gravity bombs at 6 bases across Belgium, Germany, Italy, Netherlands, Turkey — live escalation targets",
    ],
  },
  {
    id:"cyber", label:"Cyber / Tech", score:85, level:"CRITICAL", icon:"🤖", trend:"↑",
    summary:"Salt Typhoon (China MSS) confirmed inside 9+ US telecoms — FBI calls campaign 'still very much ongoing' (Feb 2026). Volt Typhoon pre-positioned in US power, water, and transport for wartime activation. Nation-state cyber operations now routinely pre-position for wartime infrastructure denial.",
    drivers:[
      "Salt Typhoon: 9+ US telecoms and 200+ orgs in 80 countries compromised — access confirmed active as of Feb 2026 (FBI)",
      "Volt Typhoon: pre-positioned inside US power grids, water systems, and transport — assessed as wartime disruption prep, not espionage",
      "Midnight Blizzard (Russia SVR): breached Microsoft corporate email Jan 2024 — including senior leadership and US federal agency accounts; spear-phishing hit 100+ orgs through Oct 2024",
      "Change Healthcare ransomware (Feb 2024): disrupted billing for 190M Americans — largest healthcare data breach ever; 74% of hospitals reported direct patient care impact",
      "AI kill-chain in combat: Israel's Lavender + Habsora systems approve human targets in ~20 seconds; UN binding autonomous weapons treaty rejected by US + Russia",
    ],
  },
  {
    id:"civil", label:"Civil / Political", score:78, level:"HIGH", icon:"🔥", trend:"↑",
    summary:"China's most extensive Taiwan drills ever (Dec 29, 2025) simulated full blockade. CFR rates a 2026 Taiwan Strait crisis at even-money. Sudan is now the world's largest humanitarian displacement crisis. Iran is weeks from weapons-grade uranium enrichment capability.",
    drivers:[
      "Taiwan: China's most extensive blockade drills ever (Dec 2025) — CFR rates 2026 crisis at 50%; Taiwan produces 92% of advanced semiconductors",
      "Ukraine: war enters 3rd year — US severed direct aid; no viable ceasefire; European NATO members absorbing full burden",
      "Iran nuclear: 408.6 kg uranium enriched to 60% (IAEA May 2025) — ~3 weeks from weapons-grade conversion capability; nuclear breakout risk highest since 2015",
      "Sudan: 10.1M internally displaced + 4.3M refugees — world's largest active displacement crisis; 30M+ require humanitarian aid (UNHCR 2025)",
      "US domestic: CFR rates political violence high-likelihood 2026; emergency power precedents and institutional norm erosion accelerating",
    ],
  },
  {
    id:"economic", label:"Economic", score:76, level:"HIGH", icon:"💸", trend:"↑",
    summary:"US debt reached $38.43T (~124% of GDP), growing $8B per day. Trump's 2025 tariff regime — 10% universal, 145% on China — represents the largest US tax increase as % of GDP since 1993. BRICS+ nations representing ~45% of global GDP are accelerating non-USD trade settlement.",
    drivers:[
      "Debt: $38.43T (~124% GDP, $8B/day) — interest consuming ~20% of federal revenue; CBO projects surpassing 1946 wartime peak by 2036",
      "Tariff shock: 10% universal tariff + 145% China tariffs (April 2025) — largest US tax increase as % of GDP since 1993; retaliatory measures active from EU, China, Canada",
      "Banking fragility: $306B unrealized losses in US banking system (FDIC Q4 2025); commercial real estate defaults accelerating",
      "De-dollarization: BRICS+ (now 9 members + partner states) accelerating non-USD trade; Saudi Arabia exploring yuan oil pricing; USD share of global reserves at multi-decade low",
      "CBDC displacement: 137 nations (98% of global GDP) exploring CBDCs — China e-CNY at $986B; EU Digital Euro targeting 2029 legislation; programmable money risk for financial freedom",
    ],
  },
  {
    id:"bio", label:"Biological", score:74, level:"HIGH", icon:"🦠", trend:"↑",
    summary:"Scientists describe H5N1 in animal reservoirs as 'completely out of control' (Jan 2026) — 70 US human cases, active in dairy herds. A novel recombinant MPXV strain (clade Ib+IIb, CFR 3–4%) was detected in India, January 13, 2026. Antimicrobial resistance now kills 1.27M/year — projected 10M/year by 2050.",
    drivers:[
      "H5N1: 'completely out of control' in animal reservoirs — 70+ US human cases, active dairy herd spread; historical CFR ~48%; no general-population vaccine stockpile",
      "MPXV recombinant: novel clade Ib+IIb strain detected India Jan 2026 — combines genomes of both clades; CFR 3–4% vs <1% for 2022 outbreak strain; under WHO investigation",
      "Antimicrobial resistance (AMR): 1.27M deaths/year currently (Lancet 2024); WHO-commissioned O'Neill review projects 10M/year by 2050; ESKAPE pathogens resistant to last-resort antibiotics in 89+ countries",
      "Drug-resistant TB: 1.25M deaths/year (WHO 2024); XDR-TB spreading in former Soviet states — requires 18–24 month treatments; pipeline of new antibiotics near-empty",
      "Pandemic infrastructure gap: WHO PHEIC response capacity strained post-COVID; international pandemic prevention treaty stalled; no coordinated H5N1 human-use vaccine reserve",
    ],
  },
  {
    id:"climate", label:"Climate", score:69, level:"ELEVATED", icon:"🌊", trend:"↑",
    summary:"2024 confirmed as hottest year in recorded history — first calendar year to exceed +1.55°C above pre-industrial (WMO). Arctic sea ice volume at record low (Mar 2026). 96M face acute food insecurity. 2.4B people live in water-stressed countries.",
    drivers:[
      "Temperature record: 2024 at +1.55°C above pre-industrial (WMO) — hottest year in recorded history; consecutive records now set 2023 and 2024",
      "Arctic collapse: sea ice volume at record low (Mar 2026) — ~20% below 2024 levels; Arctic warming at 4× the global average rate, accelerating feedback loops",
      "Food insecurity: 96M facing weather-driven acute hunger — 3× increase since 2020; climate-driven food prices rising 4× faster than non-climate-driven inflation",
      "Water stress: 2.4B people living in water-stressed countries (UN 2025); 1.8B facing absolute water scarcity; aquifer depletion accelerating in India, Middle East, US High Plains",
      "Harvest disruption: Argentina Pampas drought + Black Sea wheat winterkill (Jan–Feb 2026) threatening Q2 2026 grain supply; La Niña active Q1–Q2 2026 compounding risk",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// PRIORITY SIGNALS
// ─────────────────────────────────────────────────────────────────────

export const SIGNALS: Signal[] = [
  {
    sig:       "Doomsday Clock: 85 seconds to midnight — all-time closest in 79-year history. BAS cited failure of leadership, nuclear rhetoric, unchecked AI, and unresolved biological threats.",
    domain:    "Nuclear",     score: 97, tier: "t4",
    source:    "Bulletin of Atomic Scientists",
    sourceUrl: "https://thebulletin.org/doomsday-clock/2026-statement/",
  },
  {
    sig:       "New START expired Feb 5, 2026 — first time in 50+ years no legally binding treaty limits US or Russian nuclear arsenals. Putin offered voluntary compliance; no formal framework exists.",
    domain:    "Nuclear",     score: 94, tier: "t4",
    source:    "U.S. State Department",
    sourceUrl: "https://www.state.gov/new-start/",
  },
  {
    sig:       "Salt Typhoon (China MSS): 9+ major US telecoms compromised — Verizon, AT&T, T-Mobile, others. 200+ orgs across 80+ countries. FBI: campaign 'still very much ongoing' as of Feb 2026.",
    domain:    "Cyber",       score: 92, tier: "t3",
    source:    "CyberScoop / FBI",
    sourceUrl: "https://cyberscoop.com/fbi-salt-typhoon-ongoing-threat-cybertalks-2026/",
  },
  {
    sig:       "Volt Typhoon (China PRC): pre-positioned inside US power grids, water systems, and transport infrastructure — assessed as preparation for wartime disruption, not espionage.",
    domain:    "Cyber",       score: 89, tier: "t3",
    source:    "CISA Joint Advisory AA24-038A",
    sourceUrl: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a",
  },
  {
    sig:       "US gross national debt: $38.43T (~124% of GDP), growing $8B per day. Interest payments now consume ~20% of all federal revenue — structural fiscal dominance trap with no exit.",
    domain:    "Economic",    score: 88, tier: "t3",
    source:    "Senate Joint Economic Committee",
    sourceUrl: "https://www.jec.senate.gov/public/index.cfm/republicans/2026/1/national-debt-hits-38-43-trillion-increased-2-25-trillion-year-over-year-8-03-billion-per-day",
  },
  {
    sig:       "China nuclear arsenal: 600+ warheads (SIPRI 2025 estimate), constructing hundreds of new ICBM silos — projecting 1,000+ warheads by 2030. Largest nuclear expansion by any state since the Cold War.",
    domain:    "Nuclear",     score: 87, tier: "t3",
    source:    "SIPRI Yearbook 2025",
    sourceUrl: "https://www.sipri.org/yearbook/2025",
  },
  {
    sig:       "Taiwan Strait: China conducted its most extensive military drills ever on Dec 29, 2025, simulating a complete blockade. CFR rates a 2026 Taiwan Strait crisis at even-money (50%) probability.",
    domain:    "Geopolitical", score: 83, tier: "t3",
    source:    "CFR Conflicts to Watch 2026",
    sourceUrl: "https://www.cfr.org/report/conflicts-watch-2026",
  },
  {
    sig:       "Russia revised nuclear doctrine (Nov 2024): use threshold lowered from 'threat to state existence' to 'critical threat to sovereignty' — a materially broader trigger still under active analyst debate.",
    domain:    "Nuclear",     score: 82, tier: "t3",
    source:    "RealClearDefense",
    sourceUrl: "https://www.realcleardefense.com/articles/2026/03/09/is_russia_changing_its_nuclear_doctrine_to_affect_its_war_in_ukraine_1169225.html",
  },
  {
    sig:       "CBO 2026–2036 Outlook: US debt held by public projected to reach 120% of GDP by 2036 — surpassing the 1946 wartime peak of 106%. Annual deficit tracking ~6% of GDP with no structural correction.",
    domain:    "Economic",    score: 80, tier: "t3",
    source:    "Congressional Budget Office",
    sourceUrl: "https://www.cbo.gov/publication/61882",
  },
  {
    sig:       "H5N1 avian flu 'completely out of control' in animal reservoirs (Jan 2026). 70 confirmed US human cases — active spread in dairy herds. Historical CFR ~48%. No sustained human-to-human transmission yet.",
    domain:    "Biological",  score: 79, tier: "t2",
    source:    "CDC Bird Flu Situation Summary",
    sourceUrl: "https://www.cdc.gov/bird-flu/situation-summary/index.html",
  },
  {
    sig:       "AI kill-chain deployed in combat: Israel's Lavender + Habsora systems approve human targets within ~20 seconds. UN binding LAWS treaty resolution rejected by US and Russia. No international framework.",
    domain:    "Cyber",       score: 78, tier: "t2",
    source:    "Stanford FSI",
    sourceUrl: "https://fsi.stanford.edu/sipr/content/lethal-autonomous-weapons-next-frontier-international-security-and-arms-control",
  },
  {
    sig:       "Russia-Ukraine: war enters 3rd year with no viable ceasefire. US severed direct financial aid to Ukraine. Russia repeatedly rejected Zelenskyy as negotiating partner. Analysts: unlikely to end in 2026.",
    domain:    "Geopolitical", score: 74, tier: "t2",
    source:    "CFR Conflicts to Watch 2026",
    sourceUrl: "https://www.cfr.org/report/conflicts-watch-2026",
  },
  {
    sig:       "Novel recombinant MPXV detected in India Jan 13, 2026 — combining clade Ib and IIb genomic elements. Under WHO investigation. Clade Ib CFR: 3–4% vs <1% for the 2022 outbreak strain.",
    domain:    "Biological",  score: 73, tier: "t2",
    source:    "WHO Disease Outbreak News",
    sourceUrl: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON595",
  },
  {
    sig:       "Arctic sea ice volume at record low (March 2026) — approximately 20% below mid-2024 levels; extent 2nd lowest ever recorded. Arctic warming at 4× the global average rate.",
    domain:    "Climate",     score: 71, tier: "t2",
    source:    "NSIDC Sea Ice Today",
    sourceUrl: "https://nsidc.org/sea-ice-today",
  },
  {
    sig:       "137 countries (98% of global GDP) exploring CBDCs. China e-CNY: $986B in transactions. EU Digital Euro in preparation phase — legislation targeting 2029. US halted retail CBDC by executive order.",
    domain:    "Economic",    score: 68, tier: "t2",
    source:    "Atlantic Council CBDC Tracker",
    sourceUrl: "https://www.atlanticcouncil.org/cbdctracker/",
  },
  {
    sig:       "Global food insecurity: 96M people facing acute hunger from weather extremes — a 3× increase since 2020. Argentina Pampas drought + Black Sea wheat winterkill (Jan–Feb 2026) threatening Q2 grain supply.",
    domain:    "Climate",     score: 65, tier: "t2",
    source:    "WFP Global Hunger Crisis",
    sourceUrl: "https://www.wfp.org/global-hunger-crisis",
  },
];

// ─────────────────────────────────────────────────────────────────────
// COLLAPSE PROBABILITY MATRIX
// ─────────────────────────────────────────────────────────────────────

export const COLLAPSE_CLASSES: CollapseClass[] = [
  {
    cls:"A", name:"Financial / Monetary", prob:73, sev:"HI", n:15,
    basis:"US debt $38.43T (124% GDP, $8B/day); $306B unrealized bank losses; 24 emerging markets face bond maturity cliff by 2027; structural fiscal dominance risk.",
  },
  {
    cls:"B", name:"Infrastructure Failure", prob:68, sev:"CR", n:12,
    basis:"Volt Typhoon pre-positioned inside US power/water/transport for wartime use; Salt Typhoon active in 9+ US telecoms; aging US grid with documented intrusion events.",
  },
  {
    cls:"C", name:"Civil / Societal Fracture", prob:61, sev:"CR", n:14,
    basis:"CFR rates US political violence high-likelihood 2026; Taiwan Strait crisis at even-money; multipolar power restructuring in 10–20 yr arc; Russia-Ukraine no ceasefire.",
  },
  {
    cls:"D", name:"Pandemic / Biological", prob:54, sev:"HI", n:8,
    basis:"H5N1 'completely out of control' in reservoirs; novel recombinant MPXV (CFR 3–4%) detected Jan 2026; historical H5N1 CFR ~48%; no general-population vaccine stockpile.",
  },
  {
    cls:"E", name:"Climate Cascade", prob:51, sev:"HI", n:10,
    basis:"Arctic ice volume at record low; 96M facing weather-driven food insecurity (3× since 2020); Argentina drought + Black Sea winterkill; La Niña active Q1–Q2 2026.",
  },
  {
    cls:"F", name:"Nuclear / Existential", prob:24, sev:"EX", n:6,
    basis:"Doomsday Clock 85s (all-time record); New START expired Feb 2026 — no arms control treaty in force; China racing to 1,000 warheads; Russia lowered use threshold.",
  },
];

// ─────────────────────────────────────────────────────────────────────
// SCENARIOS
// ─────────────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  {
    id:"S01", cls:"A", icon:"💸", title:"Hyperinflation",
    window:"2026–28", prob:42, sev:"CR", prepTime:"12 mo",
    summary:"Sustained CPI >30%/yr in G7, driven by fiscal dominance. US debt at $38.43T (~124% GDP) growing $8B/day. Interest consuming ~20% of federal revenue. CBO projects surpassing 1946 wartime debt peak by 2036.",
    triggers:["Fed forced to monetize deficit while CPI re-accelerates","Treasury demand strike by foreign creditors","Dollar reserve share falls below 45% (currently ~58%)"],
    cascade:["A4 Sovereign Default","C1 Civil Conflict","A8 USD Depegging"],
    mitigation:[
      { action:"Physical gold + silver outside banking system",           pri:"1", cost:"15–25% net worth" },
      { action:"Offshore accounts in 2+ non-correlated currencies",       pri:"1", cost:"$5K setup"        },
      { action:"12-month physical food store",                            pri:"2", cost:"$2K–$8K"          },
      { action:"Inflation-linked commodity exposure",                     pri:"3", cost:"Portfolio"        },
    ],
  },
  {
    id:"S03", cls:"A", icon:"🏦", title:"CBDC Mandatory Adoption",
    window:"2027–30", prob:48, sev:"HI", prepTime:"6 mo",
    summary:"137 countries (98% of global GDP) exploring CBDCs. China e-CNY: $986B in transactions. EU Digital Euro targets 2029 legislation. US retail CBDC halted by Trump executive order — but crisis event could accelerate non-US adoption. Programmable money enables transaction blocking, spending expiry, negative rates.",
    triggers:["EU Digital Euro mandatory adoption legislation passed","Banking crisis accelerates emergency CBDC emergency rollout outside US","G20 CBDC interoperability framework adopted"],
    cascade:["A3 Asset Freeze","A8 USD Depegging"],
    mitigation:[
      { action:"Bitcoin self-custody on hardware wallet — off exchanges now", pri:"1", cost:"$100–$200 hardware" },
      { action:"Offshore account funded to maximum before restrictions",       pri:"1", cost:"Act now"           },
      { action:"6-month physical cash in foreign currency",                   pri:"1", cost:"$3K–$10K"          },
      { action:"Second residency in non-CBDC-aggressive jurisdiction",        pri:"2", cost:"$50K–$500K"        },
    ],
  },
  {
    id:"S05", cls:"B", icon:"⚡", title:"Grid-Down EMP / Cyber Attack",
    window:"2026–27", prob:32, sev:"CR", prepTime:"6 mo",
    summary:"Salt Typhoon already inside 9+ US telecoms. Volt Typhoon pre-positioned in US power grids for wartime activation. State-sponsored cyber or EMP disables grid 2–8 weeks. Food distribution fails at 72h. Water pumping at 96h. Hospital generators at 7 days.",
    triggers:["Volt Typhoon / Salt Typhoon activation during Taiwan conflict","Solar Carrington-class event","High-altitude EMP detonation over CONUS"],
    cascade:["B4 Water Failure","B5 Food Distribution","B8 Hospital Overload — simultaneous"],
    mitigation:[
      { action:"30-day food + water store (minimum)",          pri:"1", cost:"$500–$2K"  },
      { action:"Off-grid solar + LiFePO4 battery backup",     pri:"1", cost:"$3K–$8K"   },
      { action:"Faraday cage for critical electronics",       pri:"1", cost:"$50–$500"  },
      { action:"Ham radio license + Baofeng UV-5R ×5",        pri:"2", cost:"$300–$800" },
    ],
  },
  {
    id:"S07", cls:"C", icon:"🏛️", title:"US Constitutional Crisis",
    window:"2026–28", prob:30, sev:"CR", prepTime:"18 mo",
    summary:"Political scientists' consensus: 30–35% probability of active civil violence. Federal election result disputed, Supreme Court non-compliance, or militia mobilisation in 3+ states.",
    triggers:["Election result formally disputed by significant actors","Supreme Court non-compliance by executive","State nullification — 10+ states"],
    cascade:["C2 Mass Migration","C3 Surveillance State","A8 USD Reserve Loss"],
    mitigation:[
      { action:"Second residency or citizenship",                  pri:"1", cost:"$50K–$500K" },
      { action:"Rural property >100 miles from major metro",       pri:"1", cost:"$200K+"     },
      { action:"48-hour executable bug-out plan",                  pri:"2", cost:"$500 planning"},
      { action:"Vetted community of 15–30 pre-built",              pri:"1", cost:"Time"        },
    ],
  },
  {
    id:"S10", cls:"D", icon:"🦠", title:"H5N1 Pandemic",
    window:"2026–27", prob:35, sev:"CR", prepTime:"3 mo",
    summary:"Scientists describe H5N1 in animal reservoirs as 'completely out of control' (Jan 2026). 70 US human cases confirmed, active in dairy herds. Historical CFR ~48%. A novel recombinant MPXV strain (clade Ib+IIb) emerged Jan 2026 with 3–4% CFR. Either pathogen at sustained human-to-human transmission collapses health systems within 8 weeks.",
    triggers:["H5N1 confirmed in healthcare workers with no animal contact","WHO PHEIC for respiratory illness","Recombinant MPXV sustained spread outside Central Africa"],
    cascade:["B8 Hospital Overload","A7 Supply Chain","C3 Surveillance State"],
    mitigation:[
      { action:"N95 respirators: 500 per adult household member",  pri:"1", cost:"$200–$500"  },
      { action:"90-day food + water isolation capability",         pri:"1", cost:"$1K–$5K"    },
      { action:"Rural property with sealed room capacity",         pri:"1", cost:"Access"     },
      { action:"Telemedicine + home medical kit",                  pri:"2", cost:"$500–$2K"   },
    ],
  },
  {
    id:"S09", cls:"H", icon:"🚢", title:"Taiwan Strait Conflict",
    window:"2026–27", prob:40, sev:"CR", prepTime:"6 mo",
    summary:"China conducted its most extensive Taiwan military drills ever on Dec 29, 2025, simulating full blockade. CFR rates 2026 crisis at even-money. Taiwan produces 92% of advanced semiconductors — blockade triggers global semiconductor shortage within 90 days.",
    triggers:["China naval blockade declaration","Military incident in Taiwan Strait","US mixed signals on Taiwan defense commitment"],
    cascade:["A7 Supply Chain","B2 Cyber Attack","A8 USD Reserve Loss"],
    mitigation:[
      { action:"Exit Asia-Pacific on blockade declaration (pre-planned)",  pri:"1", cost:"Route planning" },
      { action:"Pre-position hard assets before conflict trigger",          pri:"1", cost:"15–25% hard assets"},
      { action:"Communications equipment stocked pre-shortage",            pri:"2", cost:"$300–$2K"       },
      { action:"Diversify semiconductor-dependent income",                 pri:"2", cost:"—"              },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// TIMELINE EVENTS
// ─────────────────────────────────────────────────────────────────────

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { year:"1944", label:"Bretton Woods — USD global reserve currency",          sev:"low",      colKey:"info", signal:"Clock started here. $400B US debt established as baseline." },
  { year:"1945", label:"Hiroshima & Nagasaki — nuclear use precedent set",     sev:"critical", colKey:"red",  signal:"First and only wartime use of nuclear weapons. Established the nuclear deterrence era. Any future use resets the entire Ark posture to immediate T4." },
  { year:"1957", label:"Sputnik + first ICBM — space-nuclear convergence begins", sev:"high",  colKey:"info", signal:"USSR launches Sputnik and tests R-7 ICBM. Nuclear warheads can now reach any point on Earth. Cold War MAD doctrine crystallizes." },
  { year:"1962", label:"Cuban Missile Crisis — 13 days from nuclear exchange", sev:"critical", colKey:"red",  signal:"Any equivalent standoff without back-channel communication = Tier 4 immediate." },
  { year:"1971", label:"Nixon Shock — gold standard ends, fiat era begins",    sev:"high",     colKey:"warn", signal:"$400B (1971) → $36.4T (2024). Unlimited deficit financing enabled." },
  { year:"1986", label:"Chernobyl — nuclear safety paradigm failure",          sev:"high",     colKey:"warn", signal:"Reactor 4 explosion exposes catastrophic systemic failure in nuclear safety culture. 350,000 displaced. Economic cost: ~$700B. Accelerated Soviet collapse." },
  { year:"2001", label:"9/11 — surveillance state era begins",                 sev:"critical", colKey:"red",  signal:"Patriot Act, FISA expansion, NSA bulk collection. Post-9/11 security apparatus created a permanent surveillance infrastructure. Justified all subsequent civil liberty erosion." },
  { year:"2008", label:"Global Financial Crisis — QE1 begins",                 sev:"critical", colKey:"warn", signal:"Fed balance sheet: $900B → $9T. QE never truly ended. Will resolve as inflation or default." },
  { year:"2011", label:"Fukushima + Arab Spring — dual system shock",          sev:"high",     colKey:"warn", signal:"Fukushima exposes catastrophic nuclear safety assumptions. Arab Spring demonstrates rapid state collapse. Both events show how interconnected system failures cascade globally." },
  { year:"2014", label:"Crimea annexation — multipolar fracture starts",       sev:"critical", colKey:"red",  signal:"First forcible annexation of European territory since WWII. Russia demonstrates willingness to violate post-Cold War order. Sanctions begin. NATO expands east. Direct precedent for 2022." },
  { year:"2016", label:"Brexit + US political fracture — institutional erosion", sev:"high",   colKey:"warn", signal:"Brexit vote and Trump election signal simultaneous rejection of post-WWII institutional consensus across Western democracies. Populist insurgency becomes durable systemic feature." },
  { year:"2019", label:"COVID precursor signals — last pre-pandemic window",   sev:"high",     colKey:"pink", signal:"WHO warns of pandemic preparedness gaps. Wuhan market surveillance data collected. Final 12-month window to build stockpiles before COVID-19. Most governments missed it." },
  { year:"2020", label:"COVID — simultaneous system stress test",              sev:"critical", colKey:"pink", signal:"6-month stockpile, off-grid capability, rural property — all validated. Increase Ark parameters." },
  { year:"2022", label:"Ukraine War — first major European land war since WWII",sev:"critical", colKey:"red", signal:"Multipolar restructuring: 10–20 year arc begins. Nuclear taboo challenged. NATO forced to spend." },
  { year:"2023", label:"SVB + Credit Suisse collapse — $600B+ unrealised losses exposed",sev:"high", colKey:"warn", signal:"Not resolved. Deferred. Watch: overnight repo rate as leading stress indicator." },
  { year:"2023", label:"Doomsday Clock: 90 seconds — then-closest in 76-year history",   sev:"critical",colKey:"red", signal:"BAS methodology is rigorous. Each advance = one Ark tier escalation." },
  { year:"2025", label:"Doomsday Clock: 89 seconds — new record",             sev:"critical", colKey:"red",  signal:"AI battlefield use, intensified nuclear rhetoric cited. Moved from 90s to 89s." },
  { year:"2025", label:"Salt Typhoon: 9+ US telecoms compromised by China MSS", sev:"high",   colKey:"warn", signal:"Backbone ISP infrastructure. Access into energy, transport, healthcare networks. FBI: still active Feb 2026." },
  { year:"2026", label:"Doomsday Clock: 85 seconds — all-time closest. New START expires", sev:"critical", colKey:"red", isNow:true, signal:"No nuclear arms control treaty in force for first time in 50+ years. China at 600+ warheads. BAS Jan 27, 2026 + New START Feb 5, 2026." },

  // ── PREDICTED ─────────────────────────────────────────────────────────────
  { year:"2026", predicted:true, label:"Iran nuclear breakout window — 3 weeks from weapons-grade", sev:"critical", colKey:"red",  signal:"IAEA: 408.6 kg at 60% enrichment — ~3 weeks conversion from weapons-grade. If Iran crosses threshold, regional nuclear proliferation cascade (Saudi, Turkey, UAE) becomes near-certain." },
  { year:"2027", predicted:true, label:"China hits 800+ warheads — nuclear parity era begins",       sev:"critical", colKey:"red",  signal:"SIPRI projection. First time in history three superpowers hold near-equivalent first-strike capability. Mutual assured destruction calculus fundamentally shifts." },
  { year:"2027", predicted:true, label:"US national debt crosses $40T — interest exceeds defense",   sev:"high",     colKey:"warn", signal:"CBO baseline: $40T by mid-2027. Interest payments projected to exceed defense budget for first time since WWII. Fiscal dominance risk becomes unavoidable." },
  { year:"2027", predicted:true, label:"First major AI-driven cyber event — Volt Typhoon activation risk", sev:"critical", colKey:"warn", signal:"Volt Typhoon pre-positioned in US power/water/transport since 2021. AI-accelerated kill chains compress response windows. First wartime cyber activation event expected during peak Taiwan-conflict window." },
  { year:"2028", predicted:true, label:"Taiwan Strait: peak crisis window — semiconductor supply at risk", sev:"critical", colKey:"red",  signal:"CFR rates 2026–28 as peak crisis window. China completes PLA modernization. Taiwan produces 92% of advanced chips. Full blockade = global tech shutdown." },
  { year:"2028", predicted:true, label:"H5N1 pandemic risk: first sustained human cluster",          sev:"critical", colKey:"pink", signal:"Historical CFR ~48%. Any sustained human-to-human transmission triggers Ark Protocol D. No mass-use vaccine stockpile exists. Activate isolation immediately." },
  { year:"2029", predicted:true, label:"EU Digital Euro launches — programmable money enters G7",    sev:"high",     colKey:"warn", signal:"ECB legislation targeted 2029. Programmable CBDC enables transaction-level surveillance and spending controls. Gate G8 trigger. Bitcoin self-custody now." },
  { year:"2029", predicted:true, label:"US-China tech cold war peaks — semiconductor supply chains fully split", sev:"high", colKey:"warn", signal:"No cross-supply of advanced chips between US and China blocs. Taiwan's strategic value peaks. Global tech sector bifurcates permanently into two incompatible ecosystems." },
  { year:"2030", predicted:true, label:"Doomsday Clock: projected 75 seconds — Gate G5 trigger",    sev:"critical", colKey:"red",  signal:"BAS trajectory analysis. 75s = Tevatha Gate G5: Tier 3 → Tier 4 escalation. Ark location must be fully operational by this date. No exceptions." },
  { year:"2030", predicted:true, label:"BRICS+ non-USD settlement active — dollar share below 45%", sev:"high",     colKey:"warn", signal:"BRICS+ (9+ members) targeting 2030 non-USD settlement infrastructure. USD global reserve share falls below 45% threshold. De-dollarization accelerates permanently." },
  { year:"2031", predicted:true, label:"Sovereign debt cascade — first simultaneous G20 defaults",  sev:"critical", colKey:"warn", signal:"3+ G20 nations default simultaneously. IMF reserve capacity exhausted. Contagion spreads to pension systems globally. Gate G4 bank bail-in trigger risk peaks." },
  { year:"2032", predicted:true, label:"Climate cascade: 150M displaced — sovereign food conflicts begin", sev:"high", colKey:"info", signal:"UNHCR climate displacement projection. Arctic feedback loops lock in +2°C. Agricultural belt shift triggers competition for arable land between nuclear-armed states." },
  { year:"2032", predicted:true, label:"AMR superbug declared — WHO confirms pan-resistant pandemic pathogen", sev:"critical", colKey:"pink", signal:"First pathogen resistant to all known antibiotic classes confirmed in multi-continent outbreak. 30%+ CFR. No treatment pipeline. Collapse of elective surgery and immunocompromised care globally." },
  { year:"2033", predicted:true, label:"Post-Cold War institutional order collapses",               sev:"high",     colKey:"info", signal:"UN Security Council paralysis, NATO fragmentation, WTO dispute system non-functional. The post-1945 rules-based international order reaches structural collapse threshold. Regional power blocs replace global governance." },
  { year:"2033", predicted:true, label:"AI autonomous strike — first lethal action without human authorization", sev:"critical", colKey:"warn", signal:"AI targeting system executes lethal strike without human-in-the-loop confirmation. Attribution contested. UN emergency session fails. Arms control frameworks collapse within 90 days." },
  { year:"2034", predicted:true, label:"AI autonomous weapons — treaty failure confirmed",           sev:"high",     colKey:"warn", signal:"UN lethal autonomous weapons treaty rejected by US, China, Russia. AI decision cycles fall below human response time. Escalation dynamics become machine-speed." },
  { year:"2035", predicted:true, label:"200M climate refugees — first armed conflicts over arable land", sev:"high",  colKey:"info", signal:"UNHCR threshold crossed. Nuclear-armed states contest shrinking agricultural zones. Food and water security become primary military objectives. Ark relocation criteria must account for crop belt shift." },
  { year:"2036", predicted:true, label:"AI labor collapse — 40%+ cognitive roles automated, welfare states fail", sev:"high", colKey:"warn", signal:"White-collar displacement exceeds retraining capacity. Tax base collapses in G7. Sovereign debt crisis accelerates. Mass unemployment triggers political radicalization at scale." },
  { year:"2037", predicted:true, label:"Post-USD multipolar reserve system — Bretton Woods II ends", sev:"high",     colKey:"info", signal:"End of Bretton Woods II era. Multipolar currency bloc settlement becomes the new norm. Physical gold re-enters sovereign reserves as tier-1 asset globally." },
  { year:"2038", predicted:true, label:"AGI threshold — AI assumes autonomous control of governance and infrastructure", sev:"critical", colKey:"red", signal:"AI systems demonstrably exceed human strategic planning across all domains. First nation cedes policy advisory to AI. Critical infrastructure management transfers to autonomous systems. Post-human governance era begins." },
];

// ─────────────────────────────────────────────────────────────────────
// DECISION GATES
// ─────────────────────────────────────────────────────────────────────

export const GATES: DecisionGate[] = [
  { id:"G1", trigger:"Any nuclear detonation, anywhere",                     window:"Immediate",  tier:"t4", action:"Full Ark protocol. No delay. No exceptions." },
  { id:"G2", trigger:"DEFCON 2 or equivalent raised",                        window:"Immediate",  tier:"t4", action:"Immediate bug-out execution." },
  { id:"G3", trigger:"NATO Article 5 formally invoked",                      window:"24 hours",   tier:"t4", action:"Leave Europe. No exceptions." },
  { id:"G4", trigger:"G7 bank bail-in announcement",                         window:"24 hours",   tier:"t4", action:"All cash to physical/offshore immediately." },
  { id:"G5", trigger:"Doomsday Clock moves to 75 seconds",                   window:"30 days",    tier:"t4", action:"Tier 3 → Tier 4 escalation. Ark location must be operational." },
  { id:"G6", trigger:"WHO PHEIC for respiratory pathogen",                   window:"Immediate",  tier:"t3", action:"Activate isolation protocol. Do not wait for community transmission." },
  { id:"G7", trigger:"Overnight repo rate >5% sustained 3+ days",            window:"72 hours",   tier:"t3", action:"Pre-bank-run signal. Move cash to hard assets." },
  { id:"G8", trigger:"CBDC mandatory adoption timeline announced (any G7)", window:"90 days",    tier:"t2", action:"Bitcoin self-custody. Offshore account to maximum. Physical cash." },
];

// ─────────────────────────────────────────────────────────────────────
// GEAR DATA
// ─────────────────────────────────────────────────────────────────────

export const GEAR: GearCategory[] = [
  {
    cat:"Communications",
    items:[
      { name:"Garmin inReach Mini 2",      brand:"Garmin",  price:"$350",        tier:"T1", rating:5, critical:true,  spec:"Two-way satellite messaging anywhere on Earth. SOS, tracking, weather. No cell required.",              note:"1 per adult + satellite plan"      },
      { name:"Baofeng UV-5R Dual Band",    brand:"Baofeng", price:"$28",         tier:"T1", rating:4, critical:false, spec:"Dual-band VHF/UHF. 400+ frequencies. HAM/FRS/GMRS compatible. 5W output.",                           note:"Buy 5–10. Pre-program channels."   },
      { name:"Midland ER310 Emergency",    brand:"Midland", price:"$60",         tier:"T1", rating:5, critical:true,  spec:"AM/FM/NOAA alerts. Hand-crank + solar + battery. USB charge port.",                                   note:"Core kit item. 1 per household."   },
      { name:"Starlink Mini Portable",     brand:"SpaceX",  price:"$599+$150/mo",tier:"T2", rating:5, critical:false, spec:"100Mbps+ anywhere. 1kg dish. Powers Ark coordination. Tier 2 comms backbone.",                        note:"Tier 2+ community only"            },
      { name:"Faraday Bag (SLNT)",         brand:"SLNT",    price:"$30",         tier:"T1", rating:4, critical:false, spec:"EMP/solar flare protection. Blocks all signals. Fits phones, radios, drives.",                         note:"Store electronics permanently"     },
    ],
  },
  {
    cat:"Medical",
    items:[
      { name:"NAR IFAK Trauma Kit",        brand:"NAR",     price:"$75",  tier:"T1", rating:5, critical:true,  spec:"SOF-T Wide tourniquet, HyFin chest seal, trauma dressing, compressed gauze. Military TCCC.", note:"1 per adult go-bag"              },
      { name:"MyMedic MYFAK Advanced",     brand:"MyMedic", price:"$160", tier:"T1", rating:5, critical:true,  spec:"150+ piece kit. Trauma supplies, wound care, medications. First-tier home medical.",         note:"1 per household minimum"         },
      { name:"QuikClot Combat Gauze (3pk)",brand:"Z-Medica",price:"$75",  tier:"T1", rating:5, critical:true,  spec:"Hemostatic gauze. Controls life-threatening bleeding in 3–5 min. US military standard.",    note:"Keep 6+ units in stock"          },
      { name:"Merck Manual 19th Ed. Print",brand:"Merck",   price:"$50",  tier:"T2", rating:5, critical:false, spec:"3,500+ pages. Diagnosis, treatment, medications. The offline medical bible.",               note:"Print only — no power needed"    },
      { name:"Pulse Ox + Digital BP Kit",  brand:"Contec",  price:"$60",  tier:"T1", rating:4, critical:false, spec:"Continuous vital monitoring. Battery operated. Critical for chronic disease off-grid.",     note:"With spare batteries"            },
    ],
  },
  {
    cat:"Energy",
    items:[
      { name:"EcoFlow DELTA Pro",          brand:"EcoFlow", price:"$2,200", tier:"T2", rating:5, critical:false, spec:"3,600Wh. 2,400W AC output. Solar/grid/car charge. Expandable to 25kWh.",  note:"Tier 2 sanctuary essential"          },
      { name:"Jackery Explorer 1000 Plus", brand:"Jackery", price:"$999",   tier:"T1", rating:5, critical:false, spec:"1,264Wh. Powers fridge 4h, CPAP 14h, phone 100+ charges. 2-hour recharge.",note:"Tier 1 go-bag power station"         },
      { name:"Renogy 400W Solar Kit",      brand:"Renogy",  price:"$580",   tier:"T2", rating:5, critical:false, spec:"4×100W mono panels + 40A controller. 1.6kWh/day moderate sun.",            note:"Starting point for off-grid solar"   },
      { name:"Champion 3500W Dual-Fuel",   brand:"Champion",price:"$580",   tier:"T2", rating:4, critical:false, spec:"Gasoline or propane. 3,500W running / 4,000W surge. 7.5-hour runtime.",   note:"Bridge power. Stock 6+ propane tanks."},
      { name:"Goal Zero Nomad 100",        brand:"Goal Zero",price:"$250",  tier:"T1", rating:4, critical:false, spec:"Foldable 100W. Direct-charge or battery compatible. Go-bag deployable.",   note:"Pair with Jackery 1000+"             },
    ],
  },
  {
    cat:"Mobility",
    items:[
      { name:"Wavian 5-Gal NATO Jerry Can",brand:"Wavian",  price:"$40",  tier:"T1", rating:5, critical:true,  spec:"UN-certified steel. Airtight. Will not crack, leak, or explode. Always kept full.", note:"Buy 4–6. Rotate fuel quarterly." },
      { name:"NOCO Boost Plus GB40",       brand:"NOCO",    price:"$100", tier:"T1", rating:5, critical:true,  spec:"1,000A peak. Up to 6L gas / 3L diesel. Compact lithium. Phone charging included.",  note:"Keep in every vehicle"           },
      { name:"NOCO Genius Pro 50 Charger", brand:"NOCO",    price:"$190", tier:"T1", rating:5, critical:false, spec:"Maintains, desulfates, recovers 12V/24V batteries. Prevents failure.",              note:"Keeps all stored batteries healthy"},
      { name:"Slime Flat Tire Repair Kit", brand:"Slime",   price:"$30",  tier:"T1", rating:4, critical:false, spec:"Sealant + inflator. Repairs and inflates in <15 min. No spare required.",           note:"1 per vehicle"                   },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// PSYCHOLOGY DATA
// ─────────────────────────────────────────────────────────────────────

export const PSYCH_PILLARS: PsychPillar[] = [
  { icon:"🧠", name:"Emotional Regulation", colKey:"purple",
    desc:"Process grief, fear, and rage without destroying decision-making or community bonds.",
    tactics:["Daily check-ins with accountability partner","10-breath rule before any decision under anger","Grief ritual: scheduled, bounded, not suppressed","10-min nightly journaling to externalize internal state"] },
  { icon:"⚓", name:"Identity Anchoring", colKey:"indigo",
    desc:"Maintain a stable self when all external identity markers have dissolved. Primary predictor of persistence in Holocaust survivor literature.",
    tactics:["Written personal mission statement, read daily","Role clarity within community provides ongoing structure","Values list: 5 non-negotiables that survive any circumstance","Daily meaningful ritual, consistent regardless of chaos"] },
  { icon:"🕸", name:"Community Bonds", colKey:"teal",
    desc:"Human connection is the single highest predictor of survival across all documented disaster scenarios. Loneliness kills faster than starvation.",
    tactics:["Daily structured community meals — non-negotiable","Pair system: every person has a designated check-in partner","Conflict protocol: 48h cooling + mediated session","Public acknowledgment of every small community victory"] },
  { icon:"⚡", name:"Agency & Purpose", colKey:"gold",
    desc:"Helplessness is the primary driver of collapse-related suicide. Real agency — even over minor decisions — prevents psychological deterioration.",
    tactics:["Meaningful role assigned to every community member","Personal project: one thing each member owns and improves","30-min daily skill acquisition target","Agency journal: log 3 things you controlled today"] },
  { icon:"🔭", name:"Cognitive Clarity", colKey:"cyan",
    desc:"Stress degrades executive function. Clear thinking under chronic threat requires deliberate cognitive hygiene protocols, not willpower.",
    tactics:["7+ hours sleep — non-negotiable for decision-makers","Decision journal: log reasoning behind major calls","Pre-mortem practice before executing any plan","1× daily intelligence debrief maximum — no doom-scrolling"] },
  { icon:"💪", name:"Physical-Psychological Link", colKey:"red",
    desc:"The body IS the mind. Physical fitness, sleep, and nutrition have disproportionate psychological effects in collapse conditions.",
    tactics:["30-min daily physical activity — any form, non-negotiable","Body scan: 5-min somatic awareness practice daily","Physiological sigh for acute anxiety: double-inhale + long exhale","Physical labour as psychological anchor: purposeful exhaustion heals"] },
];

export const PSYCH_THREATS: PsychThreat[] = [
  { threat:"PTSD / Trauma Response",    onset:"Week 1+",  sev:"HI", signs:"Flashbacks, hypervigilance, emotional numbness",          ark:"Peer processing circles. Structured narrative retelling." },
  { threat:"Grief Collapse",            onset:"Day 3+",   sev:"HI", signs:"Inability to function, prolonged dissociation",            ark:"48h hold. Peer companion. Structured grief ritual at week mark." },
  { threat:"Leadership Fatigue",        onset:"Week 2+",  sev:"HI", signs:"Decision paralysis, irritability, risky shortcuts",         ark:"Mandatory 48h rotation. No leader works >14 days continuous." },
  { threat:"Suicidal Ideation",         onset:"Variable", sev:"CR", signs:"Withdrawal, giving possessions away, hopelessness",         ark:"24-hr companion. Remove means quietly. 30-day check-in protocol." },
  { threat:"Mass Panic",                onset:"Immediate",sev:"HI", signs:"Contagious fear, irrational group action",                  ark:"Command voice. Single authoritative instruction. Physical separation." },
  { threat:"Substance Dependency",      onset:"Month 1+", sev:"HI", signs:"Hoarding, covert use, behavioural changes",                 ark:"Community accountability. Supply audit. Role modification." },
];

export const ALARM_CATEGORIES: AlarmCategory[] = [
  {
    cat:"Financial",
    items:[
      { sig:"US 10-yr yield >5.5% sustained 30+ days",         tier:"t3", action:"Reduce bond exposure, increase gold" },
      { sig:"VIX >45 sustained",                               tier:"t3", action:"Execute financial protocol immediately" },
      { sig:"G7 bank bail-in announcement",                    tier:"t4", action:"All cash to physical/offshore within 24 hrs" },
      { sig:"CBDC mandatory adoption timeline (any G7)",       tier:"t2", action:"BTC self-custody. Offshore account to maximum." },
      { sig:"IMF emergency meeting convened",                  tier:"t3", action:"Financial circuit breaker. Review all positions." },
    ],
  },
  {
    cat:"Nuclear / Military",
    items:[
      { sig:"DEFCON 2 or equivalent raised",                   tier:"t4", action:"Immediate bug-out execution" },
      { sig:"Any nuclear detonation anywhere",                 tier:"t4", action:"Full Ark protocol. No exceptions." },
      { sig:"NATO Article 5 invoked",                         tier:"t4", action:"Leave Europe within 24 hours" },
      { sig:"Doomsday Clock moves to 75 seconds",             tier:"t4", action:"Ark location must be operational" },
      { sig:"Taiwan Strait naval blockade initiated",         tier:"t3", action:"Pre-position at Ark location" },
    ],
  },
  {
    cat:"Biological",
    items:[
      { sig:"H5N1 human-to-human cluster confirmed",          tier:"t3", action:"Activate isolation protocol. Do not wait." },
      { sig:"WHO PHEIC for respiratory pathogen",             tier:"t3", action:"Isolate immediately. Do not wait." },
      { sig:"Hospital system >120% capacity (any G7)",        tier:"t2", action:"Deploy PPE cache. Avoid medical facilities." },
    ],
  },
  {
    cat:"Political",
    items:[
      { sig:"Election result disputed by incumbent",          tier:"t2", action:"Reduce urban profile. Increase readiness." },
      { sig:"Emergency powers invoked without legislature",   tier:"t3", action:"Capital controls may follow. Act immediately." },
      { sig:"Internet shutdown in any G20 nation",            tier:"t2", action:"Offline comms activated. Mesh network." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// TICKER CONTENT
// ─────────────────────────────────────────────────────────────────────

export const TICKER_TEXT =
  "☢ DOOMSDAY CLOCK: 85 SECONDS — ALL-TIME RECORD — NO NUCLEAR ARMS CONTROL TREATY IN FORCE — BAS JAN 27 2026 · " +
  "⚠ NUCLEAR: CRITICAL 93/100 · CYBER: CRITICAL 85/100 · CIVIL: HIGH 78/100 · ECONOMIC: HIGH 76/100 · BIO: HIGH 74/100 · CLIMATE: ELEVATED 69/100 · " +
  "SALT TYPHOON: 9+ US TELECOMS BREACHED — FBI: ONGOING · IRAN: 3 WEEKS FROM WEAPONS-GRADE URANIUM (IAEA) · SUDAN: WORLD'S LARGEST DISPLACEMENT CRISIS — 14M+ DISPLACED · " +
  "US DEBT $38.43T · 10% UNIVERSAL TARIFF + 145% CHINA — LARGEST US TAX INCREASE SINCE 1993 · H5N1: OUT OF CONTROL IN ANIMAL RESERVOIRS · 2024 HOTTEST YEAR EVER: +1.55°C · ";
