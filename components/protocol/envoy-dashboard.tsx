// components/protocol/envoy-dashboard.tsx
"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { ReferralLinkCard } from "@/components/protocol/referral-link-card";
import { FadeUp, FadeIn, StaggerParent, StaggerChild } from "@/components/ui/motion";

interface Commission {
  id:               string;
  referred_user_id: string | null;
  order_id:         string | null;
  commission_usdc:  number;
  commission_usd:   number;
  commission_tier:  number;
  status:           "pending" | "confirmed" | "paid" | "reversed";
  paid_at:          string | null;
  created_at:       string;
}

interface CommissionStats {
  totalEarnedUsdc: number;
  totalEarnedUsd:  number;
  pendingUsdc:     number;
  pendingUsd:      number;
  paidUsdc:        number;
  referralCount:   number;
  confirmedCount:  number;
}

interface Props {
  commissions:    Commission[];
  stats:          CommissionStats;
  ambassadorTier: number;
  userId:         string;
}

const STATUS_COLOR: Record<Commission["status"], string> = {
  pending:   "text-amber-protocol bg-amber-dim border-amber-DEFAULT/25",
  confirmed: "text-gold-bright bg-gold-glow border-gold-dim",
  paid:      "text-green-protocol bg-green-dim border-green-bright/30",
  reversed:  "text-red-bright bg-red-dim border-red-DEFAULT/25",
};

const TIER_RATES = [
  { tier:1, label:"Envoy",    rate:"5%",  threshold:"$0"      },
  { tier:2, label:"Sentinel", rate:"8%",  threshold:"$10,000" },
  { tier:3, label:"Warden",   rate:"12%", threshold:"$50,000" },
];

