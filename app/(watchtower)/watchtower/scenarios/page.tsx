// app/(watchtower)/watchtower/scenarios/page.tsx
import type { Metadata } from "next";
import { ScenarioAccordion } from "@/components/watchtower/scenario-accordion";
import { ProvisionerCta }    from "@/components/watchtower/provisioner-cta";
import { SCENARIOS }          from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Scenarios" };

export default function ScenariosPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em]
                       uppercase mb-3">
          2025–2027 Scenario Analysis
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                       leading-[1.12] text-text-base mb-2">
          Critical Window{" "}
          <span className="text-red-bright">2025–2027</span>
        </h1>
        <p className="text-text-dim max-w-[620px] leading-relaxed text-[13px]">
          The 2025–2030 window carries the highest concentration of simultaneous
          high-probability risk events since 1939–1945. These are documented
          trajectories with measurable velocities — not forecasts.
        </p>
      </header>

      <ScenarioAccordion scenarios={SCENARIOS} />

      <ProvisionerCta
        headline="The 2027 window is a convergence, not a prediction."
        subtext="The Provisioner Sanctuary maps your physical preparation level against every scenario on this page — and shows the gaps before they become crises."
        label="Score My Safe Zone →"
        href="/provisioner/scout"
        urgency="2027 CRITICAL WINDOW: ~22 MONTHS"
      />
    </div>
  );
}
