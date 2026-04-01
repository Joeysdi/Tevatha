// lib/envoy/attribution.ts
//
// Envoy referral attribution — called from webhook handlers.
// All functions are defensive: they never throw. Errors are logged only.
// Wrap call sites in .catch(console.error) for belt-and-suspenders safety.

import { cookies } from "next/headers";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type SupabaseClient = ReturnType<typeof createServiceSupabaseClient>;

// Commission tier thresholds (in cents)
const TIER1_MAX  =  50_000;  // < $500   → 5%
const TIER2_MAX  = 200_000;  // < $2000  → 8%
//                           // >= $2000 → 12%

function commissionRate(amountCents: number): { rate: number; tier: number } {
  if (amountCents < TIER1_MAX)  return { rate: 0.05, tier: 1 };
  if (amountCents < TIER2_MAX)  return { rate: 0.08, tier: 2 };
  return { rate: 0.12, tier: 3 };
}

/**
 * Calculates and upserts a commission record for a confirmed order.
 * Idempotent: ON CONFLICT (order_id) DO NOTHING.
 */
export async function calculateCommission(
  orderId: string,
  code:    string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    const { data: order } = await supabase
      .from("orders")
      .select("amount_cents, user_id")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      console.warn(`[attribution] calculateCommission: order ${orderId} not found`);
      return;
    }

    // Look up the envoy's clerk_user_id from the code
    const { data: envoy } = await supabase
      .from("envoy_codes")
      .select("clerk_user_id")
      .eq("code", code)
      .maybeSingle();

    if (!envoy) {
      console.warn(`[attribution] calculateCommission: code ${code} not found`);
      return;
    }

    const amountCents = order.amount_cents ?? 0;
    const { rate, tier } = commissionRate(amountCents);
    const commissionUsd  = parseFloat(((amountCents / 100) * rate).toFixed(2));

    await supabase
      .from("ambassador_commissions")
      .upsert(
        {
          referred_user_id: order.user_id,
          order_id:         orderId,
          commission_usd:   commissionUsd,
          commission_tier:  tier,
          status:           "pending",
        },
        { onConflict: "order_id", ignoreDuplicates: true }
      );
  } catch (err) {
    console.error("[attribution] calculateCommission error:", err);
  }
}

/**
 * Reads the 'tevatha-ref' cookie and attributes a confirmed order to the
 * envoy who referred the user. Inserts into referral_attributions and
 * triggers commission calculation.
 *
 * Never throws — all errors are caught and logged.
 */
export async function attributeOrder(
  orderId:        string,
  referredUserId: string,
  supabase:       SupabaseClient
): Promise<void> {
  try {
    // 1. Read referral code from HttpOnly cookie
    const cookieStore = await cookies();
    const code = cookieStore.get("tevatha-ref")?.value;
    if (!code) return;

    // 2. Validate code is active
    const { data: envoyCode } = await supabase
      .from("envoy_codes")
      .select("code")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (!envoyCode) {
      console.info(`[attribution] Code ${code} not found or inactive — skipping`);
      return;
    }

    // 3. Insert attribution row (ON CONFLICT DO NOTHING — idempotent)
    const { error: attrError } = await supabase
      .from("referral_attributions")
      .upsert(
        {
          code,
          referred_clerk_user_id: referredUserId,
          order_id:               orderId,
        },
        { onConflict: "order_id", ignoreDuplicates: true }
      );

    if (attrError) {
      console.error("[attribution] Insert referral_attribution error:", attrError);
      return;
    }

    // 4. Calculate and record commission
    await calculateCommission(orderId, code, supabase);
  } catch (err) {
    console.error("[attribution] attributeOrder error:", err);
  }
}
