// lib/watchtower/geo-risk.ts
// Country-level geopolitical risk data.
// iso = ISO 3166-1 numeric string — matches TopoJSON feature IDs in world-110m.json.
// lat/lon = capital/centroid for pulse-marker positioning on critical countries.

export type RiskLevel = "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE";
export type TrendDir  = "↑" | "→" | "↓";

export interface CountryRisk {
  iso:       string;
  name:      string;
  level:     RiskLevel;
  score:     number;   // 0–100
  domain:    string;   // primary threat domain label
  trend:     TrendDir;
  incidents: string[]; // 2–3 current intelligence bullets
  lat:       number;
  lon:       number;
}

// ─── RISK COLOR PALETTE (matches Tevatha design tokens) ──────────────────────
export const RISK_COLORS: Record<RiskLevel, { fill: string; hover: string; glow: string }> = {
  CRITICAL: { fill: "#b02020", hover: "#e84040", glow: "rgba(232,64,64,0.6)"   },
  HIGH:     { fill: "#a06010", hover: "#f0a500", glow: "rgba(240,165,0,0.5)"   },
  ELEVATED: { fill: "#1a5a7a", hover: "#38bdf8", glow: "rgba(56,189,248,0.4)"  },
  MODERATE: { fill: "#0e4a30", hover: "#1ae8a0", glow: "rgba(26,232,160,0.3)"  },
};

export const NO_DATA_FILL  = "#141e2b";
export const BORDER_COLOR  = "#0a1520";
export const SEA_COLOR     = "#05080a";

// ─── COUNTRY RISK DATASET ─────────────────────────────────────────────────────

