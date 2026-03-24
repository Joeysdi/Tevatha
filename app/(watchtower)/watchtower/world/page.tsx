// app/(watchtower)/watchtower/world/page.tsx  →  URL: /watchtower/world
import type { Metadata } from "next";
import { WorldRiskGlobe } from "@/components/watchtower/world-risk-globe";

export const metadata: Metadata = {
  title: "World Risk",
  description: "Interactive 3D globe — geopolitical threat intelligence across all nations.",
};

export default function WorldRiskPage() {
  // Break out of layout's max-w-5xl / px / py wrapper entirely.
  // position:absolute + inset-0 anchors to <main> which has position:relative.
  return (
    <div className="absolute inset-0 overflow-hidden">
      <WorldRiskGlobe />
    </div>
  );
}
