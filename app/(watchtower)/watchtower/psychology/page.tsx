// app/(watchtower)/watchtower/psychology/page.tsx
import type { Metadata } from "next";
import { PsychPanel }     from "@/components/watchtower/psych-panel";
import { ProvisionerCta } from "@/components/watchtower/provisioner-cta";
import { FadeUp }         from "@/components/ui/motion";
import { PSYCH_PILLARS, PSYCH_THREATS } from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Psychology" };

export default function PsychologyPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em]
                       uppercase mb-3">
          Psychological Resilience · Watchtower
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                       leading-[1.12] text-text-base mb-2">
          Collapse-Proof{" "}
          <span className="text-purple-DEFAULT">Mental Architecture</span>
        </h1>
        <p className="text-text-dim max-w-[620px] leading-relaxed text-[13px]">
          The mind fails before the body. In every documented long-duration
          collapse, psychological collapse preceded physical death. Built from
          27 case studies — including POW camps, famine, and civil war.
          Operational, not therapeutic.
        </p>
      </header>

      {/* PsychPanel is client (sub-tabs). Data served from Server Component. */}
      <FadeUp delay={0.1}>
        <PsychPanel pillars={PSYCH_PILLARS} threats={PSYCH_THREATS} />
      </FadeUp>

      <ProvisionerCta
        headline="The mind is infrastructure. Build it before you need it."
        subtext="Psychological resilience requires community. The Provisioner Network module helps you build and vet the community that becomes your mental architecture's foundation."
        label="Build Your Community →"
        href="/provisioner"
        urgency="COMMUNITY FORMATION TIME: 12–24 MONTHS MINIMUM"
      />
    </div>
  );
}
