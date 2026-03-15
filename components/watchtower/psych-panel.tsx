// components/watchtower/psych-panel.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StaggerParent, StaggerChild } from "@/components/ui/motion";
import type { PsychPillar, PsychThreat, SevCode } from "@/lib/watchtower/data";

type Tab = "pillars" | "threats" | "protocol" | "crisis";

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id:"pillars",  label:"Six Pillars"     },
  { id:"threats",  label:"Threat Matrix"   },
  { id:"protocol", label:"Daily Protocol"  },
  { id:"crisis",   label:"Crisis Protocols"},
];

const SEV_STYLES: Record<SevCode, string> = {
  EX: "bg-[rgba(255,0,85,0.18)] text-[#ff0055] border border-[rgba(255,0,85,0.3)]",
  CR: "bg-red-dim text-red-bright border border-red-protocol/28",
  HI: "bg-amber-dim text-amber-protocol border border-amber-DEFAULT/26",
  EL: "bg-blue-dim text-blue-DEFAULT border border-blue-DEFAULT/22",
  ME: "bg-[rgba(168,85,247,0.12)] text-purple-DEFAULT border border-purple-DEFAULT/22",
};

const SEV_LABELS: Record<SevCode, string> = {
  EX:"EXISTENTIAL", CR:"CRITICAL", HI:"HIGH", EL:"ELEVATED", ME:"MEDIUM",
};

// Maps pillar colKey strings to Tailwind color pairs [text, border]
const PILLAR_COLORS: Record<string, { text: string; border: string }> = {
  purple: { text:"text-purple-DEFAULT", border:"border-l-purple-DEFAULT" },
  indigo: { text:"text-[#6366f1]",      border:"border-l-[#6366f1]"      },
  teal:   { text:"text-[#2dd4bf]",      border:"border-l-[#2dd4bf]"      },
  gold:   { text:"text-gold-protocol",  border:"border-l-gold-protocol"  },
  cyan:   { text:"text-cyan-DEFAULT",   border:"border-l-cyan-DEFAULT"   },
  red:    { text:"text-red-bright",     border:"border-l-red-bright"     },
};

interface PsychPanelProps {
  pillars: PsychPillar[];
  threats: PsychThreat[];
}

