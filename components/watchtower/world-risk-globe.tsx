// components/watchtower/world-risk-globe.tsx
"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
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
import type { TimelineEvent } from "@/lib/watchtower/data";
import { SCENARIO_IMPACTS } from "@/lib/watchtower/scenario-impacts";
import type { ScenarioCountryImpact } from "@/lib/watchtower/scenario-impacts";
import { SIGNAL_PINS } from "@/lib/watchtower/signal-pins";

// ─── Dynamic import — WebGL requires browser environment ──────────────────────
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-void-0">
      <div className="text-center space-y-3">
        <p className="font-mono text-[10px] text-text-mute2 tracking-[.22em] animate-pulse">
          LOADING GLOBE...
        </p>
        <div className="w-40 h-px bg-border-protocol mx-auto relative overflow-hidden">
          <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-red-bright/60 to-transparent"
               style={{ animation: "slideRight 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  ),
});

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
  { lat: 31.35, lng: 34.30, weight: 1.0   },  // Gaza City
  { lat: 33.51, lng: 36.29, weight: 0.90  },  // Damascus
  { lat: 36.20, lng: 37.16, weight: 0.85  },  // Aleppo
  { lat: 50.45, lng: 30.52, weight: 0.95  },  // Kyiv
  { lat: 48.00, lng: 37.80, weight: 0.90  },  // Donbas front
  { lat: 15.55, lng: 32.53, weight: 0.92  },  // Khartoum
  { lat:  7.50, lng: 27.50, weight: 0.85  },  // Darfur
  { lat: 15.35, lng: 44.21, weight: 0.88  },  // Sanaa
  { lat: 13.55, lng: 43.14, weight: 0.75  },  // Aden
  { lat: 34.52, lng: 69.18, weight: 0.88  },  // Kabul
  { lat: 31.55, lng: 35.21, weight: 0.85  },  // Jerusalem
  { lat: 35.69, lng: 51.39, weight: 0.85  },  // Tehran
  { lat: 39.00, lng:125.75, weight: 0.92  },  // Pyongyang
  { lat: 55.75, lng: 37.62, weight: 0.72  },  // Moscow
  { lat: 16.87, lng: 96.19, weight: 0.75  },  // Yangon
  { lat:  2.05, lng: 45.34, weight: 0.75  },  // Mogadishu
  { lat: -4.32, lng: 15.32, weight: 0.70  },  // Kinshasa
  { lat: 12.37, lng: 43.15, weight: 0.68  },  // Djibouti
  { lat: 24.86, lng: 67.01, weight: 0.68  },  // Karachi
  { lat: 33.34, lng: 44.40, weight: 0.78  },  // Baghdad
  { lat: 36.34, lng: 43.13, weight: 0.80  },  // Mosul
  { lat: 12.37, lng:  1.53, weight: 0.65  },  // Ouagadougou
  { lat: 12.65, lng: -8.00, weight: 0.63  },  // Bamako
  { lat: 13.51, lng:  2.12, weight: 0.65  },  // Niamey
  { lat: 12.10, lng: 15.04, weight: 0.70  },  // N'Djamena
  { lat: 31.55, lng: 74.34, weight: 0.65  },  // Lahore
  { lat: 34.00, lng: 71.50, weight: 0.76  },  // Peshawar
  { lat: 36.20, lng:127.00, weight: 0.68  },  // Near Seoul DMZ
  { lat: 23.10, lng:113.25, weight: 0.58  },  // Guangdong
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  eraPhase:      string;
  timelineEvent: TimelineEvent | null;
  scenarioId:    string | null;
  showSignals:   boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WorldRiskGlobe({ eraPhase, timelineEvent, scenarioId, showSignals }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef     = useRef<GlobeMethods | undefined>(undefined);
  const [dims,       setDims]       = useState({ w: 0, h: 0 });
  const [countries,  setCountries]  = useState<GeoFeature[]>([]);
  const [hovered,    setHovered]    = useState<GeoFeature | null>(null);
  const [globeReady, setGlobeReady] = useState(false);

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

  // ── Era lookup map ────────────────────────────────────────────────────────
  const eraByIso = useMemo<Record<string, EraCountry> | null>(() => {
    if (scenarioId) return null; // scenario takes priority
    if (!isHistorical) return null;
    const map: Record<string, EraCountry> = {};
    for (const c of ERA_OVERRIDES[eraPhase as EraPhase] ?? []) {
      map[c.iso] = c;
    }
    return map;
  }, [eraPhase, isHistorical, scenarioId]);

  // ── Active rings ──────────────────────────────────────────────────────────
  const activeRings = useMemo(() => {
    if (scenarioId) {
      // Scenario rings: primary = CRITICAL glow, cascade = HIGH glow
      const scenario = SCENARIO_IMPACTS.find(s => s.id === scenarioId);
      if (!scenario) return [];
      return scenario.countries
        .filter(c => c.role === "primary" || c.role === "cascade")
        .map(c => {
          const risk = riskByIso[c.iso];
          const lat  = risk?.lat ?? 0;
          const lng  = risk?.lon ?? 0;
          return {
            lat,
            lng,
            maxR:             c.role === "primary" ? 4.5 : 2.8,
            propagationSpeed: c.role === "primary" ? 2.0 : 1.3,
            repeatPeriod:     c.role === "primary" ? 800  : 1200,
            colFn:            () => c.role === "primary"
              ? RISK_COLORS.CRITICAL.glow
              : RISK_COLORS.HIGH.glow,
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

  // ── Signal pin HTML elements ──────────────────────────────────────────────
  const signalPinsData = useMemo(() => {
    if (!showSignals) return [];
    return SIGNAL_PINS.map(pin => ({
      lat:    pin.lat,
      lng:    pin.lng,
      label:  pin.label,
      colKey: pin.colKey,
    }));
  }, [showSignals]);

  const htmlElement = useCallback((d: object) => {
    const pin = d as { lat: number; lng: number; label: string; colKey: "red" | "warn" | "info" };
    const colHex = SIGNAL_PIN_COLORS[pin.colKey];
    const el = document.createElement("div");
    el.style.cssText = `
      width: 8px; height: 8px; border-radius: 50%;
      background: ${colHex};
      box-shadow: 0 0 8px ${colHex};
      border: 1.5px solid rgba(255,255,255,0.4);
      cursor: pointer;
      animation: pulse 2s infinite;
    `;
    el.title = pin.label;
    return el;
  }, []);

  // ── Container sizing ─────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

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
        setCountries(geo.features);
      });
  }, []);

  // ── Globe ready ───────────────────────────────────────────────────────────
  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true);
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20, lng: 15, altitude: 2.4 }, 1200);
      const ctrl = globeRef.current.controls() as {
        autoRotate:      boolean;
        autoRotateSpeed: number;
        enableDamping:   boolean;
        dampingFactor:   number;
        minDistance:     number;
        maxDistance:     number;
      };
      ctrl.autoRotate      = true;
      ctrl.autoRotateSpeed = 0.22;
      ctrl.enableDamping   = true;
      ctrl.dampingFactor   = 0.06;
      ctrl.minDistance     = 180;
      ctrl.maxDistance     = 600;
    }
  }, []);

  // ── Fly to timeline event region when selected ────────────────────────────
  useEffect(() => {
    if (!globeRef.current || !timelineEvent) return;
    // Find associated era country for lat/lon
    const phase = eraPhase as EraPhase;
    const overrides = ERA_OVERRIDES[phase] ?? [];
    const match = overrides[0]; // fly to first notable country in this era
    if (match) {
      globeRef.current.pointOfView(
        { lat: match.lat, lng: match.lon, altitude: 2.0 },
        900,
      );
    }
  }, [timelineEvent, eraPhase]);

  // ── Hover handler ─────────────────────────────────────────────────────────
  const handleHover = useCallback((feat: GeoFeature | null) => {
    setHovered(feat ?? null);
    if (globeRef.current) {
      (globeRef.current.controls() as { autoRotate: boolean }).autoRotate = !feat;
    }
  }, []);

  // ── Color + altitude accessors ────────────────────────────────────────────
  const capColor = useCallback(
    (feat: object): string => {
      const f   = feat as GeoFeature;
      const iso = String(parseInt(String(f.id ?? "0"), 10));
      const isHov = hovered && String(f.id) === String(hovered.id);

      // Scenario mode takes priority over era mode
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
    [hovered, eraByIso, scenarioMap],
  );

  const altitude = useCallback(
    (feat: object): number => {
      const f   = feat as GeoFeature;
      const iso = String(parseInt(String(f.id ?? "0"), 10));

      const level: RiskLevel | null = (() => {
        if (scenarioMap) {
          const impact = scenarioMap[iso];
          if (!impact) return null;
          return impact.role === "primary" ? "CRITICAL" : "HIGH";
        }
        if (eraByIso) return (eraByIso[iso]?.level as RiskLevel) ?? null;
        return lookupRisk(f)?.level ?? null;
      })();

      if (!level) return 0.001;
      if (level === "CRITICAL") return 0.032;
      if (level === "HIGH")     return 0.018;
      if (level === "ELEVATED") return 0.008;
      return 0.003;
    },
    [eraByIso, scenarioMap],
  );

  // ── Hover card data ───────────────────────────────────────────────────────
  const hoveredCard = useMemo(() => {
    if (!hovered) return null;
    const iso = String(parseInt(String(hovered.id ?? "0"), 10));

    // Scenario mode
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

  return (
    <div ref={containerRef} className="w-full h-full relative bg-void-0 overflow-hidden select-none">

      {/* ── Globe ────────────────────────────────────────────────────────── */}
      {dims.w > 0 && (
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          onGlobeReady={handleGlobeReady}

          backgroundColor="#05080a"
          atmosphereColor="rgba(232,64,64,0.08)"
          atmosphereAltitude={0.18}

          polygonsData={countries}
          polygonCapColor={capColor}
          polygonSideColor={() => "#0a152066"}
          polygonStrokeColor={() => "#0a1520"}
          polygonAltitude={altitude}
          onPolygonHover={handleHover as (f: object | null, p: object | null) => void}
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

          htmlElementsData={signalPinsData}
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
            style={{
              background: "rgba(11,13,24,0.88)",
              border:     "1px solid rgba(232,64,64,0.4)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse" />
            <p className="font-mono text-[8.5px] tracking-[.14em] uppercase text-red-bright">
              Scenario · {SCENARIO_IMPACTS.find(s => s.id === scenarioId)?.title ?? scenarioId}
            </p>
          </div>
        </div>
      )}

      {/* ── Hover info overlay ───────────────────────────────────────────── */}
      {hoveredCard && (
        <div className="absolute top-4 right-4 w-[288px] z-20 pointer-events-none">
          <div
            className="rounded-xl overflow-hidden backdrop-blur-md"
            style={{
              background: "rgba(11,13,24,0.94)",
              border:     `1px solid ${RISK_COLORS[hoveredCard.level].fill}55`,
              boxShadow:  `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset`,
            }}
          >
            <div
              className="h-px w-full"
              style={{ background: `linear-gradient(90deg,${RISK_COLORS[hoveredCard.level].hover},transparent)` }}
            />
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
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:     `${hoveredCard.score}%`,
                      background: RISK_COLORS[hoveredCard.level].hover,
                      boxShadow: `0 0 8px ${RISK_COLORS[hoveredCard.level].glow}`,
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] flex-shrink-0"
                      style={{ color: RISK_COLORS[hoveredCard.level].fill }}>
                  {hoveredCard.trend}
                </span>
              </div>

              <div>
                <p className="font-mono text-[7.5px] tracking-[.18em] uppercase text-text-mute2 mb-2">
                  {scenarioId ? "Scenario Impact" : isHistorical ? "Historical Context" : "Active Incidents"}
                </p>
                <div className="space-y-2">
                  {hoveredCard.incidents.map((inc, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-mono text-[9px] mt-[2px] flex-shrink-0"
                            style={{ color: RISK_COLORS[hoveredCard.level].fill }}>▸</span>
                      <p className="font-mono text-[9.5px] text-text-dim leading-relaxed">{inc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom-right credits ──────────────────────────────────────────── */}
      <div className="absolute bottom-[100px] right-4 z-20 pointer-events-none">
        <p className="font-mono text-[7.5px] text-text-mute2/35 text-right leading-relaxed">
          SIPRI · IAEA · ACLED · UN OCHA · CFR<br />
          INTELLIGENCE UPDATED MARCH 2026
        </p>
      </div>

      {/* ── Loading veil ─────────────────────────────────────────────────── */}
      {!globeReady && dims.w > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-void-0 z-30">
          <div className="text-center space-y-4">
            <p className="font-mono text-[10px] tracking-[.24em] text-text-mute2 animate-pulse">
              INITIALIZING GLOBE...
            </p>
            <div className="w-36 h-px bg-border-protocol mx-auto relative overflow-hidden">
              <div
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-red-bright/70 to-transparent"
                style={{ animation: "slideRight 1.4s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