export function EnvoyDashboard({ commissions, stats, ambassadorTier, userId }: Props) {
  const { t } = useTranslation();

  const statCards = [
    { labelKey:"envoy_stat_earned" as const, val:`${stats.totalEarnedUsdc.toFixed(2)} USDC`,
      sub:`$${(stats.totalEarnedUsd / 100).toFixed(2)} USD`, col:"text-gold-bright" },
    { labelKey:"envoy_stat_pending" as const, val:`${stats.pendingUsdc.toFixed(2)} USDC`,
      sub:`${commissions.filter((c) => c.status === "pending").length} ${t("envoy_referrals_count")}`,
      col:"text-amber-protocol" },
    { labelKey:"envoy_stat_paid" as const, val:`${stats.paidUsdc.toFixed(2)} USDC`,
      sub:`${stats.confirmedCount} ${t("envoy_confirmed_count")}`, col:"text-green-protocol" },
    { labelKey:"envoy_stat_refs" as const, val:String(stats.referralCount),
      sub:`${t("envoy_ambassador_tier")} ${ambassadorTier}`, col:"text-cyan-DEFAULT" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">

      {/* Header */}
      <FadeUp>
        <header className="border-b border-border-protocol pb-6 sm:pb-8">
          <p className="font-mono text-[9.5px] text-gold-DEFAULT tracking-[.22em] uppercase mb-3">
            {t("envoy_eyebrow")}
          </p>
          <h1 className="font-syne font-extrabold text-[clamp(24px,5vw,36px)]
                          text-text-base leading-tight mb-2">
            Ambassador{" "}
            <span className="text-cyan-DEFAULT">Command</span>
          </h1>
          <p className="text-text-dim text-[13px] leading-relaxed max-w-xl">
            Commission tracking, referral performance, and network depth.
            All figures settled in USDC — no fiat conversion risk.
          </p>
        </header>
      </FadeUp>

      {/* Stat cards */}
      <StaggerParent className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" delayChildren={0.1}>
        {statCards.map((s, i) => (
          <StaggerChild key={s.labelKey}>
            <div className="bg-void-1 border border-cyan-border rounded-2xl p-4 sm:p-5 relative overflow-hidden
                             hover:shadow-[0_8px_24px_rgba(0,212,255,0.12)] transition-shadow duration-200">
              <div className="absolute top-0 left-0 right-0 h-px"
                   style={{ background:"linear-gradient(90deg,#00d4ff,transparent)" }} />
              <p className="font-mono text-[8px] sm:text-[9px] text-text-mute2 tracking-[.14em] uppercase mb-2">
                {t(s.labelKey)}
              </p>
              <p className={`font-mono text-[16px] sm:text-[20px] leading-none mb-1 font-bold ${s.col}`}>
                <FadeIn delay={i * 0.1}>{s.val}</FadeIn>
              </p>
              <p className="font-mono text-[9px] sm:text-[10px] text-text-mute2">{s.sub}</p>
            </div>
          </StaggerChild>
        ))}
      </StaggerParent>

      {/* Referral link */}
      <FadeUp delay={0.2}>
        <ReferralLinkCard userId={userId} />
      </FadeUp>

      {/* Commission tiers */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">{t("envoy_commission_tiers")}</h2>
          <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,#00d4ff22,transparent)" }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIER_RATES.map((r) => {
            const active = ambassadorTier === r.tier;
            return (
              <div key={r.tier}
                className={`relative rounded-xl border p-4 overflow-hidden
                  ${active
                    ? "bg-cyan-dim border-cyan-DEFAULT/50"
                    : "bg-void-1 border-border-protocol"}`}>
                {active && (
                  <div className="absolute top-0 left-0 right-0 h-px"
                       style={{ background:"linear-gradient(90deg,#00d4ff,transparent)" }} />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-[9px] tracking-[.12em] uppercase
                    ${active ? "text-cyan-DEFAULT" : "text-text-mute2"}`}>
                    {t("envoy_tier_num")} {r.tier}
                  </span>
                  {active && (
                    <span className="font-mono text-[8px] text-cyan-DEFAULT border border-cyan-DEFAULT/40
                                     px-2 py-0.5 rounded tracking-[.1em]">{t("envoy_current")}</span>
                  )}
                </div>
                <p className="font-syne font-bold text-[15px] text-text-base mb-1">{r.label}</p>
                <p className={`font-mono text-[22px] font-bold leading-none mb-1
                  ${active ? "text-cyan-DEFAULT" : "text-gold-DEFAULT"}`}>
                  {r.rate}
                </p>
                <p className="font-mono text-[10px] text-text-mute2">{t("envoy_from")} {r.threshold}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commission history */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-syne font-bold text-[17px] text-text-base">{t("envoy_history")}</h2>
          <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,#00d4ff22,transparent)" }} />
        </div>

        {commissions.length === 0 ? (
          <div className="border border-border-protocol rounded-xl p-10 text-center bg-void-1">
            <p className="font-mono text-[10px] text-text-mute2 tracking-[.12em] uppercase mb-2">
              {t("envoy_no_history")}
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              {t("envoy_no_history_sub")}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {commissions.map((c) => (
                <div key={c.id}
                  className="bg-void-1 border border-border-protocol rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-text-mute2">
                      {new Date(c.created_at).toLocaleDateString("en-GB")}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px]
                                      font-bold tracking-[.08em] border ${STATUS_COLOR[c.status] ?? ""}`}>
                      {(c.status ?? "—").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-text-base font-bold">
                      {(c.commission_usdc ?? 0).toFixed(2)} USDC
                    </span>
                    <span className="font-mono text-[10px] text-text-mute2">
                      T{c.commission_tier} · {c.order_id?.slice(0,8).toUpperCase() ?? "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto border border-border-protocol rounded-xl">
              <table className="w-full border-collapse font-mono text-[12px]">
                <thead>
                  <tr>
                    {[t("col_date"), t("col_order"), t("envoy_tier_num"), t("col_amount"), t("col_status")].map((h) => (
                      <th key={h}
                        className="px-4 py-2.5 text-left text-[9px] text-text-dim tracking-[.1em]
                                   uppercase border-b border-border-protocol bg-void-1">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id}
                      className="border-b border-border-protocol last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-mute2 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3 text-text-mute2 text-[10px]">
                        {c.order_id?.slice(0,8).toUpperCase() ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-text-mute2">T{c.commission_tier}</td>
                      <td className="px-4 py-3 text-gold-bright font-bold">
                        {(c.commission_usdc ?? 0).toFixed(2)} USDC
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px]
                                          font-bold tracking-[.08em] border ${STATUS_COLOR[c.status] ?? ""}`}>
                          {(c.status ?? "—").toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
