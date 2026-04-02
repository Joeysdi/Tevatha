// lib/watchtower/data.ts
// Pure data module — no framework imports, safe for any server/client context

export type ThreatLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE";
export type TierClass   = "t4" | "t3" | "t2" | "t1";
export type SevCode     = "EX" | "CR" | "HI" | "EL" | "ME";
export type TrendDir    = "↑" | "→" | "↓";

export interface ThreatDomain {
  id:          string;
  label:       string;
  score:       number;
  level:       ThreatLevel;
  icon:        string;
  trend:       TrendDir;
  summary:     string;       // one-sentence current situation
  drivers:     string[];     // 3 scored sub-factors driving the Ark Score
  scenarioIds?: string[];    // scenarios nested under this domain in the sidebar
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
  domain?:    string[];
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
    id:"geopolitical", label:"Geopolitical", score:74, level:"HIGH", icon:"⚔️", trend:"↑", scenarioIds:["S05","S07","S09"],
    summary:"The Doomsday Clock — a symbol scientists use to show how close the world is to catastrophe — stands at 85 seconds, the closest ever in 79 years. For the first time in 50+ years, there is no active treaty limiting US or Russian nuclear weapons. Chinese government hackers have secretly been inside 9+ major US phone networks, and a separate group is hiding inside US power grids, ready to disable them if war starts. China also ran its biggest-ever military exercises around Taiwan in December 2025.",
    drivers:[
      "Treaty gap: The New START nuclear arms treaty expired February 5, 2026 — for the first time in 50+ years, no legal agreement limits how many nuclear weapons the US or Russia can have. Scientists responded by moving the Doomsday Clock to 85 seconds, an all-time record (Bulletin of Atomic Scientists, 2026).",
      "Nuclear build-up: China now has 600+ nuclear warheads (SIPRI 2025 estimate) and is building more missile silos, aiming to reach 1,000+ warheads by 2030 — the fastest expansion by any country since the Cold War. Russia also broadened the conditions under which it says it might use nuclear weapons.",
      "Salt Typhoon hack: Chinese government hackers (known as 'Salt Typhoon') secretly broke into 9+ major US phone companies and 200+ organizations in 80 countries. The FBI confirmed in February 2026 that the intrusion is 'still very much ongoing.'",
      "Volt Typhoon: A separate Chinese hacker group (known as 'Volt Typhoon') has secretly placed hidden access inside US power grids, water systems, and transport networks. The US government believes this is preparation to disrupt those systems in wartime — not simply spying.",
      "Taiwan risk: The Council on Foreign Relations rates the chance of a crisis in the Taiwan Strait in 2026 at 50% (even-money). China ran its most extensive military blockade practice around Taiwan ever on December 29, 2025. Iran is also estimated to be just weeks away from being able to produce a nuclear weapon.",
    ],
  },
  {
    id:"economic", label:"Economic", score:67, level:"HIGH", icon:"💸", trend:"↑", scenarioIds:["S01","S03"],
    summary:"The US national debt reached $38.43 trillion — about 124% of the entire US economy — and grows by $8 billion every single day. In April 2025, new taxes on imported goods were introduced: 10% on almost all imports and 145% on goods from China, the largest US tax increase as a share of the economy since 1993. Countries representing about 45% of global economic output are actively moving away from using the US dollar for trade.",
    drivers:[
      "US debt: The country owes $38.43 trillion — roughly 124% of the entire US economy — and interest payments now consume about 20% of all federal revenue. The Congressional Budget Office (CBO) projects this debt will surpass the all-time record set after World War 2 by 2036.",
      "Tariff shock: Starting in April 2025, the US added a 10% tax on almost all imported goods and a 145% tax specifically on Chinese imports — the largest US tax increase as a share of the economy since 1993. The EU, China, and Canada have each responded with their own retaliatory taxes.",
      "Banking stress: US banks hold $306 billion in unrealized losses (investments that have lost value on paper) as of Q4 2025 (FDIC data). Business property (commercial real estate) loan defaults are increasing.",
      "Moving away from the dollar: The BRICS+ group of countries (now 9 full members plus partner states) is working to trade with each other without using the US dollar. Saudi Arabia is exploring pricing oil in Chinese yuan. The dollar's share of global currency reserves is at a multi-decade low.",
      "Government digital currencies: 137 countries — representing 98% of the world's economy — are exploring government-controlled digital currencies (called CBDCs). China's digital yuan has already processed $986 billion in transactions. The EU aims to pass digital euro legislation by 2029. Government-controlled digital money could allow authorities to block, limit, or expire people's funds.",
    ],
  },
  {
    id:"environmental", label:"Environmental", score:61, level:"ELEVATED", icon:"🌍", trend:"↑", scenarioIds:["S10"],
    summary:"Scientists describe the spread of H5N1 bird flu in animals as 'completely out of control' (January 2026), with 70 confirmed human cases in the US and active spread in dairy cow herds. A new combined monkeypox (MPXV) virus strain with a 3–4% death rate was detected in India in January 2026. The year 2024 was officially the hottest ever recorded — 1.55°C above pre-industrial temperatures — and Arctic sea ice reached a record low in March 2026.",
    drivers:[
      "H5N1 bird flu: Scientists describe its spread in animals as 'completely out of control' — with 70+ confirmed human cases in the US and active spread in dairy cow herds. H5N1 historically kills about 48% of people it infects. There is no general vaccine stockpile ready for the public.",
      "New MPXV strain: A new combined monkeypox virus strain — mixing parts of two different virus types (clade Ib and IIb) — was detected in India on January 13, 2026 and is under WHO investigation. Its death rate is 3–4%, compared to less than 1% for the 2022 outbreak strain.",
      "Antibiotic resistance (AMR): 1.27 million people die per year because bacteria can no longer be killed by the drugs we have (Lancet 2024). The WHO projects this could reach 10 million deaths per year by 2050. Drug-resistant 'ESKAPE' bacteria that defeat last-resort antibiotics have been found in 89+ countries.",
      "Record temperatures: 2024 was officially the hottest year ever recorded at +1.55°C above pre-industrial levels (World Meteorological Organization). Arctic sea ice volume was approximately 20% below 2024 levels in March 2026.",
      "Food and water: 96 million people face severe food shortages caused by extreme weather — three times more than in 2020. 2.4 billion people live in areas where water is scarce. A La Niña weather pattern and crop disruptions are threatening grain supplies heading into mid-2026.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// PRIORITY SIGNALS
// ─────────────────────────────────────────────────────────────────────

export const SIGNALS: Signal[] = [
  {
    sig:       "The Doomsday Clock stands at 85 seconds to midnight — the closest it has ever been in its 79-year history. The Bulletin of Atomic Scientists cited failures of leadership, nuclear threats, unchecked AI, and unresolved biological dangers as reasons for the record-close setting.",
    domain:    "Nuclear",     score: 97, tier: "t4",
    source:    "Bulletin of Atomic Scientists",
    sourceUrl: "https://thebulletin.org/doomsday-clock/2026-statement/",
  },
  {
    sig:       "The New START nuclear arms control treaty expired on February 5, 2026 — for the first time in 50+ years, no legally binding treaty limits the number of nuclear weapons the US or Russia can have. Russia offered to voluntarily comply with the old limits, but no formal replacement agreement exists.",
    domain:    "Nuclear",     score: 94, tier: "t4",
    source:    "U.S. State Department",
    sourceUrl: "https://www.state.gov/new-start/",
  },
  {
    sig:       "Chinese government hackers ('Salt Typhoon') secretly broke into 9+ major US phone companies — including Verizon, AT&T, and T-Mobile — and compromised 200+ organizations in 80+ countries. The FBI confirmed in February 2026 that the campaign is 'still very much ongoing.'",
    domain:    "Cyber",       score: 92, tier: "t3",
    source:    "CyberScoop / FBI",
    sourceUrl: "https://cyberscoop.com/fbi-salt-typhoon-ongoing-threat-cybertalks-2026/",
  },
  {
    sig:       "A separate Chinese hacker group ('Volt Typhoon') has secretly placed hidden access points inside US power grids, water systems, and transport networks. The US government assesses this as preparation to disrupt those systems during a war — not merely spying.",
    domain:    "Cyber",       score: 89, tier: "t3",
    source:    "CISA Joint Advisory AA24-038A",
    sourceUrl: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a",
  },
  {
    sig:       "The US national debt stands at $38.43 trillion — roughly 124% of the entire US economy — and grows by $8 billion every day. Interest payments now consume about 20% of all federal income, creating a situation where the government cannot easily reduce borrowing without causing a financial crisis.",
    domain:    "Economic",    score: 88, tier: "t3",
    source:    "Senate Joint Economic Committee",
    sourceUrl: "https://www.jec.senate.gov/public/index.cfm/republicans/2026/1/national-debt-hits-38-43-trillion-increased-2-25-trillion-year-over-year-8-03-billion-per-day",
  },
  {
    sig:       "China's nuclear arsenal has grown to 600+ warheads (SIPRI 2025 estimate). China is constructing hundreds of new missile silos and is projected to reach 1,000+ warheads by 2030 — the largest nuclear expansion by any country since the Cold War.",
    domain:    "Nuclear",     score: 87, tier: "t3",
    source:    "SIPRI Yearbook 2025",
    sourceUrl: "https://www.sipri.org/yearbook/2025",
  },
  {
    sig:       "China ran its most extensive military exercises around Taiwan ever on December 29, 2025, practicing a complete naval blockade of the island. The Council on Foreign Relations rates the probability of a Taiwan Strait crisis in 2026 at 50% (even-money).",
    domain:    "Geopolitical", score: 83, tier: "t3",
    source:    "CFR Conflicts to Watch 2026",
    sourceUrl: "https://www.cfr.org/report/conflicts-watch-2026",
  },
  {
    sig:       "Russia updated its nuclear weapons policy in November 2024, lowering the stated threshold for possible use from 'threat to the state's existence' to 'critical threat to sovereignty' — a broader trigger that analysts continue to debate.",
    domain:    "Nuclear",     score: 82, tier: "t3",
    source:    "RealClearDefense",
    sourceUrl: "https://www.realcleardefense.com/articles/2026/03/09/is_russia_changing_its_nuclear_doctrine_to_affect_its_war_in_ukraine_1169225.html",
  },
  {
    sig:       "The Congressional Budget Office (CBO) 2026–2036 forecast projects US public debt will reach 120% of the economy by 2036 — surpassing the previous record of 106% set after World War 2. The annual deficit is tracking at about 6% of GDP with no structural fix in place.",
    domain:    "Economic",    score: 80, tier: "t3",
    source:    "Congressional Budget Office",
    sourceUrl: "https://www.cbo.gov/publication/61882",
  },
  {
    sig:       "Scientists described H5N1 bird flu in animal populations as 'completely out of control' in January 2026. The US has confirmed 70 human cases, with active spread in dairy cow herds. H5N1 historically kills about 48% of infected people. No sustained human-to-human transmission has been confirmed yet.",
    domain:    "Biological",  score: 79, tier: "t2",
    source:    "CDC Bird Flu Situation Summary",
    sourceUrl: "https://www.cdc.gov/bird-flu/situation-summary/index.html",
  },
  {
    sig:       "Israel used AI-powered targeting systems (called 'Lavender' and 'Habsora') in combat that can recommend human targets in about 20 seconds. A UN resolution to create a binding international treaty on such autonomous weapons was rejected by the US and Russia. No international rules currently govern AI weapons.",
    domain:    "Cyber",       score: 78, tier: "t2",
    source:    "Stanford FSI",
    sourceUrl: "https://fsi.stanford.edu/sipr/content/lethal-autonomous-weapons-next-frontier-international-security-and-arms-control",
  },
  {
    sig:       "The Russia-Ukraine war entered its third year with no realistic ceasefire in sight. The US cut direct financial aid to Ukraine. Russia has repeatedly refused to negotiate with President Zelenskyy. Analysts assess the war is unlikely to end in 2026.",
    domain:    "Geopolitical", score: 74, tier: "t2",
    source:    "CFR Conflicts to Watch 2026",
    sourceUrl: "https://www.cfr.org/report/conflicts-watch-2026",
  },
  {
    sig:       "A new monkeypox (MPXV) virus strain combining parts of two different virus types (clade Ib and IIb) was detected in India on January 13, 2026 and is under WHO investigation. Clade Ib has a death rate of 3–4%, compared to less than 1% for the strain that caused the 2022 outbreak.",
    domain:    "Biological",  score: 73, tier: "t2",
    source:    "WHO Disease Outbreak News",
    sourceUrl: "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON595",
  },
  {
    sig:       "Arctic sea ice volume hit a record low in March 2026 — roughly 20% below mid-2024 levels — with sea ice extent recording the 2nd lowest ever measured. The Arctic is warming at about 4 times the global average rate.",
    domain:    "Climate",     score: 71, tier: "t2",
    source:    "NSIDC Sea Ice Today",
    sourceUrl: "https://nsidc.org/sea-ice-today",
  },
  {
    sig:       "137 countries — representing 98% of the world's economy — are now exploring government-controlled digital currencies (CBDCs). China's digital yuan has processed $986 billion in transactions. The EU's Digital Euro is in preparation with legislation targeted for 2029. The US paused its retail CBDC development by executive order.",
    domain:    "Economic",    score: 68, tier: "t2",
    source:    "Atlantic Council CBDC Tracker",
    sourceUrl: "https://www.atlanticcouncil.org/cbdctracker/",
  },
  {
    sig:       "96 million people are facing severe food shortages caused by extreme weather events — three times more than in 2020. A drought in Argentina's Pampas farming region and crop damage from cold in the Black Sea wheat belt (January–February 2026) are threatening global grain supply in mid-2026.",
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
    basis:"The US owes $38.43 trillion (124% of GDP, growing $8B/day). US banks hold $306B in paper losses. 24 developing countries face large debt payments due by 2027. The government is in a position where it may have to keep borrowing to pay its interest, with no clear way out.",
  },
  {
    cls:"B", name:"Infrastructure Failure", prob:68, sev:"CR", n:12,
    basis:"Chinese hackers (Volt Typhoon) are hidden inside US power, water, and transport systems and are assessed to be ready to disable them during a war. Chinese hackers (Salt Typhoon) are still active inside 9+ US phone companies. Multiple intrusions into aging US grid infrastructure have been confirmed.",
  },
  {
    cls:"C", name:"Civil / Societal Fracture", prob:61, sev:"CR", n:14,
    basis:"The Council on Foreign Relations rates a high chance of political violence in the US in 2026. A crisis in the Taiwan Strait is rated at 50% probability. The shift away from a single world power toward multiple competing powers is a 10–20 year process underway. The Russia-Ukraine war has no ceasefire.",
  },
  {
    cls:"D", name:"Pandemic / Biological", prob:54, sev:"HI", n:8,
    basis:"H5N1 bird flu is described as 'completely out of control' in animals. A new combined monkeypox strain with a 3–4% death rate was detected in January 2026. H5N1 historically kills about 48% of people infected. No general-public vaccine stockpile exists for either disease.",
  },
  {
    cls:"E", name:"Climate Cascade", prob:51, sev:"HI", n:10,
    basis:"Arctic sea ice is at a record low. 96 million people face weather-driven food shortages — three times more than in 2020. Crop damage in Argentina and the Black Sea region is threatening mid-2026 grain supply. A La Niña weather pattern is active through Q1–Q2 2026.",
  },
  {
    cls:"F", name:"Nuclear / Existential", prob:24, sev:"EX", n:6,
    basis:"The Doomsday Clock is at 85 seconds — an all-time record. The New START nuclear arms control treaty expired in February 2026, leaving no active limits on US or Russian arsenals. China is racing toward 1,000 warheads. Russia broadened its stated conditions for nuclear use.",
  },
];

// ─────────────────────────────────────────────────────────────────────
// SCENARIOS
// ─────────────────────────────────────────────────────────────────────

export const SCENARIOS: Scenario[] = [
  {
    id:"S01", cls:"A", icon:"💸", title:"Hyperinflation",
    window:"2026–28", prob:42, sev:"CR", prepTime:"12 mo",
    summary:"Hyperinflation means prices rising more than 30% per year, which destroys the value of savings. The US debt stands at $38.43 trillion — about 124% of the economy — growing $8 billion per day. Interest payments already consume about 20% of all federal income. The Congressional Budget Office projects the debt will surpass the record set after World War 2 by 2036.",
    triggers:["The Federal Reserve is forced to print money to cover the deficit while prices are already rising","Foreign governments stop buying US Treasury bonds","The US dollar's share of global currency reserves falls below 45% (currently about 58%)"],
    cascade:["A4 Sovereign Default","C1 Civil Conflict","A8 USD Depegging"],
    mitigation:[
      { action:"Hold physical gold and silver outside the banking system",      pri:"1", cost:"15–25% net worth" },
      { action:"Open bank accounts in 2+ countries with different currencies",  pri:"1", cost:"$5K setup"        },
      { action:"Build a 12-month physical food supply",                         pri:"2", cost:"$2K–$8K"          },
      { action:"Invest in commodities that tend to rise with inflation",         pri:"3", cost:"Portfolio"        },
    ],
  },
  {
    id:"S03", cls:"A", icon:"🏦", title:"CBDC Mandatory Adoption",
    window:"2027–30", prob:48, sev:"HI", prepTime:"6 mo",
    summary:"137 countries — 98% of the world's economy — are exploring government-controlled digital currencies (CBDCs). China's digital yuan has already processed $986 billion in transactions. The EU's Digital Euro is targeting legislation in 2029. The US paused its retail CBDC by executive order — but a financial crisis could accelerate non-US adoption. CBDCs (programmable digital money) can be designed to block transactions, set expiry dates on funds, or enforce spending limits.",
    triggers:["The EU passes mandatory Digital Euro adoption legislation","A banking crisis causes governments outside the US to rush out emergency CBDCs","The G20 agrees on a shared CBDC system that works across borders"],
    cascade:["A3 Asset Freeze","A8 USD Depegging"],
    mitigation:[
      { action:"Move Bitcoin to a hardware wallet — off exchanges now",                      pri:"1", cost:"$100–$200 hardware" },
      { action:"Fund an offshore bank account to its maximum before any restrictions begin", pri:"1", cost:"Act now"           },
      { action:"Keep 6 months of physical cash in a foreign currency",                      pri:"1", cost:"$3K–$10K"          },
      { action:"Obtain a second residency in a country unlikely to impose CBDC controls",   pri:"2", cost:"$50K–$500K"        },
    ],
  },
  {
    id:"S05", cls:"B", icon:"⚡", title:"Grid-Down EMP / Cyber Attack",
    window:"2026–27", prob:32, sev:"CR", prepTime:"6 mo",
    summary:"Chinese hackers (Salt Typhoon) are already inside 9+ US phone companies. Another group (Volt Typhoon) is pre-positioned inside US power grids, ready to turn them off during a war. A state-sponsored cyberattack or an electromagnetic pulse (EMP) — a burst of energy that can fry electronics — could knock out the power grid for 2–8 weeks. Food distribution systems would fail within 72 hours. Water pumping would stop within 96 hours. Hospital backup generators would run out within 7 days.",
    triggers:["Volt Typhoon or Salt Typhoon activated during a Taiwan conflict","A Carrington-class solar storm (a massive burst of energy from the sun)","A high-altitude nuclear detonation designed to generate an EMP over the continental US"],
    cascade:["B4 Water Failure","B5 Food Distribution","B8 Hospital Overload — simultaneous"],
    mitigation:[
      { action:"Store 30 days of food and water (minimum)",                     pri:"1", cost:"$500–$2K"  },
      { action:"Install off-grid solar panels with a LiFePO4 battery backup",   pri:"1", cost:"$3K–$8K"   },
      { action:"Store critical electronics in a Faraday cage (blocks EMP)",     pri:"1", cost:"$50–$500"  },
      { action:"Get a ham radio license and buy Baofeng UV-5R radios ×5",       pri:"2", cost:"$300–$800" },
    ],
  },
  {
    id:"S07", cls:"C", icon:"🏛️", title:"US Constitutional Crisis",
    window:"2026–28", prob:30, sev:"CR", prepTime:"18 mo",
    summary:"Political scientists broadly estimate a 30–35% probability of serious political violence in the US. This scenario covers situations such as a disputed federal election result, the executive branch refusing to follow Supreme Court orders, or organized armed groups mobilizing in 3 or more states.",
    triggers:["An election result is formally disputed by major political actors","The executive branch publicly refuses to comply with a Supreme Court ruling","10 or more states formally reject federal authority on a major issue"],
    cascade:["C2 Mass Migration","C3 Surveillance State","A8 USD Reserve Loss"],
    mitigation:[
      { action:"Establish a second residency or citizenship in another country",    pri:"1", cost:"$50K–$500K" },
      { action:"Own rural property more than 100 miles from a major city",          pri:"1", cost:"$200K+"     },
      { action:"Create a detailed 48-hour evacuation plan ready to execute",        pri:"2", cost:"$500 planning"},
      { action:"Build a vetted community group of 15–30 people you trust",          pri:"1", cost:"Time"        },
    ],
  },
  {
    id:"S10", cls:"D", icon:"🦠", title:"H5N1 Pandemic",
    window:"2026–27", prob:35, sev:"CR", prepTime:"3 mo",
    summary:"Scientists describe H5N1 bird flu in animal populations as 'completely out of control' (January 2026). 70 US human cases have been confirmed, with the virus actively spreading in dairy cow herds. H5N1 historically kills about 48% of the people it infects. A new combined monkeypox (MPXV) strain (mixing clade Ib and IIb) emerged in January 2026 with a 3–4% death rate. If either virus achieves sustained human-to-human transmission, health systems could be overwhelmed within 8 weeks.",
    triggers:["H5N1 is confirmed in healthcare workers who had no contact with animals","The WHO declares a Public Health Emergency of International Concern (PHEIC) for a respiratory illness","The new combined MPXV strain spreads sustainably outside Central Africa"],
    cascade:["B8 Hospital Overload","A7 Supply Chain","C3 Surveillance State"],
    mitigation:[
      { action:"Stock 500 N95 respirator masks per adult in the household",        pri:"1", cost:"$200–$500"  },
      { action:"Build a 90-day food and water supply for full household isolation", pri:"1", cost:"$1K–$5K"    },
      { action:"Secure access to a rural property with a sealed room",             pri:"1", cost:"Access"     },
      { action:"Set up telemedicine access and a home medical kit",                pri:"2", cost:"$500–$2K"   },
    ],
  },
  {
    id:"S09", cls:"H", icon:"🚢", title:"Taiwan Strait Conflict",
    window:"2026–27", prob:40, sev:"CR", prepTime:"6 mo",
    summary:"China ran its most extensive military exercises around Taiwan ever on December 29, 2025, practicing a complete naval blockade. The Council on Foreign Relations rates a crisis in the Taiwan Strait in 2026 at 50%. Taiwan produces 92% of the world's most advanced computer chips — a blockade would trigger a global shortage of those chips within 90 days.",
    triggers:["China officially declares a naval blockade around Taiwan","A military incident occurs in the Taiwan Strait","The US sends mixed or unclear signals about its commitment to defend Taiwan"],
    cascade:["A7 Supply Chain","B2 Cyber Attack","A8 USD Reserve Loss"],
    mitigation:[
      { action:"Have a pre-planned exit route out of the Asia-Pacific region ready to go", pri:"1", cost:"Route planning" },
      { action:"Move hard assets (gold, property) to safe locations before any conflict trigger", pri:"1", cost:"15–25% hard assets"},
      { action:"Buy communications equipment before shortages begin",                           pri:"2", cost:"$300–$2K"       },
      { action:"Reduce reliance on income that depends on semiconductor availability",           pri:"2", cost:"—"              },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// TIMELINE EVENTS
// ─────────────────────────────────────────────────────────────────────

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { year:"1848", label:"Year of Revolutions — mass uprisings across Europe simultaneously",         sev:"high", colKey:"warn", domain:["geopolitical"], signal:"Liberal uprisings erupted across France, Austria, Prussia, Hungary, and Italy within weeks of each other. These were the first modern mass political movements. All revolutions were suppressed within 18 months — but the ideas they spread (democracy, nationalism, and socialism) became the driving forces of the next century and the direct ancestors of every major political movement that followed." },
  { year:"1865", label:"US Civil War ends — deadliest American conflict, industrial warfare proven",  sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"Between 620,000 and 850,000 people died — making it America's deadliest war. It was the first modern industrial war, using railroads, telegraphs, rifled artillery, and armored ships. It proved that industrial capacity determines military outcomes. The war freed 4 million enslaved people, but the failure of Reconstruction planted lasting structural inequality that continues to shape the US in 2026." },
  { year:"1873", label:"Long Depression — first global financial panic, 23-year contraction", sev:"high", colKey:"warn", domain:["economic"], signal:"A banking panic in Vienna in May 1873 triggered simultaneous bank failures across the US, UK, and Europe. 18,000 US businesses failed within two years. Global economic decline lasted until 1896. This was the first proof that connected financial markets can turn a local shock into a civilization-scale economic collapse. It is the direct template for 1929, 2008, and every debt-driven economic crisis since. Trust in the gold standard never fully recovered — a step on the path to today's fiat (paper) money system." },
  { year:"1905", label:"Russo-Japanese War + 1905 Revolution — Asia defeats a European empire",  sev:"high", colKey:"warn", domain:["geopolitical"], signal:"Russia was defeated by Japan — the first time a major Asian country had beaten a European empire. The shock triggered a massive uprising inside Russia, forcing Tsar Nicholas II to grant constitutional reforms. Lenin called it the 'dress rehearsal' for the 1917 revolution. The entire colonial world re-evaluated assumptions about European military dominance." },
  { year:"1914", label:"WW1 begins — assassination triggers collapse of European order",     sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"Archduke Franz Ferdinand was assassinated on June 28 in Sarajevo. Over the following six weeks, a network of alliance commitments pulled nation after nation into war. Trench warfare began in September 1914. Around 20 million people died. Four empires collapsed. The civilization that built the modern world tore itself apart over national rivalries." },
  { year:"1917", label:"Russian Revolution — Bolsheviks seize power, first communist state",  sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The February Revolution toppled the Tsar. In October, Lenin's Bolsheviks seized power. A civil war between Red and White forces killed 7–12 million more people. The world's first communist state was established, starting a 75-year ideological conflict between capitalism and communism that shaped the entire 20th century." },
  { year:"1918", label:"WW1 ends + Spanish Flu — 50–100M pandemic dead, four empires gone", sev:"critical", colKey:"red", domain:["geopolitical","environmental"], signal:"The war ended on November 11. The Spanish Flu pandemic (1918–20) then killed 50–100 million people — more than the war itself. The Austro-Hungarian, German, Ottoman, and Russian empires all collapsed within months. The peace deal that followed immediately planted the seeds of World War 2." },
  { year:"1919", label:"Versailles Treaty — punitive terms make WW2 mathematically inevitable",  sev:"high", colKey:"warn", domain:["geopolitical","economic"], signal:"Germany was required to pay $33 billion in reparations (equivalent to roughly $500 billion in 2024 dollars) and accept blame for the entire war. Germany lost 13% of its territory. The economist John Maynard Keynes resigned in protest and published 'The Economic Consequences of the Peace,' accurately predicting what would follow. Hitler's entire political platform was a direct reaction to the Versailles terms." },
  { year:"1923", label:"Weimar hyperinflation — 4.2 trillion marks per dollar, savings wiped",  sev:"high", colKey:"warn", domain:["economic"], signal:"The German mark collapsed to 4.2 trillion per US dollar by November 1923. Middle-class savings were completely wiped out. The psychological trauma lasted generations — German conservatism around money and the independence of its central bank trace directly to this event. The hyperinflation playbook is currently active in Turkey, Argentina, and Venezuela." },
  { year:"1929", label:"Black Tuesday — Wall Street Crash, Great Depression begins",                   sev:"critical", colKey:"red",  domain:["economic"], signal:"On October 29, 1929, the US stock market lost 89% of its value from peak to trough. 9,000 US banks failed. Unemployment reached 25%. Global trade collapsed by 66%. The gold standard forced a deflationary spiral across every connected economy. Protectionist tariffs (Smoot-Hawley) made everything worse. This is the direct template for 2008 and every debt-driven economic crisis since." },
  { year:"1933", label:"Hitler becomes Chancellor — economic collapse fuels authoritarian rise", sev:"critical", colKey:"red", domain:["geopolitical","economic"], signal:"Hitler became Chancellor on January 30, 1933, with 30% unemployment, unresolved Versailles resentment, and hyperinflation fresh in people's memory. Within two months, the Enabling Act gave him dictatorial powers. The lesson that repeats throughout history: severe economic collapse becomes a recruitment tool for authoritarian movements." },
  { year:"1936", label:"Spanish Civil War — fascist/communist proxy war, blitzkrieg tested",   sev:"high", colKey:"warn", domain:["geopolitical"], signal:"Germany and Italy backed Franco's fascists; the Soviet Union backed the Republicans. Hitler used Spain to test the Luftwaffe (air force) and Panzer (tank) tactics. Guernica was the first mass aerial bombing of a civilian city. About 500,000 people died. Western countries' policy of avoiding confrontation hardened. The tactics and alliances of World War 2 were rehearsed here." },
  { year:"1939", label:"WW2 begins — Germany invades Poland",   sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"Germany invaded Poland on September 1, 1939, after signing a secret agreement with the Soviet Union to divide Eastern Europe. France fell in six weeks in June 1940. Britain stood alone. Germany invaded the Soviet Union in June 1941 with 4 million troops — 27 million Soviet citizens would die in the war. Japan's attack on Pearl Harbor in December 1941 made it a truly global conflict." },
  { year:"1941", label:"Pearl Harbor + Operation Barbarossa — global war ignites", sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"June 22: Germany launched the largest land invasion in history against the Soviet Union. December 7: Japan attacked the US naval base at Pearl Harbor. December 11: Hitler declared war on the US. Total industrial war was now global. 70–85 million people would die before 1945." },
  { year:"1944", label:"Bretton Woods — US dollar becomes global reserve currency",          sev:"low",      colKey:"info", domain:["economic"], signal:"This is where the current financial system was designed. $400 billion in US debt was established as the baseline. The US dollar became the world's primary reserve currency — a status that is now actively being challenged by the BRICS+ nations." },
  { year:"1945", label:"Hiroshima & Nagasaki — nuclear weapons used for the first and only time",     sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The only two times nuclear weapons have been used in war. This established the nuclear deterrence era (the idea that having nuclear weapons prevents others from attacking you). If nuclear weapons are ever used again, the entire Tevatha threat posture immediately escalates to the highest level (Tier 4)." },
  { year:"1950", label:"Korean War — first major US-China direct conflict, nuclear threat raised", sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"US and Chinese forces fought directly for the first time. General MacArthur requested permission to use nuclear weapons — the request was denied. This set the template for 'limited war under the nuclear umbrella.' About 36,000 US soldiers died." },
  { year:"1953", label:"Stalin dies + Korean armistice — brief Cold War pause", sev:"high",    colKey:"info", domain:["geopolitical"], signal:"Stalin's death removed the most aggressive Soviet leader. The Korean War armistice was signed on July 27. A brief period of de-escalation followed before the arms race accelerated again under Khrushchev." },
  { year:"1957", label:"Sputnik + first ICBM — nuclear warheads can now reach anywhere", sev:"high",  colKey:"info", domain:["geopolitical"], signal:"The Soviet Union launched Sputnik (the first satellite) and tested the R-7 — the first intercontinental ballistic missile (ICBM) capable of reaching the US. Nuclear warheads could now be delivered to any point on Earth. The concept of 'mutually assured destruction' (MAD) — both sides would be destroyed in a nuclear war — became official Cold War doctrine." },
  { year:"1962", label:"Cuban Missile Crisis — 13 days from potential nuclear exchange", sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The US and Soviet Union came closer to nuclear war than at any other time in history over 13 days in October 1962. Any equivalent confrontation today, without back-channel communication, would be an immediate Tier 4 situation." },
  { year:"1963", label:"JFK assassination — shock to executive continuity",       sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"President Kennedy's assassination triggered a period of institutional uncertainty. Nuclear command and communication procedures were rewritten. The key preparedness lesson: never depend on a single decision-maker. The transfer of power during a crisis is itself a distinct failure mode." },
  { year:"1968", label:"Prague Spring crushed — Soviet doctrine: intervene in any socialist state",   sev:"high",     colKey:"warn", domain:["geopolitical"], signal:"Soviet tanks ended Czechoslovakia's attempt at democratic reform. The USSR formally declared the right to militarily intervene in any socialist country that moved away from Soviet-style governance. This doctrine is a direct template for Putin's stated justifications for the 2022 Ukraine invasion." },
  { year:"1971", label:"Nixon Shock — gold standard ends, unlimited government borrowing begins",    sev:"high",     colKey:"warn", domain:["economic"], signal:"President Nixon ended the link between the US dollar and gold. Before 1971, each dollar was backed by physical gold held in reserve. After 1971, governments could create money without any backing. US debt: $400B (1971) → $36.4T (2024). Unlimited deficit spending became possible." },
  { year:"1972", label:"Nixon opens China — US-China-Soviet triangle reshapes Cold War", sev:"high", colKey:"info", domain:["geopolitical","economic"], signal:"National Security Advisor Kissinger's triangular diplomacy split the China-Soviet alliance. China entered the global trade system. This planted the seeds of the 2025 tech war and the 2030s technology decoupling between the US and China." },
  { year:"1973", label:"OPEC oil shock — oil priced in dollars, petrodollar system born",         sev:"high",     colKey:"warn", domain:["economic"], signal:"Arab oil-producing nations cut off oil exports to the US, triggering a 400% price spike. A US-Saudi arrangement followed: oil would be priced in US dollars, and the proceeds would be recycled into US government bonds (Treasuries). This 'petrodollar' system reinforced dollar dominance — and is now actively being dismantled as Saudi Arabia explores pricing oil in Chinese yuan." },
  { year:"1979", label:"Iranian Revolution + Soviet Afghanistan — two conflicts still active in 2026", sev:"critical", colKey:"red", domain:["geopolitical"], signal:"Ayatollah Khomeini took power in Iran, ending the Shah's rule. The Soviet Union invaded Afghanistan. Both events are still driving active conflicts in 2026 — Iran's nuclear program traces directly to this year, and the geopolitical fractures from the Afghan war never fully healed." },
  { year:"1986", label:"Chernobyl — nuclear reactor explodes, 350,000 displaced",          sev:"high",     colKey:"warn", domain:["geopolitical","environmental"], signal:"Reactor 4 at the Chernobyl nuclear plant exploded, exposing a catastrophic failure of nuclear safety systems and management culture. About 350,000 people were permanently displaced. The estimated economic cost was roughly $700 billion. The disaster accelerated the collapse of the Soviet Union." },
  { year:"1989", label:"Berlin Wall falls — Cold War ends, US-led world order begins", sev:"high", colKey:"info", domain:["geopolitical"], signal:"The Soviet empire collapsed within 18 months. The US declared the 'end of history' — the idea that liberal democracy had permanently won. NATO began expanding eastward. The post-1989 international order — based on US leadership and international rules — is the system that is currently fracturing." },
  { year:"1991", label:"USSR dissolves — nuclear arsenal splits across 4 new countries", sev:"high", colKey:"info", domain:["geopolitical"], signal:"The Soviet Union broke into 15 independent countries. Its nuclear arsenal was split across Russia, Ukraine, Kazakhstan, and Belarus. The 1994 Budapest Memorandum promised Ukraine security in exchange for giving up those nuclear weapons — a promise later broken when Russia invaded." },
  { year:"1994", label:"Rwanda genocide — 800,000 killed while UN watched",  sev:"critical", colKey:"red", domain:["geopolitical"], signal:"UN peacekeepers on the ground were ordered not to intervene. 800,000 Tutsi people were killed in 100 days. This established that a UN Security Council veto from any one of five permanent members equals impunity for the vetoing nation's allies. That framework remains in place in 2026." },
  { year:"1997", label:"Asian financial crisis — currency collapse, IMF emergency packages", sev:"high", colKey:"warn", domain:["economic"], signal:"Thailand's currency peg broke on July 2, 1997. Financial contagion spread to Indonesia, South Korea, and Malaysia within weeks. Emergency IMF rescue packages totaled $17B (Thailand), $57B (South Korea), and $43B (Indonesia) — all with austerity conditions that created lasting anti-IMF sentiment. Indonesia's currency collapsed 80% and its long-serving leader Suharto fell from power. Blueprint for 2008: countries that borrow in foreign currencies (especially dollars) are structurally vulnerable when those currencies move against them." },
  { year:"1998", label:"LTCM collapse + Russian default — first stress test of modern finance", sev:"high", colKey:"warn", domain:["economic"], signal:"Long-Term Capital Management — a massive hedge fund — required a Federal Reserve-coordinated $3.6 billion bailout after making enormous losing bets. Russia defaulted on its domestic debt. The instinct to bail out failing financial institutions rather than let them collapse was born here. The lesson was ignored until 2008." },
  { year:"2001", label:"9/11 — surveillance state era begins",                 sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The Patriot Act, expanded FISA courts, and NSA bulk data collection programs were created in response. The security infrastructure built after 9/11 created a permanent surveillance system that has served as the justification for every subsequent erosion of civil liberties." },
  { year:"2003", label:"Iraq invasion — based on false intelligence, credibility damaged", sev:"critical", colKey:"red", domain:["geopolitical"], signal:"The US invaded Iraq based on claims about weapons of mass destruction (WMD) that turned out to be false. Disbanding the Iraqi army created the conditions that later produced ISIS. More than $2 trillion was spent. US credibility as an enforcer of international rules was permanently reduced. The shift away from a single US-led world order began here." },
  { year:"2007", label:"Subprime crisis begins — housing bubble peak, CDO collapse",    sev:"high",   colKey:"warn", domain:["economic"], signal:"Bear Stearns hedge funds failed. $1.3 trillion in risky home loans had been packaged and sold as safe AAA-rated bonds (called CDOs). The collapse chain started here. The full financial crisis arrived in September 2008. The era of central bank balance sheet expansion began." },
  { year:"2008", label:"Global Financial Crisis — QE1 begins, $9T in new money created",                 sev:"critical", colKey:"warn", domain:["economic"], signal:"The Federal Reserve's balance sheet grew from $900 billion to $9 trillion through quantitative easing (QE) — essentially creating new money to buy government bonds and prevent a collapse. This policy never truly ended. It will eventually resolve as either significant inflation or a debt default." },
  { year:"2011", label:"Fukushima + Arab Spring — two simultaneous system shocks",          sev:"high",     colKey:"warn", domain:["geopolitical","environmental"], signal:"Fukushima exposed catastrophic assumptions about nuclear plant safety. The Arab Spring demonstrated how quickly governments can collapse. Both events showed how connected failures in one system cascade globally across multiple systems." },
  { year:"2013", label:"Snowden revelations — full-scale mass surveillance confirmed",    sev:"high",  colKey:"warn", domain:["geopolitical"], signal:"Edward Snowden revealed that the NSA was collecting all US phone metadata and had direct server access to Google, Apple, and Facebook through a program called PRISM. Mass government surveillance was fully operational — and is being further accelerated by AI integration after 2026." },
  { year:"2014", label:"Crimea annexation — first European territory seized by force since WW2",       sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"Russia forcibly annexed Crimea from Ukraine — the first annexation of European territory by force since World War 2. This demonstrated Russia's willingness to break the post-Cold War international order. Sanctions began. NATO accelerated its eastern expansion. This was the direct precedent for the 2022 full-scale invasion." },
  { year:"2015", label:"Paris Agreement + ISIS peak — last moment of institutional optimism", sev:"high", colKey:"info", domain:["geopolitical","environmental"], signal:"195 nations signed the Paris climate accord (though it was non-binding). At the same time, ISIS controlled territory the size of the UK. Both events represent the peak of post-Cold War optimism in international institutions — just before the 2016 fracture." },
  { year:"2016", label:"Brexit + US political fracture — Western institutions begin to crack",    sev:"high",   colKey:"warn", domain:["geopolitical","economic"], signal:"The Brexit vote and Trump's election occurred in the same year, both signaling a broad rejection of the post-World War 2 international consensus across Western democracies. Populist politics became a permanent feature of Western democracies, not a temporary phase." },
  { year:"2017", label:"North Korea ICBM — nuclear missiles can now reach the continental US", sev:"critical", colKey:"red", domain:["geopolitical"], signal:"North Korea's Hwasong-14 missile test confirmed it could reach the continental United States. Kim Jong-un declared North Korea had completed its nuclear deterrent. North Korea became the third nuclear-armed country capable of striking the US mainland. This permanently elevated the nuclear risk level." },
  { year:"2018", label:"US-China trade war begins — technology decoupling starts",    sev:"high",     colKey:"warn", domain:["economic"], signal:"The US imposed $34 billion in tariffs on Chinese goods. China retaliated. Huawei was designated a national security threat. The 'Entity List' of restricted Chinese companies expanded. Full decoupling of US and Chinese technology supply chains is now in its final phase, expected by around 2029." },
  { year:"2019", label:"COVID precursor signals — last 12-month window before pandemic",   sev:"high",     colKey:"pink", domain:["environmental"], signal:"The WHO warned about pandemic preparedness gaps. Surveillance data was being collected from Wuhan's markets. This was the last 12-month window to build pandemic stockpiles before COVID-19. Most governments did not take action." },
  { year:"2020", label:"COVID-19 — simultaneous global stress test",              sev:"critical", colKey:"pink", domain:["environmental"], signal:"COVID-19 validated every preparedness principle: having 6-month stockpiles, off-grid capability, and rural property all proved their worth. Every Ark preparedness parameter should be increased as a result." },
  { year:"2021", label:"Afghanistan collapses in 11 days — US credibility seriously damaged",   sev:"critical", colKey:"red", domain:["geopolitical"], signal:"The Taliban took Kabul just 11 days after the US military withdrew. $83 billion in US military equipment was left behind. 20 years and $2.3 trillion spent achieved zero lasting stability. Other countries' confidence in US security guarantees was significantly weakened." },
  { year:"2022", label:"Ukraine War — first major European land war since WW2",      sev:"critical", colKey:"red", domain:["geopolitical"], signal:"A multi-decade shift away from a single US-led world toward multiple competing powers has begun. The nuclear taboo — the unspoken rule that nuclear weapons are never used — was openly challenged. NATO member countries were forced to significantly increase defense spending." },
  { year:"2023", label:"SVB + Credit Suisse collapse — $600B+ in paper losses exposed",     sev:"high", colKey:"warn", domain:["economic"], signal:"The collapse of Silicon Valley Bank and Credit Suisse exposed massive hidden losses in the banking system. This was not fully resolved — only deferred. Watch the overnight lending rate (repo rate) as the key early warning indicator of the next banking stress event." },
  { year:"2023", label:"Doomsday Clock: 90 seconds — then-closest in 76-year history",   sev:"critical",colKey:"red", domain:["geopolitical"], signal:"The Bulletin of Atomic Scientists (BAS) uses a rigorous methodology. Every advance of the Doomsday Clock corresponds to one escalation in Tevatha's threat tier system." },
  { year:"2024", label:"Trump re-elected + tariff regime — America First 2.0 begins",    sev:"high",     colKey:"warn", domain:["geopolitical","economic"], signal:"The 47th US presidency initiated a 10% universal import tariff, 145% tariffs on Chinese goods, and withdrawal from the WHO — the largest US tax increase since 1993, implemented by executive order. Stress on the US alliance system with Europe, Asia, and Canada began." },
  { year:"2025", label:"Doomsday Clock: 89 seconds — new record at the time",             sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The Bulletin of Atomic Scientists cited AI weapons use on the battlefield and intensified nuclear threats as reasons for moving the clock from 90 seconds to 89 seconds." },
  { year:"2025", label:"Salt Typhoon: China secretly inside 9+ US phone networks", sev:"high",   colKey:"warn", domain:["geopolitical"], signal:"Chinese hackers broke into the core infrastructure of major US internet service providers, giving access to energy, transport, and healthcare networks as well as phone calls. The FBI confirmed the intrusion was still active as of February 2026." },
  { year:"2026", label:"Doomsday Clock: 85 seconds — all-time closest. New START treaty expires", sev:"critical", colKey:"red", isNow:true, domain:["geopolitical"], signal:"No nuclear arms control treaty is in force for the first time in 50+ years. China has 600+ warheads. The Bulletin of Atomic Scientists moved the clock from 89 to 85 seconds on January 27, 2026. New START expired on February 5, 2026." },

  // ── PREDICTED ─────────────────────────────────────────────────────────────
  { year:"2026", predicted:true, label:"Iran nuclear breakout — estimated 3 weeks from weapons-grade material", sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The IAEA estimates Iran has 408.6 kg of uranium enriched to 60% purity — roughly 3 weeks of further processing away from weapons-grade material. If Iran crosses that threshold, Saudi Arabia, Turkey, and the UAE would likely seek nuclear weapons too — triggering a regional nuclear proliferation cascade." },
  { year:"2027", predicted:true, label:"China reaches 800+ warheads — three-way nuclear parity era begins",       sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"SIPRI projection. For the first time in history, three countries (US, Russia, China) would hold roughly equivalent first-strike nuclear capability. The 'mutually assured destruction' calculation that has kept nuclear weapons from being used since 1945 would fundamentally change." },
  { year:"2027", predicted:true, label:"US national debt crosses $40T — interest exceeds defense spending",   sev:"high",     colKey:"warn", domain:["economic"], signal:"CBO baseline projection: $40 trillion by mid-2027. For the first time since World War 2, interest payments on the national debt would exceed the entire defense budget. The government would be forced to choose between borrowing more and cutting critical services." },
  { year:"2027", predicted:true, label:"First major AI-driven cyber event — Volt Typhoon activation risk", sev:"critical", colKey:"warn", domain:["geopolitical"], signal:"Volt Typhoon has been pre-positioned inside US power, water, and transport systems since 2021. AI-accelerated attack tools shorten the time between decision and impact to below human response time. The first wartime use of these hidden access points is most likely during the peak Taiwan conflict window." },
  { year:"2028", predicted:true, label:"Taiwan Strait: peak risk window — global chip supply threatened", sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"The Council on Foreign Relations rates 2026–28 as the peak crisis window. China completes its military modernization program. Taiwan produces 92% of the world's most advanced computer chips. A full blockade would shut down global technology production." },
  { year:"2028", predicted:true, label:"H5N1 pandemic risk peak — first sustained human cluster possible",          sev:"critical", colKey:"pink", domain:["environmental"], signal:"H5N1 historically kills about 48% of infected people. Any confirmed sustained human-to-human transmission immediately triggers full isolation protocol (Ark Protocol D). No mass-use vaccine is stockpiled. Act immediately — do not wait for official guidance." },
  { year:"2029", predicted:true, label:"EU Digital Euro launches — government-controlled digital money enters G7",    sev:"high",     colKey:"warn", domain:["economic"], signal:"ECB (European Central Bank) legislation is targeted for 2029. Programmable government digital currency enables transaction-level surveillance and the ability to block or expire funds. This is a Decision Gate G8 trigger. Move Bitcoin to self-custody now, before restrictions are imposed." },
  { year:"2029", predicted:true, label:"US-China tech cold war peaks — chip supply chains permanently split", sev:"high", colKey:"warn", domain:["economic","geopolitical"], signal:"No advanced computer chips will cross between the US and Chinese technology blocs. Taiwan's strategic importance reaches its maximum. The global technology sector permanently splits into two incompatible ecosystems." },
  { year:"2030", predicted:true, label:"Doomsday Clock: projected 75 seconds — Gate G5 trigger",    sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"Based on BAS trend analysis. 75 seconds triggers Tevatha Decision Gate G5: escalate from Tier 3 to Tier 4. Your Ark location must be fully operational before this date. No exceptions." },
  { year:"2030", predicted:true, label:"BRICS+ non-dollar trade active — dollar share below 45%", sev:"high",     colKey:"warn", domain:["economic"], signal:"The BRICS+ group (9+ member countries) is targeting 2030 for a functional non-dollar trade settlement system. When the US dollar's share of global currency reserves falls below 45%, the de-dollarization (shift away from the dollar) becomes self-reinforcing and irreversible." },
  { year:"2031", predicted:true, label:"Sovereign debt cascade — first simultaneous G20 defaults",  sev:"critical", colKey:"warn", domain:["economic"], signal:"Three or more G20 countries default on their debt simultaneously. The IMF's emergency lending capacity is exhausted. The crisis spreads to pension funds globally. Decision Gate G4 (bank bail-in risk) reaches its peak." },
  { year:"2032", predicted:true, label:"Climate displacement: 150M people forced to move — food conflicts begin", sev:"high", colKey:"info", domain:["environmental"], signal:"UNHCR (UN refugee agency) projection. Arctic ice feedback loops permanently lock in +2°C of warming. Competition for shrinking farmland begins between countries that have nuclear weapons." },
  { year:"2032", predicted:true, label:"First pan-resistant pathogen — no antibiotic works",  sev:"critical", colKey:"pink", domain:["environmental"], signal:"The first bacteria resistant to every known antibiotic class appears in a multi-continent outbreak. Death rate: 30%+. No treatment exists. Elective surgery and care for people with weakened immune systems collapses globally." },
  { year:"2033", predicted:true, label:"Post-Cold War international order collapses",               sev:"high",     colKey:"info", domain:["geopolitical"], signal:"The UN Security Council is paralyzed, NATO has fragmented, and the WTO dispute system no longer functions. The post-1945 international rules-based order reaches structural collapse. Regional power blocs replace global governance." },
  { year:"2033", predicted:true, label:"AI executes first lethal strike without human approval", sev:"critical", colKey:"warn", domain:["geopolitical"], signal:"An AI targeting system carries out a deadly strike without a human being in the decision loop. Who is responsible is disputed. An emergency UN session fails to reach agreement. International arms control frameworks collapse within 90 days." },
  { year:"2034", predicted:true, label:"AI weapons treaty fails — machine-speed war becomes possible",           sev:"high",     colKey:"warn", domain:["geopolitical"], signal:"A UN treaty on lethal autonomous weapons is rejected by the US, China, and Russia. AI decision cycles become faster than human response time. The speed of escalation in any conflict becomes dictated by machines, not people." },
  { year:"2035", predicted:true, label:"200M climate refugees — armed conflicts over farmland", sev:"high",  colKey:"info", domain:["environmental"], signal:"The UNHCR threshold is crossed. Countries with nuclear weapons compete over shrinking agricultural zones. Food and water security become the primary objectives of military planning. Tevatha relocation criteria must account for where farmland will be in a warmer world." },
  { year:"2036", predicted:true, label:"AI eliminates 40%+ cognitive jobs — welfare states fail", sev:"high", colKey:"warn", domain:["economic"], signal:"White-collar job displacement outpaces retraining capacity. The tax base collapses in G7 countries. Sovereign debt crises accelerate. Mass unemployment drives political radicalization on a large scale." },
  { year:"2037", predicted:true, label:"Post-dollar multipolar reserve system — Bretton Woods era ends", sev:"high",     colKey:"info", domain:["economic"], signal:"The Bretton Woods II era (US dollar as global reserve currency) ends. A multipolar system with multiple reserve currencies becomes the new norm. Physical gold re-enters national reserves as a top-tier asset globally." },
  { year:"2038", predicted:true, label:"AGI threshold — AI takes on autonomous governance and infrastructure roles", sev:"critical", colKey:"red", domain:["geopolitical"], signal:"AI systems demonstrably outperform humans in strategic planning across all domains. A first nation formally delegates policy advisory functions to AI. Critical infrastructure management transfers to autonomous systems. The era of post-human governance begins." },
  { year:"2039", predicted:true, label:"Post-AGI economic shock — 60%+ unemployment, emergency UBI rollout",         sev:"critical", colKey:"warn", domain:["economic"], signal:"AGI-driven automation eliminates the majority of knowledge work within 18 months of the threshold crossing. Emergency universal basic income (UBI) legislation passes in 40+ countries. The social contract is under existential pressure." },
  { year:"2040", predicted:true, label:"Nuclear fusion commercial: first grid-scale plant online",                    sev:"high",     colKey:"info", domain:["economic"], signal:"The first commercially viable fusion reactor feeds a national power grid. The era of energy scarcity begins to end. The geopolitical power of countries that sell fossil fuels collapses within a decade." },
  { year:"2041", predicted:true, label:"DIY biology democratized — home-lab pathogen risk peaks",                  sev:"critical", colKey:"pink", domain:["environmental"], signal:"The cost of synthesizing any DNA sequence falls below $100. CRISPR gene-editing kits become commercially available to the public. The ability to contain dangerous biology effectively disappears. The first credible non-state bioweapon attempt is confirmed." },
  { year:"2042", predicted:true, label:"Sixth mass extinction confirmed: 50% of species lost since 2000",            sev:"high",     colKey:"info", domain:["environmental"], signal:"The IUCN (International Union for Conservation of Nature) red list crosses an irreversible threshold. Ecosystem collapse begins to affect food chains. Climate feedback loops accelerate beyond model projections." },
  { year:"2043", predicted:true, label:"Arctic Ocean fully ice-free — first complete summer melt",                   sev:"high",     colKey:"info", domain:["environmental"], signal:"The first year the Arctic Ocean has zero summer sea ice. Methane frozen in the seafloor (hydrates) starts destabilizing. The Northern Sea Route becomes navigable year-round. Russia, Canada, the US, and China begin competing for Arctic resources." },
  { year:"2045", predicted:true, label:"Technological singularity window — AI self-improvement loop",          sev:"critical", colKey:"red",  domain:["geopolitical"], signal:"AI systems begin improving themselves faster than human oversight can track. All previous risk models become obsolete. Tevatha protocol enters undefined territory." },
  { year:"2047", predicted:true, label:"Global population peaks at 10.4B — resource competition at maximum",            sev:"high",     colKey:"warn", domain:["environmental"], signal:"UN median population projection. Peak population coincides with peak stress on water, food, and energy systems. Conflict probability is at the highest point in human history." },
  { year:"2048", predicted:true, label:"First water war — armed conflict over fresh water rights",           sev:"critical", colKey:"red",  domain:["geopolitical","environmental"], signal:"The first armed conflict where fresh water access is the explicit and primary cause. Most likely in the Nile basin, Indus River, or Mekong River regions. Sets a precedent for resource wars between nuclear-armed states in the 2050s." },
  { year:"2050", predicted:true, label:"+2°C permanently locked in — IPCC confirms no return",    sev:"critical", colKey:"info", domain:["environmental"], signal:"Even if all carbon emissions stopped immediately, the warming already committed cannot be reversed. Crop growing zones shift 500+ miles toward the poles. More than 2 billion people live in zones that will become too hot to inhabit. Sea level rise commitments are locked in for centuries." },
  { year:"2053", predicted:true, label:"First nation dissolved by climate — a country ceases to exist",     sev:"high",     colKey:"info", domain:["environmental"], signal:"A UN member state formally ceases to exist because its territory becomes uninhabitable. This sets a precedent for 20+ other nations. International law has no framework for people who lose their country to climate change." },
  { year:"2055", predicted:true, label:"First permanent off-world colony — Mars or Lunar settlement",          sev:"high",     colKey:"info", signal:"The first self-sustaining human presence beyond Earth. The Ark Protocol gains an off-world tier. Different actors — billionaires and governments — disagree on who governs extraterrestrial populations." },
  { year:"2056", predicted:true, label:"Synthetic food replaces 40% of agriculture — land power ends",          sev:"high",     colKey:"info", domain:["economic","environmental"], signal:"Lab-grown protein and precision fermentation reach the same price as animal agriculture. 40% of the world's farmland becomes economically unviable. Countries whose power comes from agriculture lose their primary geopolitical leverage." },
  { year:"2060", predicted:true, label:"Designer genomes normalized — gene editing of human babies routine", sev:"high",   colKey:"pink", domain:["environmental"], signal:"Editing the DNA of human embryos exits the experimental phase and becomes routine in 30+ countries. Genetic differences between edited and unedited populations begin to create a new axis of inequality alongside economic and geographic divides." },
  { year:"2062", predicted:true, label:"Post-human decade — AI-enhanced humans become statistically dominant",      sev:"critical", colKey:"warn", domain:["economic"], signal:"The majority of high-income people use cognitive enhancement technology. Two cognitive classes emerge. People without enhancement are structurally excluded from economic and governance roles within a generation." },
  { year:"2065", predicted:true, label:"AI legal personhood — first jurisdiction grants rights to AI",       sev:"high",     colKey:"warn", domain:["geopolitical"], signal:"A court or legislature formally recognizes an AI as a legal entity with rights. This cascades globally. Human legal primacy is no longer absolute." },
  { year:"2070", predicted:true, label:"Post-scarcity energy — fusion + solar makes electricity nearly free",   sev:"high",     colKey:"info", domain:["economic"], signal:"The cost of electricity approaches zero in developed countries. Industrial civilization restructures around energy abundance. Countries whose economic power depends on oil and gas collapse as leverage." },
  { year:"2075", predicted:true, label:"Nation-states decline — city-states and corporate zones replace them",     sev:"high",     colKey:"warn", domain:["geopolitical"], signal:"The Westphalian nation-state model (countries as primary units of governance) stops functioning in 40+ regions. Corporate charter cities, AI-administered zones, and city-state alliances become the primary units of governance." },
  { year:"2080", predicted:true, label:"Longevity escape velocity — aging halted for the wealthy, inequality peaks", sev:"critical", colKey:"red", domain:["economic"], signal:"Biological aging is effectively stopped for wealthy populations. Humanity splits into an indefinite-lifespan elite and a mortal majority. The Ark Protocol must treat access to longevity technology as a Tier 1 resource." },
  { year:"2085", predicted:true, label:"Climate stabilization verdict — transition succeeded or failed",             sev:"critical", colKey:"info", domain:["environmental"], signal:"By 2085, it will be clear whether civilization successfully navigated the 2026–2050 transition. Either +4°C of warming is locked in with cascading collapse, or a managed transition to a new equilibrium occurred. No middle path remains." },
  { year:"2090", predicted:true, label:"Neural interfaces normalized — human-AI cognitive merger",         sev:"critical", colKey:"warn", domain:["environmental"], signal:"Direct brain-computer interfaces become mainstream. Human cognition is augmented by AI in real time. The distinction between a person's own thoughts and AI output becomes philosophically unresolvable." },
  { year:"2100", predicted:true, label:"Post-human civilization — humanity unrecognizable from 2026", sev:"critical", colKey:"red", domain:["geopolitical"], signal:"The civilization that built this protocol no longer exists in recognizable form. Whether this represents survival, transcendence, or extinction is the question the Ark was built to answer." },
];

// ─────────────────────────────────────────────────────────────────────
// DECISION GATES
// ─────────────────────────────────────────────────────────────────────

export const GATES: DecisionGate[] = [
  { id:"G1", trigger:"A nuclear weapon is detonated anywhere in the world",                     window:"Immediate",  tier:"t4", action:"Execute full Ark protocol. No delay. No exceptions." },
  { id:"G2", trigger:"DEFCON 2 (or equivalent alert level) is raised",                         window:"Immediate",  tier:"t4", action:"Execute immediate evacuation to Ark location." },
  { id:"G3", trigger:"NATO Article 5 (collective defense clause) is formally invoked",          window:"24 hours",   tier:"t4", action:"Leave Europe immediately. No exceptions." },
  { id:"G4", trigger:"A G7 government announces bank bail-in (using depositor funds to rescue a bank)", window:"24 hours",   tier:"t4", action:"Move all cash to physical assets or offshore accounts immediately." },
  { id:"G5", trigger:"Doomsday Clock moves to 75 seconds or closer",                            window:"30 days",    tier:"t4", action:"Escalate from Tier 3 to Tier 4. Ark location must be fully operational." },
  { id:"G6", trigger:"WHO declares a Public Health Emergency of International Concern (PHEIC) for a respiratory pathogen", window:"Immediate",  tier:"t3", action:"Activate isolation protocol immediately. Do not wait for local transmission." },
  { id:"G7", trigger:"Overnight bank lending rate (repo rate) above 5% for 3+ consecutive days", window:"72 hours",   tier:"t3", action:"Early warning of a potential bank run. Move cash to hard assets now." },
  { id:"G8", trigger:"Any G7 government announces a mandatory CBDC adoption timeline",          window:"90 days",    tier:"t2", action:"Move Bitcoin to self-custody hardware wallet. Fund offshore account to maximum. Hold physical cash." },
];

// ─────────────────────────────────────────────────────────────────────
// GEAR DATA — moved to data-gear.ts, re-exported for backward compat
// ─────────────────────────────────────────────────────────────────────

export { GEAR } from "@/lib/watchtower/data-gear";

// ─────────────────────────────────────────────────────────────────────
// PSYCHOLOGY DATA — moved to data-psych.ts, re-exported for backward compat
// ─────────────────────────────────────────────────────────────────────

export { PSYCH_PILLARS, PSYCH_THREATS, ALARM_CATEGORIES } from "@/lib/watchtower/data-psych";

// ─────────────────────────────────────────────────────────────────────
// TICKER CONTENT — moved to data-ticker.ts, re-exported for backward compat
// ─────────────────────────────────────────────────────────────────────

export { TICKER_TEXT } from "@/lib/watchtower/data-ticker";
