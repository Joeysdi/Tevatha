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
            5-YEAR FORWARD WINDOW
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
        <div className="px-6 py-3 border-t border-border-protocol bg-white/[0.01]">
          <p className="font-mono text-[10px] text-text-mute2 leading-relaxed">
            Methodology: probability of at least one class-qualifying event within
            5-year window. Source: Tevatha Collapse Bible v3 scenario weighting model.
          </p>
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
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-3
                           items-center py-3 sm:py-3.5 px-4 sm:px-6
                           hover:bg-white/[0.025] transition-colors duration-150"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse
                                 ${s.score >= 90
                                   ? "bg-red-bright shadow-[0_0_8px_#e84040]"
                                   : "bg-amber-protocol shadow-[0_0_8px_#f0a500]"}`}
                  />
                  <span className="text-[12px] sm:text-[13px] text-text-base truncate">{s.sig}</span>
                </div>

                {/* Domain hidden on mobile */}
                <span className="hidden sm:inline font-mono text-[10px] text-text-mute2 whitespace-nowrap">
                  {s.domain}
                </span>

                <span
                  className={`font-mono text-[12px] sm:text-[13px] font-bold tabular-nums
                               ${s.score >= 85 ? "text-red-bright" : "text-amber-protocol"}`}
                >
                  {s.score}
                </span>

                <span
                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md
                               font-mono text-[9px] sm:text-[9.5px] font-bold
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
