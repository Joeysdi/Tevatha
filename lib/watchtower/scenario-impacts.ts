// lib/watchtower/scenario-impacts.ts
// Country impact data for scenario globe mode.
// iso codes match world-50m.json TopoJSON feature IDs.

export interface ScenarioCountryImpact {
  iso:   string;
  role:  "primary" | "cascade";
  note:  string;
}

export interface ScenarioImpact {
  id:          string;
  title:       string;
  heatPoints:  { lat: number; lng: number; weight: number }[];
  countries:   ScenarioCountryImpact[];
}

export const SCENARIO_IMPACTS: ScenarioImpact[] = [
  {
    id: "S01",
    title: "Hyperinflation",
    heatPoints: [
      { lat: 38.9,  lng: -77.0,  weight: 1.0  }, // Washington DC - Fed/Treasury
      { lat: 50.85, lng: 4.35,   weight: 0.9  }, // Brussels - ECB
      { lat: 35.7,  lng: 139.7,  weight: 0.85 }, // Tokyo - BOJ
      { lat: 31.2,  lng: 121.5,  weight: 0.8  }, // Shanghai - PBOC
      { lat: 51.5,  lng: -0.1,   weight: 0.85 }, // London - BOE
      { lat: -15.8, lng: -47.9,  weight: 0.7  }, // Brasilia
      { lat: -34.0, lng: -64.0,  weight: 0.75 }, // Argentina (hyperinflation epicentre)
      { lat: 30.0,  lng: 31.2,   weight: 0.65 }, // Cairo - import-dependent
      { lat: 4.0,   lng: 21.0,   weight: 0.6  }, // Central Africa - food import collapse
    ],
    countries: [
      { iso: "840",  role: "primary",  note: "Fed loses inflation control; USD reserve status under terminal pressure" },
      { iso: "276",  role: "primary",  note: "ECB credibility crisis; German Weimar-era hyperinflation precedent" },
      { iso: "032",  role: "primary",  note: "Argentina already in hyperinflation — becomes global contagion vector" },
      { iso: "792",  role: "primary",  note: "Turkey lira collapse accelerates; 85% inflation persistent" },
      { iso: "818",  role: "cascade",  note: "Egypt: wheat import bill doubles; bread subsidy system collapses" },
      { iso: "800",  role: "cascade",  note: "Sub-Saharan Africa: dollarised economies hit by USD debasement" },
      { iso: "356",  role: "cascade",  note: "India: import inflation spike; rupee under pressure" },
      { iso: "076",  role: "cascade",  note: "Brazil: commodity export windfall but import cost surge" },
      { iso: "566",  role: "cascade",  note: "Nigeria: naira devaluation + food import collapse" },
      { iso: "156",  role: "cascade",  note: "China: de-dollarisation accelerates; yuan internationalisation" },
      { iso: "392",  role: "cascade",  note: "Japan: yen carry trade unwind triggers Asia financial contagion" },
    ],
  },
  {
    id: "S03",
    title: "CBDC Mandatory Adoption",
    heatPoints: [
      { lat: 39.9,  lng: 116.4, weight: 1.0  }, // Beijing - e-CNY pioneer
      { lat: 50.85, lng: 4.35,  weight: 0.9  }, // Brussels - Digital Euro
      { lat: 38.9,  lng: -77.0, weight: 0.85 }, // Washington DC
      { lat: 55.75, lng: 37.62, weight: 0.8  }, // Moscow - Digital Ruble
      { lat: 9.06,  lng: 7.5,   weight: 0.7  }, // Abuja - eNaira (first CBDC)
    ],
    countries: [
      { iso: "156",  role: "primary",  note: "China e-CNY: $986B transactions; programmable money surveillance state model" },
      { iso: "840",  role: "primary",  note: "US: executive order halted retail CBDC but institutional pressure continues" },
      { iso: "643",  role: "primary",  note: "Russia Digital Ruble: sanctions evasion + domestic financial surveillance" },
      { iso: "276",  role: "cascade",  note: "Germany: ECB Digital Euro resistance; civil liberties backlash" },
      { iso: "566",  role: "cascade",  note: "Nigeria eNaira: first major CBDC adoption; cash restrictions imposed" },
      { iso: "356",  role: "cascade",  note: "India Digital Rupee: 1.4B population financial surveillance expansion" },
      { iso: "076",  role: "cascade",  note: "Brazil Digital Real: Pix system integration; cash elimination timeline" },
      { iso: "784",  role: "cascade",  note: "UAE: CBDC hub for Gulf financial integration; crypto regulation" },
    ],
  },
  {
    id: "S05",
    title: "Grid-Down EMP / Cyber Attack",
    heatPoints: [
      { lat: 38.9,  lng: -77.0,  weight: 1.0  }, // Washington DC
      { lat: 40.7,  lng: -74.0,  weight: 0.95 }, // New York - financial grid
      { lat: 41.9,  lng: -87.6,  weight: 0.9  }, // Chicago - Midwest grid
      { lat: 34.0,  lng: -118.2, weight: 0.85 }, // Los Angeles - West grid
      { lat: 50.45, lng: 30.52,  weight: 0.85 }, // Kyiv - Volt Typhoon / Russian attack precedent
      { lat: 55.75, lng: 37.62,  weight: 0.7  }, // Moscow - retaliation vector
      { lat: 39.9,  lng: 116.4,  weight: 0.8  }, // Beijing - offensive origin
      { lat: 39.0,  lng: 125.75, weight: 0.75 }, // Pyongyang - EMP capability
    ],
    countries: [
      { iso: "840",  role: "primary",  note: "Volt Typhoon pre-positioned in US power, water, transport — activation point" },
      { iso: "804",  role: "primary",  note: "Ukraine: Russian grid attacks precedent (2015, 2016, 2022) — proof of concept" },
      { iso: "156",  role: "primary",  note: "China: Salt Typhoon + Volt Typhoon offensive cyber pre-positioning" },
      { iso: "408",  role: "primary",  note: "North Korea: EMP capability demonstrated; ICBM-based delivery" },
      { iso: "643",  role: "primary",  note: "Russia: established grid attack doctrine; Sandworm attacks documented" },
      { iso: "826",  role: "cascade",  note: "UK: NCSC warns of pre-positioned Russian cyber threat to CNI" },
      { iso: "276",  role: "cascade",  note: "Germany: Russian hybrid warfare; energy infrastructure targeted" },
      { iso: "124",  role: "cascade",  note: "Canada: integrated North American grid — cascades from US attack" },
      { iso: "036",  role: "cascade",  note: "Australia: AUKUS partner; Five Eyes intelligence sharing target" },
    ],
  },
  {
    id: "S07",
    title: "US Constitutional Crisis",
    heatPoints: [
      { lat: 38.9,  lng: -77.0,  weight: 1.0  }, // Washington DC
      { lat: 40.7,  lng: -74.0,  weight: 0.85 }, // New York
      { lat: 34.0,  lng: -118.2, weight: 0.8  }, // Los Angeles
      { lat: 44.0,  lng: -72.0,  weight: 0.7  }, // Northeast states
      { lat: 30.0,  lng: -95.0,  weight: 0.75 }, // Texas - secessionist
    ],
    countries: [
      { iso: "840",  role: "primary",  note: "Federal vs state powers conflict; emergency powers invocation; political violence high-likelihood 2026 (CFR)" },
      { iso: "124",  role: "cascade",  note: "Canada: NORAD + border security; trade dependency on US stability" },
      { iso: "484",  role: "cascade",  note: "Mexico: remittances ($64B) + USMCA trade at risk; border militarisation" },
      { iso: "826",  role: "cascade",  note: "UK: special relationship; NATO credibility; USD reserve impact" },
      { iso: "276",  role: "cascade",  note: "Germany: US military withdrawal from Europe risk; rearmament pressure" },
      { iso: "156",  role: "cascade",  note: "China: exploits US instability; Taiwan action window opens" },
      { iso: "643",  role: "cascade",  note: "Russia: exploits NATO coherence doubts; accelerates Ukraine operations" },
      { iso: "376",  role: "cascade",  note: "Israel: US security guarantee uncertainty; unilateral action risk" },
    ],
  },
  {
    id: "S10",
    title: "H5N1 Pandemic",
    heatPoints: [
      { lat: 42.0,  lng: -93.0,  weight: 1.0  }, // Iowa dairy belt - epicentre
      { lat: 35.69, lng: 139.7,  weight: 0.9  }, // Tokyo - dense population
      { lat: 39.9,  lng: 116.4,  weight: 0.95 }, // Beijing - poultry reservoir
      { lat: 28.6,  lng: 77.2,   weight: 0.85 }, // Delhi - 1.4B population density
      { lat: 14.1,  lng: 108.3,  weight: 0.75 }, // Vietnam - historic H5N1 epicentre
      { lat: 6.5,   lng: 3.4,    weight: 0.7  }, // Lagos - health system fragility
      { lat: 51.5,  lng: -0.1,   weight: 0.75 }, // London - international hub
      { lat: 40.7,  lng: -74.0,  weight: 0.8  }, // New York - global air hub
    ],
    countries: [
      { iso: "840",  role: "primary",  note: "70 confirmed human cases; dairy herd spread 'completely out of control' (Jan 2026)" },
      { iso: "156",  role: "primary",  note: "Historic H5N1 reservoir; poultry industry scale; 2013 H7N9 precedent (900+ dead)" },
      { iso: "704",  role: "primary",  note: "Vietnam: 2004-2010 outbreak killed 59; proximity to migratory bird routes" },
      { iso: "356",  role: "primary",  note: "India: 1.4B; healthcare system capacity 0.5 beds/1000; AMR compounds CFR" },
      { iso: "566",  role: "cascade",  note: "Nigeria: 220M population; healthcare system near-collapse baseline" },
      { iso: "392",  role: "cascade",  note: "Japan: ageing population; highest vulnerability to respiratory CFR" },
      { iso: "076",  role: "cascade",  note: "Brazil: poultry export giant — supply chain and domestic spread vector" },
      { iso: "818",  role: "cascade",  note: "Egypt: poultry density; H5N1 human cases 2006-2015 (36 dead)" },
      { iso: "826",  role: "cascade",  note: "UK: Heathrow — global hub; 2026 health system already strained" },
      { iso: "276",  role: "cascade",  note: "Germany: largest EU economy; healthcare system under migration pressure" },
    ],
  },
  {
    id: "S09",
    title: "Taiwan Strait Conflict",
    heatPoints: [
      { lat: 24.0,  lng: 120.0,  weight: 1.0  }, // Taiwan Strait
      { lat: 23.7,  lng: 121.0,  weight: 0.95 }, // Taiwan island
      { lat: 39.9,  lng: 116.4,  weight: 0.9  }, // Beijing
      { lat: 35.7,  lng: 139.7,  weight: 0.85 }, // Tokyo
      { lat: 13.5,  lng: 144.8,  weight: 0.88 }, // Guam - US forward base
      { lat: 37.5,  lng: 127.0,  weight: 0.8  }, // Seoul - NK opportunism
      { lat: 1.3,   lng: 103.8,  weight: 0.75 }, // Singapore - Strait of Malacca
      { lat: 21.0,  lng: 105.8,  weight: 0.7  }, // Hanoi
    ],
    countries: [
      { iso: "158",  role: "primary",  note: "Primary target: 90+ PLA warships encircled Taiwan Dec 2025; blockade scenario" },
      { iso: "156",  role: "primary",  note: "China: declared reunification core interest; military capability window 2026-2027" },
      { iso: "840",  role: "primary",  note: "US: ambiguous defence commitment; AUKUS + carrier strike groups forward deployed" },
      { iso: "392",  role: "primary",  note: "Japan: Senkaku/Okinawa threatened; JSDF new strike capability; US basing" },
      { iso: "316",  role: "primary",  note: "Guam: Anderson AFB primary US strike platform; DF-26 direct targeting" },
      { iso: "410",  role: "cascade",  note: "South Korea: Kim opportunism on peninsula; US forces diverted" },
      { iso: "408",  role: "cascade",  note: "North Korea: window to act while US focuses on Taiwan" },
      { iso: "702",  role: "cascade",  note: "Singapore: Strait of Malacca choke point; 40% of global trade" },
      { iso: "036",  role: "cascade",  note: "Australia: AUKUS obligations; Pine Gap intelligence; iron ore exports to China" },
      { iso: "764",  role: "cascade",  note: "Thailand: regional hub; US basing rights; Chinese tourism dependence" },
      { iso: "458",  role: "cascade",  note: "Malaysia: South China Sea claims; Petronas LNG exports" },
    ],
  },
];
