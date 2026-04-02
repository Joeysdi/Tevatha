"use client";
// components/watchtower/sub-index-bar.tsx
// Sub-index breakdown panel — shown in the intel panel when a domain is selected.

import type { SubIndex } from "@/lib/watchtower/domain-score";

interface SubIndexPanelProps {
  subIndices: SubIndex[];
  col:        string;  // domain accent color hex
  liveScore:  number;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#e84040";
  if (score >= 65) return "#f0a500";
  if (score >= 45) return "#c9a84c";
  return "#1ae8a0";
}

export function SubIndexPanel({ subIndices, col, liveScore }: SubIndexPanelProps) {
  return (
    <div className="px-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-3 rounded-full" style={{ background: col }} />
          <p className="font-mono text-[9px] tracking-[.16em] uppercase" style={{ color: `${col}99` }}>
            Score Breakdown
          </p>
        </div>
        <p className="font-mono text-[9px] text-text-mute2/50 tracking-[.1em]">
          COMPOSITE: <span className="text-text-dim">{liveScore}/100</span>
        </p>
      </div>

      {/* Sub-index rows */}
      <div className="space-y-2.5">
        {subIndices.map((si) => (
          <div key={si.label}>
            {/* Label row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9.5px] text-text-dim tracking-[.05em]">
                  {si.label}
                </span>
                {si.isLive && (
                  <span
                    className="font-mono text-[7px] tracking-[.1em] px-1 py-px rounded"
                    style={{ background: "rgba(26,232,160,0.12)", color: "#1ae8a0" }}
                  >
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-[9px] text-text-mute2/60"
                  title={`weight: ${Math.round(si.weight * 100)}%`}
                >
                  ×{Math.round(si.weight * 100)}%
                </span>
                <span
                  className="font-mono text-[10px] font-bold tabular-nums w-6 text-right"
                  style={{ color: scoreColor(si.score) }}
                >
                  {si.score}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="relative h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${si.score}%`,
                  background: `linear-gradient(90deg, ${scoreColor(si.score)}66, ${scoreColor(si.score)})`,
                }}
              />
            </div>

            {/* Source */}
            <p className="font-mono text-[8px] text-text-mute2/40 mt-0.5 truncate">
              {si.source}
            </p>
          </div>
        ))}
      </div>

      {/* Contribution summary */}
      <div
        className="mt-3 pt-2 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex gap-2 flex-wrap">
          {subIndices.map((si) => (
            <span key={si.label} className="font-mono text-[8px] text-text-mute2/50">
              <span style={{ color: scoreColor(si.score) }}>{si.contribution}</span>
              <span className="text-text-mute2/30"> +</span>
            </span>
          ))}
        </div>
        <span
          className="font-mono text-[10px] font-bold"
          style={{ color: col }}
        >
          = {liveScore}
        </span>
      </div>

      {/* Methodology note */}
      <p className="font-mono text-[7.5px] text-text-mute2/35 mt-2 leading-relaxed">
        Live: VIX · DXY · T-bill · news feed · Static anchors: {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
      </p>
    </div>
  );
}
