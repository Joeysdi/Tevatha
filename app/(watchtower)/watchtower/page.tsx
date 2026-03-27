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
    "Real-time global threat intelligence: collapse probability matrix, scenario analysis, signal feeds, and doomsday clock monitoring.",
  openGraph: {
    title:       "Watchtower · Tevatha",
    description: "Real-time global threat intelligence: collapse probability matrix, scenario analysis, signal feeds, and doomsday clock monitoring.",
    url:         "/watchtower",
  },
  twitter: {
    title:       "Watchtower · Tevatha",
    description: "Real-time global threat intelligence: collapse probability matrix, scenario analysis, signal feeds, and doomsday clock.",
  },
  alternates: { canonical: "/watchtower" },
};

export default function WatchtowerHubPage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <h1 className="sr-only">Watchtower — Global Threat Intelligence Dashboard</h1>
      <Suspense>
        <WatchtowerGlobeShell />
      </Suspense>
    </div>
  );
}
