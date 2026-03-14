// app/(watchtower)/watchtower/page.tsx
import type { Metadata } from "next";
import Link            from "next/link";
import { DoomsdayClock }      from "@/components/watchtower/doomsday-clock";
import { ThreatGrid }         from "@/components/watchtower/threat-grid";
import { CollapseMatrixRow }  from "@/components/watchtower/collapse-matrix-row";
import { ProvisionerCta }     from "@/components/watchtower/provisioner-cta";
import {
  DOMAINS,
  SIGNALS,
  COLLAPSE_CLASSES,
  type TierClass,
} from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Hub" };

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
        className="relative rounded-xl border p-7 mb-5 overflow-hidden"
        style={{
          background: "linear-gradient(135deg,rgba(232,64,64,0.08),rgba(11,13,24,1))",
          borderColor: "rgba(232,64,64,0.22)",
        }}
      >
        <div className="flex flex-wrap gap-9 items-center">
          {/* Left — copy */}
          <div className="flex-1 min-w-[240px]">
            <p className="font-mono text-[9.5px] text-gold-protocol
                          tracking-[.22em] uppercase mb-3">
              Tevatha Watchtower · Global Fragility Monitor
            </p>
            <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                           leading-[1.12] text-text-base mb-2.5">
              Threat Intelligence{" "}
              <span className="text-red-bright">Command Center</span>
            </h1>
            <p className="text-text-dim text-[13px] leading-relaxed max-w-[460px] mb-4">
              The window between signal and collapse is measured in weeks, not years.
              This is where you read the wall before the writing fades.
            </p>

            {/* Nav quick-links with prefetch */}
            <div className="flex gap-3 flex-wrap">
              {[
                { href:"/watchtower/scenarios", label:"View Scenarios →" },
                { href:"/watchtower/signals",   label:"Signal Feed →"    },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  prefetch
                  className="font-mono text-[11px] text-text-mute2
                             border border-border-protocol rounded-md px-3.5 py-1.5
                             hover:text-text-base hover:border-border-hover
                             transition-all duration-150"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — doomsday clock (client island) */}
          <DoomsdayClock className="flex-shrink-0" />
        </div>
      </section>

      {/* ── THREAT DOMAIN GRID ──────────────────────────────────────── */}
      <section className="mb-5">
        <ThreatGrid domains={DOMAINS} />
      </section>

      {/* ── COLLAPSE PROBABILITY MATRIX ─────────────────────────────── */}
      <section className="bg-void-1 border border-border-protocol rounded-[10px]
                           p-4.5 mb-5">
        <h2 className="font-syne font-bold text-base text-text-base mb-3.5">
          Collapse Probability Matrix — 5-Year Window
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Class","Scenario","5-Yr Probability","Severity","Scenarios"].map((h) => (
                  <th
                    key={h}
                    className="text-left font-mono text-[9.5px] tracking-[.12em]
                               uppercase text-text-mute2 px-3.5 py-2.5
                               border-b border-border-bright whitespace-nowrap
                               bg-white/[0.03]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COLLAPSE_CLASSES.map((row) => (
                // Client island per-row for intersection-triggered bar animation
                <CollapseMatrixRow key={row.cls} row={row} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-[10px] text-text-mute2 mt-2.5 leading-relaxed">
          Methodology: probability of at least one class-qualifying event within
          5-year window. Source: Tevatha Collapse Bible v3 scenario weighting model.
        </p>
      </section>

      {/* ── PRIORITY SIGNAL FEED ────────────────────────────────────── */}
      <section className="bg-void-1 border border-border-protocol rounded-[10px]
                           p-4.5 mb-5">
        <h2 className="font-syne font-bold text-base text-text-base mb-3.5">
          Priority Signal Feed — Ranked by Ark Score
        </h2>

        <div className="divide-y divide-border-protocol">
          {SIGNALS.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-2.5
                         items-center py-2.5 hover:bg-white/[0.018]
                         transition-colors px-1"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`w-[7px] h-[7px] rounded-full flex-shrink-0 mt-1
                               animate-pulse
                               ${s.score >= 90
                                 ? "bg-red-bright shadow-[0_0_6px_#e84040]"
                                 : "bg-amber-protocol shadow-[0_0_6px_#f0a500]"}`}
                />
                <span className="text-[12.5px] text-text-base">{s.sig}</span>
              </div>

              <span className="font-mono text-[10px] text-text-mute2 whitespace-nowrap">
                {s.domain}
              </span>

              <span
                className={`font-mono text-[12px] font-bold tabular-nums
                             ${s.score >= 85 ? "text-red-bright" : "text-amber-protocol"}`}
              >
                {s.score}
              </span>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded
                             font-mono text-[9.5px] font-bold
                             ${TIER_STYLES[s.tier]}`}
              >
                {s.tier.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PREFETCH LINKS — invisible, forces RSC prefetch for nav pages ── */}
      <div className="sr-only" aria-hidden>
        {["/watchtower/scenarios","/watchtower/timeline",
          "/watchtower/signals","/watchtower/gear",
          "/watchtower/psychology","/provisioner",
        ].map((href) => (
          <Link key={href} href={href} prefetch />
        ))}
      </div>

      <ProvisionerCta
        headline="Signals mean nothing without a plan."
        subtext="Your Watchtower read means you see it coming. The Provisioner is how you survive it — gear, sanctuary, and community mapped to your exact threat exposure."
        label="Build Your Sanctuary →"
        urgency="TIER 2 THREAT WINDOW: ACTIVE ACROSS 4 DOMAINS"
      />
    </div>
  );
}
