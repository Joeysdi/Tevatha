// app/(watchtower)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s · Watchtower",
    default: "Watchtower · Tevatha",
  },
};

// Route group layout — Watchtower has its own nav/shell
export default function WatchtowerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-void-0">
      {/* Watchtower-specific chrome mounts here */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
