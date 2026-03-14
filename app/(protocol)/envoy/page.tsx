import type { Metadata }         from "next";
import { auth }                   from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReferralLinkCard }       from "@/components/protocol/referral-link-card";

export const metadata: Metadata = { title: "Envoy Dashboard" };

// ── Types ───────────────────────────────────────────────────────────────────

interface Commission {
  id:              string;
  referred_user_id: string | null;
  order_id:        string | null;
  commission_usdc: number;
  commission_usd:  number;
  commission_tier: number;
  status:          "pending" | "confirmed" | "paid" | "reversed";
  paid_at:         string | null;
  created_at:      string;
}

interface CommissionStats {
  totalEarnedUsdc:   number;
  totalEarnedUsd:    number;
  pendingUsdc:       number;
  pendingUsd:        number;
  paidUsdc:          number;
  referralCount:     number;
  confirmedCount:    number;
}

function computeStats(rows: Commission[]): CommissionStats {
  return rows.reduce<CommissionStats>(
    (acc, r) => {
      acc.referralCount   += 1;
      acc.totalEarnedUsdc += r.commission_usdc;
      acc.totalEarnedUsd  += r.commission_usd;
      if (r.status === "pending") {
        acc.pendingUsdc += r.commission_usdc;
        acc.pendingUsd  += r.commission_usd;
      }
      if (r.status === "paid") {
        acc.paidUsdc   += r.commission_usdc;
        acc.confirmedCount += 1;
      }
      return acc;
    },
    { totalEarnedUsdc:0, totalEarnedUsd:0, pendingUsdc:0, pendingUsd:0,
      paidUsdc:0, referralCount:0, confirmedCount:0 }
  );
}

const STATUS_COLOR: Record<Commission["status"], string> = {
  pending:   "text-amber-protocol bg-amber-dim border-amber-DEFAULT/25",
  confirmed: "text-gold-bright bg-gold-glow border-gold-dim",
  paid:      "text-green-protocol bg-green-dim border-green-bright/30",
  reversed:  "text-red-bright bg-red-dim border-red-DEFAULT/25",
};

// ── Page (Server Component) ─────────────────────────────────────────────────

