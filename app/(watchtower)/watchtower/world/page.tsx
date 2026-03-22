// app/(watchtower)/watchtower/world/page.tsx
import type { Metadata } from "next";
import { WorldRiskMap }  from "@/components/watchtower/world-risk-map";
import {
  COUNTRY_RISK,
  RISK_COLORS,
  riskStats,
  type CountryRisk,
  type RiskLevel,
} from "@/lib/watchtower/geo-risk";

export const metadata: Metadata = {
  title: "World Risk",
  description: "Global geopolitical threat map — country-level risk intelligence across nuclear, cyber, political, and economic domains.",
};

// ─── Stat bar item ────────────────────────────────────────────────────────────
function StatBadge({
  level,
  count,
  label,
}: {
  level: RiskLevel;
  count: number;
  label: string;
}) {
  const colors = RISK_COLORS[level];
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-void-1"
         style={{ borderColor: `${colors.fill}55` }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: colors.fill, boxShadow: `0 0 6px ${colors.glow}` }} />
      <span className="font-mono text-[20px] font-bold leading-none tabular-nums"
            style={{ color: colors.hover }}>
        {count}
      </span>
      <span className="font-mono text-[9.5px] tracking-[.1em] uppercase"
            style={{ color: colors.fill }}>
        {label}
      </span>
    </div>
  );
}

// ─── Incident feed row ────────────────────────────────────────────────────────
function IncidentRow({ country }: { country: CountryRisk }) {
  const colors = RISK_COLORS[country.level];
  return (
    <div className="border-l-2 pl-3 py-2.5 border-border-protocol
                    hover:border-l-[3px] transition-all duration-150 group"
         style={{ borderLeftColor: colors.fill }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-syne font-bold text-[12px] text-text-base group-hover:text-text-base/90">
          {country.name}
        </span>
        <span className="font-mono text-[9px] tracking-[.08em] px-1.5 py-0.5 rounded-full border"
              style={{ color: colors.hover, borderColor: `${colors.fill}55`,
                       background: `${colors.fill}18` }}>
          {country.level}
        </span>
        <span className="font-mono text-[9.5px] text-text-mute2 ml-auto">{country.domain}</span>
      </div>
      <p className="font-mono text-[10.5px] text-text-dim leading-relaxed line-clamp-1">
        {country.incidents[0]}
      </p>
    </div>
  );
}

export default function WorldRiskPage() {
  const criticals = COUNTRY_RISK.filter((c) => c.level === "CRITICAL")
    .sort((a, b) => b.score - a.score);
  const highs     = COUNTRY_RISK.filter((c) => c.level === "HIGH")
    .sort((a, b) => b.score - a.score);
  const others    = COUNTRY_RISK.filter((c) => c.level === "ELEVATED" || c.level === "MODERATE")
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-border-protocol bg-void-1 px-6 py-5 overflow-hidden"
           style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}>
        {/* Red top accent */}
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: "linear-gradient(90deg, #e84040, rgba(240,165,0,0.4), transparent)" }} />

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <p className="font-mono text-[9.5px] text-red-bright tracking-[.2em] uppercase mb-2">
              Watchtower · Global Intelligence
            </p>
            <h1 className="font-syne font-extrabold text-[26px] sm:text-[30px] text-text-base leading-tight">
              World Risk Map
            </h1>
            <p className="font-mono text-[11px] text-text-mute2 mt-1.5 leading-relaxed max-w-lg">
              Real-time geopolitical threat assessment across {riskStats.total} tracked nations.
              Click any country or pulse marker for full incident intelligence.
            </p>
          </div>

          {/* Stat badges */}
          <div className="flex flex-wrap gap-2">
            <StatBadge level="CRITICAL" count={riskStats.critical} label="Critical" />
            <StatBadge level="HIGH"     count={riskStats.high}     label="High"     />
            <StatBadge level="ELEVATED" count={riskStats.elevated} label="Elevated" />
            <StatBadge level="MODERATE" count={riskStats.moderate} label="Moderate" />
          </div>
        </div>
      </div>

      {/* ── Interactive map ───────────────────────────────────────────────── */}
      <WorldRiskMap />

      {/* ── Incident feed ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Critical + High */}
        <div className="rounded-xl border border-border-protocol bg-void-1 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-syne font-bold text-[17px] text-text-base">
              Critical Incidents
            </h2>
            <div className="flex-1 h-px bg-red-protocol/30" />
            <span className="font-mono text-[9px] text-red-bright tracking-[.1em] uppercase">
              Live Feed
            </span>
          </div>

          <div className="space-y-0 divide-y divide-border-protocol">
            {criticals.map((c) => (
              <IncidentRow key={c.iso} country={c} />
            ))}
          </div>
        </div>

        {/* High risk */}
        <div className="rounded-xl border border-border-protocol bg-void-1 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-syne font-bold text-[17px] text-text-base">
              High Risk Nations
            </h2>
            <div className="flex-1 h-px bg-amber-DEFAULT/25" />
          </div>

          <div className="space-y-0 divide-y divide-border-protocol">
            {highs.map((c) => (
              <IncidentRow key={c.iso} country={c} />
            ))}
          </div>
        </div>
      </div>

      {/* Elevated + Moderate */}
      <div className="rounded-xl border border-border-protocol bg-void-1 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            Elevated &amp; Moderate Zones
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
          <span className="font-mono text-[9px] text-text-mute2 tracking-[.1em] uppercase">
            {others.length} nations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0">
          {others.map((c) => (
            <IncidentRow key={c.iso} country={c} />
          ))}
        </div>
      </div>

      {/* Intelligence note */}
      <p className="font-mono text-[9.5px] text-text-mute2 text-center tracking-[.06em]
                    pb-4 leading-relaxed">
        INTELLIGENCE UPDATED MARCH 2026 · SOURCES: SIPRI · IAEA · ACLED · UN OCHA · CFR · IPC ·
        OPEN SOURCE REPORTING · FOR SITUATIONAL AWARENESS ONLY
      </p>
    </div>
  );
}
