// app/(provisioner)/provisioner/scout/page.tsx  →  URL: /provisioner/scout
import type { Metadata } from "next";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import { ScoreForm } from "@/components/provisioner/score-form";

export const metadata: Metadata = { title: "Safe Zone Analysis" };

const ZONE_TIERS = [
  {
    rank: 1,
    label: "Remote",
    sub: "Optimal",
    desc: "50+ miles from population centres. Independent water, food production, and power. Maximum defensibility. Highest initial capital requirement.",
    factors: ["Grid independence","Water autonomy","Food production","Defensibility"],
    col: "text-green-protocol",
    border: "border-green-bright/30",
    bg: "bg-green-dim",
    dot: "bg-green-bright",
  },
  {
    rank: 2,
    label: "Rural",
    sub: "Approved",
    desc: "Low population density, land available for food production. Limited grid dependency. Requires 30–90 day supply buffer minimum.",
    factors: ["Low density","Agriculture land","Well/spring access","Community network"],
    col: "text-gold-bright",
    border: "border-gold-dim",
    bg: "bg-gold-glow",
    dot: "bg-gold-protocol",
  },
  {
    rank: 3,
    label: "Suburban",
    sub: "Conditional",
    desc: "Viable only with pre-positioned supplies and a network of mutual aid neighbours. High evacuation risk during T3+ events.",
    factors: ["Supply stockpile","Evac route","Neighbour network","Solar capability"],
    col: "text-amber-protocol",
    border: "border-amber-DEFAULT/25",
    bg: "bg-amber-dim",
    dot: "bg-amber-protocol",
  },
  {
    rank: 4,
    label: "Urban",
    sub: "Last Resort",
    desc: "Viable only for initial 72-hour windows. High threat density, limited resources, infrastructure collapse risk. Evacuation priority.",
    factors: ["72h supplies","Evac primary","Evac secondary","Rally point"],
    col: "text-red-bright",
    border: "border-red-DEFAULT/25",
    bg: "bg-red-dim",
    dot: "bg-red-bright",
  },
];

const SCORING_FACTORS = [
  { factor:"Water Access",       weight:"25%", desc:"Independent source within 1 mile (well, spring, river). Filtration capacity." },
  { factor:"Grid Independence",  weight:"20%", desc:"Solar, generator, or no-grid capability. Battery or fuel reserve for 30+ days." },
  { factor:"Food Production",    weight:"20%", desc:"Arable land, growing season, livestock viability, seed bank." },
  { factor:"Defensibility",      weight:"15%", desc:"Natural barriers, sightlines, access choke points, community size." },
  { factor:"Medical Access",     weight:"10%", desc:"Distance to trauma care. On-site medical supplies and skills." },
  { factor:"Evac Route Quality", weight:"10%", desc:"Number of independent exit routes, road condition, congestion risk." },
];

export default function ScoutPage() {
  return (
    <div className="space-y-8 sm:space-y-10">

      {/* Hero */}
      <FadeUp>
        <header className="relative rounded-xl border p-6 sm:p-8 overflow-hidden"
          style={{
            background:"linear-gradient(135deg,rgba(201,168,76,0.07),rgba(11,13,24,1))",
            borderColor:"rgba(201,168,76,0.22)",
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
               style={{ background:"linear-gradient(90deg,transparent,#c9a84c,transparent)" }} />
          <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em] uppercase mb-3">
            Provisioner · Safe Zone Analysis
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(24px,5vw,32px)]
                          text-text-base leading-tight mb-3">
            Sanctuary{" "}
            <span className="text-gold-protocol">Scoring Engine</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed max-w-xl mb-5">
            Not all locations survive the same threats. This engine scores your
            current and potential sanctuary locations across 6 weighted factors
            to produce an objective Zone Classification.
          </p>
          <div className="inline-flex items-center gap-2 font-mono text-[9px]
                          text-green-protocol border border-green-bright/30
                          bg-green-dim px-3 py-1.5 rounded-lg tracking-[.1em]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-bright animate-pulse" />
            SCORING ENGINE — ACTIVE
          </div>
        </header>
      </FadeUp>

      {/* Zone classification */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">Zone Classifications</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
        <StaggerParent className="grid gap-3 sm:grid-cols-2">
          {ZONE_TIERS.map((z) => (
            <StaggerChild key={z.rank}>
              <div className={`relative rounded-xl border ${z.border} ${z.bg} p-5 overflow-hidden`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${z.dot}`} />
                    <div>
                      <p className="font-syne font-bold text-[16px] text-text-base leading-tight">
                        {z.label}
                      </p>
                      <p className={`font-mono text-[9px] tracking-[.1em] uppercase ${z.col}`}>
                        {z.sub}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-text-mute2 flex-shrink-0">
                    Zone {z.rank}
                  </span>
                </div>
                <p className="font-mono text-[10.5px] text-text-dim leading-relaxed mb-4">
                  {z.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {z.factors.map((f) => (
                    <span key={f}
                      className="font-mono text-[9px] text-text-mute2 border border-border-protocol
                                 bg-void-1/40 px-2 py-0.5 rounded tracking-[.06em]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>
      </section>

      {/* Scoring factors */}
      <FadeUp delay={0.15}>
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">Scoring Factors</h2>
            <div className="flex-1 h-px bg-border-protocol" />
          </div>
          <div className="bg-void-1 border border-border-protocol rounded-xl overflow-hidden">
            {SCORING_FACTORS.map((f, i) => (
              <div key={f.factor}
                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4
                  ${i < SCORING_FACTORS.length - 1 ? "border-b border-border-protocol" : ""}`}>
                <div className="flex items-center gap-3 sm:w-56 flex-shrink-0">
                  <span className="font-mono text-[10px] text-gold-protocol font-bold
                                   bg-gold-glow border border-gold-dim px-2 py-0.5 rounded
                                   tracking-[.06em] flex-shrink-0">
                    {f.weight}
                  </span>
                  <span className="font-syne font-bold text-[13px] text-text-base">{f.factor}</span>
                </div>
                <p className="font-mono text-[10.5px] text-text-dim leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* Interactive scoring */}
      <FadeUp delay={0.2}>
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">Score Your Location</h2>
            <div className="flex-1 h-px bg-border-protocol" />
          </div>
          <p className="font-mono text-[11px] text-text-mute2 mb-5 leading-relaxed">
            Rate each factor 1 (none) → 5 (excellent) for your current or target location.
            Score updates live and outputs your Zone Classification.
          </p>
          <ScoreForm />
        </section>
      </FadeUp>
    </div>
  );
}
