// app/(watchtower)/watchtower/page.tsx
import type { Metadata } from "next";
import Link            from "next/link";
import { DoomsdayClock }      from "@/components/watchtower/doomsday-clock";
import { ThreatGrid }         from "@/components/watchtower/threat-grid";
import { CollapseMatrixRow }  from "@/components/watchtower/collapse-matrix-row";
import { ProvisionerCta }     from "@/components/watchtower/provisioner-cta";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import {
  DOMAINS,
  SIGNALS,
  COLLAPSE_CLASSES,
  type TierClass,
} from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Hub" };

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="font-syne font-bold text-[17px] text-text-base">{label}</h2>
      <div className="flex-1 h-px bg-border-protocol" />
    </div>
  );
}

const TIER_STYLES: Record<TierClass, string> = {
  t4: "bg-red-protocol/20 text-red-bright",
  t3: "bg-amber-dim text-amber-protocol",
  t2: "bg-blue-dim text-blue-DEFAULT",
  t1: "bg-green-dim text-green-bright",
};

export default function WatchtowerHubPage() {
  return (
    <div>
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section
        className="relative rounded-2xl border p-8 mb-7 overflow-hidden"
        style={{
          background: "linear-gradient(135deg,rgba(232,64,64,0.09) 0%,rgba(11,13,24,0) 60%),rgba(8,12,16,0.9)",
          borderColor: "rgba(232,64,64,0.25)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* RED top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: "linear-gradient(90deg,transparent,rgba(232,64,64,0.6),rgba(201,168,76,0.4),transparent)" }} />

        <div className="flex flex-wrap gap-6 sm:gap-10 items-center">
          {/* Left — copy */}
          <div className="flex-1 min-w-0">
            <StaggerParent>
              <StaggerChild>
                <p className="font-mono text-[9.5px] text-gold-protocol
                              tracking-[.24em] uppercase mb-4 opacity-90">
                  Tevatha Watchtower · Global Fragility Monitor
                </p>
              </StaggerChild>
              <StaggerChild>
                <h1 className="font-syne font-extrabold text-[clamp(24px,5vw,38px)]
                               leading-[1.1] text-text-base mb-3">
                  Threat Intelligence{" "}
                  <span className="text-red-bright">Command Center</span>
                </h1>
              </StaggerChild>
              <StaggerChild>
                <p className="text-text-dim text-[13px] sm:text-[13.5px] leading-relaxed max-w-[480px] mb-6">
                  The window between signal and collapse is measured in weeks, not years.
                  This is where you read the wall before the writing fades.
                </p>
              </StaggerChild>

              {/* Nav quick-links with prefetch */}
              <StaggerChild>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {[
                    { href:"/watchtower/scenarios", label:"View Scenarios" },
                    { href:"/watchtower/signals",   label:"Signal Feed"    },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      prefetch
                      className="inline-flex items-center gap-1.5 font-mono text-[11px]
                                 text-text-dim border border-border-bright/60 rounded-lg
                                 px-3 sm:px-4 py-2 hover:text-text-base hover:border-border-hover
                                 hover:bg-white/[0.04] transition-all duration-200"
                    >
                      {l.label} <span className="text-text-mute2">→</span>
                    </Link>
                  ))}
                </div>
              </StaggerChild>
            </StaggerParent>
          </div>

          {/* Right — doomsday clock (hidden on small phones, shown sm+) */}
          <DoomsdayClock className="flex-shrink-0 hidden sm:block" />
        </div>
      </section>

      {/* ── THREAT DOMAIN GRID ──────────────────────────────────────── */}
      <section className="mb-7">
        <SectionHeader label="Active Threat Domains" />

        {/* Ark Score methodology */}
        <div className="bg-void-1 border border-border-protocol rounded-xl px-4 sm:px-5 py-4 mb-4 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,#e84040,transparent)" }}
          />
          <p className="font-mono text-[9px] text-red-bright tracking-[.16em] uppercase mb-3">
            Ark Score Methodology — Composite Threat Index
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { weight:"40%", label:"Activation Probability", desc:"Probability of disruptive event in 24-month window — academic forecasting + expert consensus + active signal density" },
              { weight:"35%", label:"Impact Severity",        desc:"Magnitude of harm if event occurs: societal collapse (100), infrastructure failure (70), economic disruption (50), localised (10)" },
              { weight:"15%", label:"Trend Velocity",         desc:"Rate of change: accelerating ↑ adds to score, stable → neutral, de-escalating ↓ reduces score relative to baseline" },
              { weight:"10%", label:"Cascade Factor",         desc:"Number of other threat domains the event simultaneously activates — higher cross-domain cascade = higher multiplier" },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-bold text-gold-protocol">{f.weight}</span>
                  <span className="font-mono text-[9px] text-text-base font-bold">{f.label}</span>
                </div>
                <p className="font-mono text-[9px] text-text-mute2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/[0.05]">
            {[
              { range:"≥ 90", label:"CRITICAL", color:"text-red-bright" },
              { range:"70–89", label:"HIGH",     color:"text-amber-protocol" },
              { range:"50–69", label:"ELEVATED", color:"text-blue-DEFAULT" },
              { range:"< 50",  label:"MODERATE", color:"text-green-protocol" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5">
                <span className={`font-mono text-[10px] font-bold tabular-nums ${b.color}`}>{b.range}</span>
                <span className={`font-mono text-[9px] tracking-[.08em] ${b.color}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <ThreatGrid domains={DOMAINS} />
      </section>



      {/* ── COLLAPSE PROBABILITY MATRIX ─────────────────────────────── */}
      <FadeUp delay={0.15}>
      <section className="bg-void-1 border border-border-protocol rounded-2xl
                           overflow-hidden mb-7"
               style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        <div className="px-6 py-4 border-b border-border-protocol bg-white/[0.02]">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            Collapse Probability Matrix
          </h2>
          <p className="font-mono text-[10px] text-text-mute2 tracking-[.08em] mt-0.5">
            5-YEAR FORWARD WINDOW · 2026–2031 · 75 SCENARIOS MODELLED
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Class","Scenario","5-Yr Probability","Severity","Scenarios"].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono text-[9.5px] tracking-[.12em]
                               uppercase text-text-mute2 px-4 py-3
                               border-b border-border-bright whitespace-nowrap
                               bg-white/[0.02]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLLAPSE_CLASSES.map((row) => (
                <CollapseMatrixRow key={row.cls} row={row} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 sm:px-6 py-4 border-t border-border-protocol bg-white/[0.01]">
          <p className="font-mono text-[9px] text-gold-protocol tracking-[.14em] uppercase mb-2">
            Probability Methodology
          </p>
          <p className="font-mono text-[10px] text-text-dim leading-relaxed mb-3">
            Each probability represents the likelihood of <strong className="text-text-base">at least one class-qualifying event</strong> within a 5-year forward window (2026–2031), not the probability of full societal collapse. Events are modelled independently.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Historical Base Rate",    desc:"Equivalent-class events per decade since 1900, converted to 5-yr probability" },
              { label:"Expert Consensus",         desc:"Aggregated from RAND, CSIS, CFR, Superforecasting panels — median estimate used" },
              { label:"Signal Density",           desc:"Active precursor indicators per class, weighted by lead-time to event" },
              { label:"Scenario Modelling",       desc:"Tevatha Collapse Bible v3 — 75 scenarios, 6 classes, probability-weighted cascade chains" },
            ].map((m) => (
              <div key={m.label}>
                <p className="font-mono text-[9px] text-text-base font-bold mb-0.5">{m.label}</p>
                <p className="font-mono text-[9px] text-text-mute2 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeUp>

      {/* ── PRIORITY SIGNAL FEED ────────────────────────────────────── */}
      <FadeUp delay={0.2}>
      <section className="bg-void-1 border border-border-protocol rounded-2xl
                           overflow-hidden mb-7"
               style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        <div className="px-6 py-4 border-b border-border-protocol bg-white/[0.02]">
          <h2 className="font-syne font-bold text-[17px] text-text-base">
            Priority Signal Feed
          </h2>
          <p className="font-mono text-[10px] text-text-mute2 tracking-[.08em] mt-0.5">
            RANKED BY ARK SCORE
          </p>
        </div>

        <StaggerParent className="divide-y divide-border-protocol">
          {SIGNALS.map((s, i) => (
            <StaggerChild key={i}>
              <div
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4
                           items-start py-3 sm:py-3.5 px-4 sm:px-6
                           hover:bg-white/[0.025] transition-colors duration-150"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse mt-1
                                 ${s.score >= 90
                                   ? "bg-red-bright shadow-[0_0_8px_#e84040]"
                                   : "bg-amber-protocol shadow-[0_0_8px_#f0a500]"}`}
                  />
                  <div className="min-w-0">
                    <span className="text-[11.5px] sm:text-[13px] text-text-base block leading-snug">{s.sig}</span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[8px] sm:text-[8.5px] text-text-mute2/60 hover:text-red-bright/70 transition-colors truncate block mt-0.5"
                    >
                      {s.source} ↗
                    </a>
                  </div>
                </div>

                {/* Domain hidden on mobile */}
                <span className="hidden sm:inline font-mono text-[10px] text-text-mute2 whitespace-nowrap">
                  {s.domain}
                </span>

                <span
                  className={`font-mono text-[12px] sm:text-[13px] font-bold tabular-nums min-w-[2ch] text-right
                               ${s.score >= 85 ? "text-red-bright" : "text-amber-protocol"}`}
                >
                  {s.score}
                </span>

                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md
                               font-mono text-[9px] font-bold whitespace-nowrap
                               ${TIER_STYLES[s.tier]}`}
                >
                  {s.tier.toUpperCase()}
                </span>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>
      </section>
      </FadeUp>

      {/* ── PREFETCH LINKS — invisible, forces RSC prefetch for nav pages ── */}
      <div className="sr-only" aria-hidden>
        {["/watchtower/scenarios","/watchtower/timeline",
          "/watchtower/signals","/watchtower/gear",
          "/watchtower/psychology","/provisioner",
        ].map((href) => (
          <Link key={href} href={href} prefetch />
        ))}
      </div>

      <FadeUp delay={0.3}>
        <ProvisionerCta
          headline="Signals mean nothing without a plan."
          subtext="Your Watchtower read means you see it coming. The Provisioner is how you survive it — gear, sanctuary, and community mapped to your exact threat exposure."
          label="Build Your Sanctuary →"
          urgency="TIER 2 THREAT WINDOW: ACTIVE ACROSS 4 DOMAINS"
        />
      </FadeUp>
    </div>
  );
}
