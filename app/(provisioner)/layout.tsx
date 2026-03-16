// app/(provisioner)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProvisionerHeader } from "@/components/provisioner/provisioner-header";

export const metadata: Metadata = {
  title: {
    template: "%s · Provisioner",
    default: "Provisioner · Tevatha",
  },
};

export default function ProvisionerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-void-0 min-h-screen flex flex-col">
      <ProvisionerHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {children}
      </main>
    </div>
  );
}
