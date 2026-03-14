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
    <div className="flex flex-col h-screen bg-void-3 overflow-hidden">

      {/* ── TOPBAR (server — static chrome) ──────────────────────────── */}
      <header className="flex-shrink-0 bg-void-1 border-b border-border-protocol
                         px-5 py-2.5 flex items-center justify-between gap-3
                         flex-wrap z-50">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Wordmark */}
          <div className="font-syne font-extrabold text-lg tracking-tight
                          text-gold-protocol leading-none">
            ⚔ <span className="text-gold-protocol">TEVATHA</span>{" "}
            <span className="text-text-mute2 font-light text-xs tracking-[.1em]
                             align-middle">WATCHTOWER</span>
          </div>

          {/* Status badges — static server render */}
          <div className="flex gap-2 flex-wrap">
            <ThreatBadge level="CRITICAL" label="NUCLEAR" dotClass="animate-pulse" />
            <ThreatBadge level="HIGH"     label="ECONOMIC" />
          </div>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          {/* 85s counter — static; no JS timer needed, value is fixed */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-protocol
                             shadow-[0_0_8px_rgba(232,64,64,0.8)]
                             animate-pulse" />
            <span className="font-syne font-bold text-xl text-red-protocol
                             leading-none">85s</span>
            <span className="font-mono text-[10px] text-text-mute2
                             tracking-[.1em]">TO MIDNIGHT</span>
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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 py-7 pb-20 w-full">
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
