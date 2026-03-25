import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EnvoyDashboard } from "@/components/protocol/envoy-dashboard";
import { AuthRequired } from "@/components/protocol/auth-required";

export const metadata: Metadata = { title: "Envoy Dashboard" };

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
        acc.paidUsdc      += r.commission_usdc;
        acc.confirmedCount += 1;
      }
      return acc;
    },
    { totalEarnedUsdc:0, totalEarnedUsd:0, pendingUsdc:0, pendingUsd:0,
      paidUsdc:0, referralCount:0, confirmedCount:0 }
  );
}

export default async function EnvoyPage() {
  const { userId } = await auth();

  if (!userId) {
    return <AuthRequired />;
  }

  let commissions: Commission[] = [];
  let ambassadorTier = 1;

  try {
    const supabase = await createServerSupabaseClient();

    const [{ data: rows }, { data: profileRaw }] = await Promise.all([
      supabase.from("ambassador_commissions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("tier").eq("clerk_user_id", userId).maybeSingle(),
    ]);

    commissions   = (rows ?? []) as Commission[];
    ambassadorTier = (profileRaw as { tier?: number } | null)?.tier ?? 1;
  } catch {
    // Data unavailable — render with empty state
  }

  const stats = computeStats(commissions);

  return (
    <EnvoyDashboard
      commissions={commissions}
      stats={stats}
      ambassadorTier={ambassadorTier}
      userId={userId}
    />
  );
}
