// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { cinzel, inter, jetbrains, syne } from "@/lib/fonts";
import { LanguageProvider } from "@/lib/i18n/use-translation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s · Tevatha",
    default: "Tevatha — Prepare. Operate. Endure.",
  },
  description:
    "Tevatha is a three-pillar resilience operating system: Watchtower threat intelligence, Provisioner supply chain, and Protocol offline continuity.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://tevatha.com"
  ),
  openGraph: {
    type:        "website",
    siteName:    "Tevatha",
    title:       "Tevatha — Prepare. Operate. Endure.",
    description: "Three-pillar resilience OS: threat intelligence, supply chain, and offline continuity.",
    url:         "/",
  },
  twitter: {
    card:        "summary_large_image",
    site:        "@tevatha",
    creator:     "@tevatha",
    title:       "Tevatha — Prepare. Operate. Endure.",
    description: "Three-pillar resilience OS: threat intelligence, supply chain, and offline continuity.",
  },
  robots: {
    index:     true,
    follow:    true,
    googleBot: { index: true, follow: true },
  },
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
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:z-[9999] focus:top-4 focus:left-4
                       focus:px-4 focus:py-2 focus:rounded-lg focus:font-mono focus:text-[11px]
                       focus:font-bold focus:tracking-[.08em]
                       focus:bg-void-1 focus:border focus:border-gold-protocol
                       focus:text-gold-bright focus:shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
          >
            Skip to main content
          </a>
          <LanguageProvider>
            {children}
          </LanguageProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://tevatha.com/#organization",
                    "name": "Tevatha",
                    "url": "https://tevatha.com",
                    "description": "Tevatha is a three-pillar resilience operating system: Watchtower threat intelligence, Provisioner supply chain, and Protocol offline continuity.",
                    "sameAs": ["https://twitter.com/tevatha"],
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://tevatha.com/#website",
                    "name": "Tevatha",
                    "url": "https://tevatha.com",
                    "description": "Tevatha — Prepare. Operate. Endure. Three-pillar resilience OS: threat intelligence, supply chain, and offline continuity.",
                    "publisher": { "@id": "https://tevatha.com/#organization" },
                  },
                ],
              }),
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
