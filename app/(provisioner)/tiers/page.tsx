// app/(provisioner)/tiers/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tier Assessment" };

export default function TiersPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void-0">
      <div
        className="rounded-2xl border border-gold-protocol/25 bg-void-1 p-10 text-center max-w-sm w-full relative overflow-hidden"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset" }}
      >
        {/* Gold top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" }}
        />

        <p className="font-mono text-[9.5px] text-gold-protocol tracking-[.22em] uppercase mb-4">
          Provisioner · Tier Assessment
        </p>
        <h1 className="font-syne font-bold text-[22px] text-text-base mb-3">
          Coming Soon
        </h1>
        <p className="font-mono text-[11px] text-text-mute2 leading-relaxed">
          Preparedness scoring engine under construction.
        </p>
      </div>
    </div>
  );
}
