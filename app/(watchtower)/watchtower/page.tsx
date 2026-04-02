// app/(watchtower)/watchtower/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import splits the entire watchtower component tree (including ~180 KB of
// geo-risk / scenario / gate data) into its own lazy chunk. Other routes never parse it.
const WatchtowerGlobeShell = dynamic(() =>
  import("@/components/watchtower/watchtower-globe-shell").then(
    (m) => ({ default: m.WatchtowerGlobeShell }),
  ),
);

export const metadata: Metadata = {
  title: "Watchtower",
  description:
    "Free real-time global threat intelligence: 73% financial collapse probability, 85 seconds to midnight, scenario analysis, and live signal feeds. No paywall. Nonprofit.",
  openGraph: {
    title:       "Watchtower · Tevatha — Free Threat Intelligence",
    description: "85 seconds to midnight. 73% financial collapse probability. Free real-time threat intelligence — no paywall, no subscription.",
    url:         "/watchtower",
  },
  twitter: {
    title:       "Watchtower · Tevatha",
    description: "Real-time global threat intelligence: collapse probability matrix, scenario analysis, signal feeds, and doomsday clock.",
  },
  alternates: { canonical: "/watchtower" },
};

const watchtowerSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tevatha Watchtower",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Web",
  "url": "https://tevatha.com/watchtower",
  "description": "Real-time global threat intelligence dashboard with collapse probability matrix, nuclear and geopolitical signal feeds, doomsday clock, and scenario analysis.",
  "featureList": [
    "Global collapse probability index",
    "Nuclear threat vector monitoring",
    "Geopolitical signal feeds",
    "Doomsday clock — 85 seconds to midnight display",
    "Six threat domain analysis: Nuclear, Cyber, Civil Unrest, Economic, Biological, Climate",
    "Scenario probability engine",
    "Historical era scrubber 1945–2100",
    "Commodity price overlays",
    "Decision gate matrix",
    "Psychology of collapse analysis",
  ],
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": {
    "@type": "Organization",
    "@id": "https://tevatha.com/#organization",
  },
};

export default function WatchtowerHubPage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(watchtowerSchema) }}
      />
      <h1 className="sr-only">Watchtower — Global Threat Intelligence Dashboard</h1>
      <Suspense>
        <WatchtowerGlobeShell />
      </Suspense>
    </div>
  );
}
