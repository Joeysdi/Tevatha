// app/(watchtower)/watchtower/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { WatchtowerGlobeShell } from "@/components/watchtower/watchtower-globe-shell";

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
