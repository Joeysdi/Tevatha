// lib/watchtower/geo-risk.ts
// Country-level geopolitical risk data — all ~180 sovereign states.
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
export const SEA_COLOR     = "#060f1e";

// ─── COUNTRY RISK DATASET — ALL SOVEREIGN STATES ─────────────────────────────

export const COUNTRY_RISK: CountryRisk[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // CRITICAL
  // ══════════════════════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════════════════════
  // HIGH
  // ══════════════════════════════════════════════════════════════════════════

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
    iso:"004", name:"Afghanistan", level:"HIGH", score:83, domain:"Civil / Political", trend:"→", lat:33.9, lon:67.7,
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
  {
    iso:"112", name:"Belarus", level:"HIGH", score:72, domain:"Civil / Political", trend:"↑", lat:53.7, lon:28.0,
    incidents:[
      "Lukashenko hosts Wagner forces and Russian nuclear weapons; EU border weaponized with migrants",
      "350,000+ opposition members fled or imprisoned since 2020 crackdown; Sviatlana Tsikhanouskaya in exile",
      "Economy fully integrated into Russia's war machine; 50%+ trade with Russia, Western sanctions deep",
    ],
  },
  {
    iso:"728", name:"South Sudan", level:"HIGH", score:74, domain:"Civil / Political", trend:"↑", lat:6.9, lon:31.3,
    incidents:[
      "Inter-communal violence: 1M+ displaced in 2025 despite 2018 peace deal formally holding",
      "Kiir-Machar rivalry reigniting; SSPDF and SPLM-IO clashes resumed in Unity State",
      "7.1M facing acute food insecurity; oil revenues diverted to military, not services",
    ],
  },
  {
    iso:"466", name:"Mali", level:"HIGH", score:75, domain:"Civil / Political", trend:"↑", lat:17.6, lon:-4.0,
    incidents:[
      "Junta expelled UN peacekeepers (MINUSMA) 2023; jihadists (JNIM, ISGS) now control 60%+ north",
      "Russia's Africa Corps replaced French forces — atrocity reports from Moura massacre ongoing",
      "8M people in acute food insecurity; Bamako itself hit by JNIM attack Jan 2025",
    ],
  },
  {
    iso:"854", name:"Burkina Faso", level:"HIGH", score:76, domain:"Civil / Political", trend:"↑", lat:12.4, lon:-1.6,
    incidents:[
      "Jihadist groups (JNIM, ISGS) control ~40% of territory; 2M+ internally displaced",
      "Junta expelled French forces, western journalists; Russia's Africa Corps deployed 2024",
      "Second-worst food crisis in Africa: 4.7M in IPC Phase 3+ acute food insecurity",
    ],
  },
  {
    iso:"140", name:"Central African Republic", level:"HIGH", score:68, domain:"Civil / Political", trend:"→", lat:6.6, lon:20.9,
    incidents:[
      "Wagner/Africa Corps forces prop up Touadéra government; CPC rebel coalition still active",
      "3M people displaced — half the population requires humanitarian assistance",
      "Natural resource looting: gold and diamond exports fund both government and armed groups",
    ],
  },
  {
    iso:"148", name:"Chad", level:"HIGH", score:67, domain:"Civil / Political", trend:"↑", lat:15.5, lon:18.7,
    incidents:[
      "Mahamat Déby consolidated power after 2021 coup; transition referendum disputed by opposition",
      "Hosting 1.2M+ refugees from Sudan, CAR, Nigeria; humanitarian strain at critical level",
      "Boko Haram and ISWAP attacks in Lake Chad basin ongoing; army capacity limited",
    ],
  },
  {
    iso:"562", name:"Niger", level:"HIGH", score:69, domain:"Civil / Political", trend:"↑", lat:17.6, lon:8.1,
    incidents:[
      "Military coup July 2023 expelled US forces (Air Base 201); ECOWAS sanctions imposed then lifted",
      "Alliance of Sahel States with Mali and Burkina Faso — bloc exiting ECOWAS",
      "JNIM and ISGS attacks in western Niger escalating; 600,000+ displaced",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ELEVATED
  // ══════════════════════════════════════════════════════════════════════════

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
    iso:"076", name:"Brazil", level:"ELEVATED", score:53, domain:"Climate", trend:"→", lat:-10.0, lon:-55.0,
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
  {
    iso:"050", name:"Bangladesh", level:"ELEVATED", score:60, domain:"Civil / Political", trend:"↑", lat:23.7, lon:90.4,
    incidents:[
      "Sheikh Hasina ousted Aug 2024 by student-led uprising; military-backed interim government fragile",
      "Rohingya crisis: 1.2M refugees in Cox's Bazar — tensions with local population spiking",
      "Climate vulnerability: 40% of land area at <3m elevation; annual flooding displacing millions",
    ],
  },
  {
    iso:"268", name:"Georgia", level:"ELEVATED", score:55, domain:"Civil / Political", trend:"↑", lat:41.7, lon:44.8,
    incidents:[
      "Mass protests Nov–Dec 2025 after 'Georgian Dream' suspended EU accession talks until 2028",
      "Russia-occupied South Ossetia and Abkhazia: 'border creep' advancing 400m in 2025",
      "Pro-Kremlin media law (foreign agents) passed over veto; civil society under siege",
    ],
  },
  {
    iso:"051", name:"Armenia", level:"ELEVATED", score:57, domain:"Civil / Political", trend:"→", lat:40.2, lon:44.5,
    incidents:[
      "Nagorno-Karabakh fell Sep 2023; 100,000+ ethnic Armenians displaced to Armenia",
      "Peace treaty with Azerbaijan: territorial concessions under negotiation, opposition protests",
      "CSTO membership suspended in practice; pivot to EU partnership accelerating",
    ],
  },
  {
    iso:"031", name:"Azerbaijan", level:"ELEVATED", score:54, domain:"Civil / Political", trend:"→", lat:40.4, lon:47.6,
    incidents:[
      "Post-Karabakh consolidation: Aliyev cementing authoritarian control; 200+ political prisoners",
      "COP29 hosted (Nov 2024) while suppressing climate activists domestically",
      "Pipeline dependency: TANAP/TAP gas routes to Europe create leverage vs Russia embargo",
    ],
  },
  {
    iso:"498", name:"Moldova", level:"ELEVATED", score:56, domain:"Civil / Political", trend:"↑", lat:47.0, lon:28.9,
    incidents:[
      "Russian gas cut Dec 2024 — Transnistria region (Russian-backed) facing energy collapse",
      "Hybrid warfare: election interference confirmed in 2024 presidential vote (EU assessment)",
      "Pro-EU Maia Sandu re-elected but Russian influence operations ongoing at scale",
    ],
  },
  {
    iso:"688", name:"Serbia", level:"ELEVATED", score:52, domain:"Civil / Political", trend:"↑", lat:44.0, lon:21.0,
    incidents:[
      "University protests Nov 2024–Jan 2025 following Novi Sad bridge collapse (14 dead); 100,000 marching",
      "Kosovo-Serbia tensions: KFOR clashes; EU-brokered talks collapsed Sep 2025",
      "Vučić balancing Russia, China, and EU simultaneously; arms deals with both sides",
    ],
  },
  {
    iso:"192", name:"Cuba", level:"ELEVATED", score:58, domain:"Economic", trend:"↑", lat:21.5, lon:-79.5,
    incidents:[
      "Island-wide blackouts 2024–2025: power grid collapsed repeatedly; 11M without electricity",
      "Largest exodus since 1960s: 500,000+ Cubans emigrated 2023–2025 (5% of population)",
      "Economic contraction -2.5% GDP 2025; foreign currency reserves near zero",
    ],
  },
  {
    iso:"320", name:"Guatemala", level:"ELEVATED", score:54, domain:"Civil / Political", trend:"→", lat:15.8, lon:-90.2,
    incidents:[
      "Anti-corruption President Arévalo survived coup attempt by AG's office and military factions",
      "Gang violence: MS-13 and Barrio 18 control significant urban territory; impunity rate 97%",
      "Indigenous land rights conflict intensifying; 200,000+ displaced by narco-violence",
    ],
  },
  {
    iso:"340", name:"Honduras", level:"ELEVATED", score:56, domain:"Civil / Political", trend:"↑", lat:14.6, lon:-86.6,
    incidents:[
      "Homicide rate: 35/100,000 — top-10 globally; Tegucigalpa effectively cartel-partitioned",
      "President Castro's anti-corruption drive blocked by congress; state capture deep",
      "Narco-network embedded in police, military, judicial system — US DEA indictments ongoing",
    ],
  },
  {
    iso:"218", name:"Ecuador", level:"ELEVATED", score:57, domain:"Civil / Political", trend:"↑", lat:-1.8, lon:-78.2,
    incidents:[
      "Narco-state emergency: prison system collapse, cartel assassinations of prosecutors/politicians",
      "Mexican cartel (Sinaloa, CJNG) territorial war for Ecuador's Pacific export corridors",
      "GDP impact: tourism collapsed 40%; foreign investment halted in coastal regions",
    ],
  },
  {
    iso:"604", name:"Peru", level:"ELEVATED", score:53, domain:"Civil / Political", trend:"↑", lat:-9.2, lon:-75.0,
    incidents:[
      "6 presidents in 7 years; Boluarte government survives impeachment but approval <10%",
      "Shining Path remnants (VRAEM) controlling cocaine production in Apurímac valley",
      "Large-scale illegal mining (garimpo) destroying Amazon; 3,000+ illegal sites active",
    ],
  },
  {
    iso:"032", name:"Argentina", level:"ELEVATED", score:52, domain:"Economic", trend:"→", lat:-34.0, lon:-64.0,
    incidents:[
      "Milei shock therapy: 300%+ inflation peak 2024, now declining; recession -3.5% GDP",
      "IMF deal renegotiated 2025; $43B debt restructuring ongoing",
      "Poverty rate peaked at 57% mid-2024; social unrest risk high as austerity bites",
    ],
  },
  {
    iso:"120", name:"Cameroon", level:"ELEVATED", score:55, domain:"Civil / Political", trend:"↑", lat:5.7, lon:12.4,
    incidents:[
      "Anglophone crisis: Ambazonia separatists control rural NW/SW regions; 750,000+ displaced",
      "Boko Haram attacks in Far North region killing 200+ in 2025",
      "Biya government (in power since 1982) — succession crisis looming; no clear mechanism",
    ],
  },
  {
    iso:"800", name:"Uganda", level:"ELEVATED", score:52, domain:"Civil / Political", trend:"↑", lat:1.4, lon:32.3,
    incidents:[
      "ADF (Allied Democratic Forces / ISIS-DRC) attacks in western Uganda and eastern DRC",
      "Uganda army supporting M23 indirectly per UN experts; regional war risk rising",
      "Anti-homosexuality law (death penalty provisions) sparking donor cuts and isolation",
    ],
  },
  {
    iso:"404", name:"Kenya", level:"ELEVATED", score:51, domain:"Civil / Political", trend:"↑", lat:-0.0, lon:37.9,
    incidents:[
      "Gen Z anti-tax protests Jun 2024: parliament stormed, 39 killed; Ruto reversed Finance Bill",
      "Al-Shabaab cross-border attacks escalating in northeastern counties",
      "Economic stress: shilling down 30% 2023–2025; IMF austerity requirements unpopular",
    ],
  },
  {
    iso:"508", name:"Mozambique", level:"ELEVATED", score:55, domain:"Civil / Political", trend:"↑", lat:-18.3, lon:35.5,
    incidents:[
      "Post-election violence Oct 2025: 130+ killed after disputed results; RENAMO reactivating",
      "Cabo Delgado insurgency (ISIS-linked): TotalEnergies LNG project still suspended",
      "Cyclone season: Idai/Kenneth/Freddy aftermath — infrastructure still 40% unrepaired",
    ],
  },
  {
    iso:"324", name:"Guinea", level:"ELEVATED", score:53, domain:"Civil / Political", trend:"↑", lat:11.0, lon:-10.9,
    incidents:[
      "CNRD junta (Mamadi Doumbouya) suspended all political activities indefinitely in 2025",
      "Transition timeline revised to 2025 then 2026 — ECOWAS sanctions reimposed",
      "Bauxite/iron ore wealth captured by junta elites; Chinese mining deals lack transparency",
    ],
  },
  {
    iso:"108", name:"Burundi", level:"ELEVATED", score:54, domain:"Civil / Political", trend:"↑", lat:-3.4, lon:29.9,
    incidents:[
      "Ndayishimiye government cracking down on dissent; 200+ political opponents jailed 2024",
      "FNL and RED-Tabara rebel incursions from eastern DRC escalating",
      "Worst food insecurity in Africa: 6.8M (55% of population) in IPC Phase 3+ as of 2025",
    ],
  },
  {
    iso:"232", name:"Eritrea", level:"ELEVATED", score:56, domain:"Civil / Political", trend:"↑", lat:15.2, lon:39.8,
    incidents:[
      "North Korea-style isolation: indefinite military service, no independent media or civil society",
      "Eritrean Defence Forces deployed inside Ethiopia and DRC — proxy force for multiple actors",
      "100,000+ Eritreans flee annually; UNHCR calls it 'one of the world's worst refugee crises'",
    ],
  },
  {
    iso:"762", name:"Tajikistan", level:"ELEVATED", score:51, domain:"Civil / Political", trend:"↑", lat:38.9, lon:71.3,
    incidents:[
      "ISIS-Khorasan recruiting from Tajik diaspora — Moscow concert hall attack (Mar 2024) by Tajik nationals",
      "Rahmon family dynastic control; son Rustam Emomali now parliament chair — succession locked",
      "Gorno-Badakhshan: 2022 crackdown on autonomous region; protests suppressed violently",
    ],
  },
  {
    iso:"598", name:"Papua New Guinea", level:"ELEVATED", score:50, domain:"Civil / Political", trend:"↑", lat:-6.3, lon:143.9,
    incidents:[
      "Enga Province massacre Jan 2024: 100+ killed in tribal conflict — worst in decades",
      "Law enforcement collapse: 85% of country outside effective police coverage",
      "Chinese infrastructure investment creating debt-trap concerns; Port Moresby port deal signed",
    ],
  },
  {
    iso:"144", name:"Sri Lanka", level:"ELEVATED", score:49, domain:"Economic", trend:"↓", lat:7.9, lon:80.7,
    incidents:[
      "IMF program on track after 2022 default; debt restructuring completed with China/India",
      "New President Dissanayake (NPP) elected Sep 2024 — anti-corruption mandate, reform fragile",
      "Tourism recovering 40% YoY but foreign debt ($50B) repayment begins 2027–28",
    ],
  },
  {
    iso:"558", name:"Nicaragua", level:"ELEVATED", score:54, domain:"Civil / Political", trend:"↑", lat:12.9, lon:-85.2,
    incidents:[
      "Ortega expelled Catholic bishops, closed 3,000 NGOs; bishops sentenced in absentia",
      "Mass emigration: 700,000+ Nicaraguans in the US; economic contraction accelerating",
      "CIA classifies Nicaragua as 'authoritarian consolidation' — proximity to Cuba/Venezuela",
    ],
  },
  {
    iso:"266", name:"Gabon", level:"ELEVATED", score:48, domain:"Civil / Political", trend:"→", lat:-0.8, lon:11.6,
    incidents:[
      "Military coup Aug 2023: Oligui Nguema ousted Bongo dynasty after 56 years in power",
      "CEMI (transitional military council) set 2026 election date; civilian pressure moderate",
      "Oil revenue management: $6.5B sovereign wealth fund audited; significant misappropriation found",
    ],
  },
  {
    iso:"070", name:"Bosnia and Herzegovina", level:"ELEVATED", score:50, domain:"Civil / Political", trend:"↑", lat:44.2, lon:17.9,
    incidents:[
      "Republika Srpska entity: Dodik pursuing secession rhetoric; sanctions imposed by US/UK",
      "High Representative Schmidt imposing laws directly — democratic process bypassed",
      "Ethnic partition risk higher than any point since Dayton 1995; EU frustrated",
    ],
  },
  {
    iso:"462", name:"Maldives", level:"ELEVATED", score:46, domain:"Economic", trend:"↑", lat:3.2, lon:73.2,
    incidents:[
      "New President Muizzu expelled Indian military personnel; pivoted to China Belt and Road",
      "$3.3B public debt at 110% GDP — IMF warns of debt distress by 2026",
      "Sea level rise: 80% of land <1m above sea level; entire nation existential risk by 2100",
    ],
  },
  {
    iso:"418", name:"Laos", level:"ELEVATED", score:47, domain:"Economic", trend:"↑", lat:17.9, lon:102.6,
    incidents:[
      "Chinese debt trap: Laos-China railway cost $6B (half of GDP); China controls power grid stake",
      "Currency (kip) collapsed 40% since 2021; inflation driving food insecurity",
      "Opium production surged 500% 2022–2025: Laos now world's 3rd largest producer",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MODERATE
  // ══════════════════════════════════════════════════════════════════════════

  // Europe
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
      "DPRK missiles: 18 ballistic missile tests overflying Japan's EEZ in 2024–2025",
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
    iso:"036", name:"Australia", level:"MODERATE", score:31, domain:"Climate", trend:"→", lat:-25.3, lon:133.8,
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
  {
    iso:"380", name:"Italy", level:"MODERATE", score:36, domain:"Economic", trend:"→", lat:42.8, lon:12.8,
    incidents:[
      "Public debt: 140% GDP — 2nd highest in eurozone; ECB fragility monitoring active",
      "Migration pressure: 150,000+ Mediterranean arrivals 2025; Meloni's Albania deal contested",
      "Mafia (Ndrangheta) now Europe's largest criminal enterprise by revenue",
    ],
  },
  {
    iso:"724", name:"Spain", level:"MODERATE", score:34, domain:"Civil / Political", trend:"→", lat:40.4, lon:-3.7,
    incidents:[
      "Catalonian independence crisis ongoing: Sánchez minority government reliant on Junts support",
      "Far-right Vox normalized: coalition governments in 6 autonomous regions",
      "Housing crisis: rental costs up 40% 2022–2025; youth homeownership near zero",
    ],
  },
  {
    iso:"616", name:"Poland", level:"MODERATE", score:33, domain:"Civil / Political", trend:"→", lat:51.9, lon:19.1,
    incidents:[
      "Rule of law crisis: Tusk government reversing PiS judicial captures — constitutional standoff",
      "Russia border: spending 4% GDP on defence — highest in NATO; border fortifications underway",
      "Migration pressure: 1M+ Ukrainians resident; Belarus-engineered border crossings ongoing",
    ],
  },
  {
    iso:"642", name:"Romania", level:"MODERATE", score:32, domain:"Civil / Political", trend:"↑", lat:45.9, lon:24.9,
    incidents:[
      "Constitutional court annulled presidential election Dec 2024 citing Russian interference",
      "Far-right candidate Călin Georgescu (TikTok-amplified by Russia) won first round",
      "NATO's eastern flank: Black Sea security architecture being hardened post-Ukraine",
    ],
  },
  {
    iso:"233", name:"Estonia", level:"MODERATE", score:35, domain:"Cyber / Tech", trend:"↑", lat:58.6, lon:25.0,
    incidents:[
      "NATO's most cyber-attacked nation per capita; Russia conducting daily probing attacks",
      "25% ethnic Russian minority; Russia uses 'compatriots' doctrine for leverage",
      "Defence spending: 3.4% GDP — highest in Europe; mandatory military service expanded",
    ],
  },
  {
    iso:"428", name:"Latvia", level:"MODERATE", score:34, domain:"Cyber / Tech", trend:"↑", lat:56.9, lon:24.6,
    incidents:[
      "Baltic corridor (Suwałki Gap): NATO's most vulnerable land link — Russia could sever",
      "Energy independence: Baltic states exiting Russian power grid (BRELL) in 2025",
      "Disinformation: Russian-language media ecosystem remains influential among minority",
    ],
  },
  {
    iso:"440", name:"Lithuania", level:"MODERATE", score:34, domain:"Civil / Political", trend:"↑", lat:55.2, lon:23.9,
    incidents:[
      "Kaliningrad blockade incident 2022: Russia threatened 'serious consequences' — tensions persist",
      "Defence spending: 3.1% GDP; conscription reinstated for men 2023",
      "Russian hybrid ops: energy grid sabotage attempts, cyberattacks on parliament recorded",
    ],
  },
  {
    iso:"348", name:"Hungary", level:"MODERATE", score:36, domain:"Civil / Political", trend:"↑", lat:47.2, lon:19.5,
    incidents:[
      "Orbán blocking EU aid to Ukraine: single veto holding $50B package through 2024",
      "Media capture: 90% of media under government-aligned ownership",
      "Rule of law: EU Article 7 proceedings; €1B in cohesion funds frozen",
    ],
  },
  {
    iso:"300", name:"Greece", level:"MODERATE", score:33, domain:"Economic", trend:"→", lat:39.1, lon:21.8,
    incidents:[
      "Migration front: Aegean crossings; Evros fence construction creating EU tension with Türkiye",
      "Wildfire season 2025: 800,000 hectares burned; climate change extending fire season",
      "Surveillance scandal: Predator spyware used on journalists and opposition MPs",
    ],
  },
  {
    iso:"100", name:"Bulgaria", level:"MODERATE", score:32, domain:"Civil / Political", trend:"→", lat:42.7, lon:25.5,
    incidents:[
      "Political instability: 7 elections in 4 years; caretaker government unable to pass reforms",
      "Corruption: EU's most corrupt member state (Transparency International); EU funds at risk",
      "Russian gas dependency: 80% of gas from Russia; diversification incomplete",
    ],
  },
  {
    iso:"191", name:"Croatia", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:45.1, lon:15.2,
    incidents:[
      "Plenković government re-elected 2024; EU integration deepening, Schengen member since 2023",
      "War crimes accountability: Hague convictions still contested by nationalist elements",
      "Brain drain: 400,000+ emigrants (10% of population) since EU accession",
    ],
  },
  {
    iso:"705", name:"Slovenia", level:"MODERATE", score:25, domain:"Economic", trend:"→", lat:46.1, lon:14.8,
    incidents:[
      "Coalition government stable; EU and NATO member in good standing",
      "Flood risk: major 2023 floods caused €500M damage; climate adaptation lagging",
      "Housing costs rising; inflation impact on living standards notable",
    ],
  },
  {
    iso:"008", name:"Albania", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:41.1, lon:20.2,
    incidents:[
      "EU accession Chapter 23/24 (justice/rights) partially opened 2024; corruption persistent",
      "Organized crime: Albanian mafia among Europe's most powerful; drug trafficking dominant",
      "Italy Albania migration deal: processing center for asylum seekers — contested legally",
    ],
  },
  {
    iso:"807", name:"North Macedonia", level:"MODERATE", score:29, domain:"Civil / Political", trend:"→", lat:41.6, lon:21.7,
    incidents:[
      "Name dispute resolved (Prespa Agreement) but Bulgaria blocking EU chapter openings",
      "VMRO-DPMNE won 2024 elections; EU accession still delayed by Sofia's veto",
      "Organized crime links in government alleged; wiretapping scandal resurfaced",
    ],
  },
  {
    iso:"499", name:"Montenegro", level:"MODERATE", score:29, domain:"Civil / Political", trend:"→", lat:42.7, lon:19.4,
    incidents:[
      "EU candidate — most advanced Western Balkans state; NATO member since 2017",
      "Organized crime: Kavač/Škaljari drug cartel war spilling into public spaces",
      "Deepfake disinformation targeting pro-EU politicians; Russia influence documented",
    ],
  },
  {
    iso:"703", name:"Slovakia", level:"MODERATE", score:31, domain:"Civil / Political", trend:"↑", lat:48.7, lon:19.7,
    incidents:[
      "PM Fico shot May 2024 — survived; blamed 'Western liberal media' and Ukraine",
      "Government blocking EU sanctions extensions on Russia; SWIFT blocking vetoed",
      "Deepening Hungary-Slovakia axis opposing mainstream EU Ukraine support",
    ],
  },
  {
    iso:"203", name:"Czechia", level:"MODERATE", score:28, domain:"Economic", trend:"→", lat:49.8, lon:15.5,
    incidents:[
      "Czech-Ukraine solidarity among strongest in EU; defense industry supplying frontlines",
      "Cost of living crisis: energy price hike reduced household savings 15%",
      "Far-right ANO weakened; Fiala centre-right governing confidently",
    ],
  },
  {
    iso:"040", name:"Austria", level:"MODERATE", score:27, domain:"Civil / Political", trend:"↑", lat:47.5, lon:14.6,
    incidents:[
      "FPÖ (far-right) won parliamentary election Sep 2024 — first time in Austrian history",
      "Chancellor Kickl forming government Jan 2025 — Russia-friendly, anti-Ukraine aid",
      "Migration: 100,000+ asylum applications 2024 straining social services",
    ],
  },
  {
    iso:"756", name:"Switzerland", level:"MODERATE", score:22, domain:"Economic", trend:"→", lat:46.8, lon:8.2,
    incidents:[
      "Banking sector: Credit Suisse collapse 2023 — UBS absorbed, systemic risk persists",
      "Bilateral agreement with EU under negotiation; direct democracy risks ratification",
      "Neutrality under pressure: arms export restrictions debated in context of Ukraine",
    ],
  },
  {
    iso:"528", name:"Netherlands", level:"MODERATE", score:27, domain:"Civil / Political", trend:"↑", lat:52.3, lon:5.3,
    incidents:[
      "Wilders PVV won 2023 election; coalition formed 2024 — most right-wing Dutch government ever",
      "Nitrogen crisis: farm protests disrupting supply chains; coalition agreement contentious",
      "Housing crisis: 400,000 unit shortage; Amsterdam rents up 60% since 2019",
    ],
  },
  {
    iso:"056", name:"Belgium", level:"MODERATE", score:29, domain:"Civil / Political", trend:"→", lat:50.5, lon:4.5,
    incidents:[
      "Islamist attack Oct 2023 (Brussels): gunman killed 2 Swedish tourists; terror level HIGH",
      "16-month government formation 2020 record broken: 2024 coalition fragile",
      "Flemish separatism: N-VA demanding confederalism; Belgium's unity structural question",
    ],
  },
  {
    iso:"208", name:"Denmark", level:"MODERATE", score:20, domain:"Economic", trend:"→", lat:56.3, lon:9.5,
    incidents:[
      "Greenland: Trump annexation demands creating diplomatic pressure; Arctic sovereignty",
      "Defence spending 2% NATO target met 2025; Baltic Sea security prioritised",
      "Energy leader: 55% electricity from wind; model for others but grid stability costs",
    ],
  },
  {
    iso:"752", name:"Sweden", level:"MODERATE", score:24, domain:"Civil / Political", trend:"↑", lat:62.2, lon:17.6,
    incidents:[
      "Gang violence: grenade attacks in Stockholm suburbs; organized crime migration effect",
      "NATO member since 2024 — Sweden's first military alliance in 200 years",
      "Far-right SD now supporting Tidö Alliance government; welfare state reform contested",
    ],
  },
  {
    iso:"578", name:"Norway", level:"MODERATE", score:18, domain:"Economic", trend:"→", lat:64.5, lon:17.9,
    incidents:[
      "Svalbard: Russia challenging Norwegian sovereignty; Arctic shipping route tensions",
      "Oil fund ($1.7T): world's largest SWF — managing peak oil transition",
      "Undersea infrastructure: Baltic cables and Nord Stream sabotage raised concern for Norwegian pipes",
    ],
  },
  {
    iso:"246", name:"Finland", level:"MODERATE", score:22, domain:"Civil / Political", trend:"→", lat:64.9, lon:25.8,
    incidents:[
      "1,340km border with Russia: bolstering defences, Finland building barrier 2024–2025",
      "Asylum instrumentalisation: Russia reopened Arctic border as hybrid tool Sep 2024",
      "NATO's newest frontier member; defence budget increased 70% since 2022",
    ],
  },
  {
    iso:"372", name:"Ireland", level:"MODERATE", score:22, domain:"Civil / Political", trend:"↑", lat:53.4, lon:-7.9,
    incidents:[
      "Far-right riots Dublin Nov 2023 (stabbing); immigration becoming dominant political issue",
      "Housing crisis: median home price 14× average wage in Dublin",
      "Corporation tax: OECD 15% minimum undermining Ireland's FDI model",
    ],
  },
  {
    iso:"352", name:"Iceland", level:"MODERATE", score:15, domain:"Climate", trend:"→", lat:64.9, lon:-19.0,
    incidents:[
      "Reykjanes Peninsula volcanic eruptions 2023–2025: Grindavik evacuated 3 times; Blue Lagoon damaged",
      "Fishing disputes: mackerel wars with Norway/Faroe Islands unresolved",
      "Housing shortage in Reykjavik: population growth straining infrastructure",
    ],
  },
  {
    iso:"470", name:"Malta", level:"MODERATE", score:22, domain:"Civil / Political", trend:"→", lat:35.9, lon:14.4,
    incidents:[
      "Migration: Malta's per-capita refugee arrival rate highest in EU; rescue ops contested",
      "Rule of law: Daphne Caruana Galizia murder — Schembri/Muscat implicated; corruption reforms incomplete",
      "Financial: golden passport scheme under EU pressure; money laundering concerns",
    ],
  },
  {
    iso:"196", name:"Cyprus", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:35.1, lon:33.4,
    incidents:[
      "Partition: Turkish-controlled north unrecognized; reunification talks stalled since 2017",
      "Gas disputes: EEZ tensions with Turkey over Aphrodite field drilling",
      "Golden passport scandal: EU citizenship sold to corrupt individuals; scheme ended under pressure",
    ],
  },

  // Middle East (non-conflict)
  {
    iso:"400", name:"Jordan", level:"MODERATE", score:35, domain:"Economic", trend:"↑", lat:30.6, lon:36.8,
    incidents:[
      "Gaza spill-over: 1M+ Palestinian refugees already resident; new displacement risk",
      "Water scarcity: among world's most water-scarce; per capita supply declining 50% since 2000",
      "Debt at 95% GDP; unemployment 22%; youth unemployment 35%",
    ],
  },
  {
    iso:"414", name:"Kuwait", level:"MODERATE", score:28, domain:"Civil / Political", trend:"↑", lat:29.3, lon:47.7,
    incidents:[
      "Emir dissolved parliament May 2024 — 4th dissolution in 3 years; political gridlock",
      "Oil dependence: 90% of revenue from oil; Vision 2035 diversification stalled",
      "Iran threat proximity: cross-border Shia militia networks active",
    ],
  },
  {
    iso:"784", name:"UAE", level:"MODERATE", score:26, domain:"Cyber / Tech", trend:"→", lat:23.4, lon:53.8,
    incidents:[
      "NSO Group Pegasus: UAE used spyware against journalists and foreign officials",
      "FATF: removed from grey list 2024 but AML concerns persist",
      "Hosting Russian oligarch assets despite sanctions — Western pressure ongoing",
    ],
  },
  {
    iso:"634", name:"Qatar", level:"MODERATE", score:24, domain:"Civil / Political", trend:"→", lat:25.4, lon:51.2,
    incidents:[
      "Hamas political bureau hosted in Doha — balancing role and pressure from US/Israel",
      "World Cup legacy: Kafala system reform incomplete; labour rights violations ongoing",
      "LNG dominance: world's #1 LNG exporter; Europe now critically dependent on Qatari gas",
    ],
  },
  {
    iso:"512", name:"Oman", level:"MODERATE", score:22, domain:"Economic", trend:"→", lat:21.0, lon:57.0,
    incidents:[
      "Mediation role: Oman brokering US-Iran back-channel talks; diplomatic asset",
      "Post-Sultan Qaboos transition (2020): Haitham stabilizing; succession secure",
      "Oil depletion timeline: Oman projects reserves exhausted by 2040; Vision 2040 diversification",
    ],
  },
  {
    iso:"048", name:"Bahrain", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:26.1, lon:50.6,
    incidents:[
      "Shia majority (60%) ruled by Sunni monarchy; 2011 uprising suppressed with Saudi help",
      "Iran influence: Hizballah-linked cells disrupted 2024; sectarian tension persistent",
      "US Fifth Fleet headquarters: critical strategic asset, potential Iranian target",
    ],
  },

  // Central Asia
  {
    iso:"398", name:"Kazakhstan", level:"MODERATE", score:32, domain:"Civil / Political", trend:"↑", lat:48.0, lon:67.0,
    incidents:[
      "Jan 2022 uprising (Kantar): 238 killed, Tokayev invited Russian/CSTO troops — first use",
      "Multi-vector diplomacy: maintaining ties with Russia while deepening EU/China relations",
      "Sanctions compliance: secondary sanctions risk for processing Russian exports; EU pressure",
    ],
  },
  {
    iso:"860", name:"Uzbekistan", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:41.4, lon:64.6,
    incidents:[
      "Mirziyoyev reforms: economy growing 5%+, but political opening limited post-Karakalpakstan 2022",
      "Karakalpakstan protests (2022): 21 killed after constitutional change proposals; silenced",
      "ISIS-K: Uzbek nationals among top recruiters globally; cross-border threat from Afghanistan",
    ],
  },
  {
    iso:"795", name:"Turkmenistan", level:"MODERATE", score:35, domain:"Civil / Political", trend:"→", lat:40.6, lon:58.4,
    incidents:[
      "North Korea-level isolation: Berdymukhamedov dynasty; food shortages denied officially",
      "Gas wealth unequally distributed; 30%+ unemployment unofficial estimates",
      "Taliban border: 750km shared frontier; smuggling and infiltration unmonitored",
    ],
  },
  {
    iso:"417", name:"Kyrgyzstan", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:41.2, lon:74.8,
    incidents:[
      "Border conflict with Tajikistan 2022: 100+ killed; ceasefire fragile, demarcation unresolved",
      "Revolving door coups: 3 presidents ousted since independence; Japarov consolidated 2021",
      "Crypto mining boom: 20% of electricity used for mining; power cuts in winter",
    ],
  },

  // East/Southeast Asia
  {
    iso:"704", name:"Vietnam", level:"MODERATE", score:27, domain:"Civil / Political", trend:"→", lat:16.6, lon:106.3,
    incidents:[
      "South China Sea: dredging disputes in Spratly/Paracel Islands; 12 incidents with China 2025",
      "Anti-corruption campaign: General Secretary Tô Lâm jailing senior party officials",
      "Manufacturing boom: Apple/Samsung supply chain shift from China benefiting Vietnam",
    ],
  },
  {
    iso:"764", name:"Thailand", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:15.9, lon:100.9,
    incidents:[
      "Constitutional court dissolved Move Forward party Jul 2024; Pita Limjaroenrat barred",
      "New PM Paetongtarn Shinawatra (Thaksin's daughter) — political dynasty restored",
      "Tourism recovering post-COVID; but political stability rating declining",
    ],
  },
  {
    iso:"116", name:"Cambodia", level:"MODERATE", score:31, domain:"Civil / Political", trend:"↑", lat:12.6, lon:104.9,
    incidents:[
      "Hun Manet inherited power from father Hun Sen (2023) — dynasty consolidation",
      "Chinese base rumours at Ream Naval Base — Cambodia denies; US concerned",
      "Scam compound crisis: 100,000+ foreign nationals trafficked for cyber-fraud operations",
    ],
  },
  {
    iso:"458", name:"Malaysia", level:"MODERATE", score:26, domain:"Civil / Political", trend:"→", lat:4.2, lon:109.5,
    incidents:[
      "South China Sea: Luconia Shoals standoff with China; Malaysia maintaining claims diplomatically",
      "Unity government: Anwar Ibrahim balancing Malay nationalism and reform",
      "1MDB fallout: $4.5B fraud case ongoing; Goldman Sachs settlement complete",
    ],
  },
  {
    iso:"496", name:"Mongolia", level:"MODERATE", score:25, domain:"Economic", trend:"→", lat:46.9, lon:103.8,
    incidents:[
      "Sandwiched between Russia and China: 90% of exports to China; extreme dependency",
      "Coal export bottleneck: infrastructure to China inadequate; revenue lost to smuggling",
      "Democratic backsliding concerns: media freedom declining; corruption high",
    ],
  },
  {
    iso:"096", name:"Brunei", level:"MODERATE", score:18, domain:"Civil / Political", trend:"→", lat:4.9, lon:114.9,
    incidents:[
      "Sharia criminal code fully implemented 2019; LGBTQ+ criminalized; diplomatic isolation",
      "Oil depletion: reserves projected exhausted by 2035; diversification minimal",
      "South China Sea: overlapping claims with China, Vietnam, Philippines",
    ],
  },
  {
    iso:"626", name:"Timor-Leste", level:"MODERATE", score:30, domain:"Economic", trend:"→", lat:-8.9, lon:125.7,
    incidents:[
      "Sunrise gas field: development agreement with Australia signed 2023; pipeline delayed",
      "Political deadlock: Guterres (Fretilin) and Xanana (CNRT) coalition fragile",
      "Poverty: 42% below national poverty line; 50% of children stunted",
    ],
  },

  // South Asia (non-conflict)
  {
    iso:"524", name:"Nepal", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:28.4, lon:84.1,
    incidents:[
      "Political instability: 14 governments in 16 years; Prachanda/Deuba cycle continues 2024",
      "China-India competition: BRI projects vs India's connectivity initiatives — Nepal navigating",
      "Earthquake risk: 2015 Gorkha killed 9,000; 2023 quake killed 157; infrastructure fragile",
    ],
  },
  {
    iso:"064", name:"Bhutan", level:"MODERATE", score:15, domain:"Economic", trend:"→", lat:27.5, lon:90.4,
    incidents:[
      "China border: 2020 Doklam-adjacent incursion; Bhutan-China boundary negotiations ongoing",
      "Brain drain: 10,000+ young Bhutanese emigrated to Australia under visa scheme",
      "Hydropower dependence: 90%+ of revenue from India purchases; single customer risk",
    ],
  },

  // Africa (non-conflict additions)
  {
    iso:"012", name:"Algeria", level:"MODERATE", score:33, domain:"Civil / Political", trend:"→", lat:28.0, lon:1.7,
    incidents:[
      "Military-backed government: Hirak protest movement suppressed 2021; 300+ political prisoners",
      "Gas supply to Europe: critical leverage as Russia gas declined; $10B in EU contracts",
      "Western Sahara: backing Polisario Front vs Morocco — Morocco-Algeria border closed since 1994",
    ],
  },
  {
    iso:"504", name:"Morocco", level:"MODERATE", score:29, domain:"Civil / Political", trend:"→", lat:31.8, lon:-5.4,
    incidents:[
      "Western Sahara: US recognition (2020) controversial; Morocco controls 80% of territory",
      "2023 earthquake (Al Haouz): 2,900 killed; reconstruction ongoing",
      "Migration transit: 50,000+ Moroccans crossed to Spain illegally 2025",
    ],
  },
  {
    iso:"788", name:"Tunisia", level:"MODERATE", score:36, domain:"Civil / Political", trend:"↑", lat:33.9, lon:9.5,
    incidents:[
      "Saied autocratic turn: suspended parliament (2021), new constitution (2022), arrested opponents",
      "IMF talks collapsed 2023; $4B fiscal gap; currency under pressure",
      "Migration launch point: 35,000+ sub-Saharan Africans crossed to Italy from Tunisia 2025",
    ],
  },
  {
    iso:"686", name:"Senegal", level:"MODERATE", score:27, domain:"Civil / Political", trend:"↑", lat:14.5, lon:-14.5,
    incidents:[
      "New President Faye (Pastef) elected Mar 2024 — peaceful transition in fragile Sahel region",
      "Oil/gas windfall expected 2025–2026; governance of revenues critical test",
      "Jihadist spill-over risk from Mali border; army deployed in Casamance",
    ],
  },
  {
    iso:"288", name:"Ghana", level:"MODERATE", score:30, domain:"Economic", trend:"↑", lat:7.9, lon:-1.2,
    incidents:[
      "Debt crisis: defaulted 2022; IMF $3B bailout; cocoa and gold revenues stressed",
      "New President Mahama elected Dec 2024 — NDC return; fiscal consolidation mandate",
      "Energy: 30% of population without electricity; load shedding 12hrs/day in north",
    ],
  },
  {
    iso:"384", name:"Côte d'Ivoire", level:"MODERATE", score:27, domain:"Civil / Political", trend:"→", lat:7.5, lon:-5.6,
    incidents:[
      "Jihadist corridor: attacks in northern border region from Burkina Faso increasing",
      "Ouattara third-term (2020) contested; Affi N'Guessan opposition jailed",
      "Cocoa dominance: 40% of world supply; climate change threatening yields",
    ],
  },
  {
    iso:"646", name:"Rwanda", level:"MODERATE", score:33, domain:"Civil / Political", trend:"↑", lat:-1.9, lon:29.9,
    incidents:[
      "Kagame won 99% in 2024 election — no genuine opposition permitted; press freedom nil",
      "DRC: UN experts confirm Rwanda backing M23; Western donors suspending aid",
      "UK asylum deal: processing refugees for UK; £240M agreement — internationally controversial",
    ],
  },
  {
    iso:"834", name:"Tanzania", level:"MODERATE", score:26, domain:"Civil / Political", trend:"→", lat:-6.4, lon:34.9,
    incidents:[
      "Opposition leader Tundu Lissu returned 2024; Samia government allowing limited space",
      "DRC refugee burden: 400,000+ Congolese refugees in western Tanzania",
      "Gas development: Lindi LNG project $30B — single largest investment in Africa",
    ],
  },
  {
    iso:"894", name:"Zambia", level:"MODERATE", score:28, domain:"Economic", trend:"↑", lat:-13.1, lon:27.9,
    incidents:[
      "Debt restructuring: reached agreement with Eurobond holders 2024 after 2020 default",
      "Copper boom: EV demand driving investment; Chinese smelter dominance contested",
      "Drought 2024: El Niño cut maize harvest 50%; food emergency declared",
    ],
  },
  {
    iso:"454", name:"Malawi", level:"MODERATE", score:29, domain:"Economic", trend:"↑", lat:-13.3, lon:34.3,
    incidents:[
      "Cyclone Freddy 2023: worst cyclone in Southern Africa history; 800+ killed, 500,000 displaced",
      "Forex crisis: fuel shortages chronic; kwacha devalued 25% in 2024",
      "Anti-corruption: President Chakwera struggling to deliver on ACB independence promise",
    ],
  },
  {
    iso:"450", name:"Madagascar", level:"MODERATE", score:30, domain:"Climate", trend:"↑", lat:-19.4, lon:46.7,
    incidents:[
      "Cyclone exposure: 3 major cyclones 2024–25; 1.5M require food assistance annually",
      "Political deadlock: Rajoelina won 2023 in boycotted election; opposition unrecognized",
      "Deforestation: 80% of original forest lost; biodiversity collapse accelerating",
    ],
  },
  {
    iso:"516", name:"Namibia", level:"MODERATE", score:22, domain:"Economic", trend:"→", lat:-22.3, lon:17.1,
    incidents:[
      "Offshore oil discovery (2022): TotalEnergies 3B barrel Orange Basin find — development contested",
      "Drought: 2024 El Niño worst in 40 years; 1.4M need food assistance",
      "Netumbo Nandi-Ndaitwah elected first female president Nov 2024",
    ],
  },
  {
    iso:"072", name:"Botswana", level:"MODERATE", score:22, domain:"Economic", trend:"↑", lat:-22.3, lon:24.7,
    incidents:[
      "Diamond shock: De Beers deal renegotiated 2023; Botswana gets 50% stake in Debswana",
      "Masisi lost election Nov 2024 — Duma Boko won; first real power transfer in decades",
      "Drought and elephant-human conflict: 135,000 elephants overwhelming northern communities",
    ],
  },
  {
    iso:"426", name:"Lesotho", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:-29.6, lon:28.2,
    incidents:[
      "Political instability: 5 PMs since 2015; coalition collapse cycle continues",
      "SACU dependency: 70% of government revenue from Southern African customs union",
      "HIV/AIDS: 24% adult prevalence — 2nd highest globally",
    ],
  },
  {
    iso:"748", name:"Eswatini", level:"MODERATE", score:32, domain:"Civil / Political", trend:"↑", lat:-26.5, lon:31.5,
    incidents:[
      "Mswati III absolute monarchy: pro-democracy protests (2021) killed 80+; banned political parties",
      "South Africa pressure: ANC calling for democratic transition at SADC",
      "HIV/AIDS: 27% adult prevalence — world's highest; life expectancy 59 years",
    ],
  },
  {
    iso:"478", name:"Mauritania", level:"MODERATE", score:31, domain:"Civil / Political", trend:"→", lat:20.3, lon:-10.9,
    incidents:[
      "Gas windfall: GTA offshore field first LNG production 2024; revenue management critical",
      "Sahel jihadist buffer: Mauritania has avoided major attacks via accommodation strategy",
      "Slavery legacy: abolished 1981, criminalized 2007 but de facto practices persist",
    ],
  },
  {
    iso:"270", name:"Gambia", level:"MODERATE", score:25, domain:"Civil / Political", trend:"→", lat:13.5, lon:-15.6,
    incidents:[
      "Post-Jammeh transition: Barrow government consolidating democracy; constitution draft stalled",
      "ICC: Jammeh faces indictment for crimes against humanity; still in Equatorial Guinea exile",
      "Climate vulnerability: sea level rise threatening 60% of coastal agricultural land",
    ],
  },
  {
    iso:"694", name:"Sierra Leone", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:8.5, lon:-11.8,
    incidents:[
      "Coup attempt Nov 2023: armory attack; state of emergency declared; ECOWAS monitoring",
      "Economic crisis: 54% inflation 2023; Leone devalued; IMF program in place",
      "Ebola preparedness: WHO warns West Africa endemic cycle returning",
    ],
  },
  {
    iso:"430", name:"Liberia", level:"MODERATE", score:27, domain:"Civil / Political", trend:"→", lat:6.4, lon:-9.4,
    incidents:[
      "New President Joseph Boakai elected Jan 2024 — Weah peacefully conceded",
      "Economy: 5% GDP growth but 50%+ poverty rate; infrastructure largely destroyed",
      "West Africa jihadist spread: ECOWAS warning jihadists may reach coastal states by 2027",
    ],
  },
  {
    iso:"204", name:"Benin", level:"MODERATE", score:29, domain:"Civil / Political", trend:"↑", lat:9.3, lon:2.3,
    incidents:[
      "Jihadist incursions: JNIM crossed from Burkina Faso — 50+ attacks in northern Benin 2024",
      "Talon government authoritarian turn: opposition barred from 2023 elections",
      "Armed forces deployed north; France Barkhane successor mission operating",
    ],
  },
  {
    iso:"768", name:"Togo", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:8.6, lon:0.8,
    incidents:[
      "Gnassingbé dynasty (since 1967): constitutional change 2024 moved to parliamentary system, entrenching family",
      "Jihadist threat: JNIM attacks in northern Kara/Savanes regions increasing",
      "Economy: remittances and Lomé port key; phosphate exports under Chinese deals",
    ],
  },
  {
    iso:"624", name:"Guinea-Bissau", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:11.9, lon:-15.2,
    incidents:[
      "Drug transshipment: West Africa's primary cocaine corridor from South America to Europe",
      "Political instability: 9 coups or attempts since independence (1974)",
      "President Embalo consolidating: dissolved parliament 2022; governing by decree",
    ],
  },
  {
    iso:"178", name:"Republic of Congo", level:"MODERATE", score:30, domain:"Civil / Political", trend:"→", lat:-0.2, lon:15.8,
    incidents:[
      "Sassou Nguesso dynasty (40+ years): 2021 election won with 88%; opposition absent",
      "Pool region: Ninja militia suppressed 2017; underlying tensions unresolved",
      "Oil wealth mismanagement: debt at 100% GDP despite oil revenues",
    ],
  },
  {
    iso:"226", name:"Equatorial Guinea", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:1.7, lon:10.3,
    incidents:[
      "Obiang Nguema dynasty (45 years): son Teodorin Obiang VP and heir — ICC warrant in France",
      "Oil wealth kleptocracy: $8B stolen (US DOJ estimate); 75% population in poverty",
      "Harboring Jammeh (Gambia): sheltering indicted authoritarian raises ICC pressure",
    ],
  },
  {
    iso:"174", name:"Comoros", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:-11.9, lon:43.4,
    incidents:[
      "Azali Assoumani won disputed 2024 election; EU observation mission rejected results",
      "Inter-island tensions: Anjouan/Mohéli resentment of Grande Comore dominance",
      "Climate: cyclone season extending; coral reef bleaching destroying fisheries",
    ],
  },
  {
    iso:"262", name:"Djibouti", level:"MODERATE", score:29, domain:"Civil / Political", trend:"→", lat:11.8, lon:42.6,
    incidents:[
      "Geostrategic nexus: US Camp Lemonnier + China's only overseas military base both here",
      "Guelleh dynasty (since 1999): no opposition permitted; critical debt to China for port",
      "Red Sea crisis: Houthi attacks diverting shipping; Djibouti port revenue paradoxically rising",
    ],
  },
  {
    iso:"480", name:"Mauritius", level:"MODERATE", score:20, domain:"Economic", trend:"→", lat:-20.2, lon:57.6,
    incidents:[
      "New government Nov 2024: Navin Ramgoolam returned; Jugnauth dynasty ended",
      "Chagos Islands: UK-Mauritius deal agreed Oct 2024; US/UK retain Diego Garcia base",
      "Financial hub: FATF grey list risk; offshore structures under EU scrutiny",
    ],
  },

  // Americas additions
  {
    iso:"214", name:"Dominican Republic", level:"MODERATE", score:28, domain:"Civil / Political", trend:"→", lat:18.7, lon:-70.2,
    incidents:[
      "Haiti border: steel wall construction; 150,000+ Haitian migrants expelled 2024",
      "Gang violence spillover from Haiti creating border security crisis",
      "Abinader re-elected May 2024; economy growing 5%+ driven by tourism",
    ],
  },
  {
    iso:"388", name:"Jamaica", level:"MODERATE", score:31, domain:"Civil / Political", trend:"→", lat:18.1, lon:-77.3,
    incidents:[
      "Gang violence: Zones of Special Operations (ZOSOs) controlling Kingston garrisons",
      "Homicide rate: 43/100,000 — top-10 globally",
      "IMF program completed; debt reduced from 140% to 70% GDP over decade",
    ],
  },
  {
    iso:"600", name:"Paraguay", level:"MODERATE", score:25, domain:"Civil / Political", trend:"→", lat:-23.4, lon:-58.4,
    incidents:[
      "Colorado Party: 77 years in power (with brief gap); Peña government business-friendly",
      "Narco-network: triple border area (Argentina-Brazil-Paraguay) cocaine trade hub",
      "Soy monoculture: 75% of arable land; climate and commodity price vulnerability",
    ],
  },
  {
    iso:"858", name:"Uruguay", level:"MODERATE", score:16, domain:"Economic", trend:"→", lat:-32.5, lon:-55.8,
    incidents:[
      "New President Orsi (Frente Amplio) March 2025 — peaceful left-right-left transition",
      "Most stable democracy in South America; rule of law metrics among best in LAC",
      "Cannabis legalization model: international scrutiny; INCB monitoring ongoing",
    ],
  },
  {
    iso:"152", name:"Chile", level:"MODERATE", score:25, domain:"Civil / Political", trend:"→", lat:-35.7, lon:-71.5,
    incidents:[
      "Constitutional process: second attempt rejected 2023; Boric government weakened",
      "Lithium nationalisation: SQM/Codelco deal reshaping battery supply chain geopolitics",
      "Migration crisis: 1.5M Venezuelans; crime rate rising in Santiago Norte",
    ],
  },
  {
    iso:"068", name:"Bolivia", level:"MODERATE", score:32, domain:"Civil / Political", trend:"↑", lat:-16.3, lon:-64.6,
    incidents:[
      "Failed coup attempt Jun 2024: General Zúñiga seized government palace with tanks; arrested",
      "Arce-Morales split in MAS party: two factions claiming party leadership",
      "Gas reserves declining: Bolivia no longer gas exporter; energy crisis deepening",
    ],
  },
  {
    iso:"328", name:"Guyana", level:"MODERATE", score:25, domain:"Economic", trend:"↑", lat:4.9, lon:-58.9,
    incidents:[
      "Largest per-capita oil discovery: 11B barrel Stabroek block; fastest-growing economy 2024 (+50% GDP)",
      "Venezuela threat: Essequibo annexation claim; ICJ case ongoing; military buildup on border",
      "Dutch disease risk: rapid oil revenue overwhelming small economy (800,000 population)",
    ],
  },
  {
    iso:"740", name:"Suriname", level:"MODERATE", score:28, domain:"Economic", trend:"→", lat:4.0, lon:-55.9,
    incidents:[
      "Offshore oil: Yellowtail discovery; TotalEnergies FID expected 2025; revenue not yet flowing",
      "Debt default avoided 2021; IMF program in place; fiscal consolidation painful",
      "Illegal gold mining: 90%+ of exports informal; mercury pollution in rivers",
    ],
  },
  {
    iso:"188", name:"Costa Rica", level:"MODERATE", score:18, domain:"Economic", trend:"→", lat:9.7, lon:-83.8,
    incidents:[
      "Gang violence spillover: northern border with Nicaragua; cartels using Costa Rica as transit",
      "Green energy leader: 99% renewable electricity but tourism-dependent GDP vulnerable",
      "Tech hub: Intel, Amazon, major data center investment; skilled worker shortage",
    ],
  },
  {
    iso:"591", name:"Panama", level:"MODERATE", score:23, domain:"Civil / Political", trend:"↑", lat:8.4, lon:-80.1,
    incidents:[
      "Mulino won 2024 election after Martinelli (in Nicaraguan asylum) replaced on ticket",
      "Cobre Panama copper mine closure (2023): largest investment in Central America shuttered after protests",
      "Canal: El Niño drought reduced transits 30%; drought vulnerability structural concern",
    ],
  },
  {
    iso:"084", name:"Belize", level:"MODERATE", score:24, domain:"Civil / Political", trend:"→", lat:17.2, lon:-88.5,
    incidents:[
      "Guatemala territorial claim: 60% of Belize claimed; ICJ case filed 2022",
      "Gang violence: highest homicide rate in Central America (44/100,000)",
      "Reef bleaching: Great Belize Barrier Reef UNESCO-listed; climate threat",
    ],
  },
  {
    iso:"222", name:"El Salvador", level:"MODERATE", score:26, domain:"Civil / Political", trend:"↓", lat:13.8, lon:-88.9,
    incidents:[
      "Bukele re-elected 2024 (unconstitutional); international community accepts fait accompli",
      "Gang crackdown: 75,000 arrested; homicide rate down 70% but due process absent",
      "Authoritarian consolidation: Supreme Court, legislature, military now Bukele-controlled",
    ],
  },
  {
    iso:"780", name:"Trinidad and Tobago", level:"MODERATE", score:27, domain:"Civil / Political", trend:"→", lat:10.7, lon:-61.2,
    incidents:[
      "Homicide rate: 30/100,000 — gang violence linked to Venezuela-Colombia drug routes",
      "Gas depletion: LNG exports declining; Atlantic LNG trains aging; reinvestment gap",
      "PM Rowley government facing energy transition; petro-state model unsustainable",
    ],
  },

  // Oceania
  {
    iso:"554", name:"New Zealand", level:"MODERATE", score:17, domain:"Climate", trend:"→", lat:-40.9, lon:174.9,
    incidents:[
      "Cyclone Gabrielle 2023: $14B damage; Hawke's Bay infrastructure rebuilt over 2 years",
      "China: deepening trade (25% of exports) creating security concerns; Five Eyes tension",
      "Luxon National-led government cutting climate commitments; agricultural emissions exempted",
    ],
  },
  {
    iso:"090", name:"Solomon Islands", level:"MODERATE", score:30, domain:"Civil / Political", trend:"↑", lat:-8.9, lon:160.2,
    incidents:[
      "China security deal 2022: bilateral security pact alarming Australia/US/NZ",
      "PM Sogavare lost 2024 election — new government reviewing China agreements",
      "Ethnic tensions: Malaita-Guadalcanal rivalry; 2021 riots burned Chinatown",
    ],
  },
  {
    iso:"242", name:"Fiji", level:"MODERATE", score:24, domain:"Civil / Political", trend:"→", lat:-17.7, lon:178.1,
    incidents:[
      "Rabuka returned to power 2022 — two-time coup leader now elected PM",
      "Climate: sea level rise 4mm/year; 42 villages requiring relocation; coral bleaching",
      "China-Australia competition: Fiji balancing; ANZUS pressure to reject China security deal",
    ],
  },
  {
    iso:"548", name:"Vanuatu", level:"MODERATE", score:25, domain:"Climate", trend:"↑", lat:-15.4, lon:166.9,
    incidents:[
      "Cyclone Winston-scale risk annually; 2024 Cyclone Judy destroyed Efate infrastructure",
      "Political instability: 15 PMs in 10 years; no-confidence votes routine",
      "Citizenship by investment: controversial passport scheme funds budget",
    ],
  },

  // ── Previously missing ────────────────────────────────────────────────────
  {
    iso:"024", name:"Angola", level:"MODERATE", score:32, domain:"Civil / Political", trend:"→", lat:-11.2, lon:17.9,
    incidents:[
      "MPLA in power since independence (1975); Lourenço anti-corruption drive stalling",
      "Oil dependency: 95% of exports; revenue collapse when prices fall",
      "1.6M internally displaced from civil war still unresolved; landmines cover 25% of territory",
    ],
  },
  {
    iso:"044", name:"Bahamas", level:"MODERATE", score:24, domain:"Climate", trend:"↑", lat:24.3, lon:-76.0,
    incidents:[
      "Hurricane Dorian (2019) destroyed Abaco and Grand Bahama — recovery still incomplete",
      "Drug transshipment corridor: US DEA active operations; gang violence in Nassau rising",
      "Sea level rise: 80% of land below 1m; entire island chains face uninhabitability by 2100",
    ],
  },
  {
    iso:"158", name:"Taiwan", level:"HIGH", score:81, domain:"Civil / Political", trend:"↑", lat:23.7, lon:121.0,
    incidents:[
      "PRC blockade exercises Dec 2025 encircled Taiwan with 90+ warships — most extensive ever",
      "CFR rates 2026 cross-strait crisis probability at 50%; TSMC fabs are global supply chokepoint",
      "US defence commitments ambiguous; AUKUS + Japan security frameworks accelerating",
    ],
  },
  {
    iso:"238", name:"Falkland Islands", level:"MODERATE", score:20, domain:"Civil / Political", trend:"→", lat:-51.8, lon:-59.5,
    incidents:[
      "Argentina sovereignty claim renewed under Milei government — UN resolutions cited",
      "UK garrison and Mount Pleasant airbase maintained; defence spend increased post-Ukraine",
      "Squid fishing economy threatened by Chinese fleet illegal fishing in surrounding EEZ",
    ],
  },
  {
    iso:"304", name:"Greenland", level:"MODERATE", score:30, domain:"Civil / Political", trend:"↑", lat:72.0, lon:-40.0,
    incidents:[
      "Trump annexation demands (Jan 2025) causing NATO-Denmark crisis; Greenland PM rejected outright",
      "Independence movement: Inuit Ataqatigiit government pursuing full independence from Denmark",
      "Arctic resources: rare earth deposits and ice-free shipping routes fuelling great power competition",
    ],
  },
  {
    iso:"442", name:"Luxembourg", level:"MODERATE", score:16, domain:"Economic", trend:"→", lat:49.8, lon:6.1,
    incidents:[
      "Financial centre: €3.5T in investment funds; FATF monitoring and EU tax haven pressure",
      "NATO host nation: SHAPE facilities; increased defence spending commitments 2025",
      "Housing crisis: world's most expensive real estate per m²; social inequality rising",
    ],
  },
  {
    iso:"540", name:"New Caledonia", level:"MODERATE", score:30, domain:"Civil / Political", trend:"↑", lat:-20.9, lon:165.6,
    incidents:[
      "Independence riots May 2024: 9 killed, €2.2B damage; Kanak uprising after electoral reform",
      "France dissolved local assembly; constitutional status dispute unresolved",
      "Nickel industry collapse: 3 smelters closed 2024; China undercutting on price",
    ],
  },
  {
    iso:"620", name:"Portugal", level:"MODERATE", score:26, domain:"Economic", trend:"→", lat:39.6, lon:-7.8,
    incidents:[
      "Centre-right AD minority government (2024); snap election risk if budget collapses",
      "Housing crisis: Lisbon rents up 60% since 2019; golden visa scheme ended under EU pressure",
      "Wildfire: 2024 season burned 120,000 hectares; climate change extending fire season",
    ],
  },
  {
    iso:"630", name:"Puerto Rico", level:"MODERATE", score:28, domain:"Economic", trend:"→", lat:18.2, lon:-66.6,
    incidents:[
      "Public debt: $70B restructuring under PROMESA oversight board since 2016; austerity ongoing",
      "Hurricane Maria (2017) recovery incomplete; power grid still fragile in 2025",
      "Population decline: 20% emigrated since 2010; fiscal spiral accelerating",
    ],
  },
  {
    iso:"732", name:"Western Sahara", level:"ELEVATED", score:48, domain:"Civil / Political", trend:"↑", lat:24.2, lon:-12.9,
    incidents:[
      "Morocco controls 80% of territory; Polisario Front (Algeria-backed) controls eastern strip",
      "US recognized Moroccan sovereignty (2020); UN peace process paralysed since 2019",
      "Phosphate wealth: world's largest reserves under Moroccan control — exports contested legally",
    ],
  },

  // ── Name-only features (no ISO numeric ID in TopoJSON) ────────────────────
  {
    iso:"xk", name:"Kosovo", level:"ELEVATED", score:49, domain:"Civil / Political", trend:"↑", lat:42.6, lon:20.9,
    incidents:[
      "Serbia refuses to recognise independence; EU-brokered normalisation talks collapsed Sep 2025",
      "KFOR (NATO) troops still required; Serb minority north Mitrovica flashpoint active",
      "EU candidate status stalled; visa liberalisation only gained 2024",
    ],
  },
  {
    iso:"nc-cy", name:"N. Cyprus", level:"ELEVATED", score:45, domain:"Civil / Political", trend:"→", lat:35.2, lon:33.6,
    incidents:[
      "Turkey-backed TRNC recognised only by Ankara; UN buffer zone divides island since 1974",
      "Reunification talks stalled; Tatar government hardening partition stance",
      "Varosha ghost city: Turkey unilaterally reopened sealed zone — EU condemned",
    ],
  },
  {
    iso:"so-sl", name:"Somaliland", level:"HIGH", score:65, domain:"Civil / Political", trend:"→", lat:9.6, lon:45.1,
    incidents:[
      "Unrecognised state since 1991 — functioning democracy but no UN membership",
      "Ethiopia-Somaliland port deal (Jan 2024) gave landlocked Ethiopia sea access — Somalia furious",
      "Al-Shabaab pressure on eastern borders; Puntland territorial clashes ongoing",
    ],
  },

  // ── Pacific & Polar Territories ────────
  {
    iso:"010", name:"Antarctica", level:"MODERATE", score:15, domain:"Climate", trend:"↑", lat:-80.0, lon:0.0,
    incidents:[
      "2026 record ice loss: West Antarctic Ice Sheet melt accelerating beyond IPCC worst-case",
      "7 nations claim overlapping territorial sovereignty — treaty system under strain",
      "96 research stations from 30 nations; climate data suggests 1.5°C threshold crossed",
    ],
  },
  {
    iso:"316", name:"Guam", level:"HIGH", score:72, domain:"Civil / Political", trend:"↑", lat:13.5, lon:144.8,
    incidents:[
      "Anderson AFB and Naval Base Guam: primary US forward strike position vs North Korea/China",
      "China DF-26 'Guam killer' IRBM specifically designed to strike island — range confirmed",
      "PLA targeting doctrine names Guam as priority strike in Taiwan Strait scenario",
    ],
  },
  {
    iso:"258", name:"French Polynesia", level:"MODERATE", score:25, domain:"Civil / Political", trend:"→", lat:-17.6, lon:-149.4,
    incidents:[
      "Nuclear test legacy: 193 French nuclear tests 1966–1996 — compensation law still contested",
      "Independence movement gaining strength; Tavini party won 2023 elections",
      "Rising sea levels threatening low-lying atolls; 3 islands already uninhabitable",
    ],
  },
  {
    iso:"584", name:"Marshall Islands", level:"HIGH", score:68, domain:"Climate", trend:"↑", lat:7.1, lon:171.1,
    incidents:[
      "Existential climate risk: highest point 2m above sea level — entire nation faces inundation",
      "Bikini Atoll nuclear test legacy: radiation still above safe levels; islanders not resettled",
      "Compact of Free Association renewal (2023) with US secured military basing rights",
    ],
  },
  {
    iso:"585", name:"Micronesia", level:"MODERATE", score:32, domain:"Climate", trend:"↑", lat:7.4, lon:150.6,
    incidents:[
      "Rising sea levels threatening freshwater lens on low-lying islands",
      "Compact of Free Association with US: military exclusion zone; strategic Pacific position",
      "Chinese fishing fleet IUU activities in EEZ despite bilateral agreements",
    ],
  },
  {
    iso:"520", name:"Nauru", level:"MODERATE", score:22, domain:"Climate", trend:"↑", lat:-0.5, lon:166.9,
    incidents:[
      "World's smallest island nation: 21km² — entire territory vulnerable to storm surge",
      "Phosphate reserves exhausted 1990s; nation near-bankrupt until Australian detention deal",
      "Taiwan recognition vs China pressure: foreign policy leverage disproportionate to size",
    ],
  },
  {
    iso:"798", name:"Tuvalu", level:"HIGH", score:70, domain:"Climate", trend:"↑", lat:-8.5, lon:179.2,
    incidents:[
      "First nation formally offered relocation: Falepili Union with Australia (2023) — climate refugee precedent",
      "Maximum elevation 5m; king tides now regularly flood main island of Funafuti",
      "Digital nation strategy: claim sovereignty even after physical inundation",
    ],
  },
  {
    iso:"598", name:"Papua New Guinea", level:"HIGH", score:67, domain:"Civil / Political", trend:"↑", lat:-6.3, lon:143.9,
    incidents:[
      "Highlands tribal warfare: 50+ killed in Enga Province Feb 2024 — worst in 40 years",
      "LNG exports critical for Australia energy security; China infrastructure deals accelerating",
      "UN: 2.3M food insecure; El Niño drought + conflict combining for humanitarian crisis",
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const riskByIso = Object.fromEntries(
  COUNTRY_RISK.map((c) => [c.iso, c])
) as Record<string, CountryRisk>;

// Name-based lookup for TopoJSON features that have no ISO numeric id
// Keys match the `properties.name` values used in world-110m.json
// Build name→risk map, omitting entries whose ISO isn't in COUNTRY_RISK
const _nameEntries: [string, CountryRisk][] = (
  [
    ["Kosovo",           COUNTRY_RISK.find((c) => c.iso === "xk")],
    ["N. Cyprus",        COUNTRY_RISK.find((c) => c.iso === "nc-cy")],
    ["Somaliland",       COUNTRY_RISK.find((c) => c.iso === "so-sl")],
    ["Antarctica",       COUNTRY_RISK.find((c) => c.iso === "010")],
    ["Guam",             COUNTRY_RISK.find((c) => c.iso === "316")],
    ["French Polynesia", COUNTRY_RISK.find((c) => c.iso === "258")],
    ["Marshall Is.",     COUNTRY_RISK.find((c) => c.iso === "584")],
    ["Micronesia",       COUNTRY_RISK.find((c) => c.iso === "585")],
    ["Nauru",            COUNTRY_RISK.find((c) => c.iso === "520")],
    ["Tuvalu",           COUNTRY_RISK.find((c) => c.iso === "798")],
    ["Papua New Guinea", COUNTRY_RISK.find((c) => c.iso === "598")],
  ] as [string, CountryRisk | undefined][]
).filter((e): e is [string, CountryRisk] => e[1] !== undefined);

export const riskByName: Record<string, CountryRisk> =
  Object.fromEntries(_nameEntries);

export const riskStats = {
  critical:  COUNTRY_RISK.filter((c) => c.level === "CRITICAL").length,
  high:      COUNTRY_RISK.filter((c) => c.level === "HIGH").length,
  elevated:  COUNTRY_RISK.filter((c) => c.level === "ELEVATED").length,
  moderate:  COUNTRY_RISK.filter((c) => c.level === "MODERATE").length,
  total:     COUNTRY_RISK.length,
};

export const CRITICAL_HOTSPOTS = COUNTRY_RISK.filter((c) => c.level === "CRITICAL");
