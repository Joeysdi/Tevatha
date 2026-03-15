// app/(watchtower)/watchtower/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SignalTicker }    from "@/components/watchtower/signal-ticker";
import { LiveClock }       from "@/components/watchtower/live-clock";
import { WatchtowerNav }   from "@/components/watchtower/watchtower-nav";
import { TICKER_TEXT }     from "@/lib/watchtower/data";

export const metadata: Metadata = {
  title: {
    template: "%s · Watchtower",
    default:  "Watchtower · Tevatha",
  },
  description: "Tevatha Watchtower — global threat intelligence, collapse scenario analysis, and decision gate monitoring.",
};

// Shared nav link definitions — defined server-side, passed to client nav
const NAV_LINKS = [
  { href: "/watchtower",             label: "⬡ Hub"         },
  { href: "/watchtower/scenarios",   label: "Scenarios"     },
  { href: "/watchtower/timeline",    label: "Timeline"      },
  { href: "/watchtower/signals",     label: "Signal Feed"   },
  { href: "/watchtower/gear",        label: "Gear Tables"   },
  { href: "/watchtower/psychology",  label: "Psychology"    },
] as const;

export type WatchtowerNavLink = (typeof NAV_LINKS)[number];

export default function WatchtowerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-void-3 overflow-hidden"
         style={{ height: "100dvh" }}>

      {/* ── TOPBAR (server — static chrome) ──────────────────────────── */}
      <header className="flex-shrink-0 bg-void-1 border-b border-border-bright/60
                         px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3
                         z-50"
              style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)" }}>
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          {/* Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 leading-none flex-shrink-0">
            <span className="font-syne font-extrabold text-[15px] sm:text-[17px] tracking-tight
                             text-gold-protocol">
              ⚔ TEVATHA
            </span>
            <span className="w-px h-4 bg-border-bright opacity-40" />
            <span className="font-mono text-[9px] sm:text-[10px] text-text-mute2 tracking-[.18em] uppercase">
              Watchtower
            </span>
          </div>

          {/* Status badges — hidden on small screens to save space */}
          <div className="hidden sm:flex gap-2">
            <ThreatBadge level="CRITICAL" label="NUCLEAR" dotClass="animate-pulse" />
            <ThreatBadge level="HIGH"     label="ECONOMIC" />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {/* 85s counter */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-lg
                          bg-red-protocol/10 border border-red-protocol/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-protocol
                             shadow-[0_0_8px_rgba(232,64,64,0.9)]
                             animate-pulse flex-shrink-0" />
            <span className="font-syne font-bold text-[16px] sm:text-[18px] text-red-protocol
                             leading-none tabular-nums">85s</span>
            <span className="font-mono text-[9px] sm:text-[9.5px] text-text-mute2
                             tracking-[.12em] uppercase hidden xs:inline">to midnight</span>
          </div>

          {/* Live UTC clock — isolated client island */}
          <LiveClock />
        </div>
      </header>

      {/* ── TICKER — client island for CSS animation ─────────────────── */}
      <SignalTicker text={TICKER_TEXT} />

      {/* ── NAV — client island for usePathname active state ────────── */}
      <WatchtowerNav links={NAV_LINKS} />

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto overscroll-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

// ── Sub-component: static threat badge (server renderable) ────────────
function ThreatBadge({
  level,
  label,
  dotClass = "",
}: {
  level: "CRITICAL" | "HIGH" | "ELEVATED";
  label: string;
  dotClass?: string;
}) {
  const styles = {
    CRITICAL: "bg-red-dim    text-red-bright  border border-red-protocol/30",
    HIGH:     "bg-amber-dim  text-amber-protocol border border-amber-DEFAULT/25",
    ELEVATED: "bg-blue-dim   text-blue-DEFAULT  border border-blue-DEFAULT/25",
  } as const;

  const dotColor = {
    CRITICAL: "bg-red-protocol shadow-[0_0_6px_rgba(232,64,64,0.8)]",
    HIGH:     "bg-amber-protocol shadow-[0_0_6px_rgba(240,165,0,0.7)]",
    ELEVATED: "bg-blue-DEFAULT  shadow-[0_0_6px_rgba(58,122,191,0.7)]",
  } as const;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full
                      font-mono text-[10.5px] font-semibold tracking-[.05em]
                      ${styles[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                        ${dotColor[level]} ${dotClass}`} />
      {label}: {level}
    </span>
  );
}
