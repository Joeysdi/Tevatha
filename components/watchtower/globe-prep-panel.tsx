// components/watchtower/globe-prep-panel.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GEAR, PSYCH_PILLARS, PSYCH_THREATS } from "@/lib/watchtower/data";
import { GearPanel }  from "./gear-panel";
import { PsychPanel } from "./psych-panel";

export type PrepTab = "gear" | "psychology";

interface Props {
  open:        boolean;
  onClose:     () => void;
  activeTab:   PrepTab;
  onTabChange: (t: PrepTab) => void;
}

const TABS: { id: PrepTab; label: string }[] = [
  { id: "gear",       label: "⚙ Gear"      },
  { id: "psychology", label: "🧠 Psychology" },
];

export function GlobePrepPanel({ open, onClose, activeTab, onTabChange }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="prep-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 inset-y-0 z-30 w-[400px] max-w-[88vw]
                     flex flex-col bg-void-1/97 backdrop-blur-md
                     border-l border-border-protocol overflow-hidden"
          style={{ boxShadow: "-6px 0 48px rgba(0,0,0,0.7)" }}
        >
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
               style={{ background: "linear-gradient(90deg,transparent,#c9a84c,rgba(201,168,76,0.2))" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-border-protocol flex-shrink-0">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-protocol text-text-mute2
                         hover:text-text-base hover:border-border-bright/40
                         transition-colors font-mono text-[11px]
                         flex items-center justify-center"
            >
              ✕
            </button>
            <p className="font-mono text-[8.5px] tracking-[.24em] uppercase text-gold-protocol">
              Preparedness · Intel
            </p>
          </div>

          {/* Tab strip */}
          <div className="flex border-b border-border-protocol flex-shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 py-2.5 font-mono text-[9.5px] font-bold tracking-[.07em]
                            transition-colors duration-150
                            ${activeTab === t.id
                              ? "text-gold-bright border-b-2 border-gold-protocol bg-gold-glow"
                              : "text-text-mute2 hover:text-text-base border-b-2 border-transparent"
                            }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              >
                {activeTab === "gear" && (
                  <GearPanel categories={GEAR} />
                )}
                {activeTab === "psychology" && (
                  <PsychPanel pillars={PSYCH_PILLARS} threats={PSYCH_THREATS} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
