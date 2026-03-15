// app/(provisioner)/provisioner/tiers/page.tsx  →  URL: /provisioner/tiers
"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";

// ── Tier definitions ─────────────────────────────────────────────────────────

const TIERS = [
  {
    id:       "T1",
    label:    "Essentials",
    sub:      "72-Hour Capable",
    desc:     "Emergency bag, 72-hour water and food, basic comms, first aid. Minimum viable for short-term disruptions and evacuations.",
    cost:     "$300–$600",
    window:   "72 hours",
    color:    "text-blue-DEFAULT",
    border:   "border-blue-DEFAULT/30",
    bg:       "bg-blue-dim",
    bar:      "#38bdf8",
    dot:      "bg-blue-DEFAULT",
    requirements: [
      "72hr water (1 gallon/person/day)",
      "72hr food supply (non-perishable)",
      "Handheld radio (Baofeng or equivalent)",
      "IFAK trauma kit",
      "Bug-out bag (packed, ready)",
    ],
    skuLinks: [
      { sku:"WAT-002", label:"Sawyer Water Filter" },
      { sku:"COM-002", label:"Baofeng UV-5R Radio" },
      { sku:"MED-001", label:"North American Rescue IFAK" },
    ],
  },
  {
    id:       "T2",
    label:    "Standard",
    sub:      "30-Day Capable",
    desc:     "T1 plus independent water filtration, 30-day food, solar or battery backup, and off-grid communications. Viable through most regional disruptions.",
    cost:     "$1,500–$4,000",
    window:   "30 days",
    color:    "text-gold-bright",
    border:   "border-gold-dim",
    bg:       "bg-gold-glow",
    bar:      "#c9a84c",
    dot:      "bg-gold-protocol",
    requirements: [
      "T1 capabilities",
      "Gravity-fed water filter (10+ gallons/day)",
      "30-day food supply (2,000 cal/person/day)",
      "Portable solar + LiFePO4 battery",
      "Satellite communications backup",
    ],
    skuLinks: [
      { sku:"WAT-001", label:"Berkey Water System" },
      { sku:"ENE-001", label:"Jackery Explorer 1000" },
      { sku:"COM-001", label:"Garmin inReach Mini 2" },
    ],
  },
  {
    id:       "T3",
    label:    "Advanced",
    sub:      "90-Day Capable",
    desc:     "T2 plus off-grid solar array, deep water storage, security measures, and extended medical capability. Resilient through grid-down events lasting months.",
    cost:     "$6,000–$18,000",
    window:   "90 days",
    color:    "text-amber-protocol",
    border:   "border-amber-DEFAULT/30",
    bg:       "bg-amber-dim",
    bar:      "#f0a500",
    dot:      "bg-amber-protocol",
    requirements: [
      "T2 capabilities",
      "400W+ solar with expandable battery bank",
      "90-day water reserve (dedicated storage)",
      "Perimeter security and monitoring",
      "Trauma-level medical supplies",
    ],
    skuLinks: [
      { sku:"ENE-002", label:"EcoFlow Delta Pro" },
      { sku:"ENE-003", label:"Renogy 400W Solar Kit" },
      { sku:"SEC-001", label:"Reolink Security System" },
    ],
  },
  {
    id:       "T4",
    label:    "Ark Level",
    sub:      "1-Year Sovereign",
    desc:     "T3 plus location independence, full satellite comms suite, Faraday protection for electronics, and EMP-hardened systems. Viable through existential-class events.",
    cost:     "$20,000+",
    window:   "1 year+",
    color:    "text-red-bright",
    border:   "border-red-DEFAULT/30",
    bg:       "bg-red-dim",
    bar:      "#e84040",
    dot:      "bg-red-bright",
    requirements: [
      "T3 capabilities",
      "Starlink or equivalent satellite internet",
      "Faraday cage for critical electronics",
      "Fuel reserves (90+ days mobility)",
      "Secondary vehicle with jump capability",
    ],
    skuLinks: [
      { sku:"COM-005", label:"Starlink Gen 3" },
      { sku:"SEC-003", label:"Mission Darkness Faraday Bag" },
      { sku:"MOB-001", label:"Wavian NATO Jerry Can" },
    ],
  },
] as const;

type TierId = "T1" | "T2" | "T3" | "T4";

// ── Quiz questions ────────────────────────────────────────────────────────────

