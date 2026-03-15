// app/(provisioner)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s · Provisioner",
    default: "Provisioner · Tevatha",
  },
};

export default function ProvisionerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-void-0 min-h-screen flex flex-col">
      <header className="bg-void-1 border-b border-border-bright/60 relative px-6 py-3.5 flex items-center justify-between">
        {/* Gold top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,#f0c842,#c9a84c,transparent)" }}
        />

        {/* Left: brand + pillar label */}
        <div className="flex items-center gap-2.5">
          <span className="font-syne font-bold text-[17px] text-gold-protocol">
            ⚙ TEVATHA
          </span>
          <span className="w-px h-4 bg-border-bright opacity-40" />
          <span className="font-mono text-[10px] text-text-mute2 tracking-[.18em]">
            PROVISIONER
          </span>
        </div>

        {/* Right: cross-pillar back link */}
        <Link
          href="/watchtower"
          className="font-mono text-[11px] text-text-mute2 hover:text-gold-bright
                     border border-border-protocol rounded-lg px-3 py-1.5
                     hover:border-gold-protocol/40 transition-all duration-200"
        >
          ← Watchtower
        </Link>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
