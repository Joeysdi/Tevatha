// components/watchtower/world-risk-globe.tsx
"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n/use-translation";
import { GlobeLoadingScreen } from "./globe-loading-screen";
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

// ─── Dynamic import — WebGL requires browser environment ──────────────────────
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => <GlobeLoadingScreen />,
});

// ─── City pins data ───────────────────────────────────────────────────────────
interface CityPin {
  name:        string;
  country:     string;
  flag:        string;
  lat:         number;
  lng:         number;
  pop:         number;
  threatScore: number;
  note:        string;
}

const CITY_PINS_DATA: CityPin[] = [
  { name: "New York",      country: "USA",          flag: "🇺🇸", lat:  40.71, lng:  -74.01, pop:  8.3, threatScore: 42, note: "Financial hub; persistent cyber targeting by state actors" },
  { name: "London",        country: "UK",           flag: "🇬🇧", lat:  51.51, lng:   -0.13, pop:  9.0, threatScore: 38, note: "Intelligence hub; ongoing espionage operations" },
  { name: "Moscow",        country: "Russia",       flag: "🇷🇺", lat:  55.75, lng:   37.62, pop: 12.4, threatScore: 78, note: "Nuclear command center; hybrid warfare doctrine active" },
  { name: "Beijing",       country: "China",        flag: "🇨🇳", lat:  39.91, lng:  116.39, pop: 21.5, threatScore: 72, note: "PLAN expansion; Taiwan Strait tension elevated" },
  { name: "Washington DC", country: "USA",          flag: "🇺🇸", lat:  38.91, lng:  -77.04, pop:  0.7, threatScore: 65, note: "Primary federal target; critical infrastructure at risk" },
  { name: "Paris",         country: "France",       flag: "🇫🇷", lat:  48.86, lng:    2.35, pop: 11.1, threatScore: 44, note: "Jihadist cell activity; intelligence services on alert" },
  { name: "Tokyo",         country: "Japan",        flag: "🇯🇵", lat:  35.69, lng:  139.69, pop: 13.9, threatScore: 35, note: "NK missile overflight corridor; seismic zone" },
  { name: "Kyiv",          country: "Ukraine",      flag: "🇺🇦", lat:  50.45, lng:   30.52, pop:  2.9, threatScore: 94, note: "Active warzone; drone and missile strikes ongoing" },
  { name: "Tehran",        country: "Iran",         flag: "🇮🇷", lat:  35.69, lng:   51.39, pop:  9.3, threatScore: 88, note: "Proxy network active; nuclear program accelerating" },
  { name: "Pyongyang",     country: "N. Korea",     flag: "🇰🇵", lat:  39.03, lng:  125.75, pop:  3.0, threatScore: 91, note: "ICBM tests continuous; total information blackout" },
  { name: "Tel Aviv",      country: "Israel",       flag: "🇮🇱", lat:  32.08, lng:   34.78, pop:  4.2, threatScore: 82, note: "Multi-front conflict active; Iron Dome engaged" },
  { name: "Delhi",         country: "India",        flag: "🇮🇳", lat:  28.61, lng:   77.21, pop: 32.9, threatScore: 55, note: "Border tensions with China/Pakistan; nuclear doctrine revision" },
  { name: "Islamabad",     country: "Pakistan",     flag: "🇵🇰", lat:  33.72, lng:   73.06, pop:  2.2, threatScore: 74, note: "Nuclear arsenal; Taliban border activity elevated" },
  { name: "Riyadh",        country: "Saudi Arabia", flag: "🇸🇦", lat:  24.69, lng:   46.72, pop:  7.7, threatScore: 60, note: "Houthi missile threat; royal succession risk" },
  { name: "Kabul",         country: "Afghanistan",  flag: "🇦🇫", lat:  34.53, lng:   69.17, pop:  4.6, threatScore: 89, note: "Taliban control; ISKP operations ongoing" },
  { name: "Singapore",     country: "Singapore",    flag: "🇸🇬", lat:   1.35, lng:  103.82, pop:  5.9, threatScore: 22, note: "Malacca chokepoint; stable but geopolitically watched" },
  { name: "Dubai",         country: "UAE",          flag: "🇦🇪", lat:  25.20, lng:   55.27, pop:  3.6, threatScore: 33, note: "Sanctions evasion hub; financial surveillance focal point" },
  { name: "Lagos",         country: "Nigeria",      flag: "🇳🇬", lat:   6.52, lng:    3.38, pop: 15.9, threatScore: 67, note: "ISWAP/Boko Haram; oil facility sabotage risk" },
  { name: "Cairo",         country: "Egypt",        flag: "🇪🇬", lat:  30.06, lng:   31.25, pop: 21.7, threatScore: 58, note: "Sinai insurgency; Nile dam standoff ongoing" },
  { name: "Caracas",       country: "Venezuela",    flag: "🇻🇪", lat:  10.48, lng:  -66.88, pop:  2.8, threatScore: 73, note: "Hybrid authoritarian state; narco-terror networks" },
  { name: "Mogadishu",     country: "Somalia",      flag: "🇸🇴", lat:   2.05, lng:   45.34, pop:  2.6, threatScore: 92, note: "Al-Shabaab active; piracy in Gulf of Aden" },
  { name: "Khartoum",      country: "Sudan",        flag: "🇸🇩", lat:  15.55, lng:   32.53, pop:  6.2, threatScore: 90, note: "SAF vs RSF civil war; humanitarian catastrophe" },
  { name: "Yangon",        country: "Myanmar",      flag: "🇲🇲", lat:  16.87, lng:   96.19, pop:  7.3, threatScore: 77, note: "Military junta; resistance forces advancing" },
  { name: "Sao Paulo",     country: "Brazil",       flag: "🇧🇷", lat: -23.55, lng:  -46.63, pop: 22.4, threatScore: 52, note: "Organized crime; deforestation-linked instability" },
  { name: "Mexico City",   country: "Mexico",       flag: "🇲🇽", lat:  19.43, lng:  -99.13, pop: 21.5, threatScore: 63, note: "Cartel state capture; fentanyl corridor active" },
  { name: "Berlin",        country: "Germany",      flag: "🇩🇪", lat:  52.52, lng:   13.41, pop:  3.7, threatScore: 36, note: "NATO eastern flank lead; Russian sabotage operations" },
  { name: "Sydney",        country: "Australia",    flag: "🇦🇺", lat: -33.87, lng:  151.21, pop:  5.3, threatScore: 25, note: "AUKUS submarine program; South China Sea tension" },
  { name: "Seoul",         country: "S. Korea",     flag: "🇰🇷", lat:  37.57, lng:  126.98, pop:  9.7, threatScore: 71, note: "NK artillery range; chemical weapon threat" },
  { name: "Taipei",        country: "Taiwan",       flag: "🇹🇼", lat:  25.03, lng:  121.56, pop:  2.7, threatScore: 85, note: "PRC military pressure; strait crossing rehearsals" },
  { name: "Istanbul",      country: "Türkiye",      flag: "🇹🇷", lat:  41.01, lng:   28.97, pop: 15.5, threatScore: 62, note: "Bosphorus chokepoint; Kurdish-Turkish conflict" },
];

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

