// components/watchtower/threat-grid.tsx
"use client";

import { useState } from "react";
import type { ThreatDomain, ThreatLevel } from "@/lib/watchtower/data";

const LEVEL_STYLES: Record<ThreatLevel, string> = {
  CRITICAL: "border-l-red-protocol text-red-bright bg-red-dim border border-red-protocol/28",
  HIGH:     "border-l-amber-protocol text-amber-protocol bg-amber-dim border border-amber-DEFAULT/25",
  ELEVATED: "border-l-blue-DEFAULT text-blue-DEFAULT bg-blue-dim border border-blue-DEFAULT/22",
  MODERATE: "border-l-green-DEFAULT text-green-DEFAULT bg-green-dim border border-green-DEFAULT/22",
};

const BORDER_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#e84040",
  HIGH:     "#f0a500",
  ELEVATED: "#38bdf8",
  MODERATE: "#22c55e",
};

const SCORE_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: "#e84040",
  HIGH:     "#f0a500",
  ELEVATED: "#38bdf8",
  MODERATE: "#22c55e",
};

interface ThreatGridProps {
  domains: ThreatDomain[];
}

export function ThreatGrid({ domains }: ThreatGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      {domains.map((d) => (
        <DomainCard key={d.id} domain={d} />
      ))}
    </div>
  );
}

function DomainCard({ domain: d }: { domain: ThreatDomain }) {
  const [hovered, setHovered] = useState(false);
  const scoreColor = SCORE_COLORS[d.level];
  const borderColor = BORDER_COLORS[d.level];

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        rounded-[9px] px-4 py-3.5 border-l-[3px]
        transition-colors duration-200 cursor-default
        ${hovered ? "bg-void-2" : "bg-void-1"}
      `}
      style={{ borderLeftColor: borderColor, borderTop: `1px solid rgba(255,255,255,0.06)`, borderRight:`1px solid rgba(255,255,255,0.06)`, borderBottom:`1px solid rgba(255,255,255,0.06)` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[18px] leading-none">{d.icon}</span>
          <span className="font-syne font-bold text-[15px] text-text-base">
            {d.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] font-bold"
            style={{ color: d.trend === "↑" ? "#e84040" : "rgba(100,116,139,0.8)" }}
          >
            {d.trend}
          </span>
          <LevelBadge level={d.level} />
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9.5px] tracking-[.1em] text-text-mute2 uppercase">
          Score
        </span>
        <span
          className="font-mono text-[12px] font-bold"
          style={{ color: scoreColor }}
        >
          {d.score}/100
        </span>
      </div>

      {/* Bar */}
      <div className="h-[4px] rounded-sm bg-white/[0.07] overflow-hidden">
        <div
          className="h-full rounded-sm transition-[width] duration-[1100ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: `${d.score}%`, background: scoreColor }}
        />
      </div>
    </article>
  );
}

function LevelBadge({ level }: { level: ThreatLevel }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
        font-mono text-[10px] font-semibold tracking-[.05em]
        ${LEVEL_STYLES[level]}
      `}
    >
      <PulseDot level={level} />
      {level}
    </span>
  );
}

function PulseDot({ level }: { level: ThreatLevel }) {
  const color = SCORE_COLORS[level];
  return (
    <span
      className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}
