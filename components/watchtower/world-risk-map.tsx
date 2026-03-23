// components/watchtower/world-risk-map.tsx
"use client";

import { useState, useCallback, memo, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  COUNTRY_RISK,
  RISK_COLORS,
  NO_DATA_FILL,
  riskByName,
  BORDER_COLOR,
  SEA_COLOR,
  riskByIso,
  type CountryRisk,
  type RiskLevel,
} from "@/lib/watchtower/geo-risk";

const GEO_URL = "/world-110m.json";

// ─── Level badge styles ───────────────────────────────────────────────────────
const LEVEL_BADGE: Record<RiskLevel, string> = {
  CRITICAL: "bg-red-protocol/20  text-red-bright  border-red-protocol/40",
  HIGH:     "bg-amber-dim        text-amber-protocol border-amber-DEFAULT/35",
  ELEVATED: "bg-blue-dim         text-blue-DEFAULT  border-blue-DEFAULT/30",
  MODERATE: "bg-emerald-dim      text-emerald-400   border-emerald-500/30",
};

const TREND_COLOR: Record<string, string> = {
  "↑": "text-red-bright",
  "→": "text-text-mute2",
  "↓": "text-emerald-400",
};

// ─── Country detail panel ─────────────────────────────────────────────────────
function CountryPanel({
  country,
  onClose,
}: {
  country: CountryRisk;
  onClose: () => void;
}) {
  const colors = RISK_COLORS[country.level];

  return (
    <div className="absolute top-3 right-3 w-72 z-20 rounded-xl border bg-void-1
                    shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
         style={{ borderColor: colors.fill }}>
      {/* Top accent */}
      <div className="h-px w-full rounded-t-xl"
           style={{ background: `linear-gradient(90deg, ${colors.fill}, transparent)` }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-syne font-bold text-[15px] text-text-base leading-tight">
              {country.name}
            </h3>
            <p className="font-mono text-[9.5px] text-text-mute2 tracking-[.1em] mt-0.5">
              {country.domain}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-mute2 hover:text-text-dim transition-colors
                       font-mono text-[14px] leading-none flex-shrink-0 mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Score + level */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                            font-mono text-[10px] font-bold tracking-[.05em] border
                            ${LEVEL_BADGE[country.level]}`}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: colors.fill,
                           boxShadow: `0 0 6px ${colors.glow}` }} />
            {country.level}
          </span>
          <span className="font-mono text-[22px] font-bold leading-none"
                style={{ color: colors.hover }}>
            {country.score}
          </span>
          <span className="font-mono text-[10px] text-text-mute2">/100</span>
          <span className={`ml-auto font-mono text-[16px] ${TREND_COLOR[country.trend]}`}>
            {country.trend}
          </span>
        </div>

        {/* Score bar */}
        <div className="h-1 w-full bg-void-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${country.score}%`,
              background: `linear-gradient(90deg, ${colors.fill}, ${colors.hover})`,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          />
        </div>

        {/* Incidents */}
        <ul className="space-y-2">
          {country.incidents.map((inc, i) => (
            <li key={i} className="flex gap-2 font-mono text-[10.5px] text-text-dim leading-relaxed">
              <span className="flex-shrink-0 mt-0.5" style={{ color: colors.fill }}>▸</span>
              <span>{inc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const LEGEND_ITEMS: Array<{ level: RiskLevel; label: string }> = [
  { level: "CRITICAL", label: "Critical" },
  { level: "HIGH",     label: "High"     },
  { level: "ELEVATED", label: "Elevated" },
  { level: "MODERATE", label: "Moderate" },
];

function Legend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1
                    bg-void-1/90 border border-border-protocol rounded-lg px-3 py-2.5
                    backdrop-blur-sm">
      <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.14em] uppercase mb-1">
        Risk Level
      </p>
      {LEGEND_ITEMS.map(({ level, label }) => (
        <div key={level} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: RISK_COLORS[level].fill,
                         boxShadow: `0 0 5px ${RISK_COLORS[level].glow}` }} />
          <span className="font-mono text-[10px] text-text-dim">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-0.5 pt-1 border-t border-border-protocol">
        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: NO_DATA_FILL }} />
        <span className="font-mono text-[10px] text-text-mute2">No data</span>
      </div>
    </div>
  );
}

// ─── Pulse marker for critical hotspots ──────────────────────────────────────
function PulseMarker({ lat, lon, onClick }: { lat: number; lon: number; onClick: () => void }) {
  return (
    <Marker coordinates={[lon, lat]}>
      <g onClick={onClick} style={{ cursor: "pointer" }}>
        {/* Outer pulse ring — CSS animation */}
        <circle r={7} fill="none" stroke="rgba(232,64,64,0.4)" strokeWidth={1}
                style={{ animation: "pulseRing 2s ease-out infinite" }} />
        {/* Inner dot */}
        <circle r={3} fill="#e84040"
                style={{ filter: "drop-shadow(0 0 4px rgba(232,64,64,0.9))" }} />
      </g>
    </Marker>
  );
}

// ─── Main map component ───────────────────────────────────────────────────────
export const WorldRiskMap = memo(function WorldRiskMap() {
  const [selected, setSelected]   = useState<CountryRisk | null>(null);
  const [hovered,  setHovered]    = useState<string | null>(null);
  const [position, setPosition]   = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border-protocol
                    bg-void-2"
         style={{ height: 480 }}>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulseRing {
          0%   { r: 5;  opacity: 0.8; }
          100% { r: 18; opacity: 0;   }
        }
      `}</style>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [0, 20] }}
        style={{ width: "100%", height: "100%", background: SEA_COLOR }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          minZoom={0.8}
          maxZoom={6}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // geo.id is the ISO numeric string ("004", "840" …)
                // Fall back to name lookup for features without a numeric id
                // (Kosovo, N. Cyprus, Somaliland in world-110m.json)
                const id     = geo.id ? String(geo.id) : null;
                const name   = geo.properties?.name as string | undefined;
                const risk   = (id ? riskByIso[id] : null) ?? (name ? riskByName[name] : null);
                const hoverKey = id ?? name ?? geo.rsmKey;
                const isHov  = hovered === hoverKey;
                const isSel  = selected
                  ? (id ? selected.iso === id : selected.name === name)
                  : false;
                const fill   = risk
                  ? isHov || isSel
                    ? RISK_COLORS[risk.level].hover
                    : RISK_COLORS[risk.level].fill
                  : NO_DATA_FILL;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={BORDER_COLOR}
                    strokeWidth={0.4}
                    onClick={() => risk && setSelected(risk)}
                    onMouseEnter={() => setHovered(hoverKey)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      default:  { outline: "none", transition: "fill 0.15s ease" },
                      hover:    { outline: "none", cursor: risk ? "pointer" : "default" },
                      pressed:  { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Pulse markers on critical countries */}
          {COUNTRY_RISK.filter((c) => c.level === "CRITICAL").map((c) => (
            <PulseMarker
              key={c.iso}
              lat={c.lat}
              lon={c.lon}
              onClick={() => setSelected(c)}
            />
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <Legend />

      {/* Zoom controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        <button
          onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 6) }))}
          className="w-7 h-7 flex items-center justify-center
                     bg-void-1/90 border border-border-protocol rounded-md
                     font-mono text-[14px] text-text-dim hover:text-text-base
                     hover:border-border-bright transition-all backdrop-blur-sm"
        >
          +
        </button>
        <button
          onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 0.8) }))}
          className="w-7 h-7 flex items-center justify-center
                     bg-void-1/90 border border-border-protocol rounded-md
                     font-mono text-[14px] text-text-dim hover:text-text-base
                     hover:border-border-bright transition-all backdrop-blur-sm"
        >
          −
        </button>
        <button
          onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
          className="w-7 h-7 flex items-center justify-center
                     bg-void-1/90 border border-border-protocol rounded-md
                     font-mono text-[9px] text-text-mute2 hover:text-text-dim
                     hover:border-border-bright transition-all backdrop-blur-sm"
          title="Reset view"
        >
          ⌂
        </button>
      </div>

      {/* Country detail panel */}
      {selected && (
        <CountryPanel
          country={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Hover tooltip — shows when hovering tracked country, no panel open */}
      {hovered && !selected && (() => {
        const risk = riskByIso[hovered] ?? riskByName[hovered];
        if (!risk) return null;
        return (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10
                          bg-void-1/95 border border-border-protocol rounded-lg
                          px-3 py-1.5 pointer-events-none backdrop-blur-sm
                          flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: RISK_COLORS[risk.level].fill }} />
            <span className="font-mono text-[11px] text-text-base">{risk.name}</span>
            <span className="font-mono text-[10px]"
                  style={{ color: RISK_COLORS[risk.level].hover }}>
              {risk.level}
            </span>
            <span className="font-mono text-[10px] text-text-mute2">·</span>
            <span className="font-mono text-[10px] text-text-dim">{risk.score}/100</span>
          </div>
        );
      })()}
    </div>
  );
});
