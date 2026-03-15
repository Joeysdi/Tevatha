// app/(watchtower)/watchtower/signals/page.tsx
import type { Metadata } from "next";
import { ProvisionerCta }    from "@/components/watchtower/provisioner-cta";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";
import { ALARM_CATEGORIES }  from "@/lib/watchtower/data";
import type { TierClass }    from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Signal Feed" };

const TIER_STYLES: Record<TierClass, string> = {
  t4: "bg-red-protocol/20 text-red-bright",
  t3: "bg-amber-dim text-amber-protocol",
  t2: "bg-blue-dim text-blue-DEFAULT",
  t1: "bg-green-dim text-green-bright",
};

const SCHEDULE = [
  { time:"06:00", action:"Overnight disaster scan",        sources:"GDACS · USGS · ReliefWeb",           freq:"Daily"   },
  { time:"06:15", action:"Disease outbreak news",          sources:"WHO DON (who.int/emergencies)",       freq:"Daily"   },
  { time:"06:30", action:"VIX, Gold, DXY — flag >5% moves",sources:"Bloomberg · TradingView",            freq:"Daily"   },
  { time:"08:00", action:"OSINT conflict scan",            sources:"Bellingcat · ACLED",                  freq:"Daily"   },
  { time:"12:00", action:"Geopolitical brief",             sources:"Stratfor · open-source equivalents", freq:"Daily"   },
  { time:"18:00", action:"Macro: yield curves, commodities",sources:"FRED · IMF · BIS",                  freq:"Daily"   },
  { time:"Weekly",action:"Full scenario review",           sources:"Tevatha Watchtower",                  freq:"Weekly"  },
  { time:"Monthly",action:"Safe Zone Doctrine tier review",sources:"Tevatha Provisioner",                 freq:"Monthly" },
];

export default function SignalsPage() {
  return (
    <div>
      <FadeUp>
        <header className="mb-6">
          <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em]
                         uppercase mb-3">
            Signal Feed · Daily Intelligence Protocol
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                         leading-[1.12] text-text-base mb-2">
            Priority Signal{" "}
            <span className="text-blue-DEFAULT">Monitor</span>
          </h1>
          <p className="text-text-dim max-w-[620px] leading-relaxed text-[13px]">
            Not everything is a signal. Most noise is noise. These monitored
            conditions have documented relationships to collapse scenarios.{" "}
            <strong className="text-text-base">
              Total daily commitment: 35 minutes maximum.
            </strong>
          </p>
        </header>
      </FadeUp>

      {/* Daily schedule — static server render */}
      <section className="bg-void-1 border border-border-protocol rounded-[10px]
                           p-4.5 mb-5">
        <h2 className="font-syne font-bold text-base text-text-base mb-3.5">
          Daily Monitoring Schedule
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Time","Action","Sources","Frequency"].map((h) => (
                  <th key={h}
                      className="text-left font-mono text-[9.5px] tracking-[.12em]
                                 uppercase text-text-mute2 px-3.5 py-2.5
                                 border-b border-border-bright whitespace-nowrap
                                 bg-white/[0.03]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((r, i) => (
                <tr key={i}
                    className="border-b border-white/[0.04] hover:bg-white/[0.018] transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-[12px]
                                 text-gold-protocol whitespace-nowrap font-bold">
                    {r.time}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-text-base text-[12.5px]">
                    {r.action}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-mute2">
                    {r.sources}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-mute2">
                    {r.freq}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alarm categories — static server render */}
      <StaggerParent>
      {ALARM_CATEGORIES.map((cat) => (
        <StaggerChild key={cat.cat}>
        <section
          className="bg-void-1 border border-border-protocol rounded-[10px]
                      p-4.5 mb-4"
        >
          <h2 className="font-syne font-bold text-base text-text-base mb-3.5">
            {cat.cat} — Alarm Conditions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Signal","Tier","Required Action"].map((h) => (
                    <th key={h}
                        className="text-left font-mono text-[9.5px] tracking-[.12em]
                                   uppercase text-text-mute2 px-3.5 py-2.5
                                   border-b border-border-bright whitespace-nowrap
                                   bg-white/[0.03]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.items.map((s, i) => (
                  <tr key={i}
                      className="border-b border-white/[0.04] hover:bg-white/[0.018] transition-colors">
                    <td className="px-3.5 py-2.5 font-medium text-text-base text-[12.5px]">
                      {s.sig}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded
                                        font-mono text-[9.5px] font-bold
                                        ${TIER_STYLES[s.tier]}`}>
                        {s.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-dim">
                      {s.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        </StaggerChild>
      ))}
      </StaggerParent>

      <ProvisionerCta
        headline="Signals identified. Preparation gap unknown."
        subtext="Every alarm condition has a corresponding preparation item. The Provisioner maps Tevatha-Certified equipment to each domain — so your store matches your threat profile."
        label="Shop by Threat Domain →"
        href="/provisioner/gear"
        urgency="B2 (CYBER) + B1 (EMP): ELEVATED · D1 (BIO): HIGH"
      />
    </div>
  );
}
