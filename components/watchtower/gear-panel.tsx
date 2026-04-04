// components/watchtower/gear-panel.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GearCategory } from "@/lib/watchtower/data";
import { useTranslation } from "@/lib/i18n/use-translation";

const DOMAIN_MAP: Record<string, string> = {
  Communications: "B1 EMP + B2 Cyber",
  Medical:        "D1 Pandemic + B8 Hospital",
  Energy:         "B1 Grid-Down + B6 Fuel",
  Mobility:       "C1 Civil + B5 Food Distribution",
};

const CATEGORY_OUTCOME: Record<string, string> = {
  Communications: "When the grid fails, your comms hold.",
  Medical:        "Your household runs self-sufficient in isolation.",
  Energy:         "Your power is live when the grid is not.",
  Mobility:       "You move before the crowd moves.",
};

const CATEGORY_DOMAIN: Record<string, string> = {
  Communications: "cyber",
  Medical:        "bio",
  Energy:         "nuclear",
  Mobility:       "civil",
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
  const { t } = useTranslation();
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
              px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-protocol/40
              ${active === c.cat
                ? "rounded-full border border-gold-protocol/60 bg-gold-glow text-gold-bright"
                : "rounded-full text-text-mute2 hover:bg-white/[0.03]"
              }
            `}
          >
            {c.cat}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-text-mute2
                         self-center pr-2">
          {current?.items.length ?? 0} {t("gear_items")}
        </span>
      </div>

      {/* Domain signal badge */}
      <div className="flex items-center gap-3 flex-wrap px-4 py-3
                      bg-void-2 border border-border-protocol rounded-lg mb-4">
        <span className="font-mono text-[10px] text-text-mute2 tracking-[.1em]">
          {t("gear_threat_domain")}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                         bg-red-dim text-red-bright border border-red-protocol/28
                         font-mono text-[10.5px] font-semibold">
          {DOMAIN_MAP[active] ?? t("gear_multi_domain")}
        </span>
        <span className="text-[12px] text-text-mute2">
          {t("gear_scenario_desc")}
        </span>
      </div>

      {/* Category outcome headline */}
      {current && CATEGORY_OUTCOME[current.cat] && (
        <p className="font-syne font-bold text-[16px] text-text-base leading-snug mb-3 px-1">
          {CATEGORY_OUTCOME[current.cat]}
        </p>
      )}

      {/* Gear table */}
      {current && (
        <div className="bg-void-1 border border-border-protocol rounded-[10px]
                        overflow-hidden mb-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {([
                    t("col_item"), t("col_brand"), t("col_price"), t("col_tier"),
                    t("col_rating"), t("col_critical"), t("col_spec"), t("col_build_note"),
                  ] as string[]).map((h) => (
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
                  <motion.tr
                    key={i}
                    className="border-b border-white/[0.04]"
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
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
                          {t("gear_critical_yes")}
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SHOP CTA */}
      {current && (
        <div className="mb-3">
          <Link
            href="/provisioner/tiers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                       bg-gold-protocol text-void-0 font-syne font-bold text-[12px]
                       tracking-[.06em] hover:bg-gold-bright hover:-translate-y-0.5
                       hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)]
                       transition-all duration-200"
          >
            SHOP {current.items.length} ITEMS →
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-5 flex-wrap px-4 py-3 bg-void-2
                      border border-border-protocol rounded-lg text-[12px]">
        {[
          { l:"T1", d:t("gear_t1_desc"), c:"text-green-bright" },
          { l:"T2", d:t("gear_t2_desc"), c:"text-blue-DEFAULT"  },
          { l:"T3", d:t("gear_t3_desc"), c:"text-purple-DEFAULT" },
        ].map((tier) => (
          <div key={tier.l} className="flex items-center gap-2">
            <span className={`font-mono text-[11px] font-bold ${tier.c}`}>{tier.l}</span>
            <span className="text-text-mute2">{tier.d}</span>
          </div>
        ))}
        <span className="text-text-mute2 text-[12px] ml-auto">
          {t("gear_certified")}
        </span>
      </div>
    </>
  );
}