export const COUNTRY_RISK: CountryRisk[] = [

  // ── CRITICAL ──────────────────────────────────────────────────────────────

  {
    iso:"275", name:"Palestine / Gaza", level:"CRITICAL", score:99, domain:"Civil / Political", trend:"↑", lat:31.9, lon:35.2,
    incidents:[
      "Active war — 35,000+ civilian casualties, 80% infrastructure destroyed",
      "Humanitarian blockade; 2.2M facing famine-level conditions (IPC Phase 5)",
      "Regional escalation risk: Hezbollah, Houthi, Iran proxy activation ongoing",
    ],
  },
  {
    iso:"804", name:"Ukraine", level:"CRITICAL", score:97, domain:"Civil / Political", trend:"→", lat:49.0, lon:31.5,
    incidents:[
      "Active war entering 3rd year — frontlines shifting Feb 2026 after US aid pause",
      "Zaporizhzhia nuclear plant: IAEA warns 'safeguards continuity cannot be guaranteed'",
      "10M+ internally displaced; Kyiv energy grid struck 14 times since Oct 2023",
    ],
  },
  {
    iso:"729", name:"Sudan", level:"CRITICAL", score:95, domain:"Civil / Political", trend:"↑", lat:12.8, lon:30.2,
    incidents:[
      "World's largest displacement crisis: 14M+ internally displaced, 4.3M refugees",
      "RSF mass atrocities in Darfur — ICC investigators denied access",
      "30M+ require humanitarian assistance; 18M face acute food insecurity (IPC Phase 3+)",
    ],
  },
  {
    iso:"408", name:"North Korea", level:"CRITICAL", score:94, domain:"Nuclear / EMP", trend:"↑", lat:40.0, lon:127.0,
    incidents:[
      "~50 assembled warheads (SIPRI 2025) + fissile material for 40 more; ICBM range covers CONUS",
      "Kim pledged 'exponential' arsenal expansion; new solid-fuel Hwasong-18 tested 2024",
      "25,000+ DPRK troops deployed to Russia — largest foreign force commitment in decades",
    ],
  },
  {
    iso:"887", name:"Yemen", level:"CRITICAL", score:93, domain:"Civil / Political", trend:"↑", lat:15.5, lon:48.5,
    incidents:[
      "Houthi missile/drone campaigns striking Red Sea shipping — 2,000+ commercial vessels rerouted",
      "US/UK airstrikes ongoing Feb 2026; Houthi retaliation hit Eilat, Israel multiple times",
      "21M people require humanitarian assistance; cholera outbreak active in 18 governorates",
    ],
  },
  {
    iso:"364", name:"Iran", level:"CRITICAL", score:92, domain:"Nuclear / EMP", trend:"↑", lat:32.0, lon:53.7,
    incidents:[
      "408.6kg uranium enriched to 60% (IAEA May 2025) — ~3 weeks from weapons-grade conversion",
      "Nuclear breakout risk highest since 2015; IAEA access restricted to declared sites only",
      "Proxy network: Houthi, Hezbollah, Hamas, Iraqi militia simultaneously activated",
    ],
  },
  {
    iso:"760", name:"Syria", level:"CRITICAL", score:91, domain:"Civil / Political", trend:"↑", lat:34.8, lon:38.9,
    incidents:[
      "Assad regime collapse Dec 2024 — HTS (Hayat Tahrir al-Sham) controls Damascus",
      "ISIS resurgence in Deir ez-Zor; Turkish military operations northeast Syria ongoing",
      "13.4M requiring humanitarian aid; 7M internally displaced, 5.5M refugees abroad",
    ],
  },

  // ── HIGH ──────────────────────────────────────────────────────────────────

  {
    iso:"643", name:"Russia", level:"HIGH", score:89, domain:"Nuclear / EMP", trend:"↑", lat:61.5, lon:90.0,
    incidents:[
      "Nuclear doctrine lowered (Nov 2024): use threshold now 'critical threat to sovereignty'",
      "New START expired Feb 2026 — no nuclear arms control treaty in force for first time in 50 years",
      "War economy: GDP 3.6% growth driven by military production, unsustainable beyond 18–24 months",
    ],
  },
  {
    iso:"156", name:"China", level:"HIGH", score:87, domain:"Civil / Political", trend:"↑", lat:35.0, lon:104.0,
    incidents:[
      "Most extensive Taiwan blockade drills ever (Dec 2025) — CFR rates 2026 Strait crisis at 50%",
      "600+ nuclear warheads now (SIPRI) → 1,000+ by 2030; hundreds of new missile silos under construction",
      "Salt Typhoon: China MSS confirmed inside 9+ US telecoms, 200+ orgs in 80 countries",
    ],
  },
  {
    iso:"376", name:"Israel", level:"HIGH", score:85, domain:"Civil / Political", trend:"↑", lat:31.5, lon:34.8,
    incidents:[
      "Multi-front: Gaza operations, Lebanon ceasefire fragile, Syria border strikes ongoing",
      "Iran direct missile/drone attack (Apr + Oct 2024); risk of escalation to direct war",
      "International Court of Justice genocide case; diplomatic isolation deepening",
    ],
  },
  {
    iso:"104", name:"Myanmar", level:"HIGH", score:84, domain:"Civil / Political", trend:"↑", lat:19.0, lon:96.7,
    incidents:[
      "Military junta losing territory: resistance controls ~50% of country (CRPH estimates)",
      "2.5M+ internally displaced; junta conscription law triggering mass border crossings",
      "Scam compound slavery: 100,000+ foreign nationals trapped in Shan/Karen cyber-fraud camps",
    ],
  },
  {
    iso:"4", name:"Afghanistan", level:"HIGH", score:83, domain:"Civil / Political", trend:"→", lat:33.9, lon:67.7,
    incidents:[
      "Taliban: women banned from all employment, education, and public spaces — UN calls 'gender apartheid'",
      "23M+ at acute food insecurity risk; 6.5M at emergency/famine levels (IPC 2025)",
      "ISIS-Khorasan: 3 major attacks against Sufi shrines + Kabul infrastructure in 2025",
    ],
  },
  {
    iso:"180", name:"DR Congo", level:"HIGH", score:82, domain:"Civil / Political", trend:"↑", lat:-4.0, lon:21.8,
    incidents:[
      "M23 rebel advance: Goma seized Jan 2026 — 700,000 displaced in 60 days",
      "Rwanda-backed M23 and FDLR proxies creating regional war; SADC peacekeepers engaged",
      "World's largest humanitarian crisis: 25M+ in acute food insecurity, 7.2M displaced",
    ],
  },
  {
    iso:"422", name:"Lebanon", level:"HIGH", score:79, domain:"Civil / Political", trend:"→", lat:33.9, lon:35.5,
    incidents:[
      "Post-war reconstruction: $20–25B estimated damage; 1M+ internally displaced since Sep 2024",
      "Hezbollah military capacity degraded ~80% (US/Israeli estimates) but re-arming via Syria",
      "Banking system frozen since 2019; 80% of population in poverty; new government fragile",
    ],
  },
  {
    iso:"706", name:"Somalia", level:"HIGH", score:78, domain:"Civil / Political", trend:"↑", lat:5.0, lon:46.2,
    incidents:[
      "Al-Shabaab controls ~20% of territory; bombings in Mogadishu averaging 2/week",
      "Houthi solidarity declared: Somali coastline piracy resurging with Houthi coordination",
      "3.8M facing acute food insecurity; drought, flooding cycle destroying harvests",
    ],
  },
  {
    iso:"840", name:"United States", level:"HIGH", score:78, domain:"Cyber / Tech", trend:"↑", lat:39.5, lon:-98.4,
    incidents:[
      "Salt Typhoon (China MSS) confirmed active inside 9+ major telecoms as of Feb 2026",
      "$38.43T national debt (~124% GDP, +$8B/day); CBO projects fiscal crisis by 2034",
      "CFR rates domestic political violence as high-likelihood 2026; institutional norm erosion",
    ],
  },
  {
    iso:"231", name:"Ethiopia", level:"HIGH", score:77, domain:"Civil / Political", trend:"→", lat:9.0, lon:40.5,
    incidents:[
      "Tigray peace agreement fragile; Amhara conflict active with 500,000+ displaced",
      "Severe drought: El Niño + La Niña cycle driving back-to-back harvest failures",
      "Red Sea access dispute with Eritrea; Nile dam conflict with Egypt/Sudan escalating",
    ],
  },
  {
    iso:"332", name:"Haiti", level:"HIGH", score:76, domain:"Civil / Political", trend:"↑", lat:18.9, lon:-72.3,
    incidents:[
      "Gang control: 85% of Port-au-Prince under armed gang territory as of Feb 2026",
      "Prime Minister Conille replaced Jan 2026 — 4th leadership change in 12 months",
      "5.5M facing acute food insecurity; cholera re-emergence confirmed in 6 departments",
    ],
  },
  {
    iso:"586", name:"Pakistan", level:"HIGH", score:75, domain:"Nuclear / EMP", trend:"↑", lat:30.4, lon:69.3,
    incidents:[
      "170 nuclear warheads (SIPRI) — fastest-growing arsenal in Asia; India-Pakistan tension HIGH",
      "TTP attacks: 1,500+ security personnel killed 2024 — worst year since 2014",
      "Economy: $350B external debt, IMF bailout tranche at risk; currency down 38% since 2023",
    ],
  },
  {
    iso:"368", name:"Iraq", level:"HIGH", score:73, domain:"Civil / Political", trend:"→", lat:33.2, lon:43.7,
    incidents:[
      "Iran-backed militia strikes on US bases accelerated following Gaza war",
      "ISIS resurgence: 300+ attacks in 2025, targeting Sunni leaders and infrastructure",
      "PMF (Popular Mobilization Forces) operating as parallel military outside state control",
    ],
  },
  {
    iso:"434", name:"Libya", level:"HIGH", score:71, domain:"Civil / Political", trend:"→", lat:27.0, lon:18.0,
    incidents:[
      "Split government: GNU (Tripoli) vs HoR (Tobruk) — 13-year civil war unresolved",
      "Russian Wagner Group (now Africa Corps) entrenched in eastern Libya",
      "Fuel smuggling and people-trafficking networks funding both sides; OPEC quota tensions",
    ],
  },
  {
    iso:"716", name:"Zimbabwe", level:"HIGH", score:70, domain:"Economic", trend:"↑", lat:-20.0, lon:30.0,
    incidents:[
      "ZiG (Zimbabwe Gold) currency collapsed within 6 months of launch — third currency failure",
      "78% of population in multidimensional poverty; sanctions + corruption combine",
      "Severe drought: Zambezi hydro at 12% capacity → 20hr/day load shedding",
    ],
  },

  // ── ELEVATED ──────────────────────────────────────────────────────────────

  {
    iso:"356", name:"India", level:"ELEVATED", score:68, domain:"Biological", trend:"↑", lat:20.6, lon:79.0,
    incidents:[
      "AMR epicentre: highest carbapenem-resistant Klebsiella rates globally; 3+ million AMR deaths/yr",
      "India-Pakistan nuclear stand-off: LOC violations up 40% 2025; Kashmir status unresolved",
      "Extreme heat: 2025 saw 19 consecutive days above 47°C in Delhi; grid failures during peak",
    ],
  },
  {
    iso:"792", name:"Turkey", level:"ELEVATED", score:67, domain:"Economic", trend:"→", lat:39.0, lon:35.2,
    incidents:[
      "Inflation: 65% annual CPI (Jan 2026); lira lost 28% value vs USD in 2025",
      "Syria post-Assad: Turkey conducting military operations in northern Syria, NATO tension",
      "Erdoğan centralization: constitutional court bypass precedent set Sep 2025",
    ],
  },
  {
    iso:"566", name:"Nigeria", level:"ELEVATED", score:66, domain:"Civil / Political", trend:"↑", lat:9.1, lon:8.7,
    incidents:[
      "Boko Haram/ISWAP: 500+ killed Q4 2025 in northeast; military struggling to hold territory",
      "Naira: down 70% since 2023 float; fuel subsidy removal driving 40% inflation",
      "Banditry crisis in northwest: 3,500+ kidnapped in 2025, $12M+ ransom paid",
    ],
  },
  {
    iso:"818", name:"Egypt", level:"ELEVATED", score:63, domain:"Economic", trend:"↑", lat:26.8, lon:30.8,
    incidents:[
      "$165B external debt; IMF loan tranche conditionality creating subsidy reform pressure",
      "Gaza border: 100,000+ Palestinian refugees straining Sinai; canal revenue down 40%",
      "Nile: GERD dam filling threatens 100M Egyptians' primary freshwater source",
    ],
  },
  {
    iso:"484", name:"Mexico", level:"ELEVATED", score:63, domain:"Civil / Political", trend:"↑", lat:23.6, lon:-102.6,
    incidents:[
      "35,000 homicides/year; cartel territorial wars displaced 400,000+ in Sinaloa alone",
      "US tariff threat (25%): $800B bilateral trade at risk; peso down 15% since Nov 2024",
      "Judicial reform crisis: replacement of all federal judges by election risks rule of law",
    ],
  },
  {
    iso:"862", name:"Venezuela", level:"ELEVATED", score:61, domain:"Economic", trend:"↑", lat:8.0, lon:-66.6,
    incidents:[
      "Maduro declared winner (Jul 2025) despite opposition evidence of 2:1 defeat; 1,000+ arrested",
      "Essequibo: military buildup on Guyana border; ICJ proceedings ongoing",
      "7.7M Venezuelans displaced globally — 3rd largest displacement crisis after Ukraine and Syria",
    ],
  },
  {
    iso:"682", name:"Saudi Arabia", level:"ELEVATED", score:61, domain:"Economic", trend:"→", lat:23.9, lon:45.1,
    incidents:[
      "Aramco attack risk: Houthi drones reached Abqaiq facility — world's largest oil processing plant",
      "Vision 2030 stress: NEOM city $500B project stalled; labour abuse, PIF leverage rising",
      "Exploring yuan-denominated oil pricing with China — direct dollar hegemony challenge",
    ],
  },
  {
    iso:"710", name:"South Africa", level:"ELEVATED", score:57, domain:"Economic", trend:"→", lat:-29.0, lon:25.0,
    incidents:[
      "32% unemployment; load shedding averaging 8hrs/day reducing GDP 2% annually",
      "ANC coalition government fragile: GNU holds but policy gridlock on key reforms",
      "Water crisis: 47% of infrastructure dysfunctional; Johannesburg water cuts 3x/week",
    ],
  },
  {
    iso:"170", name:"Colombia", level:"ELEVATED", score:55, domain:"Civil / Political", trend:"→", lat:4.1, lon:-72.9,
    incidents:[
      "ELN declared war on Colombian state Jan 2025 — peace talks collapsed Dec 2024",
      "FARC dissident resurgence in Catatumbo; 32,000 displaced in 10 days (Jan 2026)",
      "Venezuela border: 700,000 Venezuelans in Colombia straining resources",
    ],
  },
  {
    iso:"76", name:"Brazil", level:"ELEVATED", score:53, domain:"Climate", trend:"→", lat:-10.0, lon:-55.0,
    incidents:[
      "Amazon deforestation: 2025 fire season burned 22M hectares — largest since records began",
      "Lula survived Bolsonaro-linked coup attempt investigation; political polarization HIGH",
      "Rio Grande do Sul floods: 600,000 displaced May 2024; infrastructure still not rebuilt",
    ],
  },
  {
    iso:"608", name:"Philippines", level:"ELEVATED", score:57, domain:"Civil / Political", trend:"↑", lat:12.9, lon:121.8,
    incidents:[
      "South China Sea: 6 confrontations with China coastguard at Second Thomas Shoal in 2025",
      "Marcos-Duterte political war: ICC warrant for Duterte; government destabilisation risk",
      "Typhoon exposure: top-5 most disaster-prone country globally; 3 major landfalls 2025",
    ],
  },
  {
    iso:"360", name:"Indonesia", level:"ELEVATED", score:56, domain:"Climate", trend:"→", lat:-2.5, lon:118.0,
    incidents:[
      "Jakarta sinking 25cm/year; coastal flooding now annual; new capital (Nusantara) delayed",
      "Papua insurgency: OPM attacks on infrastructure; military operations ongoing",
      "Sea level rise: 17,000 islands — 2,000 projected uninhabitable by 2050",
    ],
  },

  // ── MODERATE ──────────────────────────────────────────────────────────────

  {
    iso:"276", name:"Germany", level:"MODERATE", score:42, domain:"Economic", trend:"↑", lat:51.2, lon:10.4,
    incidents:[
      "Manufacturing recession: GDP contracted 0.2% 2024, 0.1% 2025; automotive sector crisis",
      "Migration political crisis triggered snap election Feb 2025; far-right AfD 20%+ nationally",
      "Energy dependence: Russian gas replaced at 3× cost; industrial competitiveness declining",
    ],
  },
  {
    iso:"392", name:"Japan", level:"MODERATE", score:43, domain:"Nuclear / EMP", trend:"↑", lat:37.0, lon:137.0,
    incidents:[
      "DPRK missiles: 18 ballistic missile tests overflying Japan's EEZ in 2024-2025",
      "Defense spending: 2% GDP target reached 2025 — largest military build-up since WW2",
      "Demographic crisis: 1.2M annual population decline; economic deflation structural",
    ],
  },
  {
    iso:"410", name:"South Korea", level:"MODERATE", score:43, domain:"Civil / Political", trend:"↑", lat:36.5, lon:127.8,
    incidents:[
      "President Yoon impeached Dec 2024 after brief martial law declaration — constitutional crisis",
      "DPRK artillery drills targeting Seoul corridor; loudspeaker warfare resumed",
      "Demographic emergency: world's lowest fertility rate 0.72 (2024)",
    ],
  },
  {
    iso:"250", name:"France", level:"MODERATE", score:38, domain:"Civil / Political", trend:"↑", lat:46.2, lon:2.2,
    incidents:[
      "Political fragmentation: 4th government in 18 months; budget crisis (6.1% deficit)",
      "Far-right RN polling at 35% nationally; snap election risk if Macron government falls",
      "Urban unrest: post-Nahel protests 2023 → 2025 follow-on riots in 12 cities",
    ],
  },
  {
    iso:"826", name:"United Kingdom", level:"MODERATE", score:37, domain:"Economic", trend:"→", lat:54.4, lon:-2.2,
    incidents:[
      "Growth stalled: 0% GDP growth Q3 2025; Reeves budget raised taxes by £40B",
      "NHS critical: 7.6M waiting list; 14,000 excess winter deaths from fuel poverty 2025",
      "Asylum crisis: 85,000 small boat crossings 2025 — political pressure intensifying",
    ],
  },
  {
    iso:"36", name:"Australia", level:"MODERATE", score:31, domain:"Climate", trend:"→", lat:-25.3, lon:133.8,
    incidents:[
      "Bushfire risk: 2025-26 season rated 'above normal' by BOM; Queensland already burning",
      "China trade tensions resumed: barley/wine tariffs lifted but rare earth export controls",
      "AUKUS: nuclear submarine program delays; first vessel not expected before 2038",
    ],
  },
  {
    iso:"124", name:"Canada", level:"MODERATE", score:30, domain:"Economic", trend:"↑", lat:56.1, lon:-106.4,
    incidents:[
      "US annexation rhetoric from Trump causing diplomatic crisis; tariff threats (25%) active",
      "Housing bubble: average home $800K+; affordability worst in G7",
      "Wildfire: 18M hectares burned 2024 — air quality emergencies in 8 provinces",
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const riskByIso = Object.fromEntries(
  COUNTRY_RISK.map((c) => [c.iso, c])
) as Record<string, CountryRisk>;

export const riskStats = {
  critical:  COUNTRY_RISK.filter((c) => c.level === "CRITICAL").length,
  high:      COUNTRY_RISK.filter((c) => c.level === "HIGH").length,
  elevated:  COUNTRY_RISK.filter((c) => c.level === "ELEVATED").length,
  moderate:  COUNTRY_RISK.filter((c) => c.level === "MODERATE").length,
  total:     COUNTRY_RISK.length,
};

export const CRITICAL_HOTSPOTS = COUNTRY_RISK.filter((c) => c.level === "CRITICAL");
