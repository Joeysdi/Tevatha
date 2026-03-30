// components/watchtower/world-risk-globe.tsx
"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/use-translation";
import type { GlobeMethods } from "react-globe.gl";
import {
  COUNTRY_RISK,
  RISK_COLORS,
  NO_DATA_FILL,
} from "@/lib/watchtower/geo-risk";
import type { CountryRisk, RiskLevel } from "@/lib/watchtower/geo-risk";
import {
  ERA_OVERRIDES,
  ERA_NEUTRAL_FILL,
} from "@/lib/watchtower/era-risk";
import type { EraPhase, EraCountry } from "@/lib/watchtower/era-risk";
import { SCENARIO_IMPACTS } from "@/lib/watchtower/scenario-impacts";
import type { ScenarioCountryImpact } from "@/lib/watchtower/scenario-impacts";
import { SIGNAL_PINS } from "@/lib/watchtower/signal-pins";
import { DOMAIN_IMPACTS } from "@/lib/watchtower/domain-impacts";
import { DOMAINS } from "@/lib/watchtower/data";
import { GATE_PINS } from "@/lib/watchtower/gate-pins";
import { COMMODITY_PINS } from "@/lib/watchtower/commodity-pins";
import type { NewsFeedPin } from "@/lib/watchtower/news-feed-pins";
import { INSTABILITY_SCORES, INSTABILITY_DEFAULT, instabilityFill } from "@/lib/watchtower/instability-data";
import { CITY_PINS_DATA } from "@/lib/watchtower/city-pins";

// ─── Dynamic import — WebGL requires browser environment ──────────────────────
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

