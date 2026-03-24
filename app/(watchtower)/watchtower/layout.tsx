// app/(watchtower)/watchtower/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s · Watchtower",
    default:  "Watchtower · Tevatha",
  },
  description: "Tevatha Watchtower — global threat intelligence, collapse scenario analysis, and decision gate monitoring.",
};

export default function WatchtowerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-void-3 overflow-hidden"
         style={{ height: "100dvh" }}>

      {/* ── DOOMSDAY BAR — single focused indicator ───────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-center
                         bg-void-1 border-b border-red-protocol/20 py-1.5 z-50"
              style={{ boxShadow: "0 0 24px rgba(232,64,64,0.08)" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-protocol
                           shadow-[0_0_8px_rgba(232,64,64,0.9)] animate-pulse" />
          <span className="font-syne font-extrabold text-[22px] text-red-protocol
                           leading-none tabular-nums">85s</span>
          <span className="font-mono text-[9px] text-text-mute2
                           tracking-[.16em] uppercase">to midnight</span>
        </div>
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