const QUESTIONS = [
  { id:"q1", text:"Do you have 72+ hours of water and food ready for your household right now?", tier:"T1" as TierId },
  { id:"q2", text:"Do you have a working off-grid communications device (radio or satellite messenger)?", tier:"T1" as TierId },
  { id:"q3", text:"Do you have a gravity-fed water filter and 30+ days of food stored?", tier:"T2" as TierId },
  { id:"q4", text:"Do you have solar panels and a battery bank sufficient for 7+ days of basic power?", tier:"T2" as TierId },
  { id:"q5", text:"Do you have a 90-day water reserve and a perimeter security system?", tier:"T3" as TierId },
  { id:"q6", text:"Do you have satellite internet, Faraday protection, and 90+ day fuel reserves?", tier:"T4" as TierId },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TiersPage() {
  const [answers, setAnswers]       = useState<Record<string, boolean | null>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, null]))
  );
  const [activeTier, setActiveTier] = useState<TierId | null>(null);
  const [showResult, setShowResult] = useState(false);

  const answered = Object.values(answers).filter((v) => v !== null).length;

  // Determine current tier from answers
  function computeTier(): TierId {
    const yes = (id: string) => answers[id] === true;
    if (yes("q6") && yes("q5") && yes("q4") && yes("q3") && yes("q2") && yes("q1")) return "T4";
    if (yes("q5") && yes("q4") && yes("q3") && yes("q2") && yes("q1")) return "T3";
    if (yes("q3") && yes("q4") && yes("q2") && yes("q1")) return "T2";
    if (yes("q1") && yes("q2")) return "T1";
    return "T1"; // below T1 — needs T1
  }

  const result = showResult ? computeTier() : null;
  const resultTier = result ? TIERS.find((t) => t.id === result)! : null;
  const nextTierIdx = result ? TIERS.findIndex((t) => t.id === result) + 1 : null;
  const nextTier = nextTierIdx !== null && nextTierIdx < TIERS.length ? TIERS[nextTierIdx] : null;

  const displayTier = activeTier ? TIERS.find((t) => t.id === activeTier)! : null;

  return (
    <div className="space-y-7">

      {/* Hero */}
      <FadeUp>
        <header
          className="relative rounded-xl border overflow-hidden p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(11,13,24,1))",
            borderColor: "rgba(201,168,76,0.22)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
          />
          <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em] uppercase mb-3">
            Provisioner · Preparedness Assessment
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(22px,5vw,32px)] text-text-base leading-tight mb-2">
            Tier{" "}
            <span className="text-gold-protocol">Assessment</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed max-w-xl mb-5">
            Buying without knowing your tier wastes capital. Know where you
            stand, identify your exact capability gap, and shop from a
            prioritised list — not a generic starter kit.
          </p>
          <div className="inline-flex items-center gap-2 font-mono text-[9px] text-gold-protocol
                          border border-gold-protocol/30 bg-gold-glow px-3 py-1.5 rounded-lg tracking-[.1em]">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-protocol animate-pulse" />
            4 TIERS · T1 → T4
          </div>
        </header>
      </FadeUp>

      {/* Tier cards */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">Tier Framework</h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>

        <StaggerParent className="grid gap-3 sm:grid-cols-2">
          {TIERS.map((t) => (
            <StaggerChild key={t.id}>
              <button
                onClick={() => setActiveTier(activeTier === t.id ? null : t.id as TierId)}
                className={`w-full text-left relative rounded-xl border p-5 overflow-hidden
                            transition-all duration-200 hover:-translate-y-0.5
                            ${activeTier === t.id ? `${t.bg} ${t.border}` : "bg-void-1 border-border-protocol hover:border-border-bright/40"}`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: activeTier === t.id ? `linear-gradient(90deg,${t.bar},transparent)` : "transparent" }}
                />
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded
                                   border ${t.border} ${t.bg} ${t.color}`}>
                    {t.id}
                  </span>
                  <span className="font-mono text-[9px] text-text-mute2">{t.window}</span>
                </div>
                <p className={`font-syne font-bold text-[16px] leading-tight mb-0.5 ${activeTier === t.id ? t.color : "text-text-base"}`}>
                  {t.label}
                </p>
                <p className={`font-mono text-[9px] tracking-[.1em] uppercase mb-3 ${activeTier === t.id ? t.color : "text-text-mute2"}`}>
                  {t.sub}
                </p>
                <p className="font-mono text-[10.5px] text-text-dim leading-relaxed mb-3">
                  {t.desc}
                </p>

                {activeTier === t.id && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-white/[0.07]">
                    <div>
                      <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.14em] uppercase mb-2">
                        Requirements
                      </p>
                      <ul className="space-y-1.5">
                        {t.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-mono text-[10px] flex-shrink-0 mt-px" style={{ color: t.bar }}>→</span>
                            <span className="font-mono text-[10px] text-text-dim leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-mono text-[8.5px] text-text-mute2 tracking-[.14em] uppercase mb-2">
                        Key Gear
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {t.skuLinks.map((s) => (
                          <Link
                            key={s.sku}
                            href="/provisioner"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 font-mono text-[10px]
                                       text-text-mute2 hover:text-text-base transition-colors"
                          >
                            <span className="text-gold-DEFAULT">→</span>
                            {s.label}
                            <span className="text-text-mute2 text-[9px]">({s.sku})</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[9px] text-text-mute2">Estimated cost to reach this tier:</span>
                      <span className={`font-mono text-[13px] font-bold ${t.color}`}>{t.cost}</span>
                    </div>
                  </div>
                )}
              </button>
            </StaggerChild>
          ))}
        </StaggerParent>
      </section>

      {/* Self-assessment quiz */}
      <FadeUp delay={0.1}>
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-syne font-bold text-[17px] text-text-base">Find Your Tier</h2>
            <div className="flex-1 h-px bg-border-protocol" />
            {answered > 0 && (
              <button
                onClick={() => {
                  setAnswers(Object.fromEntries(QUESTIONS.map((q) => [q.id, null])));
                  setShowResult(false);
                }}
                className="font-mono text-[9px] text-text-mute2 hover:text-text-base transition-colors flex-shrink-0"
              >
                Reset
              </button>
            )}
          </div>

          <div className="bg-void-1 border border-border-protocol rounded-xl overflow-hidden">
            {QUESTIONS.map((q, i) => (
              <div
                key={q.id}
                className={`px-4 sm:px-5 py-4 ${i < QUESTIONS.length - 1 ? "border-b border-border-protocol" : ""}`}
              >
                <p className="font-mono text-[11px] text-text-base leading-relaxed mb-3">{q.text}</p>
                <div className="flex gap-2">
                  {(["Yes", "No"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: v === "Yes" }))}
                      className={`px-4 py-1.5 rounded-lg font-mono text-[11px] font-bold border transition-all duration-150
                        ${answers[q.id] === (v === "Yes")
                          ? v === "Yes"
                            ? "bg-green-dim border-green-bright/40 text-green-protocol"
                            : "bg-red-dim border-red-DEFAULT/30 text-red-bright"
                          : "border-border-protocol text-text-mute2 hover:border-border-bright hover:text-text-base"
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Calculate button */}
            <div className="px-4 sm:px-5 py-4 border-t border-border-protocol bg-void-2">
              <button
                onClick={() => setShowResult(true)}
                disabled={answered < QUESTIONS.length}
                className="w-full bg-gold-protocol text-void-0 font-mono font-bold text-[11px]
                           tracking-[.08em] py-3 rounded-lg transition-all duration-150
                           hover:bg-gold-bright hover:-translate-y-0.5
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {answered < QUESTIONS.length
                  ? `${QUESTIONS.length - answered} QUESTION${QUESTIONS.length - answered !== 1 ? "S" : ""} REMAINING`
                  : "CALCULATE MY TIER →"}
              </button>
            </div>
          </div>

          {/* Result */}
          {showResult && resultTier && (
            <div
              className={`mt-4 relative rounded-xl border overflow-hidden p-5 ${resultTier.border} ${resultTier.bg}`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg,${resultTier.bar},transparent)` }}
              />
              <p className="font-mono text-[9px] text-text-mute2 tracking-[.12em] uppercase mb-1">
                Your Current Tier
              </p>
              <p className={`font-syne font-extrabold text-[32px] leading-none ${resultTier.color}`}>
                {resultTier.id}
              </p>
              <p className={`font-mono text-[11px] tracking-[.1em] uppercase mt-1 mb-3 ${resultTier.color}`}>
                {resultTier.label} · {resultTier.sub}
              </p>

              {nextTier ? (
                <>
                  <p className="font-mono text-[10.5px] text-text-dim leading-relaxed mb-4">
                    You are at <strong className={resultTier.color}>{resultTier.id}</strong>. To reach{" "}
                    <strong className={nextTier.color}>{nextTier.id} ({nextTier.label})</strong>, focus on these gaps:
                  </p>
                  <div className="space-y-2 mb-4">
                    {nextTier.skuLinks.map((s) => (
                      <div key={s.sku} className="flex items-center gap-2">
                        <span className="font-mono text-[10px]" style={{ color: nextTier.bar }}>→</span>
                        <Link
                          href="/provisioner"
                          className="font-mono text-[10px] text-text-dim hover:text-text-base transition-colors"
                        >
                          {s.label} <span className="text-text-mute2">({s.sku})</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/provisioner"
                    className="inline-flex items-center gap-2 font-mono text-[11px] font-bold
                               text-void-0 bg-gold-protocol px-4 py-2 rounded-lg
                               hover:bg-gold-bright transition-colors"
                  >
                    Shop {nextTier.id} Gap →
                  </Link>
                </>
              ) : (
                <p className="font-mono text-[11px] text-text-dim leading-relaxed">
                  ✓ T4 capability confirmed. Maintain, document, and drill.
                </p>
              )}
            </div>
          )}
        </section>
      </FadeUp>

      {/* CTA */}
      <FadeUp delay={0.15}>
        <div className="border border-border-protocol rounded-xl px-5 py-4 flex items-center
                         justify-between gap-4 bg-void-1">
          <p className="font-mono text-[11px] text-text-mute2 leading-relaxed">
            Browse all gear sorted by threat domain
          </p>
          <Link
            href="/provisioner/gear"
            className="font-mono text-[10px] text-gold-protocol hover:text-gold-bright
                       transition-colors flex-shrink-0"
          >
            Threat Domain Catalog →
          </Link>
        </div>
      </FadeUp>

    </div>
  );
}