export function PsychPanel({ pillars, threats }: PsychPanelProps) {
  const [tab, setTab] = useState<Tab>("pillars");

  return (
    <>
      {/* Tab strip */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-void-2 rounded-lg
                      border border-border-protocol mb-5">
        {TAB_LABELS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150
              focus-visible:outline-none
              ${tab === t.id
                ? "rounded-full border border-gold-protocol/60 bg-gold-glow text-gold-bright"
                : "rounded-full text-text-mute2 hover:bg-white/[0.03]"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "pillars" && (
          <motion.div
            key="pillars"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
        <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pillars.map((p) => {
            const colors = PILLAR_COLORS[p.colKey] ?? PILLAR_COLORS.gold;
            return (
              <StaggerChild key={p.name}>
              <div
                className={`bg-void-1 border border-border-protocol rounded-[10px]
                             p-4.5 border-l-[3px] ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[20px]">{p.icon}</span>
                  <span className={`font-syne font-bold text-[15px] ${colors.text}`}>
                    {p.name}
                  </span>
                </div>
                <p className="text-[12px] text-text-dim leading-relaxed mb-3">
                  {p.desc}
                </p>
                <div className="font-mono text-[9px] text-text-mute2
                                tracking-[.1em] uppercase mb-2">
                  Tactics
                </div>
                {p.tactics.map((t, i) => (
                  <div
                    key={i}
                    className="flex gap-2 py-1 border-b border-white/[0.04]
                               text-[12px] text-text-dim leading-relaxed"
                  >
                    <span className={`flex-shrink-0 text-[11px] ${colors.text}`}>
                      ›
                    </span>
                    {t}
                  </div>
                ))}
              </div>
              </StaggerChild>
            );
          })}
        </StaggerParent>
          </motion.div>
        )}

        {tab === "threats" && (
          <motion.div
            key="threats"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
          <div className="bg-void-1 border border-border-protocol rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Threat","Onset","Severity","Warning Signs","Ark Intervention"].map((h) => (
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
                  {threats.map((t) => (
                    <tr key={t.threat}
                        className="border-b border-white/[0.04] hover:bg-white/[0.018] transition-colors">
                      <td className="px-3.5 py-2.5 font-semibold text-text-base
                                     text-[12.5px] whitespace-nowrap">
                        {t.threat}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-dim">
                        {t.onset}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded font-mono
                                          text-[9.5px] font-bold tracking-[.06em]
                                          ${SEV_STYLES[t.sev]}`}>
                          {SEV_LABELS[t.sev]}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[12px] text-text-dim max-w-[200px]">
                        {t.signs}
                      </td>
                      <td className="px-3.5 py-2.5 text-[12px] text-text-dim max-w-[240px]">
                        {t.ark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </motion.div>
        )}

        {tab === "protocol" && (
          <motion.div
            key="protocol"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <DailyProtocol />
          </motion.div>
        )}
        {tab === "crisis" && (
          <motion.div
            key="crisis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <CrisisProtocols />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Inner server-renderable sub-views (defined here as client is already loaded)

const DAILY_BLOCKS = [
  { time:"05:30–06:00", title:"Morning Anchor",    col:"text-purple-DEFAULT", items:["Physical movement 20 min — non-negotiable","Read personal mission statement aloud","Physiological sigh ×3 to regulate nervous system","Identify today's 3 agency targets"] },
  { time:"07:00–07:30", title:"Community Sync",    col:"text-cyan-DEFAULT",   items:["1-word check-in round per person","Confirm daily roles","Acknowledge yesterday's wins publicly","Surface any emerging conflicts early"] },
  { time:"12:00–12:30", title:"Midday Reset",      col:"text-gold-protocol",  items:["Eat together — always together","5-min body scan or breathing practice","1× daily intel debrief maximum","Accountability partner check-in"] },
  { time:"19:30–20:00", title:"Evening Process",   col:"text-[#2dd4bf]",      items:["Shared meal + open conversation","Grief check-in (weekly structured)","Journal: what you controlled today","Gratitude: 1 specific thing per person"] },
  { time:"21:00–21:30", title:"Night Protocol",    col:"text-text-dim",       items:["Zero information intake after 21:00","Consistent wind-down ritual — regulating","8-hour sleep enforced for decision-makers","Tomorrow's first task defined before sleep"] },
];

function DailyProtocol() {
  return (
    <div>
      <blockquote className="bg-void-2 border border-border-protocol rounded-lg
                              px-4 py-3 mb-4 text-[13px] text-text-dim italic leading-relaxed">
        &ldquo;In every documented long-duration survival scenario, communities that maintained
        structured daily rhythm had dramatically lower psychological deterioration rates — even
        when resources were identical.&rdquo;
      </blockquote>
      <StaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DAILY_BLOCKS.map((b) => (
          <StaggerChild key={b.title}>
          <div
               className="bg-void-2 border border-border-protocol rounded-[10px] p-4">
            <div className="font-mono text-[9px] text-gold-protocol tracking-[.1em]
                            uppercase mb-1.5">{b.time}</div>
            <div className={`font-syne font-bold text-[15px] mb-2.5 ${b.col}`}>
              {b.title}
            </div>
            {b.items.map((it, i) => (
              <div key={i}
                   className="flex gap-2 py-1 border-b border-white/[0.04]
                              text-[12px] text-text-dim leading-relaxed">
                <span className="text-purple-DEFAULT flex-shrink-0">›</span>{it}
              </div>
            ))}
          </div>
          </StaggerChild>
        ))}
      </StaggerParent>
    </div>
  );
}

const CRISIS_PROTOCOLS = [
  {
    title:"Suicidal ideation — immediate protocol",
    steps:["Remove access to means immediately and quietly.","24-hour companion assignment. Never leave alone.","Direct, non-judgmental: \"Are you thinking about ending your life?\"","Emergency community meeting: share broadly, reduce shame.","Create meaningful role immediately.","Daily structured check-ins for 30 days minimum."],
  },
  {
    title:"Leadership psychological collapse",
    steps:["Deputy must be designated and trained before crisis — not during.","Succession trigger: 2 members independently flag degraded functioning.","48h mandatory rest with zero decision responsibility.","Gradual re-engagement only after structured debrief.","Full burnout = 2-week minimum stand-down — no exceptions."],
  },
  {
    title:"Acute panic attack management",
    steps:["Physiological sigh: double-inhale through nose, long exhale ×3–5. Fastest evidence-based autonomic reset.","Grounding: 5 things you see, 4 touch, 3 hear, 2 smell, 1 taste.","For others: calm low voice. Slow your own breathing visibly. Touch only if consented."],
  },
  {
    title:"Mass grief event (multiple deaths)",
    steps:["Allow 48h unstructured mourning. Do not enforce normalcy.","Formal ritual — even simple — marks the loss as real.","Name the dead explicitly. Tell their stories.","Redistribute their roles gradually, not immediately.","Create a lasting marker: name a project or practice after the lost.","Monitor surviving close partners for 90 days."],
  },
];

function CrisisProtocols() {
  return (
    <div className="bg-void-1 border border-border-protocol rounded-[10px] overflow-hidden">
      {CRISIS_PROTOCOLS.map((p, pi, arr) => (
        <div key={pi}
             className={pi < arr.length - 1 ? "border-b border-border-protocol" : ""}>
          <div className="p-4.5">
            <h4 className="font-syne font-bold text-[15px] text-purple-DEFAULT mb-3">
              {p.title}
            </h4>
            {p.steps.map((s, i) => (
              <div key={i}
                   className="flex gap-3 py-1.5 border-b border-white/[0.04]">
                <span className="font-mono text-gold-protocol text-[12px]
                                 min-w-[24px] font-bold">{i + 1}.</span>
                <span className="text-[13px] text-text-dim leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