// ─── Instability badge — "looks live" animated score ─────────────────────────
function InstabilityBadge() {
  const [delta, setDelta] = useState(0);
  const [score, setScore] = useState(58.4);

  useEffect(() => {
    const iv = setInterval(() => {
      const d = (Math.random() - 0.48) * 1.8;
      setDelta(d);
      setScore((s) => Math.max(40, Math.min(80, s + d * 0.1)));
    }, 3800);
    return () => clearInterval(iv);
  }, []);

  const col = delta > 0.1 ? "#e84040" : delta < -0.1 ? "#1ae8a0" : "#f0a500";

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
         style={{ marginTop: "0px" }}>
      <div
        className="flex items-center gap-2.5 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
        style={{ background: "rgba(11,13,24,0.90)", border: "1px solid rgba(240,165,0,0.4)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "#f0a500" }} />
        <p className="font-mono text-[8.5px] tracking-[.14em] uppercase text-amber-protocol">
          INSTABILITY INDEX
        </p>
        <span className="font-mono text-[8.5px] font-bold tabular-nums" style={{ color: col }}>
          {score.toFixed(1)} {delta > 0.1 ? "▲" : delta < -0.1 ? "▼" : "—"}
        </span>
        <span className="font-mono text-[7px] text-text-mute2/50">● LIVE</span>
      </div>
    </div>
  );
}

// ─── Starfield canvas (static, rendered once) ─────────────────────────────────
function StarfieldCanvas({ w, h }: { w: number; h: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnRef  = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w === 0 || h === 0 || drawnRef.current) return;
    drawnRef.current = true;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Seeded PRNG — deterministic layout on every load
    let seed = 0xf3a2c1;
    const rand = () => {
      seed = ((seed * 0x5deece66d + 0xb) | 0) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (let i = 0; i < 460; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = rand() < 0.04 ? 1.6 : rand() < 0.18 ? 0.9 : 0.4;
      const a = 0.22 + rand() * 0.78;
      const cyan = rand() < 0.12;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = cyan ? `rgba(120,200,255,${a})` : `rgba(255,255,255,${a})`;
      ctx.fill();
    }

    // Faint nebula patches
    for (let i = 0; i < 5; i++) {
      const x  = rand() * w;
      const y  = rand() * h;
      const rr = 55 + rand() * 90;
      const g  = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, `rgba(0,80,160,${0.025 + rand() * 0.03})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  }, [w, h]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ─── City threat color ─────────────────────────────────────────────────────────
function cityThreatColor(score: number): string {
  if (score >= 80) return "#e84040";
  if (score >= 60) return "#f0a500";
  if (score >= 40) return "#38bdf8";
  return "#1ae8a0";
}

// ─── Data lookups ─────────────────────────────────────────────────────────────
const riskByIso: Record<string, CountryRisk> = {};
const riskByName: Record<string, CountryRisk> = {};

// City-pins uses abbreviated names — map them to the canonical COUNTRY_RISK names
const CITY_COUNTRY_ALIASES: Record<string, string> = {
  "usa":            "united states",
  "uk":             "united kingdom",
  "n. korea":       "north korea",
  "s. korea":       "south korea",
  "czech rep.":     "czechia",
  "dom. republic":  "dominican republic",
  "n. macedonia":   "north macedonia",
  "bosnia":         "bosnia and herzegovina",
  "türkiye":        "turkey",
  "china (sar)":    "china",
};

for (const c of COUNTRY_RISK) {
  riskByIso[c.iso] = c;
  riskByName[c.name.toLowerCase()] = c;
}
// Register aliases so cityIso() resolves abbreviated names
for (const [alias, canonical] of Object.entries(CITY_COUNTRY_ALIASES)) {
  if (riskByName[canonical]) riskByName[alias] = riskByName[canonical];
}

function lookupRisk(feat: GeoFeature | null): CountryRisk | null {
  if (!feat) return null;
  const isoNum = String(parseInt(String(feat.id ?? "0"), 10));
  if (riskByIso[isoNum]) return riskByIso[isoNum];
  const name = (feat.properties?.name ?? "").toLowerCase();
  return riskByName[name] ?? null;
}

// ─── Base ring data (P4 / current) ───────────────────────────────────────────
const PULSE_RINGS_P4 = COUNTRY_RISK
  .filter((c) => c.level === "CRITICAL" || c.level === "HIGH")
  .map((c) => ({
    lat:              c.lat,
    lng:              c.lon,
    maxR:             c.level === "CRITICAL" ? 4.5 : 2.8,
    propagationSpeed: c.level === "CRITICAL" ? 2.0 : 1.3,
    repeatPeriod:     c.level === "CRITICAL" ? 800  : 1200,
    colFn:            () => RISK_COLORS[c.level].glow,
  }));

// ─── Base heatmap (P4 / current) ─────────────────────────────────────────────
const HEAT_POINTS_P4: HeatPoint[] = COUNTRY_RISK.map((c) => ({
  lat:    c.lat,
  lng:    c.lon,
  weight: c.score / 100,
}));

const CITY_HOTSPOTS: HeatPoint[] = [
  { lat: 31.35, lng: 34.30, weight: 1.0   },
  { lat: 33.51, lng: 36.29, weight: 0.90  },
  { lat: 36.20, lng: 37.16, weight: 0.85  },
  { lat: 50.45, lng: 30.52, weight: 0.95  },
  { lat: 48.00, lng: 37.80, weight: 0.90  },
  { lat: 15.55, lng: 32.53, weight: 0.92  },
  { lat:  7.50, lng: 27.50, weight: 0.85  },
  { lat: 15.35, lng: 44.21, weight: 0.88  },
  { lat: 13.55, lng: 43.14, weight: 0.75  },
  { lat: 34.52, lng: 69.18, weight: 0.88  },
  { lat: 31.55, lng: 35.21, weight: 0.85  },
  { lat: 35.69, lng: 51.39, weight: 0.85  },
  { lat: 39.00, lng:125.75, weight: 0.92  },
  { lat: 55.75, lng: 37.62, weight: 0.72  },
  { lat: 16.87, lng: 96.19, weight: 0.75  },
  { lat:  2.05, lng: 45.34, weight: 0.75  },
  { lat: -4.32, lng: 15.32, weight: 0.70  },
  { lat: 12.37, lng: 43.15, weight: 0.68  },
  { lat: 24.86, lng: 67.01, weight: 0.68  },
  { lat: 33.34, lng: 44.40, weight: 0.78  },
  { lat: 36.34, lng: 43.13, weight: 0.80  },
  { lat: 12.37, lng:  1.53, weight: 0.65  },
  { lat: 12.65, lng: -8.00, weight: 0.63  },
  { lat: 13.51, lng:  2.12, weight: 0.65  },
  { lat: 12.10, lng: 15.04, weight: 0.70  },
  { lat: 31.55, lng: 74.34, weight: 0.65  },
  { lat: 34.00, lng: 71.50, weight: 0.76  },
  { lat: 36.20, lng:127.00, weight: 0.68  },
  { lat: 23.10, lng:113.25, weight: 0.58  },
];

const ALL_HEAT_POINTS_P4 = [...HEAT_POINTS_P4, ...CITY_HOTSPOTS];

// ─── Signal pin color map ──────────────────────────────────────────────────────
const SIGNAL_PIN_COLORS = {
  red:  "#e84040",
  warn: "#f0a500",
  info: "#38bdf8",
} as const;

// ─── Threat domain → signal pin type mapping ──────────────────────────────────
const DOMAIN_SIGNAL_TYPES: Record<string, string[]> = {
  geopolitical:  ["nuclear", "cyber", "civil"],
  economic:      ["economic"],
  environmental: ["bio", "climate"],
};

// ─── Threat domain → gate ID mapping ─────────────────────────────────────────
const DOMAIN_GATE_IDS: Record<string, string[]> = {
  geopolitical:  ["G1", "G2", "G3", "G5"],
  economic:      ["G4", "G7", "G8"],
  environmental: ["G6"],
};

// ─── Domain → pin color map ───────────────────────────────────────────────────
const DOMAIN_ID_COLORS: Record<string, string> = {
  nuclear:  "#e84040",
  cyber:    "#00d4ff",
  civil:    "#f0a500",
  economic: "#c9a84c",
  bio:      "#1ae8a0",
  climate:  "#38bdf8",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeatPoint {
  lat:    number;
  lng:    number;
  weight: number;
}

interface GeoFeature {
  id?:        string | number;
  properties?: { name?: string };
  geometry?:   unknown;
}


// ─── Psychology zones ─────────────────────────────────────────────────────────
interface PsychZone {
  lat:     number;
  lng:     number;
  region:  string;
  domains: string[];
  threat: string;
  note:   string;
}

const PSYCH_ZONES: PsychZone[] = [
  { lat: 49.0, lng: 31.5,   region: "Ukraine",      threat: "Combat Stress",           note: "3yr war → hypervigilance & moral injury at scale. Identity anchoring critical.",                                    domains: ["nuclear", "civil"] },
  { lat: 31.9, lng: 35.2,   region: "Gaza",         threat: "Infrastructure Collapse",  note: "Complete social fabric destruction → anomie + learned helplessness cascade.",                                     domains: ["cyber", "civil", "economic"] },
  { lat: 33.5, lng: 36.3,   region: "Syria",        threat: "Chronic Displacement",     note: "14yr conflict: compound trauma + grief without closure = identity dissolution.",                                   domains: ["civil", "climate"] },
  { lat: 15.5, lng: 32.5,   region: "Sudan",        threat: "Societal Fracture",        note: "Largest displacement crisis: community bonds severed = primary resilience failure.",                               domains: ["civil", "economic", "bio", "climate"] },
  { lat: 39.0, lng: 125.75, region: "North Korea",  threat: "Information Blackout",     note: "Total information control → normalisation of abnormal. Cognitive capture complete.",                               domains: ["nuclear", "cyber"] },
  { lat:  2.0, lng: 45.3,   region: "Somalia",      threat: "State Collapse",           note: "33yr failed state: survival psychology becomes default — trust radius collapses to family.",                       domains: ["civil", "economic", "bio"] },
  { lat: 34.5, lng: 69.2,   region: "Afghanistan",  threat: "Learned Helplessness",     note: "4 regime changes in 20yrs: agency loss → fatalism prevents adaptive action.",                                     domains: ["civil", "economic"] },
  { lat: 15.5, lng: 44.2,   region: "Yemen",        threat: "Famine Stress",            note: "Chronic hunger impairs cognition: decision quality collapses under caloric deficit.",                              domains: ["economic", "bio", "climate"] },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  eraPhase:              string;
  scenarioId:            string | null;
  domainId:              string | null;
  gatePhase:             string;
  scrubVelocity:         number;
  showCommodities:       boolean;
  showNewsFeed:          boolean;
  newsFeedPins:          NewsFeedPin[];
  onCityPinClick:        (cityIdx: number) => void;
  onSignalPinClick:      (sigIndex: number) => void;
  onPsychZoneClick:      (zone: { region: string; threat: string; note: string }) => void;
  onGatePinClick:        (gateId: string) => void;
  onCommodityPinClick:   (commodityId: string) => void;
  onNewsFeedPinClick:    (newsId: string) => void;
}

// ─── Gate tier map (component-scope so GateLabelOverlay can receive it) ───────
const GATE_TIER: Record<string, string> = {
  G1:"t4", G2:"t4", G3:"t4", G4:"t4", G5:"t4", G6:"t3", G7:"t3", G8:"t2",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function WorldRiskGlobe({ eraPhase, scenarioId, domainId, gatePhase, scrubVelocity, showCommodities, showNewsFeed, newsFeedPins, onCityPinClick, onSignalPinClick, onPsychZoneClick, onGatePinClick, onCommodityPinClick, onNewsFeedPinClick }: Props) {
  const showInstability = domainId === "economic";
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef     = useRef<GlobeMethods | undefined>(undefined);
  const [dims,         setDims]         = useState({ w: 0, h: 0 });
  const [countries,    setCountries]    = useState<GeoFeature[]>([]);
  const [hovered,      setHovered]      = useState<GeoFeature | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<GeoFeature | null>(null);
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);
  const [globeReady,      setGlobeReady]      = useState(false);
  const { t } = useTranslation();
  const isHistorical = eraPhase !== "P4";

  // ── Scenario map ──────────────────────────────────────────────────────────
  const scenarioMap = useMemo<Record<string, ScenarioCountryImpact> | null>(() => {
    if (!scenarioId) return null;
    const scenario = SCENARIO_IMPACTS.find(s => s.id === scenarioId);
    if (!scenario) return null;
    const map: Record<string, ScenarioCountryImpact> = {};
    for (const c of scenario.countries) map[c.iso] = c;
    return map;
  }, [scenarioId]);

  // ── Domain map ────────────────────────────────────────────────────────────
  const domainMap = useMemo<Record<string, "primary" | "secondary" | "watch"> | null>(() => {
    if (!domainId) return null;
    const impact = DOMAIN_IMPACTS.find(d => d.id === domainId);
    if (!impact) return null;
    const map: Record<string, "primary" | "secondary" | "watch"> = {};
    for (const c of impact.countries) map[c.iso] = c.role;
    return map;
  }, [domainId]);

  const domainColor = useMemo(() => {
    if (!domainId) return "#c9a84c";
    const domain = DOMAINS.find(d => d.id === domainId);
    if (!domain) return "#c9a84c";
    const DOMAIN_HEX: Record<string, string> = {
      "Nuclear / EMP":     "#e84040",
      "Cyber / Tech":      "#00d4ff",
      "Civil / Political": "#f0a500",
      "Economic":          "#c9a84c",
      "Biological":        "#1ae8a0",
      "Climate":           "#38bdf8",
    };
    return DOMAIN_HEX[domain.label] ?? "#c9a84c";
  }, [domainId]);

  // ── Era lookup map ────────────────────────────────────────────────────────
  const eraByIso = useMemo<Record<string, EraCountry> | null>(() => {
    if (scenarioId) return null;
    if (!isHistorical) return null;
    const map: Record<string, EraCountry> = {};
    for (const c of ERA_OVERRIDES[eraPhase as EraPhase] ?? []) {
      map[c.iso] = c;
    }
    return map;
  }, [eraPhase, isHistorical, scenarioId]);

  // ── Active rings ──────────────────────────────────────────────────────────
  const activeRings = useMemo(() => {
    if (domainId && domainMap) {
      const impact = DOMAIN_IMPACTS.find(d => d.id === domainId);
      if (!impact) return PULSE_RINGS_P4;
      return impact.countries
        .filter(c => c.role === "primary" || c.role === "secondary")
        .flatMap(c => {
          const risk = riskByIso[c.iso];
          if (!risk) return [];
          return [{
            lat:              risk.lat,
            lng:              risk.lon,
            maxR:             c.role === "primary" ? 4.0 : 2.5,
            propagationSpeed: c.role === "primary" ? 1.8 : 1.2,
            repeatPeriod:     c.role === "primary" ? 900 : 1400,
            colFn:            () => c.role === "primary" ? RISK_COLORS.CRITICAL.glow : RISK_COLORS.HIGH.glow,
          }];
        });
    }
    if (scenarioId) {
      const scenario = SCENARIO_IMPACTS.find(s => s.id === scenarioId);
      if (!scenario) return [];
      return scenario.countries
        .filter(c => c.role === "primary" || c.role === "cascade")
        .map(c => {
          const risk = riskByIso[c.iso];
          const lat  = risk?.lat ?? 0;
          const lng  = risk?.lon ?? 0;
          return {
            lat, lng,
            maxR:             c.role === "primary" ? 4.5 : 2.8,
            propagationSpeed: c.role === "primary" ? 2.0 : 1.3,
            repeatPeriod:     c.role === "primary" ? 800  : 1200,
            colFn:            () => c.role === "primary" ? RISK_COLORS.CRITICAL.glow : RISK_COLORS.HIGH.glow,
          };
        });
    }
    if (!isHistorical) return domainId ? PULSE_RINGS_P4 : [];
    return (ERA_OVERRIDES[eraPhase as EraPhase] ?? [])
      .filter((c) => c.level === "CRITICAL" || c.level === "HIGH")
      .map((c) => ({
        lat:              c.lat,
        lng:              c.lon,
        maxR:             c.level === "CRITICAL" ? 4.5 : 2.8,
        propagationSpeed: c.level === "CRITICAL" ? 2.0 : 1.3,
        repeatPeriod:     c.level === "CRITICAL" ? 800 : 1200,
        colFn:            () => RISK_COLORS[c.level as RiskLevel].glow,
      }));
  }, [eraPhase, isHistorical, scenarioId]);

  // ── Active heatmap ────────────────────────────────────────────────────────
  const activeHeatPoints = useMemo(() => {
    if (domainId && domainMap) {
      const impact = DOMAIN_IMPACTS.find(d => d.id === domainId);
      if (!impact) return ALL_HEAT_POINTS_P4;
      return impact.countries.flatMap(c => {
        const risk = riskByIso[c.iso];
        if (!risk) return [];
        const w = c.role === "primary" ? 0.9 : c.role === "secondary" ? 0.6 : 0.3;
        return [{ lat: risk.lat, lng: risk.lon, weight: w }];
      });
    }
    if (scenarioId) {
      const scenario = SCENARIO_IMPACTS.find(s => s.id === scenarioId);
      if (!scenario) return [];
      return scenario.heatPoints;
    }
    if (!isHistorical) return ALL_HEAT_POINTS_P4;
    return (ERA_OVERRIDES[eraPhase as EraPhase] ?? []).map((c) => ({
      lat:    c.lat,
      lng:    c.lon,
      weight: c.score / 100,
    }));
  }, [eraPhase, isHistorical, scenarioId]);

  // ── Unified HTML elements for globe ──────────────────────────────────────
  type HtmlGlobeItem = {
    type:        "signal" | "scenario-label" | "psych-zone" | "city" | "domain-label" | "gate" | "commodity" | "news";
    lat:         number;
    lng:         number;
    // signal fields
    sigIndex?:   number;
    label?:      string;
    colKey?:     "red" | "warn" | "info";
    domainId?:   string;
    // scenario label fields
    role?:       "primary" | "cascade";
    note?:       string;
    isoLabel?:   string;
    // psych zone fields
    region?:     string;
    threat?:     string;
    psychNote?:  string;
    // city fields
    cityIdx?:    number;
    cityName?:   string;
    cityScore?:  number;
    // domain label fields
    domainRole?:  "primary" | "secondary" | "watch";
    domainLabel?: string;
    domainHex?:   string;
    // gate fields
    gateId?:    string;
    gateLabel?: string;
    gateTier?:  string;
    // commodity fields
    commodityId?:     string;
    commoditySymbol?: string;
    commodityPrice?:  string;
    commodityUnit?:   string;
    commodityChange?: number;
    commodityName?:   string;
    // news fields
    newsId?:       string;
    newsTier?:     string;
    newsHeadline?: string;
    newsCategory?: string;
  };

  const htmlGlobeData = useMemo<HtmlGlobeItem[]>(() => {
    const items: HtmlGlobeItem[] = [];

    // City pins — visible only when a country or domain is active
    const selectedIso = selectedFeat
      ? String(parseInt(String(selectedFeat.id ?? "0"), 10))
      : null;
    const cityIso = (city: { country: string }) =>
      riskByName[city.country.toLowerCase()]?.iso ?? null;

    if (selectedFeat || domainId) {
      if (selectedFeat && !domainId) {
        // Country only → top 5 by population
        CITY_PINS_DATA
          .filter(c => cityIso(c) === selectedIso)
          .sort((a, b) => b.pop - a.pop)
          .slice(0, 5)
          .forEach(city => {
            items.push({ type: "city", lat: city.lat, lng: city.lng,
              cityIdx: CITY_PINS_DATA.indexOf(city), cityName: city.name, cityScore: city.threatScore });
          });
      } else if (domainId && !selectedFeat) {
        // Domain only → top 3 per primary country, top 2 per secondary
        const ROLE_LIMIT: Record<string, number> = { primary: 3, secondary: 2, watch: 0 };
        const byIso: Record<string, typeof CITY_PINS_DATA> = {};
        for (const city of CITY_PINS_DATA) {
          const iso = cityIso(city);
          if (!iso) continue;
          if (!byIso[iso]) byIso[iso] = [];
          byIso[iso].push(city);
        }
        for (const [iso, cities] of Object.entries(byIso)) {
          const role = domainMap?.[iso];
          const limit = role ? (ROLE_LIMIT[role] ?? 0) : 0;
          if (limit === 0) continue;
          cities.sort((a, b) => b.pop - a.pop).slice(0, limit).forEach(city => {
            items.push({ type: "city", lat: city.lat, lng: city.lng,
              cityIdx: CITY_PINS_DATA.indexOf(city), cityName: city.name, cityScore: city.threatScore });
          });
        }
      } else if (domainId && selectedFeat && selectedIso && domainMap?.[selectedIso]) {
        // Both → top 5 in selected country, only if country is in domain
        CITY_PINS_DATA
          .filter(c => cityIso(c) === selectedIso)
          .sort((a, b) => b.pop - a.pop)
          .slice(0, 5)
          .forEach(city => {
            items.push({ type: "city", lat: city.lat, lng: city.lng,
              cityIdx: CITY_PINS_DATA.indexOf(city), cityName: city.name, cityScore: city.threatScore });
          });
      }
    }

    // Signal pins — show only signal types belonging to active domain
    if (domainId) {
      const signalTypes = DOMAIN_SIGNAL_TYPES[domainId] ?? [];
      for (const pin of SIGNAL_PINS.filter(p => signalTypes.includes(p.domainId))) {
        items.push({
          type:     "signal",
          lat:      pin.lat,
          lng:      pin.lng,
          sigIndex: pin.sigIndex,
          label:    pin.label,
          colKey:   pin.colKey,
          domainId,
        });
      }
    }

    // Scenario overlay labels
    if (scenarioId) {
      const scenario = SCENARIO_IMPACTS.find(s => s.id === scenarioId);
      if (scenario) {
        for (const c of scenario.countries) {
          const risk = riskByIso[c.iso];
          if (!risk) continue;
          items.push({
            type:     "scenario-label",
            lat:      risk.lat,
            lng:      risk.lon,
            role:     c.role,
            note:     c.note,
            isoLabel: risk.name,
          });
        }
      }
    }

    // Psychology zone overlays — auto-show for active domain
    if (domainId) {
      for (const z of PSYCH_ZONES.filter(z => z.domains.includes(domainId))) {
        items.push({
          type:      "psych-zone",
          lat:       z.lat,
          lng:       z.lng,
          region:    z.region,
          threat:    z.threat,
          psychNote: z.note,
        });
      }
    }

    // Domain country labels
    if (domainId) {
      const impact = DOMAIN_IMPACTS.find(d => d.id === domainId);
      if (impact) {
        for (const c of impact.countries) {
          const risk = riskByIso[c.iso];
          if (!risk) continue;
          items.push({
            type:        "domain-label",
            lat:         risk.lat,
            lng:         risk.lon,
            domainRole:  c.role,
            domainLabel: c.label,
            domainHex:   domainColor,
          });
        }
      }
    }

    // Gate pins — only show for active domain, filtered to domain-relevant gates
    if (domainId) {
      const gateIds = DOMAIN_GATE_IDS[domainId] ?? [];
      for (const pin of GATE_PINS.filter(p => gateIds.includes(p.gateId))) {
        items.push({
          type:      "gate",
          lat:       pin.lat,
          lng:       pin.lng,
          gateId:    pin.gateId,
          gateLabel: pin.label,
          gateTier:  GATE_TIER[pin.gateId] ?? "t3",
        });
      }
    }

    // Commodity price ticker pins — Economic domain only
    if (showCommodities && domainId === "economic") {
      for (const pin of COMMODITY_PINS) {
        items.push({
          type:             "commodity",
          lat:              pin.lat,
          lng:              pin.lng,
          commodityId:      pin.id,
          commoditySymbol:  pin.symbol,
          commodityPrice:   pin.price,
          commodityUnit:    pin.unit,
          commodityChange:  pin.change,
          commodityName:    pin.name,
        });
      }
    }

    // World news feed pins — only show when a domain is active
    if (showNewsFeed && domainId) {
      for (const pin of newsFeedPins) {
        items.push({
          type:         "news",
          lat:          pin.lat,
          lng:          pin.lng,
          newsId:       pin.id,
          newsTier:     pin.tier,
          newsHeadline: pin.headline,
          newsCategory: pin.category,
        });
      }
    }

    return items;
  }, [scenarioId, domainId, domainColor, domainMap, gatePhase, showCommodities, showNewsFeed, newsFeedPins, selectedFeat]);

  const htmlElement = useCallback((d: object) => {
    const el = document.createElement("div");
    if (!d) return el;
    const item = d as HtmlGlobeItem;
    if (!item.type) return el;

    if (item.type === "city") {
      const col = cityThreatColor(item.cityScore ?? 0);
      el.style.cssText = `
        display: inline-flex; align-items: center; gap: 5px;
        padding: 2px 8px 2px 5px;
        background: rgba(5,8,10,0.80);
        border: 1px solid ${col}50;
        border-radius: 999px;
        backdrop-filter: blur(4px);
        cursor: pointer; pointer-events: auto;
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s;
        user-select: none;
      `;
      const dot = document.createElement("span");
      dot.style.cssText = `
        width:5px; height:5px; border-radius:50%;
        background:${col}; box-shadow:0 0 5px ${col}bb; flex-shrink:0;
      `;
      const label = document.createElement("span");
      label.textContent = item.cityName ?? "";
      label.style.cssText = `
        font-family:monospace; font-size:9px; font-weight:600;
        letter-spacing:.05em; color:rgba(215,220,230,0.88); line-height:1;
      `;
      el.appendChild(dot);
      el.appendChild(label);
      el.addEventListener("mouseenter", () => {
        el.style.background = "rgba(5,8,10,0.95)";
        el.style.borderColor = `${col}99`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.background = "rgba(5,8,10,0.80)";
        el.style.borderColor = `${col}50`;
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("city-pin-click", {
          bubbles: true,
          detail:  { cityIndex: item.cityIdx ?? 0 },
        }));
      });

    } else if (item.type === "signal") {
      const colHex = (item.domainId ? DOMAIN_ID_COLORS[item.domainId] : null)
                    ?? SIGNAL_PIN_COLORS[item.colKey ?? "info"];
      el.style.cssText = `
        width: 9px; height: 9px; border-radius: 50%;
        background: ${colHex};
        box-shadow: 0 0 10px ${colHex}, 0 0 20px ${colHex}44;
        border: 1.5px solid rgba(255,255,255,0.5);
        cursor: pointer;
        pointer-events: auto;
        transition: transform 0.15s;
      `;
      el.title = item.label ?? "";
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.8)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("signal-pin-click", {
          bubbles: true,
          detail: { sigIndex: item.sigIndex ?? 0 },
        }));
      });

    } else if (item.type === "scenario-label") {
      const bgCol  = item.role === "primary" ? "rgba(232,64,64,0.82)" : "rgba(240,165,0,0.82)";
      const badge  = item.role === "primary" ? "PRIMARY" : "CASCADE";
      const truncated = (item.note ?? "").length > 60 ? (item.note ?? "").slice(0, 60) + "…" : (item.note ?? "");
      el.style.cssText = `
        background: ${bgCol};
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 8px;
        padding: 5px 8px;
        pointer-events: none;
        max-width: 160px;
        backdrop-filter: blur(4px);
      `;
      el.innerHTML = `
        <div style="font-family:monospace;font-size:7px;font-weight:bold;color:rgba(255,255,255,0.7);
                    letter-spacing:.1em;margin-bottom:2px;">${badge}</div>
        <div style="font-family:monospace;font-size:8.5px;font-weight:bold;color:#fff;
                    margin-bottom:2px;">${item.isoLabel ?? ""}</div>
        <div style="font-family:monospace;font-size:7.5px;color:rgba(255,255,255,0.75);
                    line-height:1.3;">${truncated}</div>
      `;

    } else if (item.type === "psych-zone") {
      const truncated = (item.psychNote ?? "").length > 65 ? (item.psychNote ?? "").slice(0, 65) + "…" : (item.psychNote ?? "");
      el.style.cssText = `
        background: rgba(138,43,226,0.8);
        border: 1px solid rgba(200,150,255,0.4);
        border-radius: 8px;
        padding: 5px 8px;
        pointer-events: auto;
        cursor: pointer;
        max-width: 155px;
        backdrop-filter: blur(4px);
        transition: transform 0.15s, box-shadow 0.15s;
      `;
      el.innerHTML = `
        <div style="font-family:monospace;font-size:7px;font-weight:bold;color:rgba(200,150,255,0.9);
                    letter-spacing:.1em;margin-bottom:2px;">🧠 ${t("globe_psych_risk")}</div>
        <div style="font-family:monospace;font-size:8.5px;font-weight:bold;color:#fff;
                    margin-bottom:2px;">${item.region ?? ""}</div>
        <div style="font-family:monospace;font-size:7px;color:rgba(200,150,255,0.85);
                    margin-bottom:2px;">${item.threat ?? ""}</div>
        <div style="font-family:monospace;font-size:7px;color:rgba(255,255,255,0.7);
                    line-height:1.3;">${truncated}</div>
      `;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.05)";
        el.style.boxShadow = "0 4px 20px rgba(138,43,226,0.5)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = "none";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("psych-zone-click", {
          bubbles: true,
          detail: { region: item.region, threat: item.threat, note: item.psychNote },
        }));
      });

    } else if (item.type === "gate") {
      const tierCol = item.gateTier === "t4" ? "#e84040"
                    : item.gateTier === "t3" ? "#f0a500" : "#38bdf8";
      el.style.cssText = `
        width:8px; height:8px;
        background:${tierCol};
        border-radius:50%;
        box-shadow:0 0 10px ${tierCol}cc;
        pointer-events:auto;
        cursor:pointer;
        transition:transform 0.15s, box-shadow 0.15s;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.8)";
        el.style.boxShadow = `0 0 18px ${tierCol}`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = `0 0 10px ${tierCol}cc`;
      });
      el.addEventListener("click", e => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("gate-pin-click", { bubbles:true, detail:{ gateId:item.gateId } }));
      });

    } else if (item.type === "commodity") {
      const up  = (item.commodityChange ?? 0) >= 0;
      const chg = Math.abs(item.commodityChange ?? 0).toFixed(1);
      const col = up ? "#1ae8a0" : "#e84040";
      el.style.cssText = `
        background: rgba(5,8,13,0.92);
        border: 1px solid ${col}55;
        border-left: 2px solid ${col};
        border-radius: 6px;
        padding: 4px 7px;
        pointer-events: auto;
        cursor: pointer;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.7), 0 0 8px ${col}18;
        transition: transform 0.15s, box-shadow 0.15s;
      `;
      el.innerHTML = `
        <div style="font-family:monospace;font-size:7px;font-weight:bold;color:${col}99;letter-spacing:.1em;margin-bottom:1px;">${item.commoditySymbol ?? ""}</div>
        <div style="display:flex;align-items:baseline;gap:4px;">
          <span style="font-family:monospace;font-size:10px;font-weight:bold;color:#e8dcc8;">${item.commodityPrice ?? ""}</span>
          <span style="font-family:monospace;font-size:7.5px;color:rgba(215,220,230,0.5);">${item.commodityUnit ?? ""}</span>
          <span style="font-family:monospace;font-size:8px;font-weight:bold;color:${col};">${up ? "▲" : "▼"} ${chg}%</span>
        </div>
      `;
      el.title = `${item.commodityName ?? ""} — Click for details`;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.06)";
        el.style.boxShadow = `0 6px 24px rgba(0,0,0,0.8), 0 0 16px ${col}30`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = `0 4px 16px rgba(0,0,0,0.7), 0 0 8px ${col}18`;
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("commodity-pin-click", {
          bubbles: true,
          detail:  { commodityId: item.commodityId },
        }));
      });

    } else if (item.type === "news") {
      const tierCol = item.newsTier === "t4" ? "#e84040" : item.newsTier === "t3" ? "#f0a500" : "#38bdf8";
      const catIcon: Record<string, string> = {
        war: "⚔", economic: "📉", nuclear: "☢", health: "⚕", climate: "🌡", political: "🏛",
      };
      const icon = catIcon[item.newsCategory ?? ""] ?? "📡";
      el.style.cssText = `
        background: rgba(5,8,13,0.92);
        border: 1px solid ${tierCol}55;
        border-left: 2px solid ${tierCol};
        border-radius: 6px;
        padding: 4px 8px;
        pointer-events: auto;
        cursor: pointer;
        max-width: 150px;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.7), 0 0 8px ${tierCol}18;
        transition: transform 0.15s, box-shadow 0.15s;
      `;
      const truncHead = (item.newsHeadline ?? "").length > 38
        ? (item.newsHeadline ?? "").slice(0, 38) + "…"
        : (item.newsHeadline ?? "");
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
          <span style="font-size:9px;">${icon}</span>
          <span style="font-family:monospace;font-size:6.5px;font-weight:bold;color:${tierCol};letter-spacing:.1em;">${(item.newsTier ?? "").toUpperCase()}</span>
        </div>
        <div style="font-family:monospace;font-size:8px;font-weight:bold;color:rgba(215,220,230,0.92);line-height:1.3;">${truncHead}</div>
      `;
      el.title = item.newsHeadline ?? "";
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.05)";
        el.style.boxShadow = `0 6px 24px rgba(0,0,0,0.8), 0 0 16px ${tierCol}30`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = `0 4px 16px rgba(0,0,0,0.7), 0 0 8px ${tierCol}18`;
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("news-pin-click", {
          bubbles: true,
          detail:  { newsId: item.newsId },
        }));
      });

    } else if (item.type === "domain-label") {
      const hex   = item.domainHex ?? "#c9a84c";
      const role  = item.domainRole ?? "watch";
      const badge = role === "primary" ? "PRIMARY" : role === "secondary" ? "SECONDARY" : "WATCH";
      const alpha = role === "primary" ? "0.85" : role === "secondary" ? "0.75" : "0.60";
      el.style.cssText = `
        background: rgba(5,8,13,${alpha});
        border: 1px solid ${hex}55;
        border-left: 2px solid ${hex};
        border-radius: 6px;
        padding: 4px 7px;
        pointer-events: none;
        max-width: 148px;
        backdrop-filter: blur(6px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 8px ${hex}22;
      `;
      el.innerHTML = `
        <div style="font-family:monospace;font-size:6.5px;font-weight:bold;
                    color:${hex};letter-spacing:.12em;margin-bottom:2px;">${badge}</div>
        <div style="font-family:monospace;font-size:8px;font-weight:bold;
                    color:rgba(215,220,230,0.95);letter-spacing:.06em;">${item.domainLabel ?? ""}</div>
      `;
    }

    return el;
  }, [t]);

  // ── Container sizing ─────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        // Only update when we have real dimensions — never let Globe unmount
        // due to a transient 0×0 layout during rapid state changes
        if (w > 0 && h > 0) setDims({ w, h });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Signal pin click listener ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sigIndex !== undefined) {
        onSignalPinClick(detail.sigIndex);
      }
    };
    container.addEventListener("signal-pin-click", handler);
    return () => container.removeEventListener("signal-pin-click", handler);
  }, [onSignalPinClick]);

  // ── City pin click listener ───────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.cityIndex !== undefined) {
        onCityPinClick(detail.cityIndex);
        setSelectedFeat(null);
      }
    };
    container.addEventListener("city-pin-click", handler);
    return () => container.removeEventListener("city-pin-click", handler);
  }, [onCityPinClick]);

  // ── Psych zone click listener ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.region) {
        onPsychZoneClick(detail);
      }
    };
    container.addEventListener("psych-zone-click", handler);
    return () => container.removeEventListener("psych-zone-click", handler);
  }, [onPsychZoneClick]);

  // ── Gate pin click listener ───────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.gateId) {
        onGatePinClick(detail.gateId);
      }
    };
    container.addEventListener("gate-pin-click", handler);
    return () => container.removeEventListener("gate-pin-click", handler);
  }, [onGatePinClick]);

  // ── Commodity pin click listener ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.commodityId) onCommodityPinClick(detail.commodityId);
    };
    container.addEventListener("commodity-pin-click", handler);
    return () => container.removeEventListener("commodity-pin-click", handler);
  }, [onCommodityPinClick]);

  // ── News feed pin click listener ─────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.newsId) onNewsFeedPinClick(detail.newsId);
    };
    container.addEventListener("news-pin-click", handler);
    return () => container.removeEventListener("news-pin-click", handler);
  }, [onNewsFeedPinClick]);

  // ── Load + parse TopoJSON ─────────────────────────────────────────────────
  useEffect(() => {
    fetch("/world-50m.json")
      .then((r) => r.json())
      .then(async (world) => {
        const { feature } = await import("topojson-client");
        const geo = feature(world, world.objects.countries) as unknown as {
          type:     string;
          features: GeoFeature[];
        };
        setCountries(geo.features ?? []);
      })
      .catch((err) => console.error("[Globe] Failed to load world-50m.json:", err));
  }, []);

  // ── Globe ready ───────────────────────────────────────────────────────────
  const handleGlobeReady = useCallback(() => {
    if (!globeRef.current) return;

    // Snap camera to far altitude instantly (no animation) so the reveal
    // looks like zooming in from deep space
    globeRef.current.pointOfView({ lat: 20, lng: 15, altitude: 7 }, 0);

    const ctrl = globeRef.current.controls() as {
      autoRotate:      boolean;
      autoRotateSpeed: number;
      enableDamping:   boolean;
      dampingFactor:   number;
      minDistance:     number;
      maxDistance:     number;
    };
    const prefersReduced = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ctrl.autoRotate      = !prefersReduced;
    ctrl.autoRotateSpeed = 0.22;
    ctrl.enableDamping   = false;
    ctrl.minDistance     = 180;
    ctrl.maxDistance     = 600;

    // Begin zoom — quick sharp 1.2s fly-in from space
    setTimeout(() => {
      globeRef.current?.pointOfView({ lat: 20, lng: 15, altitude: 2.4 }, 1200);
    }, 60);

    // Dismiss loading veil mid-zoom (500ms in) so the veil fades
    // while Earth is already rushing toward the viewer
    setTimeout(() => {
      setGlobeReady(true);
    }, 500);
  }, []);

  // ── Scrub velocity → globe rotation speed ────────────────────────────────
  useEffect(() => {
    if (!globeRef.current || !globeReady) return;
    const prefersReduced = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const ctrl = globeRef.current.controls() as { autoRotate: boolean; autoRotateSpeed: number };
    ctrl.autoRotate      = true;
    ctrl.autoRotateSpeed = 0.22 + scrubVelocity * 3;
  }, [scrubVelocity, globeReady]);

  // ── Hover handler ─────────────────────────────────────────────────────────
  const handleHover = useCallback((feat: GeoFeature | null | object) => {
    setHovered((feat as GeoFeature) ?? null);
    if (globeRef.current) {
      const prefersReduced = typeof window !== "undefined"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      (globeRef.current.controls() as { autoRotate: boolean }).autoRotate =
        !feat && !prefersReduced;
    }
  }, []);

  // ── Color + altitude accessors ────────────────────────────────────────────
  const capColor = useCallback(
    (feat: object): string => {
      if (!feat) return NO_DATA_FILL;
      const f   = feat as GeoFeature;
      const iso = String(parseInt(String(f.id ?? "0"), 10));
      const isHov = hovered && String(f.id) === String(hovered.id);

      if (showInstability) {
        const score = INSTABILITY_SCORES[iso] ?? INSTABILITY_DEFAULT;
        return instabilityFill(score, !!isHov);
      }

      if (domainMap) {
        const role = domainMap[iso];
        if (!role) return ERA_NEUTRAL_FILL;
        const level: RiskLevel = role === "primary" ? "CRITICAL" : role === "secondary" ? "HIGH" : "ELEVATED";
        return isHov ? RISK_COLORS[level].hover : RISK_COLORS[level].fill;
      }

      if (scenarioMap) {
        const impact = scenarioMap[iso];
        if (!impact) return ERA_NEUTRAL_FILL;
        const level: RiskLevel = impact.role === "primary" ? "CRITICAL" : "HIGH";
        return isHov ? RISK_COLORS[level].hover : RISK_COLORS[level].fill;
      }

      if (eraByIso) {
        const eraC = eraByIso[iso];
        if (!eraC) return ERA_NEUTRAL_FILL;
        return isHov ? RISK_COLORS[eraC.level as RiskLevel].hover : RISK_COLORS[eraC.level as RiskLevel].fill;
      }

      const risk = lookupRisk(f);
      if (!risk) return NO_DATA_FILL;
      return isHov ? RISK_COLORS[risk.level].hover : RISK_COLORS[risk.level].fill;
    },
    [hovered, eraByIso, scenarioMap, domainMap, showInstability],
  );

  const altitude = useCallback(
    (feat: object): number => {
      if (!feat) return 0.006;
      const f   = feat as GeoFeature;
      const iso = String(parseInt(String(f.id ?? "0"), 10));

      const level: RiskLevel | null = (() => {
        if (domainMap) {
          const role = domainMap[iso];
          if (!role) return null;
          return role === "primary" ? "CRITICAL" : role === "secondary" ? "HIGH" : "ELEVATED";
        }
        if (scenarioMap) {
          const impact = scenarioMap[iso];
          if (!impact) return null;
          return impact.role === "primary" ? "CRITICAL" : "HIGH";
        }
        if (eraByIso) return (eraByIso[iso]?.level as RiskLevel) ?? null;
        return lookupRisk(f)?.level ?? null;
      })();

      if (!level) return 0.006;
      if (level === "CRITICAL") return 0.014;
      if (level === "HIGH")     return 0.010;
      if (level === "ELEVATED") return 0.008;
      return 0.006;
    },
    [eraByIso, scenarioMap],
  );

  // ── Hover card data ───────────────────────────────────────────────────────
  const hoveredCard = useMemo(() => {
    if (!hovered) return null;
    const iso = String(parseInt(String(hovered.id ?? "0"), 10));

    if (scenarioMap) {
      const impact = scenarioMap[iso];
      if (!impact) return null;
      const level: RiskLevel = impact.role === "primary" ? "CRITICAL" : "HIGH";
      return {
        name:      hovered.properties?.name ?? `ISO ${iso}`,
        level,
        score:     level === "CRITICAL" ? 95 : 72,
        domain:    impact.role === "primary" ? "PRIMARY TARGET" : "CASCADE IMPACT",
        trend:     "↑" as const,
        incidents: [impact.note],
      };
    }

    if (eraByIso) {
      const eraC = eraByIso[iso];
      if (!eraC) return null;
      return {
        name:      hovered.properties?.name ?? `ISO ${iso}`,
        level:     eraC.level as RiskLevel,
        score:     eraC.score,
        domain:    "Historical",
        trend:     "→" as const,
        incidents: [eraC.note],
      };
    }

    const risk = lookupRisk(hovered);
    return risk;
  }, [hovered, eraByIso, scenarioMap]);

  // ── Selected (clicked) card ───────────────────────────────────────────────
  const selectedCard = useMemo(() => {
    if (!selectedFeat) return null;
    const iso = String(parseInt(String(selectedFeat.id ?? "0"), 10));

    if (scenarioMap) {
      const impact = scenarioMap[iso];
      if (!impact) return null;
      const level: RiskLevel = impact.role === "primary" ? "CRITICAL" : "HIGH";
      return {
        name:      selectedFeat.properties?.name ?? `ISO ${iso}`,
        level,
        score:     level === "CRITICAL" ? 95 : 72,
        domain:    impact.role === "primary" ? "PRIMARY TARGET" : "CASCADE IMPACT",
        trend:     "↑" as const,
        incidents: [impact.note],
      };
    }

    if (eraByIso) {
      const eraC = eraByIso[iso];
      if (!eraC) return null;
      return {
        name:      selectedFeat.properties?.name ?? `ISO ${iso}`,
        level:     eraC.level as RiskLevel,
        score:     eraC.score,
        domain:    "Historical",
        trend:     "→" as const,
        incidents: [eraC.note],
      };
    }

    return lookupRisk(selectedFeat);
  }, [selectedFeat, eraByIso, scenarioMap]);

  // Reset expanded domain when selection changes
  useEffect(() => { setExpandedDomainId(null); }, [selectedFeat]);

  const DOMAIN_BADGE_COLORS: Record<string, string> = {
    geopolitical:  "#e84040",
    economic:      "#c9a84c",
    environmental: "#1ae8a0",
  };

  const countryDomainLinks = useMemo(() => {
    if (!selectedFeat) return [];
    const iso = String(parseInt(String(selectedFeat.id ?? "0"), 10));
    return DOMAIN_IMPACTS.flatMap(di => {
      const entry = di.countries.find(c => c.iso === iso);
      if (!entry) return [];
      const domain = DOMAINS.find(d => d.id === di.id);
      if (!domain) return [];
      return [{ id: di.id, domain, entry }];
    });
  }, [selectedFeat]);

  // Solid-color PNG data URL for the ocean surface
  const oceanTextureUrl = useMemo(() => {
    if (typeof document === "undefined") return "";
    const canvas = document.createElement("canvas");
    canvas.width = 2; canvas.height = 2;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#060f1e";
    ctx.fillRect(0, 0, 2, 2);
    return canvas.toDataURL("image/png");
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden select-none"
         style={{ background: "#000005" }}>

      {/* ── Starfield — behind globe canvas ──────────────────────────────── */}
      <StarfieldCanvas w={dims.w} h={dims.h} />


      {/* ── Globe ────────────────────────────────────────────────────────── */}
      {dims.w > 0 && (
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          onGlobeReady={handleGlobeReady}

          globeImageUrl={oceanTextureUrl}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="rgba(0,212,255,0.22)"
          atmosphereAltitude={0.24}

          polygonsData={countries}
          polygonCapColor={capColor}
          polygonSideColor={capColor}
          polygonStrokeColor={() => "rgba(255,255,255,0.06)"}
          polygonAltitude={altitude}
          polygonCapCurvatureResolution={5}
          onPolygonHover={handleHover as (f: object | null, p: object | null) => void}

          onPolygonClick={(feat: object) => {
            const f = feat as GeoFeature;
            setSelectedFeat((prev) => (prev?.id === f.id ? null : f));
            if (globeRef.current) {
              (globeRef.current.controls() as { autoRotate: boolean }).autoRotate = false;
            }
          }}
          polygonsTransitionDuration={300}

          ringsData={activeRings}
          ringColor="colFn"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"

          heatmapsData={[activeHeatPoints]}
          heatmapPointLat="lat"
          heatmapPointLng="lng"
          heatmapPointWeight="weight"
          heatmapTopAltitude={0.005}
          heatmapBandwidth={4.2}
          heatmapColorFn={(t: number) => {
            if (t < 0.2)  return `rgba(240,165,0,${(t / 0.2) * 0.35})`;
            if (t < 0.55) return `rgba(232,64,64,${0.35 + ((t - 0.2) / 0.35) * 0.45})`;
            return        `rgba(255,20,60,${Math.min(0.92, 0.8 + (t - 0.55) * 0.27)})`;
          }}

          htmlElementsData={htmlGlobeData}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={htmlElement}
        />
      )}

{/* ── Scenario mode badge ───────────────────────────────────────────── */}
      {scenarioId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
            style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(232,64,64,0.4)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse" />
            <p className="font-mono text-[8.5px] tracking-[.14em] uppercase text-red-bright">
              {t("badge_scenario")} · {SCENARIO_IMPACTS.find(s => s.id === scenarioId)?.title ?? scenarioId}
            </p>
          </div>
        </div>
      )}

      {/* ── Instability mode badge ───────────────────────────────────────── */}
      {showInstability && (
        <InstabilityBadge />
      )}

      {/* ── Hover info overlay ────────────────────────────────────────────── */}
      {hoveredCard && !selectedFeat && (
        <div className="absolute top-4 right-4 w-[288px] z-20 pointer-events-none hidden sm:block">
          <div
            className="rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(11,13,24,0.94)",
              border:     `1px solid ${RISK_COLORS[hoveredCard.level].fill}55`,
              boxShadow:  `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset`,
            }}
          >
            <div className="h-px w-full"
                 style={{ background: `linear-gradient(90deg,${RISK_COLORS[hoveredCard.level].hover},transparent)` }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-mono text-[8px] tracking-[.22em] uppercase mb-1"
                     style={{ color: RISK_COLORS[hoveredCard.level].hover }}>
                    {hoveredCard.level} · {hoveredCard.domain}
                  </p>
                  <h3 className="font-syne font-bold text-[15px] text-text-base leading-snug">
                    {hoveredCard.name}
                  </h3>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-syne font-extrabold text-[28px] leading-none tabular-nums"
                       style={{ color: RISK_COLORS[hoveredCard.level].hover }}>
                    {hoveredCard.score}
                  </div>
                  <div className="font-mono text-[8px] text-text-mute2 text-right">/100</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3.5">
                <div className="flex-1 h-1 rounded-full bg-void-3 overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{ width: `${hoveredCard.score}%`, background: RISK_COLORS[hoveredCard.level].hover,
                                boxShadow: `0 0 8px ${RISK_COLORS[hoveredCard.level].glow}` }} />
                </div>
                <span className="font-mono text-[10px] flex-shrink-0"
                      style={{ color: RISK_COLORS[hoveredCard.level].fill }}>
                  {hoveredCard.trend}
                </span>
              </div>

              <div>
                <p className="font-mono text-[7.5px] tracking-[.18em] uppercase text-text-mute2 mb-2">
                  {scenarioId ? t("card_scenario_impact") : isHistorical ? t("card_historical") : t("card_active_incidents")}
                </p>
                <div className="space-y-2">
                  {(hoveredCard.incidents ?? []).map((inc, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-mono text-[9px] mt-[2px] flex-shrink-0"
                            style={{ color: RISK_COLORS[hoveredCard.level].fill }}>▸</span>
                      <p className="font-mono text-[9.5px] text-text-dim leading-relaxed">{inc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border-protocol/40">
                <p className="font-mono text-[7.5px] text-text-mute2/40 text-center tracking-[.1em]">
                  {t("card_hint")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Country selected card ─────────────────────────────────────────── */}
      {selectedCard && (
        <div className="absolute bottom-4 sm:top-4 sm:bottom-auto
                        left-3 right-3 sm:left-auto sm:right-4 sm:w-[308px] z-25">
          <div
            className="rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(8,10,18,0.97)",
              border:     `1px solid ${RISK_COLORS[selectedCard.level].fill}70`,
              boxShadow:  `0 12px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset`,
            }}
          >
            <div className="h-px w-full"
                 style={{ background: `linear-gradient(90deg,${RISK_COLORS[selectedCard.level].hover},transparent)` }} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[8px] tracking-[.22em] uppercase mb-0.5"
                     style={{ color: RISK_COLORS[selectedCard.level].hover }}>
                    {selectedCard.level} · {selectedCard.domain}
                  </p>
                  <h3 className="font-syne font-bold text-[16px] text-text-base leading-snug">
                    {selectedCard.name}
                  </h3>
                </div>
                <div className="flex items-start gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-syne font-extrabold text-[28px] leading-none tabular-nums"
                         style={{ color: RISK_COLORS[selectedCard.level].hover }}>
                      {selectedCard.score}
                    </div>
                    <div className="font-mono text-[8px] text-text-mute2">/100</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFeat(null);
                      if (globeRef.current) {
                        (globeRef.current.controls() as { autoRotate: boolean }).autoRotate = true;
                      }
                    }}
                    className="w-6 h-6 mt-0.5 rounded-md border border-border-protocol/60
                               text-text-mute2 hover:text-text-base hover:border-border-bright/40
                               font-mono text-[10px] flex items-center justify-center transition-colors"
                  >✕</button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1 rounded-full bg-void-3 overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{ width: `${selectedCard.score}%`, background: RISK_COLORS[selectedCard.level].hover,
                                boxShadow: `0 0 8px ${RISK_COLORS[selectedCard.level].glow}` }} />
                </div>
                <span className="font-mono text-[10px] flex-shrink-0"
                      style={{ color: RISK_COLORS[selectedCard.level].fill }}>
                  {selectedCard.trend}
                </span>
              </div>

              <div className="mb-3">
                <p className="font-mono text-[7.5px] tracking-[.18em] uppercase text-text-mute2 mb-2">
                  {scenarioId ? t("card_scenario_impact") : isHistorical ? t("card_historical") : t("card_active_incidents")}
                </p>
                <div className="space-y-1.5">
                  {(selectedCard.incidents ?? []).map((inc, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-mono text-[9px] mt-[2px] flex-shrink-0"
                            style={{ color: RISK_COLORS[selectedCard.level].fill }}>▸</span>
                      <p className="font-mono text-[9px] text-text-dim leading-relaxed">{inc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border-protocol/40 pt-3 space-y-2">
                <p className="font-mono text-[7px] tracking-[.2em] uppercase text-text-mute2/60 mb-2">
                  {t("card_news_header")}
                </p>
                <a href={`https://news.google.com/search?q=${encodeURIComponent(selectedCard.name + " security military threat")}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between w-full px-3 py-2 rounded-lg
                              border border-red-protocol/30 bg-red-protocol/8
                              text-red-bright font-mono text-[9px] font-bold
                              hover:border-red-protocol/55 hover:bg-red-protocol/14
                              transition-all duration-150">
                  <span>☢ {t("card_news_threat")}</span>
                  <span className="text-[10px] opacity-70">↗</span>
                </a>
                <a href={`https://news.google.com/search?q=${encodeURIComponent(selectedCard.name + " economy finance sanctions")}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between w-full px-3 py-2 rounded-lg
                              border border-gold-protocol/30 bg-gold-glow/50
                              text-gold-protocol font-mono text-[9px] font-bold
                              hover:border-gold-protocol/55 hover:bg-gold-glow
                              transition-all duration-150">
                  <span>💰 {t("card_news_economy")}</span>
                  <span className="text-[10px] opacity-70">↗</span>
                </a>
                <a href={`https://news.google.com/search?q=${encodeURIComponent(selectedCard.name)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between w-full px-3 py-2 rounded-lg
                              border border-border-protocol bg-void-3/60
                              text-text-mute2 font-mono text-[9px]
                              hover:border-border-bright/40 hover:text-text-base
                              transition-all duration-150">
                  <span>🌐 {t("card_news_all")}</span>
                  <span className="text-[10px] opacity-60">↗</span>
                </a>
              </div>

              {/* ── Relevant Domains (Layer 2 + 3) ──────────────────────── */}
              {countryDomainLinks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-border-protocol/40">
                  <p className="font-mono text-[7.5px] tracking-[.18em] uppercase text-text-mute2 mb-2">
                    RELEVANT DOMAINS
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {countryDomainLinks.map(link => {
                      const col = DOMAIN_BADGE_COLORS[link.id] ?? "#c9a84c";
                      const active = expandedDomainId === link.id;
                      return (
                        <button
                          key={link.id}
                          onClick={() => setExpandedDomainId(active ? null : link.id)}
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono
                                     text-[8px] font-bold tracking-[.1em] transition-all duration-150"
                          style={{
                            background: active ? `${col}22` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${active ? col : col + "44"}`,
                            color: active ? col : `${col}cc`,
                          }}
                        >
                          <span>{link.domain.icon}</span>
                          <span>{link.domain.label.toUpperCase()}</span>
                          <span style={{ opacity: 0.6, fontSize: "7px" }}>
                            {link.entry.role.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Layer 3: expanded domain panel */}
                  {expandedDomainId && (() => {
                    const link = countryDomainLinks.find(l => l.id === expandedDomainId);
                    if (!link) return null;
                    const iso = String(parseInt(String(selectedFeat!.id ?? "0"), 10));
                    const col = DOMAIN_BADGE_COLORS[link.id] ?? "#c9a84c";
                    const relScenarios = SCENARIO_IMPACTS.filter(sc =>
                      (link.domain.scenarioIds ?? []).includes(sc.id) &&
                      sc.countries.some(c => c.iso === iso)
                    );
                    const countryScenarioNote = (sc: typeof SCENARIO_IMPACTS[0]) =>
                      sc.countries.find(c => c.iso === iso)?.note ?? "";

                    return (
                      <div className="mt-2 rounded-lg p-3"
                           style={{ background: `${col}0d`, border: `1px solid ${col}33` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: `${col}22`, color: col }}>
                            {link.entry.role.toUpperCase()}
                          </span>
                          <span className="font-mono text-[9px] font-bold"
                                style={{ color: col }}>
                            {link.entry.label}
                          </span>
                        </div>
                        {relScenarios.length > 0 ? (
                          <>
                            <p className="font-mono text-[7px] tracking-[.14em] uppercase text-text-mute2 mb-1.5">
                              EXPOSURE SCENARIOS
                            </p>
                            <div className="space-y-1.5">
                              {relScenarios.map(sc => (
                                <div key={sc.id} className="flex items-start gap-1.5">
                                  <span className="font-mono text-[8px] mt-px flex-shrink-0"
                                        style={{ color: col }}>▸</span>
                                  <div>
                                    <p className="font-mono text-[8.5px] font-bold text-text-dim">
                                      {sc.title}
                                    </p>
                                    <p className="font-mono text-[7.5px] text-text-mute2 leading-relaxed">
                                      {countryScenarioNote(sc)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="font-mono text-[7.5px] text-text-mute2">
                            No active scenarios mapped for this country.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading veil — dark hold until globe canvas is ready ── */}
      <AnimatePresence>
        {!globeReady && (
          <motion.div
            className="absolute inset-0 z-30 bg-void-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
