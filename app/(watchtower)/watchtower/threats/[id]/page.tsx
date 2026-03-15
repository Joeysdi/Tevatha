// app/(watchtower)/watchtower/threats/[id]/page.tsx  →  URL: /watchtower/threats/:id
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  DOMAINS, SIGNALS, SCENARIOS, GATES,
} from "@/lib/watchtower/data";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";

// ── Per-domain metadata ──────────────────────────────────────────────────────

const DOMAIN_META: Record<string, {
  description: string;
  scenarioIds: string[];
  signalDomain: string;
  gateIds: string[];
  watchFor: string[];
}> = {
  nuclear: {
    description: "Nuclear and EMP threats represent existential-level risk. A single detonation anywhere triggers Ark protocol immediately — no delay, no exceptions. A high-altitude EMP can disable power grid infrastructure for weeks to months, causing cascade failure across food, water, and hospital systems.",
    scenarioIds: ["S05", "S09"],
    signalDomain: "Nuclear",
    gateIds: ["G1", "G2", "G3", "G5"],
    watchFor: ["DEFCON level changes", "Nuclear testing by any nation", "Doomsday Clock movement", "EMP-capable weapon deployments", "High-altitude missile tests"],
  },
  economic: {
    description: "The global financial architecture is structurally fragile. US debt at 123% GDP, $600B+ unrealised bank losses unresolved since 2023, and active CBDC rollout across all G7 nations create three simultaneous vectors for financial system disruption — any one of which is sufficient.",
    scenarioIds: ["S01", "S03"],
    signalDomain: "Economic",
    gateIds: ["G4", "G7", "G8"],
    watchFor: ["US 10-yr yield >5.5% sustained 30+ days", "VIX >45 sustained", "G7 bank bail-in announcements", "CBDC mandatory adoption timelines", "IMF emergency meetings"],
  },
  civil: {
    description: "Political scientists put active civil violence probability in the US at 30–35% through 2028. NATO cohesion is under measurable stress. The multipolar restructuring of global power begun in 2022 has a 10–20 year arc — this is not a short-term threat window.",
    scenarioIds: ["S07", "S09"],
    signalDomain: "Geopolitical",
    gateIds: ["G2", "G3"],
    watchFor: ["Election results disputed by incumbents", "Emergency powers without legislature", "State nullification movements (10+ states)", "Taiwan Strait naval movements", "Militia mobilisation in 3+ states"],
  },
  cyber: {
    description: "No binding international AI safety treaty exists. Russia, China, and DPRK maintain active cyberweapon programs targeting critical infrastructure. A coordinated attack or high-altitude EMP event can collapse power grids for weeks — initiating simultaneous cascade failures in food, water, and hospital systems.",
    scenarioIds: ["S05"],
    signalDomain: "Cyber",
    gateIds: ["G1", "G5"],
    watchFor: ["Critical infrastructure cyberattacks in G7", "Internet shutdown in any G20 nation", "AI battlefield deployment announcements", "Power grid intrusion events", "Water treatment facility attacks"],
  },
  bio: {
    description: "H5N1 currently has a ~52% case fatality rate in human cases. Even at 5% post-adaptation CFR — a very conservative estimate — global health systems collapse within 8 weeks of sustained human-to-human transmission. The WHO is actively monitoring multi-country human clusters.",
    scenarioIds: ["S10"],
    signalDomain: "Biological",
    gateIds: ["G6"],
    watchFor: ["H5N1 confirmed in healthcare workers with no animal contact", "WHO PHEIC for respiratory pathogen", "Hospital capacity >120% in any G7 nation", "Community transmission in 3+ countries simultaneously"],
  },
  climate: {
    description: "Climate cascade effects are slower onset but irreversible in trajectory. Breadbasket droughts, sea level disruption, and supply chain fragility compound every other threat vector — acting as a force multiplier. The Q2 2026 food risk window is active.",
    scenarioIds: [],
    signalDomain: "Climate",
    gateIds: [],
    watchFor: ["Global grain index movements", "Breadbasket drought indices", "Arctic amplification acceleration", "Supply chain food disruptions", "Wildfire smoke crop impact reports"],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<string, string> = {
  CRITICAL: "#e84040",
  HIGH:     "#f0a500",
  ELEVATED: "#38bdf8",
  MODERATE: "#22c55e",
};

const LEVEL_TEXT: Record<string, string> = {
  CRITICAL: "text-red-bright",
  HIGH:     "text-amber-protocol",
  ELEVATED: "text-cyan-DEFAULT",
  MODERATE: "text-green-protocol",
};

const SEV_LABEL: Record<string, string> = {
  EX: "EXISTENTIAL", CR: "CRITICAL", HI: "HIGH", EL: "ELEVATED", ME: "MODERATE",
};

const TIER_STYLE: Record<string, string> = {
  t4: "text-red-bright border-red-DEFAULT/30 bg-red-dim",
  t3: "text-amber-protocol border-amber-DEFAULT/25 bg-amber-dim",
  t2: "text-blue-DEFAULT border-blue-DEFAULT/22 bg-blue-dim",
  t1: "text-green-protocol border-green-bright/30 bg-green-dim",
};

// ── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ id: d.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const domain = DOMAINS.find((d) => d.id === id);
  return { title: domain ? `${domain.label} — Threat Analysis` : "Threat Analysis" };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ThreatDomainPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const domain = DOMAINS.find((d) => d.id === id);
  if (!domain) notFound();

  const meta      = DOMAIN_META[domain.id] ?? null;
  if (!meta) notFound();

  const scoreColor  = LEVEL_COLOR[domain.level] ?? "#00d4ff";
  const scoreText   = LEVEL_TEXT[domain.level]  ?? "text-cyan-DEFAULT";
  const signals     = SIGNALS.filter((s) => s.domain === meta.signalDomain);
  const scenarios   = SCENARIOS.filter((s) => meta.scenarioIds.includes(s.id));
  const gates       = GATES.filter((g) => meta.gateIds.includes(g.id));

  return (
    <div className="space-y-7 sm:space-y-8">

      {/* Back link */}
      <Link
        href="/watchtower"
        className="inline-flex items-center gap-2 font-mono text-[10px] text-text-mute2
                   hover:text-text-base transition-colors tracking-[.1em]"
      >
        ← WATCHTOWER HUB
      </Link>

      {/* Domain header */}
      <FadeUp>
        <header
          className="relative rounded-xl border overflow-hidden p-6 sm:p-8"
          style={{
            borderColor: `${scoreColor}30`,
            background: `linear-gradient(135deg,${scoreColor}0d 0%,rgba(11,13,24,1) 60%)`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg,${scoreColor},transparent)` }}
          />

          <div className="flex items-start gap-4 mb-5">
            <span className="text-[40px] sm:text-[48px] leading-none flex-shrink-0">{domain.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9.5px] text-text-mute2 tracking-[.2em] uppercase mb-2">
                Watchtower · Threat Domain Analysis
              </p>
              <h1 className="font-syne font-extrabold text-[clamp(22px,5vw,34px)]
                              text-text-base leading-tight">
                {domain.label}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`font-mono text-[28px] sm:text-[32px] font-bold tabular-nums leading-none ${scoreText}`}>
                {domain.score}
                <span className="text-text-mute2 font-normal text-[12px]">/100</span>
              </span>
              <span className={`font-mono text-[9px] font-bold tracking-[.1em] uppercase ${scoreText}`}>
                {domain.level} {domain.trend}
              </span>
            </div>
          </div>

          {/* Score bar */}
          <div className="h-2 rounded-full bg-black/25 overflow-hidden mb-5">
            <div
              className="h-full rounded-full"
              style={{
                width: `${domain.score}%`,
                background: scoreColor,
                boxShadow: `0 0 12px ${scoreColor}60`,
              }}
            />
          </div>

          <p className="font-mono text-[11.5px] text-text-dim leading-relaxed">
            {meta.description}
          </p>
        </header>
      </FadeUp>

      {/* Watch For */}
      <FadeUp delay={0.05}>
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">Watch For</h2>
            <div className="flex-1 h-px bg-border-protocol" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {meta.watchFor.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-void-1 border border-border-protocol
                           rounded-lg px-4 py-3"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 animate-pulse"
                  style={{ background: scoreColor, boxShadow: `0 0 6px ${scoreColor}` }}
                />
                <span className="font-mono text-[11px] text-text-dim leading-relaxed">{w}</span>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* Active Signals */}
      {signals.length > 0 && (
        <FadeUp delay={0.1}>
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-syne font-bold text-[17px] text-text-base">Active Signals</h2>
              <div className="flex-1 h-px bg-border-protocol" />
            </div>
            <div className="bg-void-1 border border-border-protocol rounded-xl overflow-hidden">
              {signals.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 px-4 sm:px-5 py-3.5
                    ${i < signals.length - 1 ? "border-b border-border-protocol" : ""}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 animate-pulse
                      ${s.score >= 90
                        ? "bg-red-bright shadow-[0_0_8px_#e84040]"
                        : s.score >= 75
                          ? "bg-amber-protocol shadow-[0_0_8px_#f0a500]"
                          : "bg-cyan-DEFAULT"}`}
                  />
                  <p className="flex-1 font-mono text-[11px] sm:text-[11.5px] text-text-base leading-relaxed">
                    {s.sig}
                  </p>
                  <span
                    className={`font-mono text-[12px] font-bold tabular-nums flex-shrink-0
                      ${s.score >= 85 ? "text-red-bright" : "text-amber-protocol"}`}
                  >
                    {s.score}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>
      )}

      {/* Related Scenarios */}
      {scenarios.length > 0 && (
        <FadeUp delay={0.15}>
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-syne font-bold text-[17px] text-text-base">Related Scenarios</h2>
              <div className="flex-1 h-px bg-border-protocol" />
              <Link
                href="/watchtower/scenarios"
                className="font-mono text-[10px] text-text-mute2 hover:text-text-base
                           transition-colors flex-shrink-0"
              >
                All →
              </Link>
            </div>
            <StaggerParent className="grid gap-4 sm:grid-cols-2">
              {scenarios.map((s) => (
                <StaggerChild key={s.id}>
                  <div className="bg-void-1 border border-border-protocol rounded-xl p-5 h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-[22px] leading-none flex-shrink-0">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[9px] text-text-mute2 tracking-[.1em]">
                          {s.id} · {s.window}
                        </p>
                        <h3 className="font-syne font-bold text-[15px] text-text-base">
                          {s.title}
                        </h3>
                      </div>
                      <span
                        className="font-mono text-[9px] font-bold border px-2 py-0.5 rounded
                                   text-amber-protocol border-amber-DEFAULT/25 bg-amber-dim
                                   flex-shrink-0 whitespace-nowrap"
                      >
                        {s.prob}% · {SEV_LABEL[s.sev] ?? s.sev}
                      </span>
                    </div>

                    <p className="font-mono text-[11px] text-text-dim leading-relaxed mb-4">
                      {s.summary}
                    </p>

                    <div>
                      <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.14em]
                                     uppercase mb-2">
                        Priority Actions
                      </p>
                      <div className="space-y-1.5">
                        {s.mitigation.filter((m) => m.pri === "1").slice(0, 2).map((m, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-gold-DEFAULT font-mono text-[11px] flex-shrink-0">→</span>
                            <span className="font-mono text-[10.5px] text-text-dim">
                              {m.action}
                              <span className="text-text-mute2 ml-1">({m.cost})</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </StaggerChild>
              ))}
            </StaggerParent>
          </section>
        </FadeUp>
      )}

      {/* Decision Gates */}
      {gates.length > 0 && (
        <FadeUp delay={0.2}>
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-syne font-bold text-[17px] text-text-base">Decision Gates</h2>
              <div className="flex-1 h-px bg-border-protocol" />
              <p className="font-mono text-[9px] text-text-mute2 flex-shrink-0">
                EXECUTE ON TRIGGER — NO DELAY
              </p>
            </div>
            <div className="bg-void-1 border border-border-protocol rounded-xl overflow-hidden">
              {gates.map((g, i) => (
                <div
                  key={g.id}
                  className={`flex flex-col sm:flex-row gap-3 sm:gap-5 px-5 py-4
                    ${i < gates.length - 1 ? "border-b border-border-protocol" : ""}`}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[10px] text-text-mute2 w-6">{g.id}</span>
                    <span
                      className={`font-mono text-[9px] font-bold border px-2 py-0.5 rounded
                                   tracking-[.08em] ${TIER_STYLE[g.tier]}`}
                    >
                      {g.tier.toUpperCase()}
                    </span>
                    <span className="font-mono text-[9px] text-text-mute2 sm:hidden">
                      {g.window}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] text-text-base mb-1">{g.trigger}</p>
                    <p className="font-mono text-[10.5px] text-gold-DEFAULT">{g.action}</p>
                  </div>
                  <span className="hidden sm:block font-mono text-[9px] text-text-mute2
                                   flex-shrink-0 text-right pt-0.5">
                    {g.window}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>
      )}

    </div>
  );
}
