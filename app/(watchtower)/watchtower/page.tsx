// app/(watchtower)/watchtower/page.tsx
import type { Metadata } from "next";
import { WatchtowerGlobeShell } from "@/components/watchtower/watchtower-globe-shell";

export const metadata: Metadata = { title: "Watchtower" };

export default function WatchtowerHubPage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <WatchtowerGlobeShell />
    </div>
  );
}
