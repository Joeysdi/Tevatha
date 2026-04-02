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
    description: "The Doomsday Clock is at 85 seconds — all-time closest in the clock's 79-year history (BAS, Jan 27, 2026). On February 5, 2026, New START — the last US-Russia nuclear arms control treaty — expired. No legally binding framework now governs either nation's nuclear stockpile. Russia lowered its nuclear use threshold to 'critical threat to sovereignty'. China is constructing hundreds of ICBM silos, projecting 1,000+ warheads by 2030 — the largest nuclear build-up since the Cold War. A single detonation anywhere triggers Ark protocol immediately. No delay. No exceptions.",
    scenarioIds: ["S05", "S09"],
    signalDomain: "Nuclear",
    gateIds: ["G1", "G2", "G3", "G5"],
    watchFor: ["New US-Russia nuclear talks or absence thereof", "China ICBM silo completion reports", "DPRK seventh nuclear test preparation signals", "Any nuclear detonation anywhere on Earth", "High-altitude missile test by any nation (EMP precursor)"],
  },
  economic: {
    description: "US gross national debt reached $38.43 trillion as of January 2026 (~124% of GDP), growing at $8 billion per day. Interest payments now consume nearly one-fifth of all federal revenue — a structural fiscal trap. CBO projects debt will exceed the 1946 wartime peak of 106% by 2036. Banking system unrealized losses remain elevated at $306 billion (Q4 2025). 137 countries are exploring CBDCs; the EU Digital Euro targets 2029 legislation. The US halted retail CBDC development under Trump executive order — but 24 emerging markets face bond maturity cliffs by 2027.",
    scenarioIds: ["S01", "S03"],
    signalDomain: "Economic",
    gateIds: ["G4", "G7", "G8"],
    watchFor: ["US 10-yr Treasury yield >5.5% sustained 30+ days (currently 4.19%)", "VIX >45 sustained", "G7 bank bail-in announcements", "EU Digital Euro mandatory adoption timeline announced", "IMF emergency convening — sovereign debt cascade"],
  },
  civil: {
    description: "CFR's 2026 Conflict Risk Assessment rates growing political violence and civil unrest in the United States as a high-likelihood, high-impact event. China conducted its most extensive military drills around Taiwan ever on December 29, 2025, simulating a complete blockade — CFR rates a 2026 Taiwan Strait crisis at even-money. Russia-Ukraine war continues with no viable ceasefire; the US severed direct aid, deepening the US-Europe rift. NATO's eastern flank cohesion is under active stress. The multipolar restructuring of power begun in 2022 has a 10–20 year arc.",
    scenarioIds: ["S07", "S09"],
    signalDomain: "Geopolitical",
    gateIds: ["G2", "G3"],
    watchFor: ["Taiwan Strait naval blockade declaration", "US emergency powers invoked without legislature", "NATO Article 5 formal invocation", "Ukraine ceasefire or collapse of frontlines", "China-Taiwan diplomatic breakdown acceleration"],
  },
  cyber: {
    description: "Salt Typhoon, linked to China's Ministry of State Security, has compromised at least 9 major US telecom companies and 200+ organizations across 80+ countries. As of February 2026, the FBI states the campaign is 'still very much ongoing'. Volt Typhoon (PRC) has been pre-positioning inside US critical infrastructure — power grids, water systems, transport — for potential wartime disruption activation. Israel's AI targeting systems (Lavender, Habsora) have deployed autonomous kill-chain decisions with ~20 seconds of human review. The UN resolution for a legally binding autonomous weapons treaty was rejected by the US and Russia.",
    scenarioIds: ["S05"],
    signalDomain: "Cyber",
    gateIds: ["G1", "G5"],
    watchFor: ["Salt Typhoon / Volt Typhoon activation events (grid or water)", "Internet shutdown in any G20 nation", "Power grid intrusion events in G7", "State actor cyberweapon deployment announcement", "CISA emergency critical infrastructure advisory"],
  },
  bio: {
    description: "H5N1 bird flu has recorded 70 confirmed human cases in the US (March 2024 – June 2025) with no sustained human-to-human transmission confirmed. Scientists describe the situation in animal reservoirs as 'completely out of control'. Historical global CFR: ~48% (WHO 2003–2025). Even at 5% post-adaptation CFR, global health systems collapse within 8 weeks of sustained transmission. A novel recombinant MPXV strain (combining clade Ib and IIb genomic elements) was detected in India, January 13, 2026 — with clade Ib carrying a 3–4% CFR vs <1% for the 2022 outbreak strain.",
    scenarioIds: ["S10"],
    signalDomain: "Biological",
    gateIds: ["G6"],
    watchFor: ["H5N1 confirmed in healthcare workers with no animal contact", "WHO PHEIC for respiratory pathogen", "Hospital capacity >120% in any G7 nation", "Recombinant MPXV spread beyond India — international clusters", "H5N1 mammal-to-mammal transmission acceleration"],
  },
  climate: {
    description: "Arctic sea ice extent reached its second-lowest level ever recorded as of March 1, 2026 — with sea ice volume the lowest on record. WFP reports 20% more people facing acute food insecurity since 2020, with weather-driven cases tripling to 96 million. Climate-related food price increases are rising at 4× the rate of non-climate-impacted foods. Argentina's Pampas region faces a severe drought threatening grain output. Black Sea wheat winterkill events occurred in late January/February 2026. La Niña patterns remain active. The FAO Global Emergency Appeal for 2026 has been issued.",
    scenarioIds: [],
    signalDomain: "Climate",
    gateIds: [],
    watchFor: ["Global grain futures spike >40% in 60 days", "Argentina Pampas harvest loss confirmation", "Black Sea wheat export disruption from winterkill", "La Niña strengthening reports affecting key growing regions", "FAO food price index monthly reports"],
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
  if (!domain) return { title: "Threat Analysis" };
  const meta = DOMAIN_META[domain.id];
  return {
    title: `${domain.label} Threat Analysis — Score ${domain.score}/100`,
    description: meta?.description.slice(0, 160) ?? `${domain.label} threat domain analysis. Current score: ${domain.score}/100 ${domain.level}.`,
    openGraph: {
      title: `${domain.label} — ${domain.score}/100 ${domain.level} · Tevatha Watchtower`,
      description: meta?.description.slice(0, 200),
    },
    alternates: { canonical: `/watchtower/threats/${id}` },
  };
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${domain.label} Threat Analysis — Score ${domain.score}/100`,
    "description": meta.description.slice(0, 200),
    "author": { "@type": "Organization", "name": "Tevatha", "url": "https://tevatha.com" },
    "publisher": { "@type": "Organization", "name": "Tevatha", "url": "https://tevatha.com" },
    "url": `https://tevatha.com/watchtower/threats/${domain.id}`,
    "mainEntityOfPage": `https://tevatha.com/watchtower/threats/${domain.id}`,
    "dateModified": new Date().toISOString().split("T")[0],
    "about": {
      "@type": "Thing",
      "name": domain.label,
      "description": meta.description,
    },
  };

  const faqSchema = meta.watchFor.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": meta.watchFor.map((w) => ({
      "@type": "Question",
      "name": `What should I watch for regarding ${domain.label.toLowerCase()} threats?`,
      "acceptedAnswer": { "@type": "Answer", "text": w },
    })),
  } : null;

  return (
    <div className="space-y-7 sm:space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

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
