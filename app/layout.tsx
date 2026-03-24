// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { cinzel, inter, jetbrains, syne } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s · Tevatha",
    default: "Tevatha — Prepare. Operate. Endure.",
  },
  description:
    "Tevatha is a three-pillar resilience operating system: Watchtower, Provisioner, Protocol.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://tevatha.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#05080a",
          colorInputBackground: "#0c1218",
          colorText: "#e2d8c8",
          colorPrimary: "#d4a832",
          colorDanger: "#c94040",
          borderRadius: "8px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
      }}
    >
      <html
        lang="en"
        className={`
          ${cinzel.variable}
          ${inter.variable}
          ${jetbrains.variable}
          ${syne.variable}
        `}
      >
        <body className="bg-void-0 text-text-base font-sans antialiased overscroll-none">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
