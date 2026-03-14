// app/(provisioner)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s · Provisioner",
    default: "Provisioner · Tevatha",
  },
};

export default function ProvisionerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-void-0 overflow-hidden">
      <main className="flex-1">{children}</main>
    </div>
  );
}
