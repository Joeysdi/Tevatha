// app/(watchtower)/watchtower/timeline/page.tsx
import type { Metadata } from "next";
import { GateTable }      from "@/components/watchtower/gate-table";
import { ProvisionerCta } from "@/components/watchtower/provisioner-cta";
import { FadeUp }         from "@/components/ui/motion";
import { TIMELINE_EVENTS, GATES } from "@/lib/watchtower/data";

export const metadata: Metadata = { title: "Timeline" };

const PHASE_COLORS = [
  { label:"P1 Stability",  years:"1945–71",  hex:"#38bdf8" },
  { label:"P2 Expansion",  years:"1971–08",  hex:"#818cf8" },
  { label:"P3 Stress",     years:"2008–20",  hex:"#fbbf24" },
  { label:"P4 NOW ◀",      years:"2020+",    hex:"#e84040", isNow:true },
  { label:"P5 Cascade",    years:"2025–30",  hex:"#ff0055" },
  { label:"P6 Resolve",    years:"2028+",    hex:"#475569" },
];

const EVENT_COLORS = {
  red:  "#e84040",
  warn: "#f0a500",
  info: "#38bdf8",
  pink: "#ff0055",
} as const;

export default function TimelinePage() {
  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em]
                       uppercase mb-3">
          Doomsday Timeline · 1944–2026
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,34px)]
                       leading-[1.12] text-text-base mb-2">
          Civilisational{" "}
          <span className="text-red-bright">Escalation Arc</span>
        </h1>
        <p className="text-text-dim max-w-[620px] leading-relaxed text-[13px] mb-3">
          Collapse does not surprise prepared people. It surprises those who
          mistook the escalation for stability. Every step of the arc is
          documented — with the action required at each node.
        </p>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         bg-red-dim text-red-bright border border-red-protocol/28
                         font-mono text-[10.5px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse" />
          CURRENT PHASE: 4 — ACCELERATION (2020–2026+)
        </span>
      </header>

      {/* Phase bar — purely decorative, static server render */}
      <section className="bg-void-1 border border-border-protocol rounded-[10px]
                           p-4.5 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-syne font-bold text-[17px] text-text-base whitespace-nowrap">
            Phase Overview — 1945 to Resolution
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
        <div className="flex rounded-lg overflow-hidden border border-border-protocol">
          {PHASE_COLORS.map((p) => (
            <div
              key={p.label}
              className="flex-1 py-2.5 px-1.5 text-center border-r
                         border-border-protocol last:border-r-0 min-w-0"
              style={{ background: `${p.hex}22` }}
            >
              <div
                className="font-syne font-bold text-[11px] truncate"
                style={{ color: p.hex }}
              >
                {p.label}
              </div>
              <div className="font-mono text-[9px] text-text-mute2">{p.years}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline events */}
      <section className="bg-void-1 border border-border-protocol rounded-[10px]
                           p-4.5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base whitespace-nowrap">
            Key Event Nodes
          </h2>
          <div className="flex-1 h-px bg-border-protocol" />
        </div>
        <div className="relative pl-0">
          {/* Spine */}
          <div
            className="absolute left-[22px] top-0 bottom-0 w-px"
            style={{
              background: "linear-gradient(to bottom,rgba(255,255,255,0.11),rgba(255,255,255,0.06))",
            }}
          />

          {TIMELINE_EVENTS.map((e, i) => {
            const col = EVENT_COLORS[e.colKey];
            return (
              <FadeUp key={i} delay={i * 0.07}>
              <div className="relative pl-[52px] pb-5">
                {/* Node dot */}
                <div
                  className="absolute left-[14px] top-3.5 w-4 h-4 rounded-full
                               border-2 border-void-1"
                  style={{
                    background: col,
                    boxShadow: `0 0 ${e.isNow ? "12px" : "6px"} ${col}`,
                  }}
                />

                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <span
                    className="font-mono text-[11px] font-bold"
                    style={{ color: e.isNow ? "#e84040" : "#c9a84c" }}
                  >
                    {e.year}
                  </span>
                  <span
                    className={`font-syne text-[14px] leading-snug
                                 ${e.isNow ? "font-bold text-text-base" : "font-semibold text-text-dim"}`}
                  >
                    {e.label}
                  </span>
                  {e.isNow && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                                     bg-red-dim text-red-bright border border-red-protocol/28
                                     font-mono text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-bright animate-pulse" />
                      NOW
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-text-mute2 leading-relaxed">
                  ▸ {e.signal}
                </div>
              </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      {/* Decision gates — client island for show/hide toggle */}
      <GateTable gates={GATES} />

      <ProvisionerCta
        headline="Phase 4: Acceleration is not a metaphor."
        subtext="The Timeline tells you where we are. The Provisioner is where you act — property, stores, community, and protocol ready before the next gate fires."
        label="Enter the Provisioner →"
        urgency="PHASE 4 ACTIVE · 2027 CASCADE WINDOW: APPROACHING"
      />
    </div>
  );
}
