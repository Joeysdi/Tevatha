// components/watchtower/gear-panel.tsx
"use client";

import { useState } from "react";
import type { GearCategory } from "@/lib/watchtower/data";

const DOMAIN_MAP: Record<string, string> = {
  Communications: "B1 EMP + B2 Cyber",
  Medical:        "D1 Pandemic + B8 Hospital",
  Energy:         "B1 Grid-Down + B6 Fuel",
  Mobility:       "C1 Civil + B5 Food Distribution",
};

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold-protocol text-[11px] tracking-[1px]">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

interface GearPanelProps {
  categories: GearCategory[];
}

export function GearPanel({ categories }: GearPanelProps) {
  const [active, setActive] = useState(categories[0]?.cat ?? "");
  const current = categories.find((c) => c.cat === active);

  return (
    <>
      {/* Category tab strip */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-void-2 rounded-lg
                      border border-border-protocol mb-4">
        {categories.map((c) => (
          <button
            key={c.cat}
            onClick={() => setActive(c.cat)}
            className={`
              px-3.5 py-1.5 text-[12px] rounded-md transition-all duration-150
              font-medium focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-gold-protocol/40
              ${active === c.cat
                ? "bg-void-3 text-text-base font-semibold border border-border-hover"
                : "text-text-mute2 hover:text-text-base"
              }
            `}
          >
            {c.cat}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-text-mute2
                         self-center pr-2">
          {current?.items.length ?? 0} ITEMS
        </span>
      </div>

      {/* Domain signal badge */}
      <div className="flex items-center gap-3 flex-wrap px-4 py-3
                      bg-void-2 border border-border-protocol rounded-lg mb-4">
        <span className="font-mono text-[10px] text-text-mute2 tracking-[.1em]">
          THREAT DOMAIN ▸
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                         bg-red-dim text-red-bright border border-red-protocol/28
                         font-mono text-[10.5px] font-semibold">
          {DOMAIN_MAP[active] ?? "MULTI-DOMAIN"}
        </span>
        <span className="text-[12px] text-text-mute2">
          Items below directly mitigate this scenario class.
        </span>
      </div>

      {/* Gear table */}
      {current && (
        <div className="bg-void-1 border border-border-protocol rounded-[10px]
                        overflow-hidden mb-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Item","Brand","Price","Tier","Rating","Critical","Spec","Build Note"].map((h) => (
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
                {current.items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04]
                               hover:bg-white/[0.018] transition-colors"
                  >
                    <td className="px-3.5 py-2.5 font-semibold text-text-base
                                   text-[12.5px] min-w-[160px]">
                      {item.name}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px]
                                   text-text-mute2 whitespace-nowrap">
                      {item.brand}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="font-mono text-[12px] text-gold-protocol
                                       font-bold whitespace-nowrap">
                        {item.price}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`font-mono text-[11px] font-bold
                          ${item.tier === "T1" ? "text-green-bright" :
                            item.tier === "T2" ? "text-blue-DEFAULT" : "text-purple-DEFAULT"}`}
                      >
                        {item.tier}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <Stars n={item.rating} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      {item.critical ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5
                                         rounded-full bg-red-dim text-red-bright
                                         border border-red-protocol/28
                                         font-mono text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-bright
                                           animate-pulse" />
                          YES
                        </span>
                      ) : (
                        <span className="text-text-mute2 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-dim
                                   max-w-[280px] leading-relaxed">
                      {item.spec}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[10px]
                                   text-text-mute2 max-w-[160px]">
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-5 flex-wrap px-4 py-3 bg-void-2
                      border border-border-protocol rounded-lg text-[12px]">
        {[
          { l:"T1", d:"Essential — every household", c:"text-green-bright" },
          { l:"T2", d:"Sanctuary / community level", c:"text-blue-DEFAULT"  },
          { l:"T3", d:"Tier 3+ communities only",   c:"text-purple-DEFAULT" },
        ].map((t) => (
          <div key={t.l} className="flex items-center gap-2">
            <span className={`font-mono text-[11px] font-bold ${t.c}`}>{t.l}</span>
            <span className="text-text-mute2">{t.d}</span>
          </div>
        ))}
        <span className="text-text-mute2 text-[12px] ml-auto">
          ★★★★★ = Tevatha-Certified
        </span>
      </div>
    </>
  );
}