for (const c of COUNTRY_RISK) {
  riskByIso[c.iso] = c;
  riskByName[c.name.toLowerCase()] = c;
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
  lat:    number;
  lng:    number;
  region: string;
  threat: string;
  note:   string;
}

const PSYCH_ZONES: PsychZone[] = [
  { lat: 49.0, lng: 31.5,   region: "Ukraine",      threat: "Combat Stress",          note: "3yr war → hypervigilance & moral injury at scale. Identity anchoring critical." },
  { lat: 31.9, lng: 35.2,   region: "Gaza",         threat: "Infrastructure Collapse", note: "Complete social fabric destruction → anomie + learned helplessness cascade." },
  { lat: 33.5, lng: 36.3,   region: "Syria",        threat: "Chronic Displacement",    note: "14yr conflict: compound trauma + grief without closure = identity dissolution." },
  { lat: 15.5, lng: 32.5,   region: "Sudan",        threat: "Societal Fracture",       note: "Largest displacement crisis: community bonds severed = primary resilience failure." },
  { lat: 39.0, lng: 125.75, region: "North Korea",  threat: "Information Blackout",    note: "Total information control → normalisation of abnormal. Cognitive capture complete." },
  { lat:  2.0, lng: 45.3,   region: "Somalia",      threat: "State Collapse",          note: "33yr failed state: survival psychology becomes default — trust radius collapses to family." },
  { lat: 34.5, lng: 69.2,   region: "Afghanistan",  threat: "Learned Helplessness",    note: "4 regime changes in 20yrs: agency loss → fatalism prevents adaptive action." },
  { lat: 15.5, lng: 44.2,   region: "Yemen",        threat: "Famine Stress",           note: "Chronic hunger impairs cognition: decision quality collapses under caloric deficit." },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  eraPhase:         string;
  scenarioId:       string | null;
  showSignals:      boolean;
  psychologyMode:   boolean;
  domainId:         string | null;
  gatePhase:        string;
  scrubVelocity:    number;
  onSignalPinClick: (sigIndex: number) => void;
  onPsychZoneClick: (zone: { region: string; threat: string; note: string }) => void;
  onGatePinClick:   (gateId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WorldRiskGlobe({ eraPhase, scenarioId, showSignals, psychologyMode, domainId, gatePhase, scrubVelocity, onSignalPinClick, onPsychZoneClick, onGatePinClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef     = useRef<GlobeMethods | undefined>(undefined);
  const [dims,         setDims]         = useState({ w: 0, h: 0 });
  const [countries,    setCountries]    = useState<GeoFeature[]>([]);
  const [hovered,      setHovered]      = useState<GeoFeature | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<GeoFeature | null>(null);
  const [globeReady,   setGlobeReady]   = useState(false);
  const [selectedCityIdx, setSelectedCityIdx] = useState<number | null>(null);
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
    if (!isHistorical) return PULSE_RINGS_P4;
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
    type:        "signal" | "scenario-label" | "psych-zone" | "city" | "domain-label" | "gate";
    lat:         number;
    lng:         number;
    // signal fields
    sigIndex?:   number;
    label?:      string;
    colKey?:     "red" | "warn" | "info";
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
  };

  const htmlGlobeData = useMemo<HtmlGlobeItem[]>(() => {
    const items: HtmlGlobeItem[] = [];

    // City pins — always visible
    CITY_PINS_DATA.forEach((city, idx) => {
      items.push({
        type:      "city",
        lat:       city.lat,
        lng:       city.lng,
        cityIdx:   idx,
        cityName:  city.name,
        cityScore: city.threatScore,
      });
    });

    // Signal pins
    if (showSignals) {
      for (const pin of SIGNAL_PINS) {
        items.push({
          type:     "signal",
          lat:      pin.lat,
          lng:      pin.lng,
          sigIndex: pin.sigIndex,
          label:    pin.label,
          colKey:   pin.colKey,
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

    // Psychology zone overlays
    if (psychologyMode) {
      for (const z of PSYCH_ZONES) {
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

    // Gate pins — visible in present/future phases (P4, P5, P6)
    const showGates = gatePhase !== "P1" && gatePhase !== "P2" && gatePhase !== "P3";
    if (showGates) {
      const GATE_TIER: Record<string, string> = {
        G1:"t4", G2:"t4", G3:"t4", G4:"t4", G5:"t4", G6:"t3", G7:"t3", G8:"t2",
      };
      for (const pin of GATE_PINS) {
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

    return items;
  }, [showSignals, scenarioId, psychologyMode, domainId, domainColor, gatePhase]);

  const htmlElement = useCallback((d: object) => {
    const el = document.createElement("div");
    if (!d) return el;
    const item = d as HtmlGlobeItem;
    if (!item.type) return el;

    if (item.type === "city") {
      const col = cityThreatColor(item.cityScore ?? 0);
      const high = (item.cityScore ?? 0) >= 80;
      el.style.cssText = `
        width: 8px; height: 8px;
        border: 1.5px solid ${col};
        background: ${col}20;
        box-shadow: 0 0 8px ${col}99, 0 0 2px ${col};
        cursor: pointer;
        color: ${col};
        transform: rotate(45deg);
        transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        border-radius: 1px;
        ${high ? `animation: city-pulse 2s ease-in-out infinite;` : ""}
      `;
      el.title = `${item.cityName ?? ""} — Click for intel`;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "rotate(45deg) scale(2.2)";
        el.style.boxShadow = `0 0 16px ${col}cc, 0 0 5px ${col}`;
        el.style.background = `${col}44`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "rotate(45deg) scale(1)";
        el.style.boxShadow = `0 0 8px ${col}99, 0 0 2px ${col}`;
        el.style.background = `${col}20`;
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("city-pin-click", {
          bubbles: true,
          detail:  { cityIndex: item.cityIdx ?? 0 },
        }));
      });

    } else if (item.type === "signal") {
      const colHex = SIGNAL_PIN_COLORS[item.colKey ?? "info"];
      el.style.cssText = `
        width: 9px; height: 9px; border-radius: 50%;
        background: ${colHex};
        box-shadow: 0 0 10px ${colHex}, 0 0 20px ${colHex}44;
        border: 1.5px solid rgba(255,255,255,0.5);
        cursor: pointer;
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
      const tierCol = item.gateTier === "t4" ? "#e84040" : item.gateTier === "t3" ? "#f0a500" : "#38bdf8";
      el.style.cssText = `
        background: rgba(5,8,13,0.88);
        border: 1.5px solid ${tierCol}88;
        border-radius: 6px;
        padding: 4px 7px;
        pointer-events: auto;
        cursor: pointer;
        max-width: 120px;
        backdrop-filter: blur(6px);
        box-shadow: 0 0 12px ${tierCol}33;
        transition: transform 0.15s, box-shadow 0.15s;
      `;
      el.innerHTML = `
        <div style="font-family:monospace;font-size:7.5px;font-weight:bold;
                    color:${tierCol};letter-spacing:.1em;">${item.gateLabel ?? ""}</div>
      `;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.1)";
        el.style.boxShadow = `0 4px 20px ${tierCol}55`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = `0 0 12px ${tierCol}33`;
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        el.dispatchEvent(new CustomEvent("gate-pin-click", {
          bubbles: true,
          detail: { gateId: item.gateId },
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
        setSelectedCityIdx(detail.cityIndex);
        setSelectedFeat(null);
      }
    };
    container.addEventListener("city-pin-click", handler);
    return () => container.removeEventListener("city-pin-click", handler);
  }, []);

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
    [hovered, eraByIso, scenarioMap, domainMap],
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

  // ── Selected city data ────────────────────────────────────────────────────
  const selectedCity = selectedCityIdx !== null ? CITY_PINS_DATA[selectedCityIdx] ?? null : null;

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
            setSelectedCityIdx(null);
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

      {/* ── Psychology mode badge ─────────────────────────────────────────── */}
      {psychologyMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
             style={{ marginTop: scenarioId ? "40px" : "0" }}>
          <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-sm"
               style={{ background: "rgba(11,13,24,0.88)", border: "1px solid rgba(138,43,226,0.4)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#8b2be2" }} />
            <p className="font-mono text-[8.5px] tracking-[.14em] uppercase" style={{ color: "#c084fc" }}>
              {t("badge_psych_overlay")}
            </p>
          </div>
        </div>
      )}

      {/* ── Hover info overlay ────────────────────────────────────────────── */}
      {hoveredCard && !selectedFeat && selectedCityIdx === null && (
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
            </div>
          </div>
        </div>
      )}

      {/* ── City pin selected card ────────────────────────────────────────── */}
      {selectedCity && (
        <div className="absolute top-4 right-4 w-[288px] z-25 sm:block hidden">
          <div
            className="rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(8,10,18,0.97)",
              border:     `1px solid ${cityThreatColor(selectedCity.threatScore)}55`,
              boxShadow:  `0 12px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03) inset`,
            }}
          >
            <div className="h-px w-full"
                 style={{ background: `linear-gradient(90deg,${cityThreatColor(selectedCity.threatScore)},transparent)` }} />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[8px] tracking-[.2em] uppercase mb-0.5"
                     style={{ color: cityThreatColor(selectedCity.threatScore) }}>
                    {selectedCity.flag} {selectedCity.country} · {t("city_intel")}
                  </p>
                  <h3 className="font-syne font-bold text-[16px] text-text-base leading-snug">
                    {selectedCity.name}
                  </h3>
                </div>
                <div className="flex items-start gap-2 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-syne font-extrabold text-[26px] leading-none tabular-nums"
                         style={{ color: cityThreatColor(selectedCity.threatScore) }}>
                      {selectedCity.threatScore}
                    </div>
                    <div className="font-mono text-[7px] text-text-mute2">threat</div>
                  </div>
                  <button
                    onClick={() => setSelectedCityIdx(null)}
                    className="w-6 h-6 mt-0.5 rounded-md border border-border-protocol/60
                               text-text-mute2 hover:text-text-base hover:border-border-bright/40
                               font-mono text-[10px] flex items-center justify-center transition-colors"
                  >✕</button>
                </div>
              </div>

              {/* Score bar */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1 rounded-full bg-void-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ width: `${selectedCity.threatScore}%`,
                                background: cityThreatColor(selectedCity.threatScore),
                                boxShadow: `0 0 8px ${cityThreatColor(selectedCity.threatScore)}99` }} />
                </div>
                <span className="font-mono text-[9px] text-text-mute2 flex-shrink-0">
                  /100
                </span>
              </div>

              {/* Population */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border-protocol/30">
                <span className="font-mono text-[8px] text-text-mute2 tracking-[.14em] uppercase">{t("city_population")}</span>
                <span className="font-mono text-[11px] font-bold text-text-base ml-auto tabular-nums">
                  {selectedCity.pop >= 10
                    ? `${selectedCity.pop.toFixed(0)}M`
                    : `${selectedCity.pop.toFixed(1)}M`}
                </span>
              </div>

              {/* Intel note */}
              <div className="mb-3">
                <p className="font-mono text-[7.5px] tracking-[.18em] uppercase text-text-mute2 mb-2">
                  {t("city_active_intel")}
                </p>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-[9px] mt-[2px] flex-shrink-0"
                        style={{ color: cityThreatColor(selectedCity.threatScore) }}>▸</span>
                  <p className="font-mono text-[9px] text-text-dim leading-relaxed">
                    {selectedCity.note}
                  </p>
                </div>
              </div>

              {/* News links */}
              <div className="border-t border-border-protocol/40 pt-3 space-y-1.5">
                <p className="font-mono text-[7px] tracking-[.2em] uppercase text-text-mute2/60 mb-2">
                  {t("card_news_header")}
                </p>
                <a href={`https://news.google.com/search?q=${encodeURIComponent(selectedCity.name + " security threat attack")}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between w-full px-3 py-2 rounded-lg
                              border border-red-protocol/30 bg-red-protocol/8
                              text-red-bright font-mono text-[9px] font-bold
                              hover:border-red-protocol/55 hover:bg-red-protocol/14
                              transition-all duration-150">
                  <span>☢ {t("card_news_threat")}</span>
                  <span className="text-[10px] opacity-70">↗</span>
                </a>
                <a href={`https://news.google.com/search?q=${encodeURIComponent(selectedCity.name + " " + selectedCity.country)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between w-full px-3 py-2 rounded-lg
                              border border-border-protocol bg-void-3/60
                              text-text-mute2 font-mono text-[9px]
                              hover:border-border-bright/40 hover:text-text-base
                              transition-all duration-150">
                  <span>🌐 {t("city_all_news")}</span>
                  <span className="text-[10px] opacity-60">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile city card */}
      {selectedCity && (
        <div className="absolute bottom-4 left-3 right-3 z-25 sm:hidden">
          <div
            className="rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(8,10,18,0.97)",
              border:     `1px solid ${cityThreatColor(selectedCity.threatScore)}55`,
            }}
          >
            <div className="h-px w-full"
                 style={{ background: `linear-gradient(90deg,${cityThreatColor(selectedCity.threatScore)},transparent)` }} />
            <div className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[8px] tracking-[.12em] uppercase mb-0.5"
                   style={{ color: cityThreatColor(selectedCity.threatScore) }}>
                  {selectedCity.flag} {selectedCity.country}
                </p>
                <p className="font-syne font-bold text-[14px] text-text-base leading-none">{selectedCity.name}</p>
                <p className="font-mono text-[8.5px] text-text-dim mt-1 leading-relaxed line-clamp-2">
                  {selectedCity.note}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-syne font-extrabold text-[22px] leading-none tabular-nums"
                     style={{ color: cityThreatColor(selectedCity.threatScore) }}>
                  {selectedCity.threatScore}
                </div>
                <div className="font-mono text-[7px] text-text-mute2">threat</div>
              </div>
              <button onClick={() => setSelectedCityIdx(null)}
                      className="font-mono text-[12px] text-text-mute2 hover:text-text-base flex-shrink-0">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom-right credits ──────────────────────────────────────────── */}
      <div className="absolute bottom-[100px] right-4 z-20 pointer-events-none">
        <p className="font-mono text-[7.5px] text-text-mute2/35 text-right leading-relaxed">
          SIPRI · IAEA · ACLED · UN OCHA · CFR<br />
          {t("intel_credits")}
        </p>
      </div>

      {/* ── Loading veil — stays until globe + pins are ready, then fades ── */}
      <AnimatePresence>
        {!globeReady && (
          <motion.div
            className="absolute inset-0 bg-void-0 z-30 flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Top red accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-red-protocol via-red-bright/40 to-transparent" />

            {/* Scanline */}
            <div className="w-64 h-px overflow-hidden relative mb-8">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-red-bright/50 to-transparent"
                   style={{ animation: "slideRight 1.4s ease-in-out infinite" }} />
            </div>

            <div className="flex flex-col items-center gap-3">
              {/* Title */}
              <p className="font-mono text-[9px] tracking-[.3em] uppercase text-text-mute2/60">
                TEVATHA WATCHTOWER
              </p>

              {/* Clock */}
              <div className="flex items-center gap-3 my-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-protocol flex-shrink-0
                                 shadow-[0_0_14px_rgba(232,64,64,0.9)] animate-pulse" />
                <span className="font-syne font-extrabold leading-none text-red-bright tabular-nums"
                      style={{ fontSize: "clamp(64px,18vw,96px)", textShadow: "0 0 60px rgba(232,64,64,0.55)" }}>
                  85s
                </span>
              </div>

              <p className="font-mono text-[13px] text-text-mute2 tracking-[.12em] uppercase">
                to midnight
              </p>
            </div>

            {/* Bottom scanline */}
            <div className="w-64 h-px overflow-hidden relative mt-8">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-red-bright/50 to-transparent"
                   style={{ animation: "slideRight 1.4s ease-in-out infinite", animationDelay: "0.7s" }} />
            </div>

            <p className="font-mono text-[7px] tracking-[.22em] uppercase text-text-mute2/30 animate-pulse mt-6">
              {t("loading_init")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
