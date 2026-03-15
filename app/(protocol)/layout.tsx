// app/(protocol)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProtocolNav } from "@/components/protocol/protocol-nav";

export const metadata: Metadata = {
  title: {
    template: "%s · Protocol",
    default: "Protocol · Tevatha",
  },
};

export default function ProtocolLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-void-3 min-h-screen flex flex-col">
      <header className="bg-void-1 border-b border-border-bright/60 relative px-6 py-3.5
                         flex items-center justify-between">
        {/* CYAN top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,#00d4ff,transparent)" }}
        />

        {/* Left: brand + pillar label */}
        <div className="flex items-center gap-2.5">
          <span className="font-syne font-bold text-[17px] text-cyan-DEFAULT">
            ◈ TEVATHA
          </span>
          <span className="w-px h-4 bg-border-bright opacity-40" />
          <span className="font-mono text-[10px] text-text-mute2 tracking-[.18em]">
            PROTOCOL
          </span>
        </div>

        {/* Right: ProtocolNav (client island) */}
        <ProtocolNav />
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
