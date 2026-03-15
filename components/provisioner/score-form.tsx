"use client";

import { useState } from "react";

const FACTORS = [
  { id:"water",   label:"Water Access",       weight:0.25, desc:"Independent source within 1 mile — well, spring, or river with filtration" },
  { id:"grid",    label:"Grid Independence",  weight:0.20, desc:"Solar, generator, or fully off-grid capability with 30+ day fuel/battery" },
  { id:"food",    label:"Food Production",    weight:0.20, desc:"Arable land available, viable growing season, livestock capability" },
  { id:"defend",  label:"Defensibility",      weight:0.15, desc:"Natural barriers, sightlines, access choke points, community size" },
  { id:"medical", label:"Medical Access",     weight:0.10, desc:"Distance to trauma care, on-site medical supplies and trained personnel" },
  { id:"evac",    label:"Evac Route Quality", weight:0.10, desc:"Number of independent exit routes, road condition, congestion risk" },
] as const;

type FactorId = (typeof FACTORS)[number]["id"];

const SCORE_LABEL = ["", "None", "Poor", "Acceptable", "Good", "Excellent"] as const;

const ZONES = [
  { min:80, rank:1, label:"Remote",   sub:"Optimal",     col:"text-green-protocol",  border:"border-green-bright/30",    bg:"bg-green-dim",   bar:"#1ae8a0" },
  { min:60, rank:2, label:"Rural",    sub:"Approved",    col:"text-gold-bright",     border:"border-gold-dim",            bg:"bg-gold-glow",   bar:"#c9a84c" },
  { min:40, rank:3, label:"Suburban", sub:"Conditional", col:"text-amber-protocol",  border:"border-amber-DEFAULT/25",    bg:"bg-amber-dim",   bar:"#f0a500" },
  { min:0,  rank:4, label:"Urban",    sub:"Last Resort", col:"text-red-bright",      border:"border-red-DEFAULT/25",      bg:"bg-red-dim",     bar:"#e84040" },
];

const IMPROVEMENT_TIPS: Record<FactorId, string> = {
  water:   "Drill a well, identify and test a nearby spring, or build a 10,000L rainwater collection system.",
  grid:    "Install 400W+ solar with LiFePO4 battery bank. Keep 90 days of generator fuel rotated.",
  food:    "Begin raised bed cultivation. Target 1 acre per 4 adults minimum for caloric sufficiency.",
  defend:  "Build community of 15–30 vetted individuals. Natural perimeter is more valuable than fencing.",
  medical: "Maintain MyMedic FAK + trauma kit. Complete Stop-the-Bleed and Wilderness First Aid courses.",
  evac:    "Map and drive 3 independent exit routes. Pre-plan rally points at 25mi, 100mi, and 300mi.",
};

export function ScoreForm() {
  const [scores, setScores] = useState<Record<FactorId, number>>(
    Object.fromEntries(FACTORS.map((f) => [f.id, 0])) as Record<FactorId, number>
  );

  const answered = FACTORS.filter((f) => scores[f.id] > 0).length;

  const totalScore = Math.round(
    FACTORS.reduce((sum, f) => sum + (scores[f.id] / 5) * 100 * f.weight, 0)
  );

  const zone      = answered === FACTORS.length
    ? ZONES.find((z) => totalScore >= z.min) ?? ZONES[ZONES.length - 1]
    : null;

  const weakFactors = FACTORS.filter((f) => scores[f.id] > 0 && scores[f.id] <= 2);

  return (
    <div className="space-y-5">

      {/* Question rows */}
      <div className="bg-void-1 border border-border-protocol rounded-xl overflow-hidden">
        {FACTORS.map((f, i) => (
          <div
            key={f.id}
            className={`px-4 sm:px-5 py-4
              ${i < FACTORS.length - 1 ? "border-b border-border-protocol" : ""}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-syne font-bold text-[13px] text-text-base">{f.label}</span>
                  <span className="font-mono text-[8.5px] text-gold-protocol bg-gold-glow
                                   border border-gold-dim px-1.5 py-0.5 rounded">
                    {Math.round(f.weight * 100)}%
                  </span>
                </div>
                <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">{f.desc}</p>
              </div>
              {scores[f.id] > 0 && (
                <span className="font-mono text-[10px] text-cyan-DEFAULT flex-shrink-0 mt-1">
                  {SCORE_LABEL[scores[f.id]]}
                </span>
              )}
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              {([1, 2, 3, 4, 5] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setScores((s) => ({ ...s, [f.id]: v }))}
                  className={`flex-1 py-2 rounded-lg font-mono text-[11px] font-bold
                              border transition-all duration-150
                    ${scores[f.id] === v
                      ? "bg-cyan-DEFAULT/15 border-cyan-DEFAULT text-cyan-DEFAULT"
                      : "border-border-protocol text-text-mute2 hover:border-border-bright hover:text-text-base"
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress / result */}
      {answered > 0 && (
        <div
          className={`relative rounded-xl border p-5 sm:p-6 overflow-hidden
            ${zone ? `${zone.border} ${zone.bg}` : "border-border-protocol bg-void-1"}`}
        >
          {zone && (
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg,${zone.bar},transparent)` }}
            />
          )}

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.12em] uppercase mb-1">
                {answered < FACTORS.length
                  ? `${answered} of ${FACTORS.length} factors rated`
                  : "Zone Classification"}
              </p>
              {zone ? (
                <>
                  <p className={`font-syne font-extrabold text-[30px] leading-none ${zone.col}`}>
                    {zone.label}
                  </p>
                  <p className={`font-mono text-[10px] tracking-[.1em] uppercase mt-1 ${zone.col}`}>
                    Zone {zone.rank} · {zone.sub}
                  </p>
                </>
              ) : (
                <p className="font-syne font-bold text-[18px] text-text-base">
                  Rate all 6 factors
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono text-[36px] sm:text-[40px] font-bold text-text-base
                             leading-none tabular-nums">
                {totalScore}
              </p>
              <p className="font-mono text-[10px] text-text-mute2">/100</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="h-2 rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${answered < FACTORS.length ? (answered / FACTORS.length) * 100 : totalScore}%`,
                background: zone ? zone.bar : "#00d4ff",
              }}
            />
          </div>

          {/* Weak factors */}
          {zone && weakFactors.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.14em] uppercase">
                Highest Priority Improvements
              </p>
              {weakFactors.map((f) => (
                <div key={f.id} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-red-bright flex-shrink-0 mt-0.5">⚠</span>
                  <div>
                    <p className="font-mono text-[10px] text-text-base font-bold mb-0.5">{f.label}</p>
                    <p className="font-mono text-[10px] text-text-dim leading-relaxed">
                      {IMPROVEMENT_TIPS[f.id]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Perfect score */}
          {zone && zone.rank === 1 && weakFactors.length === 0 && (
            <p className="mt-4 font-mono text-[11px] text-green-protocol text-center">
              ✓ Zone 1 capability confirmed. Maintain and document.
            </p>
          )}
        </div>
      )}

      {answered === 0 && (
        <p className="font-mono text-[10px] text-text-mute2 text-center">
          Rate each factor 1–5 to calculate your Zone Classification
        </p>
      )}
    </div>
  );
}
