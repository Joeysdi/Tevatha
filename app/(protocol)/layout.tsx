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

const protocolSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tevatha Protocol — Continuity Vault",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Web",
  "url": "https://tevatha.com/ledger",
  "description": "AES-256-GCM encrypted offline continuity ledger. Stores critical survival data — crypto custody, emergency contacts, access protocols, financial architecture — that survives infrastructure collapse. PIN-gated, zero connectivity required.",
  "featureList": [
    "AES-256-GCM client-side encryption",
    "Offline-first IndexedDB storage",
    "PIN-gated vault access",
    "Zero connectivity required",
    "Encrypted categories: crypto custody, access protocol, financial architecture, emergency contacts",
    "Blueprint location data with GPS coordinates and access routes",
    "Supabase sync when online",
    "Envoy referral network",
  ],
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": {
    "@type": "Organization",
    "@id": "https://tevatha.com/#organization",
  },
};

export default function ProtocolLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-void-3 min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(protocolSchema) }}
      />
      <header className="bg-void-1 border-b border-border-bright/60 relative px-4 sm:px-6 py-3 sm:py-3.5
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

      <main id="main-content" className="flex-1 px-0">{children}</main>
    </div>
  );
}