export default async function EnvoyPage() {
  const { userId } = await auth();
  if (!userId) return null; // proxy.ts enforces auth — this is a type guard

  const supabase = await createServerSupabaseClient();

  // Fetch commissions for the authenticated ambassador
  const { data: rows, error } = await supabase
    .from("ambassador_commissions")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch ambassador tier (stored in profiles.tier)
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();
  const profile = profileRaw as { tier?: number } | null;

  const commissions: Commission[] = rows ?? [];
  const stats                     = computeStats(commissions);
  const ambassadorTier            = profile?.tier ?? 1;

  const statCards = [
    { label: "Total Earned", val: `${stats.totalEarnedUsdc.toFixed(2)} USDC`,
      sub: `$${(stats.totalEarnedUsd / 100).toFixed(2)} USD`, col: "text-gold-bright" },
    { label: "Pending",      val: `${stats.pendingUsdc.toFixed(2)} USDC`,
      sub: `${commissions.filter((c) => c.status === "pending").length} referrals`, col: "text-amber-protocol" },
    { label: "Paid Out",     val: `${stats.paidUsdc.toFixed(2)} USDC`,
      sub: `${stats.confirmedCount} confirmed`, col: "text-green-protocol" },
    { label: "Referrals",    val: String(stats.referralCount),
      sub: `Ambassador Tier ${ambassadorTier}`, col: "text-cyan-DEFAULT" },
  ];

  // Commission tier rates table
  const tierRates = [
    { tier:1, label:"Envoy",    rate:"5%",  threshold:"$0"       },
    { tier:2, label:"Sentinel", rate:"8%",  threshold:"$10,000"  },
    { tier:3, label:"Warden",   rate:"12%", threshold:"$50,000"  },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

      {/* ── Header ── */}
      <header className="border-b border-border-protocol pb-8">
        <p className="font-mono text-[9.5px] text-gold-DEFAULT tracking-[.22em] uppercase mb-3">
          Protocol · Envoy Network
        </p>
        <h1 className="font-syne font-extrabold text-[clamp(26px,5vw,36px)]
                        text-text-base leading-tight mb-2">
          Ambassador{" "}
          <span className="text-cyan-DEFAULT">Command</span>
        </h1>
        <p className="text-text-dim text-[13px] leading-relaxed max-w-xl">
          Commission tracking, referral performance, and network depth.
          All figures settled in USDC — no fiat conversion risk.
        </p>
      </header>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label}
            className="bg-glass-protocol border border-border-protocol
                       rounded-card-lg px-5 py-4 backdrop-blur-glass">
            <p className="font-mono text-[9px] text-text-mute2
                           tracking-[.14em] uppercase mb-2">{s.label}</p>
            <p className={`font-syne font-extrabold text-[22px] leading-none mb-1 ${s.col}`}>
              {s.val}
            </p>
            <p className="font-mono text-[10px] text-text-mute2">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* ── Referral link (Client island) ── */}
      <ReferralLinkCard userId={userId} />

      {/* ── Commission tier table ── */}
      <section>
        <h2 className="font-syne font-bold text-[15px] text-text-base mb-4">
          Commission Tiers
        </h2>
        <div className="overflow-x-auto border border-border-protocol rounded-card">
          <table className="w-full border-collapse font-mono text-[12px]">
            <thead>
              <tr>
                {["Tier","Level","Rate","Threshold"].map((h) => (
                  <th key={h}
                    className="px-4 py-2.5 text-left text-[9px] text-text-dim
                               tracking-[.1em] uppercase border-b border-border-protocol
                               bg-glass-DEFAULT">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tierRates.map((r) => (
                <tr key={r.tier}
                  className={`border-b border-border-protocol last:border-0
                    ${ambassadorTier === r.tier ? "bg-cyan-dim" : ""}`}>
                  <td className="px-4 py-3 text-text-mute2">{r.tier}</td>
                  <td className="px-4 py-3 text-text-base font-bold">{r.label}</td>
                  <td className={`px-4 py-3 font-bold
                    ${ambassadorTier === r.tier ? "text-cyan-DEFAULT" : "text-gold-DEFAULT"}`}>
                    {r.rate}
                  </td>
                  <td className="px-4 py-3 text-text-dim">{r.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Commission history ── */}
      <section>
        <h2 className="font-syne font-bold text-[15px] text-text-base mb-4">
          Commission History
        </h2>
        {commissions.length === 0 ? (
          <div className="border border-border-protocol rounded-card p-10
                           text-center bg-glass-DEFAULT">
            <p className="font-mono text-[11px] text-text-mute2 tracking-[.12em]">
              NO COMMISSIONS YET — SHARE YOUR REFERRAL LINK
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border-protocol rounded-card">
            <table className="w-full border-collapse font-mono text-[12px]">
              <thead>
                <tr>
                  {["Date","Order","Tier","Amount","Status"].map((h) => (
                    <th key={h}
                      className="px-4 py-2.5 text-left text-[9px] text-text-dim
                                 tracking-[.1em] uppercase border-b border-border-protocol
                                 bg-glass-DEFAULT">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}
                    className="border-b border-border-protocol last:border-0
                               hover:bg-glass-hover transition-colors">
                    <td className="px-4 py-3 text-text-mute2 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 text-text-mute2 font-mono text-[10px]">
                      {c.order_id?.slice(0, 8).toUpperCase() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-text-mute2">T{c.commission_tier}</td>
                    <td className="px-4 py-3 text-gold-bright font-bold">
                      {c.commission_usdc.toFixed(2)} USDC
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px]
                                        font-bold tracking-[.08em] border
                                        ${STATUS_COLOR[c.status]}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
