// lib/watchtower/severity-styles.ts
// Single source of truth for severity code → Tailwind class strings.
// Used by ScenarioAccordion, PsychPanel, GlobeIntelPanel.

import type { SevCode } from "@/lib/watchtower/data";

export const SEV_STYLES: Record<SevCode, string> = {
  EX: "bg-[rgba(255,0,85,0.18)] text-[#ff0055] border border-[rgba(255,0,85,0.3)]",
  CR: "bg-red-dim text-red-bright border border-red-protocol/28",
  HI: "bg-amber-dim text-amber-protocol border border-amber-DEFAULT/26",
  EL: "bg-blue-dim text-blue-DEFAULT border border-blue-DEFAULT/22",
  ME: "bg-[rgba(168,85,247,0.12)] text-purple-DEFAULT border border-purple-DEFAULT/22",
};

export const SEV_LABELS: Record<SevCode, string> = {
  EX: "EXISTENTIAL", CR: "CRITICAL", HI: "HIGH", EL: "ELEVATED", ME: "MEDIUM",
};
