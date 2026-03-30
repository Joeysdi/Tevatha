// lib/watchtower/data-psych.ts
// Psychology & alarm data — only loaded by /watchtower/psychology subroute and psych-panel.tsx.
// ~8 KB of data not needed in the main watchtower globe bundle.

import type { PsychPillar, PsychThreat, AlarmCategory } from "@/lib/watchtower/data";

export const PSYCH_PILLARS: PsychPillar[] = [
  { icon:"🧠", name:"Emotional Regulation", colKey:"purple",
    desc:"Process grief, fear, and rage without destroying decision-making or community bonds.",
    tactics:["Daily check-ins with accountability partner","10-breath rule before any decision under anger","Grief ritual: scheduled, bounded, not suppressed","10-min nightly journaling to externalize internal state"] },
  { icon:"⚓", name:"Identity Anchoring", colKey:"indigo",
    desc:"Maintain a stable self when all external identity markers have dissolved. Primary predictor of persistence in Holocaust survivor literature.",
    tactics:["Written personal mission statement, read daily","Role clarity within community provides ongoing structure","Values list: 5 non-negotiables that survive any circumstance","Daily meaningful ritual, consistent regardless of chaos"] },
  { icon:"🕸", name:"Community Bonds", colKey:"teal",
    desc:"Human connection is the single highest predictor of survival across all documented disaster scenarios. Loneliness kills faster than starvation.",
    tactics:["Daily structured community meals — non-negotiable","Pair system: every person has a designated check-in partner","Conflict protocol: 48h cooling + mediated session","Public acknowledgment of every small community victory"] },
  { icon:"⚡", name:"Agency & Purpose", colKey:"gold",
    desc:"Helplessness is the primary driver of collapse-related suicide. Real agency — even over minor decisions — prevents psychological deterioration.",
    tactics:["Meaningful role assigned to every community member","Personal project: one thing each member owns and improves","30-min daily skill acquisition target","Agency journal: log 3 things you controlled today"] },
  { icon:"🔭", name:"Cognitive Clarity", colKey:"cyan",
    desc:"Stress degrades executive function. Clear thinking under chronic threat requires deliberate cognitive hygiene protocols, not willpower.",
    tactics:["7+ hours sleep — non-negotiable for decision-makers","Decision journal: log reasoning behind major calls","Pre-mortem practice before executing any plan","1× daily intelligence debrief maximum — no doom-scrolling"] },
  { icon:"💪", name:"Physical-Psychological Link", colKey:"red",
    desc:"The body IS the mind. Physical fitness, sleep, and nutrition have disproportionate psychological effects in collapse conditions.",
    tactics:["30-min daily physical activity — any form, non-negotiable","Body scan: 5-min somatic awareness practice daily","Physiological sigh for acute anxiety: double-inhale + long exhale","Physical labour as psychological anchor: purposeful exhaustion heals"] },
];

export const PSYCH_THREATS: PsychThreat[] = [
  { threat:"PTSD / Trauma Response",    onset:"Week 1+",  sev:"HI", signs:"Flashbacks, hypervigilance, emotional numbness",          ark:"Peer processing circles. Structured narrative retelling." },
  { threat:"Grief Collapse",            onset:"Day 3+",   sev:"HI", signs:"Inability to function, prolonged dissociation",            ark:"48h hold. Peer companion. Structured grief ritual at week mark." },
  { threat:"Leadership Fatigue",        onset:"Week 2+",  sev:"HI", signs:"Decision paralysis, irritability, risky shortcuts",         ark:"Mandatory 48h rotation. No leader works >14 days continuous." },
  { threat:"Suicidal Ideation",         onset:"Variable", sev:"CR", signs:"Withdrawal, giving possessions away, hopelessness",         ark:"24-hr companion. Remove means quietly. 30-day check-in protocol." },
  { threat:"Mass Panic",                onset:"Immediate",sev:"HI", signs:"Contagious fear, irrational group action",                  ark:"Command voice. Single authoritative instruction. Physical separation." },
  { threat:"Substance Dependency",      onset:"Month 1+", sev:"HI", signs:"Hoarding, covert use, behavioural changes",                 ark:"Community accountability. Supply audit. Role modification." },
];

export const ALARM_CATEGORIES: AlarmCategory[] = [
  {
    cat:"Financial",
    items:[
      { sig:"US 10-yr yield >5.5% sustained 30+ days",         tier:"t3", action:"Reduce bond exposure, increase gold" },
      { sig:"VIX >45 sustained",                               tier:"t3", action:"Execute financial protocol immediately" },
      { sig:"G7 bank bail-in announcement",                    tier:"t4", action:"All cash to physical/offshore within 24 hrs" },
      { sig:"CBDC mandatory adoption timeline (any G7)",       tier:"t2", action:"BTC self-custody. Offshore account to maximum." },
      { sig:"IMF emergency meeting convened",                  tier:"t3", action:"Financial circuit breaker. Review all positions." },
    ],
  },
  {
    cat:"Nuclear / Military",
    items:[
      { sig:"DEFCON 2 or equivalent raised",                   tier:"t4", action:"Immediate bug-out execution" },
      { sig:"Any nuclear detonation anywhere",                 tier:"t4", action:"Full Ark protocol. No exceptions." },
      { sig:"NATO Article 5 invoked",                         tier:"t4", action:"Leave Europe within 24 hours" },
      { sig:"Doomsday Clock moves to 75 seconds",             tier:"t4", action:"Ark location must be operational" },
      { sig:"Taiwan Strait naval blockade initiated",         tier:"t3", action:"Pre-position at Ark location" },
    ],
  },
  {
    cat:"Biological",
    items:[
      { sig:"H5N1 human-to-human cluster confirmed",          tier:"t3", action:"Activate isolation protocol. Do not wait." },
      { sig:"WHO PHEIC for respiratory pathogen",             tier:"t3", action:"Isolate immediately. Do not wait." },
      { sig:"Hospital system >120% capacity (any G7)",        tier:"t2", action:"Deploy PPE cache. Avoid medical facilities." },
    ],
  },
  {
    cat:"Political",
    items:[
      { sig:"Election result disputed by incumbent",          tier:"t2", action:"Reduce urban profile. Increase readiness." },
      { sig:"Emergency powers invoked without legislature",   tier:"t3", action:"Capital controls may follow. Act immediately." },
      { sig:"Internet shutdown in any G20 nation",            tier:"t2", action:"Offline comms activated. Mesh network." },
    ],
  },
];
