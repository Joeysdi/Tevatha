// app/(protocol)/protocol/page.tsx  →  URL: /protocol
"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { FadeUp, StaggerParent, StaggerChild } from "@/components/ui/motion";

const MODULES = [
  {
    href:  "/ledger",
    num:   "01",
    title: "Continuity Ledger",
    desc:  "AES-256 encrypted vault for crypto keys, bunker blueprints, emergency contacts, and access protocols. PIN-gated. IDB-cached. Supabase-synced when online.",
    cta:   "Open Ledger →",
    badge: "OFFLINE CAPABLE",
  },
  {
    href:  "/envoy",
    num:   "02",
    title: "Envoy Network",
    desc:  "Ambassador commission tracking, referral performance, and network depth. All figures settled in USDC — no fiat conversion risk.",
    cta:   "View Dashboard →",
    badge: "LIVE DATA",
  },
];

export default function ProtocolHubPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* Header */}
      <FadeUp>
        <header className="border-b border-border-protocol pb-8">
          <p className="font-mono text-[9.5px] text-cyan-DEFAULT tracking-[.22em] uppercase mb-3">
            {t("proto_hub_eyebrow")}
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,36px)]
                          text-text-base leading-tight mb-2">
            {t("proto_hub_title")}{" "}
            <span className="text-cyan-DEFAULT">{t("proto_hub_highlight")}</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed max-w-xl">
            {t("proto_hub_sub")}
          </p>
        </header>
      </FadeUp>

      {/* Module cards */}
      <StaggerParent className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <StaggerChild key={m.href}>
            <Link href={m.href} className="block group h-full">
              <div
                className="h-full bg-void-1 border border-cyan-border rounded-2xl p-6 relative overflow-hidden
                            hover:shadow-[0_8px_24px_rgba(0,212,255,0.12)] transition-all duration-200
                            hover:-translate-y-0.5"
              >
                {/* CYAN top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg,#00d4ff,transparent)" }}
                />

                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[9px] text-cyan-DEFAULT tracking-[.14em] uppercase">
                    {t("proto_hub_module")} {m.num}
                  </p>
                  <span className="font-mono text-[8px] text-text-mute2 tracking-[.1em]
                                   border border-border-protocol px-2 py-0.5 rounded">
                    {m.badge}
                  </span>
                </div>

                <h2 className="font-syne font-bold text-[18px] text-text-base mb-2">
                  {m.title}
                </h2>
                <p className="font-mono text-[11px] text-text-mute2 leading-relaxed mb-5">
                  {m.desc}
                </p>

                <span className="font-mono text-[10px] text-cyan-DEFAULT
                                 group-hover:underline">
                  {m.cta}
                </span>
              </div>
            </Link>
          </StaggerChild>
        ))}
      </StaggerParent>

      {/* Status strip */}
      <FadeUp delay={0.2}>
        <div className="bg-void-1 border border-border-protocol rounded-xl px-5 py-4
                         flex flex-wrap items-center gap-4">
          {[
            { dot:"bg-cyan-DEFAULT", label:"AES-256-GCM ENCRYPTION" },
            { dot:"bg-green-bright",  label:"OFFLINE CAPABLE" },
            { dot:"bg-gold-protocol", label:"SUPABASE SYNC" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
              <span className="font-mono text-[9px] text-text-mute2 tracking-[.1em]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </FadeUp>

      {/* Escape */}
      <FadeUp delay={0.25}>
        <div className="border-t border-border-protocol pt-6">
          <Link
            href="/watchtower"
            className="font-mono text-[11px] text-text-mute2 hover:text-text-base transition-colors"
          >
            {t("proto_hub_back")}
          </Link>
        </div>
      </FadeUp>
    </div>
  );
}
