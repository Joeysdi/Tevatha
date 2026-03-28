// app/(provisioner)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProvisionerHeader } from "@/components/provisioner/provisioner-header";
import { ProvisionerAtmosphere } from "@/components/provisioner/provisioner-atmosphere";

export const metadata: Metadata = {
  title: {
    template: "%s · Provisioner",
    default: "Provisioner · Tevatha",
  },
};

const provisonerSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Tevatha Provisioner",
  "url": "https://tevatha.com/provisioner",
  "description": "Tevatha-certified emergency preparedness hardware store. Curated resilience gear across Communications, Medical, Water & Food, Power, and Security categories. Graded A–D across five supply-chain and reliability layers.",
  "paymentAccepted": "Credit Card, USDC Cryptocurrency",
  "currenciesAccepted": "USD, USDC",
  "priceRange": "$$",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tevatha-Certified Resilience Gear",
    "itemListElement": [
      { "@type": "OfferCatalog", "name": "Communications — Satellite, radio, faraday" },
      { "@type": "OfferCatalog", "name": "Medical — Trauma kits, antibiotics" },
      { "@type": "OfferCatalog", "name": "Water & Food — Filtration, long-shelf storage" },
      { "@type": "OfferCatalog", "name": "Power — Solar, battery banks, EMP-safe" },
      { "@type": "OfferCatalog", "name": "Security — Physical security, safes" },
    ],
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://tevatha.com/#organization",
  },
};

export default function ProvisionerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-void-0 min-h-screen flex flex-col relative overflow-x-hidden">
      <ProvisionerAtmosphere />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(provisonerSchema) }}
      />
      <ProvisionerHeader />

      <main id="main-content" className="relative z-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {children}
      </main>
    </div>
  );
}
