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
  sig:    string;
  domain: string;
  score:  number;
  tier:   TierClass;
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
  year:    string;
  label:   string;
  sev:     "critical" | "high" | "low";
  colKey:  "red" | "warn" | "info" | "pink";
  isNow?:  boolean;
  signal:  string;
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
    summary:"New START expired Feb 5, 2026 — no nuclear arms control treaty in force for the first time in 50+ years. Doomsday Clock at 85s (all-time record). China racing to 1,000 warheads by 2030.",
    drivers:[
      "Treaty collapse: New START lapse removes all legal limits on US-Russia arsenals",
      "China ICBM expansion: 600+ warheads now → 1,000+ by 2030 — largest build-up since Cold War",
      "Russia doctrine: threshold lowered from 'state existence' to 'critical threat to sovereignty'",
    ],
  },
  {
    id:"cyber", label:"Cyber / Tech", score:83, level:"CRITICAL", icon:"🤖", trend:"↑",
    summary:"Salt Typhoon (China MSS) confirmed inside 9+ US telecoms — FBI calls campaign 'still very much ongoing' (Feb 2026). Volt Typhoon pre-positioned in US power, water, and transport for wartime activation.",
    drivers:[
      "Salt Typhoon: 9+ US telecoms and 200+ orgs in 80 countries compromised — access active",
      "Volt Typhoon: pre-positioned inside US grid, water systems, and transport for wartime use",
      "AI kill-chain automation deployed in combat; UN autonomous weapons treaty rejected by US + Russia",
    ],
  },
  {
    id:"civil", label:"Civil / Political", score:76, level:"HIGH", icon:"🔥", trend:"↑",
    summary:"China's most extensive Taiwan drills ever (Dec 29, 2025) simulated full blockade. CFR rates a 2026 Taiwan Strait crisis at even-money. NATO-US rift over Ukraine deepens as US pursues normalized Russia relations.",
    drivers:[
      "Taiwan: most extensive Chinese blockade drills ever — CFR rates 2026 crisis at 50% probability",
      "Ukraine: no viable ceasefire — US severed direct aid, pushing burden to European NATO members",
      "US domestic: CFR flags high-likelihood political violence and civil unrest in 2026",
    ],
  },
  {
    id:"economic", label:"Economic", score:74, level:"HIGH", icon:"💸", trend:"↑",
    summary:"US debt reached $38.43T (~124% of GDP), growing $8B per day. Interest payments now consume ~20% of all federal revenue. CBO projects US will exceed the 1946 wartime debt peak by 2036.",
    drivers:[
      "Debt: $38.43T (~124% GDP, $8B/day) — interest at ~20% of revenue, structural fiscal trap",
      "Banking: $306B unrealized losses in US banking system (FDIC Q4 2025) — commercial RE watch",
      "CBDC: 137 nations exploring — EU Digital Euro targets 2029; China e-CNY at $986B in transactions",
    ],
  },
  {
    id:"bio", label:"Biological", score:72, level:"HIGH", icon:"🦠", trend:"↑",
    summary:"Scientists describe H5N1 in animal reservoirs as 'completely out of control' (Jan 2026) — 70 US human cases, active in dairy herds. A novel recombinant MPXV strain (clade Ib+IIb, CFR 3–4%) was detected in India, January 13, 2026.",
    drivers:[
      "H5N1: 'completely out of control' in reservoirs — 70 US human cases, active dairy herd spread",
      "MPXV recombinant: novel clade Ib+IIb strain detected India Jan 2026 — CFR 3–4% vs <1% prior",
      "Pandemic infrastructure: no H5N1 vaccine stockpile for general population; WHO PHEIC capacity strained",
    ],
  },
  {
    id:"climate", label:"Climate", score:67, level:"ELEVATED", icon:"🌊", trend:"↑",
    summary:"Arctic sea ice volume reached its lowest level on record (Mar 2026). WFP reports 96M facing acute food insecurity from weather extremes — a 3× increase since 2020. Argentina drought and Black Sea wheat winterkill are active now.",
    drivers:[
      "Arctic: sea ice volume at record low — 20% below 2024 levels, 2nd lowest extent ever recorded",
      "Food: 96M facing weather-driven food insecurity (3× since 2020); climate-food prices rising 4× faster",
      "Harvests: Argentina Pampas drought + Black Sea wheat winterkill threatening Q2 2026 supply",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// PRIORITY SIGNALS
// ─────────────────────────────────────────────────────────────────────

export const SIGNALS: Signal[] = [
  { sig:"Doomsday Clock: 85 seconds — all-time record (BAS Jan 27 2026). New START expired Feb 5 2026: first time in 50+ years no nuclear arms control treaty is in force",      domain:"Nuclear",     score:97, tier:"t4" },
  { sig:"Salt Typhoon (China MSS): 9+ US telecoms compromised, 200+ orgs in 80+ countries — FBI confirms campaign 'still very much ongoing' as of Feb 2026",                    domain:"Cyber",       score:92, tier:"t3" },
  { sig:"US debt $38.43T (~124% of GDP), growing $8B/day — interest payments now ~20% of all federal revenue. CBO projects debt exceeds 1946 wartime peak by 2036",             domain:"Economic",    score:88, tier:"t3" },
  { sig:"China nuclear arsenal: 600+ warheads (SIPRI 2025), projecting 1,000+ by 2030 — constructing hundreds of new ICBM silos — largest nuclear build-up since Cold War",      domain:"Nuclear",     score:87, tier:"t3" },
  { sig:"Taiwan Strait: China's most extensive military drills ever (Dec 29 2025) simulated full blockade — CFR rates 2026 Taiwan Strait crisis at even-money probability",       domain:"Geopolitical",score:83, tier:"t3" },
  { sig:"H5N1 'completely out of control' in animal reservoirs — 70 confirmed US human cases, active dairy herd spread — no sustained human-to-human transmission yet",           domain:"Biological",  score:78, tier:"t2" },
  { sig:"Russia nuclear doctrine: threshold lowered to 'critical threat to sovereignty' — materially broader than prior 'existence of state' language",                           domain:"Nuclear",     score:76, tier:"t3" },
  { sig:"Arctic sea ice 2nd lowest ever recorded (Mar 2026); 96M facing acute food insecurity from weather extremes — 3× increase since 2020. Argentina Pampas drought active",  domain:"Climate",     score:73, tier:"t2" },
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
  { year:"1962", label:"Cuban Missile Crisis — 13 days from nuclear exchange", sev:"critical", colKey:"red",  signal:"Any equivalent standoff without back-channel communication = Tier 4 immediate." },
  { year:"1971", label:"Nixon Shock — gold standard ends, fiat era begins",    sev:"high",     colKey:"warn", signal:"$400B (1971) → $36.4T (2024). Unlimited deficit financing enabled." },
  { year:"2008", label:"Global Financial Crisis — QE1 begins",                 sev:"critical", colKey:"warn", signal:"Fed balance sheet: $900B → $9T. QE never truly ended. Will resolve as inflation or default." },
  { year:"2020", label:"COVID — simultaneous system stress test",              sev:"critical", colKey:"pink", signal:"6-month stockpile, off-grid capability, rural property — all validated. Increase Ark parameters." },
  { year:"2022", label:"Ukraine War — first major European land war since WWII",sev:"critical", colKey:"red", signal:"Multipolar restructuring: 10–20 year arc begins. Nuclear taboo challenged. NATO forced to spend." },
  { year:"2023", label:"SVB + Credit Suisse collapse — $600B+ unrealised losses exposed",sev:"high", colKey:"warn", signal:"Not resolved. Deferred. Watch: overnight repo rate as leading stress indicator." },
  { year:"2023", label:"Doomsday Clock: 90 seconds — then-closest in 76-year history",   sev:"critical",colKey:"red", signal:"BAS methodology is rigorous. Each advance = one Ark tier escalation." },
  { year:"2025", label:"Doomsday Clock: 89 seconds — new record",             sev:"critical", colKey:"red",  signal:"AI battlefield use, intensified nuclear rhetoric cited. Moved from 90s to 89s." },
  { year:"2025", label:"Salt Typhoon: 9+ US telecoms compromised by China MSS", sev:"high",   colKey:"warn", signal:"Backbone ISP infrastructure. Access into energy, transport, healthcare networks. FBI: still active Feb 2026." },
  { year:"2026", label:"Doomsday Clock: 85 seconds — all-time closest. New START expires", sev:"critical", colKey:"red", isNow:true, signal:"No nuclear arms control treaty in force for first time in 50+ years. China at 600+ warheads. BAS Jan 27, 2026 + New START Feb 5, 2026." },
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
  "⚠ NUCLEAR: CRITICAL 93/100 · CYBER: CRITICAL 83/100 · CIVIL: HIGH 76/100 · ECONOMIC: HIGH 74/100 · BIO: HIGH 72/100 · CLIMATE: ELEVATED 67/100 · " +
  "SALT TYPHOON: 9+ US TELECOMS BREACHED — FBI: ONGOING · US DEBT $38.43T · TAIWAN DRILLS: MOST EXTENSIVE EVER DEC 2025 · H5N1: OUT OF CONTROL IN ANIMAL RESERVOIRS · ";
