// components/watchtower/threat-grid.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StaggerParent, StaggerChild } from "@/components/ui/motion";
import type { ThreatDomain, ThreatLevel } from "@/lib/watchtower/data";
import { useTranslation } from "@/lib/i18n/use-translation";

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
    <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {domains.map((d) => (
        <StaggerChild key={d.id}>
          <DomainCard domain={d} />
        </StaggerChild>
      ))}
    </StaggerParent>
  );
}

function DomainCard({ domain: d }: { domain: ThreatDomain }) {
  const { t } = useTranslation();
  const scoreColor  = SCORE_COLORS[d.level];
  const borderColor = BORDER_COLORS[d.level];

  return (
    <Link href={`/watchtower/threats/${d.id}`} className="block h-full">
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="rounded-xl px-5 py-4 border-l-[3px] bg-void-1 h-full flex flex-col
                   transition-shadow duration-200 cursor-pointer
                   hover:shadow-[0_8px_24px_rgba(232,64,64,0.18)]"
        style={{
          borderLeftColor: borderColor,
          borderTop:    "1px solid rgba(255,255,255,0.07)",
          borderRight:  "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[20px] leading-none flex-shrink-0">{d.icon}</span>
            <span className="font-syne font-bold text-[15px] text-text-base leading-tight">
              {d.label}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="font-mono text-[11px] font-bold"
              style={{ color: d.trend === "↑" ? "#e84040" : d.trend === "↓" ? "#22c55e" : "rgba(100,116,139,0.7)" }}
            >
              {d.trend}
            </span>
            <LevelBadge level={d.level} />
          </div>
        </div>

        {/* Ark Score row */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9.5px] tracking-[.1em] text-text-mute2 uppercase">
            {t("threat_ark_score")}
          </span>
          <span
            className="font-mono text-[13px] font-bold tabular-nums"
            style={{ color: scoreColor }}
          >
            {d.score}<span className="text-text-mute2 font-normal text-[10px]">/100</span>
          </span>
        </div>

        {/* Score bar */}
        <div className="h-[5px] rounded-full bg-white/[0.07] overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              transformOrigin: "left",
              width:      `${d.score}%`,
              background: scoreColor,
              boxShadow:  `0 0 8px ${scoreColor}40`,
            }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Summary */}
        <p className="font-mono text-[10px] text-text-dim leading-relaxed mb-3">
          {d.summary}
        </p>

        {/* Key drivers */}
        <ul className="space-y-1.5 mb-4 flex-1">
          {d.drivers.map((drv, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                style={{ background: scoreColor }}
              />
              <span className="font-mono text-[9.5px] text-text-mute2 leading-relaxed">{drv}</span>
            </li>
          ))}
        </ul>

        {/* Footer link */}
        <div
          className="flex items-center justify-end pt-3 mt-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span
            className="font-mono text-[9px] tracking-[.1em] uppercase"
            style={{ color: scoreColor }}
          >
            {t("threat_full_analysis")}
          </span>
        </div>
      </motion.article>
    </Link>
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
