// app/(watchtower)/watchtower/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s · Tevatha",
    default:  "Watchtower · Tevatha",
  },
  description: "Tevatha Watchtower — global threat intelligence, collapse scenario analysis, and decision gate monitoring.",
};

export default function WatchtowerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-void-3 overflow-hidden"
         style={{ height: "100dvh" }}>

      {/* ── GLOBAL THREAT MATRIX HEADER ───────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between
                         px-6 py-3.5 bg-void-1 border-b border-border-protocol/40 z-50"
              aria-label="Tevatha Global Threat Matrix"
              style={{ boxShadow: "0 0 24px rgba(232,64,64,0.06)" }}>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-bright animate-pulse flex-shrink-0"
                aria-hidden="true" />
          <span
            className="font-bold text-[14px] tracking-[.3em]"
            style={{
              fontFamily: "var(--font-cinzel)",
              background: "linear-gradient(90deg, #c9a84c, #e84040)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TEVATHA
          </span>
          <span className="w-px h-4 bg-border-protocol opacity-60" aria-hidden="true" />
          <span className="font-mono text-[8.5px] text-text-mute2/60 tracking-[.22em] uppercase">
            Global Threat Matrix
          </span>
        </div>
        <span className="font-mono text-[7.5px] text-text-mute2/30 tracking-[.14em]">
          MATRIX v2.6 · LIVE
        </span>
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
