// lib/watchtower/data-psych.ts
// Psychology & alarm data — only loaded by /watchtower/psychology subroute and psych-panel.tsx.
// ~8 KB of data not needed in the main watchtower globe bundle.

import type { PsychPillar, PsychThreat, AlarmCategory } from "@/lib/watchtower/data";

export const PSYCH_PILLARS: PsychPillar[] = [
  { icon:"🧠", name:"Emotional Regulation", colKey:"purple",
    desc:"Learn to process fear, grief, and anger without letting those feelings destroy your ability to make good decisions or hurt your relationships with the people around you.",
    tactics:["Daily check-ins with an accountability partner","Take 10 slow breaths before making any decision when you are angry","Schedule grief time: give yourself a set window to feel it, then continue","10-min nightly journaling to get your thoughts out of your head and onto paper"] },
  { icon:"⚓", name:"Identity Anchoring", colKey:"indigo",
    desc:"Keep a stable sense of who you are even when everything around you has changed. Research on Holocaust survivors shows this is the strongest single predictor of persistence through extreme hardship.",
    tactics:["Write a personal mission statement and read it every day","Having a clear role within your community gives you ongoing structure and purpose","Write down 5 core values that define who you are regardless of circumstances","Maintain one daily ritual that stays the same no matter how chaotic things get"] },
  { icon:"🕸", name:"Community Bonds", colKey:"teal",
    desc:"Human connection is the single strongest predictor of survival in every documented disaster scenario. Social isolation kills people faster than starvation does.",
    tactics:["Eat together as a community every day — this is non-negotiable","Pair system: every person has one designated check-in partner","Conflict protocol: wait 48 hours, then resolve disputes through a mediated session","Publicly acknowledge every small community win, no matter how minor"] },
  { icon:"⚡", name:"Agency & Purpose", colKey:"gold",
    desc:"Feeling helpless is the main driver of suicide during collapse events. Having real agency — even over small, everyday decisions — prevents psychological deterioration.",
    tactics:["Give every community member a meaningful role they are responsible for","Personal project: each person owns and improves one thing that is theirs","Set a 30-minute daily skill-learning target for yourself","Agency journal: write down 3 things you controlled or decided today"] },
  { icon:"🔭", name:"Cognitive Clarity", colKey:"cyan",
    desc:"Chronic stress degrades the brain's ability to think clearly and make good decisions. Maintaining clear thinking under ongoing pressure requires deliberate habits — not just willpower.",
    tactics:["Get 7+ hours of sleep — this is non-negotiable for decision-makers","Decision journal: write down your reasoning for every major choice","Pre-mortem practice: before executing any plan, ask 'what could go wrong?'","Limit yourself to one daily news/intelligence briefing — no doom-scrolling"] },
  { icon:"💪", name:"Physical-Psychological Link", colKey:"red",
    desc:"Your body and mind are the same system. Physical fitness, sleep, and nutrition have an outsized effect on mental health, especially during crisis conditions.",
    tactics:["30 minutes of physical activity every day — any form counts, non-negotiable","Body scan: spend 5 minutes each day noticing how your body feels","Physiological sigh for acute anxiety: two quick inhales through the nose, then one long exhale","Physical labor as a psychological anchor: purposeful physical exhaustion helps restore mental calm"] },
];

export const PSYCH_THREATS: PsychThreat[] = [
  { threat:"PTSD / Trauma Response",    onset:"Week 1+",  sev:"HI", signs:"Flashbacks (reliving traumatic events), hypervigilance (feeling constantly on alert), emotional numbness",          ark:"Set up peer processing circles. Use structured narrative retelling — having the person tell their story in a safe setting." },
  { threat:"Grief Collapse",            onset:"Day 3+",   sev:"HI", signs:"Unable to perform basic functions, prolonged disconnection from reality",            ark:"48-hour supportive hold. Assign a peer companion. Hold a structured grief ritual at the one-week mark." },
  { threat:"Leadership Fatigue",        onset:"Week 2+",  sev:"HI", signs:"Unable to make decisions, increasing irritability, taking dangerous shortcuts",         ark:"Mandatory 48-hour rest rotation. No leader works more than 14 consecutive days." },
  { threat:"Suicidal Ideation",         onset:"Variable", sev:"CR", signs:"Withdrawing from others, giving away possessions, expressing hopelessness",         ark:"24-hour companion assignment. Quietly remove access to means. 30-day daily check-in protocol." },
  { threat:"Mass Panic",                onset:"Immediate",sev:"HI", signs:"Fear spreading rapidly through the group, irrational group behavior",                  ark:"Use a calm, commanding voice. Give one clear, specific instruction at a time. Physically separate agitated individuals from the group." },
  { threat:"Substance Dependency",      onset:"Month 1+", sev:"HI", signs:"Hiding substances, behavioral changes, hoarding",                 ark:"Community accountability. Conduct a supply audit. Modify the person's role to reduce stress triggers." },
];

export const ALARM_CATEGORIES: AlarmCategory[] = [
  {
    cat:"Financial",
    items:[
      { sig:"US 10-year bond yield above 5.5% for 30+ consecutive days",         tier:"t3", action:"Reduce bond exposure, increase allocation to gold" },
      { sig:"VIX (market fear index) above 45 sustained",                         tier:"t3", action:"Execute financial protocol immediately" },
      { sig:"A G7 government announces a bank bail-in (using depositor money to rescue a failing bank)",  tier:"t4", action:"Move all cash to physical assets or offshore accounts within 24 hours" },
      { sig:"Any G7 government announces a mandatory CBDC (government digital currency) adoption timeline", tier:"t2", action:"Move Bitcoin to self-custody hardware wallet. Fund offshore account to maximum." },
      { sig:"An emergency IMF meeting is called",                                  tier:"t3", action:"Financial circuit breaker. Review all positions immediately." },
    ],
  },
  {
    cat:"Nuclear / Military",
    items:[
      { sig:"DEFCON 2 (or equivalent readiness level) is raised",                 tier:"t4", action:"Execute immediate evacuation to Ark location" },
      { sig:"A nuclear weapon is detonated anywhere in the world",                 tier:"t4", action:"Execute full Ark protocol. No exceptions." },
      { sig:"NATO Article 5 (collective defense clause) is formally invoked",     tier:"t4", action:"Leave Europe within 24 hours" },
      { sig:"Doomsday Clock moves to 75 seconds or closer",                        tier:"t4", action:"Ark location must be fully operational" },
      { sig:"China initiates a naval blockade of Taiwan",                          tier:"t3", action:"Pre-position at Ark location" },
    ],
  },
  {
    cat:"Biological",
    items:[
      { sig:"H5N1 human-to-human transmission confirmed in a cluster of cases",   tier:"t3", action:"Activate isolation protocol immediately. Do not wait." },
      { sig:"WHO declares a Public Health Emergency of International Concern (PHEIC) for a respiratory pathogen", tier:"t3", action:"Isolate immediately. Do not wait for local cases." },
      { sig:"Any G7 hospital system above 120% capacity",                          tier:"t2", action:"Deploy your PPE supply. Avoid medical facilities unless life-threatening." },
    ],
  },
  {
    cat:"Political",
    items:[
      { sig:"The incumbent formally disputes an election result",                  tier:"t2", action:"Reduce your urban presence. Increase overall readiness level." },
      { sig:"Emergency powers are invoked without legislative approval",           tier:"t3", action:"Capital controls may follow within days. Act immediately on financial preparations." },
      { sig:"A G20 country shuts down internet access",                            tier:"t2", action:"Switch to offline communications. Activate mesh network." },
    ],
  },
];
