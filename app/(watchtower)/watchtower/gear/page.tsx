// app/(watchtower)/watchtower/gear/page.tsx
import type { Metadata } from "next";
import { GearPanel }      from "@/components/watchtower/gear-panel";
import { ProvisionerCta } from "@/components/watchtower/provisioner-cta";
import { GEAR }            from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Gear Tables" };

export default function GearPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em]
                       uppercase mb-3">
          Tevatha-Certified Gear
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                       leading-[1.12] text-text-base mb-2">
          Signal-Mapped{" "}
          <span className="text-gold-protocol">Equipment</span>
        </h1>
        <p className="text-text-dim max-w-[620px] leading-relaxed text-[13px]">
          Every item maps to a specific threat domain signal. No affiliate links.
          No sponsored placements. Tevatha-Certified means it passed the Life Over
          Money filter: does this increase your probability of survival?
        </p>
      </header>

      {/* GearPanel is client (category tabs) but data is passed from server */}
      <GearPanel categories={GEAR} />

      <ProvisionerCta
        headline="Reading signals is step one. Step two is the store."
        subtext="The Provisioner store maps every Tevatha-Certified item to your specific threat domain exposure — prioritized by probability, not price tag."
        label="Shop by Threat Domain →"
        href="/provisioner/gear"
        urgency="COMMUNICATIONS + MEDICAL: T1 CRITICAL"
      />
    </div>
  );
}
