// app/(protocol)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s · Protocol",
    default: "Protocol · Tevatha",
  },
};

export default function ProtocolLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-void-3">
      <main className="flex-1">{children}</main>
    </div>
  );
}
