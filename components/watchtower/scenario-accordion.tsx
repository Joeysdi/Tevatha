// components/watchtower/scenario-accordion.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { StaggerParent, StaggerChild } from "@/components/ui/motion";
import type { Scenario } from "@/lib/watchtower/data";
import { SEV_STYLES, SEV_LABELS } from "@/lib/watchtower/severity-styles";
import { SCENARIO_GEAR_MAP } from "@/lib/watchtower/data-gear";
import { useTranslation } from "@/lib/i18n/use-translation";

const PRI_COLORS = { "1":"#e84040", "2":"#f0a500", "3":"#c9a84c" } as const;

interface ScenarioAccordionProps {
  scenarios: Scenario[];
}

export function ScenarioAccordion({ scenarios }: ScenarioAccordionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <StaggerParent className="flex flex-col gap-2.5">
      {scenarios.map((s) => {
        const isOpen = expanded === s.id;
        const barColor = s.prob >= 40 ? "#e84040" : "#f0a500";

        return (
          <StaggerChild key={s.id}>
          <motion.article
            whileHover={{ backgroundColor: "rgba(255,255,255,0.012)" }}
            transition={{ duration: 0.15 }}
            className="bg-void-1 border border-border-protocol rounded-[10px] overflow-hidden"
          >
            {/* Accordion header */}
            <button
              onClick={() => toggle(s.id)}
              className="w-full flex items-center gap-3.5 px-4.5 py-4
                         text-left flex-wrap hover:bg-void-2
                         transition-colors duration-150 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-gold-protocol/40"
              aria-expanded={isOpen}
            >
              <span className="text-[22px] flex-shrink-0">{s.icon}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <span className="font-mono text-[10px] text-text-mute2">{s.id}</span>
                  <span className="font-syne font-bold text-[15px] text-text-base">
                    {s.title}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                   bg-purple-DEFAULT/10 text-purple-DEFAULT
                                   border border-purple-DEFAULT/22
                                   font-mono text-[10px] font-semibold">
                    {s.window}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`inline-block px-2 py-0.5 rounded font-mono
                                    text-[9.5px] font-bold tracking-[.06em]
                                    ${SEV_STYLES[s.sev]}`}>
                    {SEV_LABELS[s.sev]}
                  </span>

                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="w-[60px] h-[3px] rounded-sm bg-white/[0.07] overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{ width:`${s.prob}%`, background:barColor }}
                      />
                    </div>
                    <span
                      className="font-mono text-[11px] font-bold tabular-nums"
                      style={{ color: barColor }}
                    >
                      {s.prob}{t("prob_suffix")}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-text-mute2">
                    {t("ark_prep")}: {s.prepTime}
                  </span>
                </div>
              </div>

              <motion.span
                className="text-text-mute2 text-base flex-shrink-0"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.span>
            </button>

            {/* Accordion body */}
            <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: "hidden" }}
              >
              <div className="border-t border-border-protocol px-4.5 py-4">
                <p className="text-text-dim text-[13px] leading-relaxed mb-4">
                  {s.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Triggers + Cascade */}
                  <div>
                    <SectionLabel>{t("section_triggers")}</SectionLabel>
                    {s.triggers.map((trig, i) => (
                      <BodyRow key={i} icon="▸" color="#f0a500">{trig}</BodyRow>
                    ))}

                    <SectionLabel className="mt-3.5">{t("section_cascade")}</SectionLabel>
                    {s.cascade.map((c, i) => (
                      <BodyRow key={i} icon="→" color="#e84040">{c}</BodyRow>
                    ))}
                  </div>

                  {/* Mitigation table */}
                  <div>
                    <SectionLabel>{t("section_mitigation")}</SectionLabel>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {[t("col_action"), t("col_priority"), t("col_cost")].map((h) => (
                            <th
                              key={h}
                              className="text-left font-mono text-[9.5px] tracking-[.12em]
                                         uppercase text-text-mute2 px-3.5 py-2.5
                                         border-b border-border-bright whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.mitigation.map((m, i) => (
                          <tr key={i} className="border-b border-white/[0.04]">
                            <td className="px-3.5 py-2.5 text-[12px] text-text-dim">
                              {m.action}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span
                                className="font-mono text-[11px] font-bold"
                                style={{ color: PRI_COLORS[m.pri] ?? "#c9a84c" }}
                              >
                                {m.pri}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-mute2">
                              {m.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Priority gear row */}
                {SCENARIO_GEAR_MAP[s.id] && (
                  <div className="mt-4 pt-3 border-t border-border-protocol">
                    <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.14em] uppercase mb-2">
                      PRIORITY GEAR
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SCENARIO_GEAR_MAP[s.id].skus.map((sku) => (
                        <Link
                          key={sku}
                          href="/provisioner/tiers"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                     border border-gold-protocol/30 bg-gold-glow
                                     font-mono text-[9px] text-gold-bright
                                     hover:border-gold-protocol/60 hover:-translate-y-px
                                     transition-all duration-150"
                        >
                          {sku}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.article>
          </StaggerChild>
        );
      })}
    </StaggerParent>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-mono text-[9px] text-text-mute2 tracking-[.12em]
                  uppercase mb-2 ${className}`}
    >
      {children}
    </div>
  );
}

function BodyRow({
  icon,
  color,
  children,
}: {
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 py-1.5 border-b border-white/[0.04] text-[12.5px]">
      <span className="flex-shrink-0" style={{ color }}>{icon}</span>
      <span className="text-text-dim">{children}</span>
    </div>
  );
}
