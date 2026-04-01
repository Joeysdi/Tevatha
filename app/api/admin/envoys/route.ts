export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateCode(): string {
  let suffix = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) {
    suffix += CODE_CHARS[b % CODE_CHARS.length];
  }
  return `ENV-${suffix}`;
}

// GET /api/admin/envoys — list codes with referral count + commission sum
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("envoy_codes")
      .select(`
        id, code, clerk_user_id, created_by, is_active, created_at,
        referral_attributions (
          id,
          order_id
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich with commission sums from ambassador_commissions
    const codes = data ?? [];
    const orderIds = codes
      .flatMap((c) => (c.referral_attributions ?? []).map((r: { order_id: string | null }) => r.order_id))
      .filter(Boolean) as string[];

    let commissionMap: Record<string, number> = {};
    if (orderIds.length > 0) {
      const { data: commissions } = await supabase
        .from("ambassador_commissions")
        .select("order_id, commission_usd")
        .in("order_id", orderIds);

      for (const c of commissions ?? []) {
        commissionMap[c.order_id] = (commissionMap[c.order_id] ?? 0) + (c.commission_usd ?? 0);
      }
    }

    const result = codes.map((c) => {
      const refs = c.referral_attributions ?? [];
      const totalCommission = refs.reduce(
        (sum: number, r: { order_id: string | null }) =>
          sum + (r.order_id ? (commissionMap[r.order_id] ?? 0) : 0),
        0
      );
      return {
        id:               c.id,
        code:             c.code,
        clerk_user_id:    c.clerk_user_id,
        created_by:       c.created_by,
        is_active:        c.is_active,
        created_at:       c.created_at,
        referral_count:   refs.length,
        total_commission: totalCommission,
      };
    });

    return NextResponse.json({ envoys: result });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}

// POST /api/admin/envoys — issue a new envoy code
// Body: { clerk_user_id: string }
export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin();
    const { clerk_user_id } = await req.json();
    if (!clerk_user_id?.trim()) {
      return NextResponse.json({ error: "clerk_user_id is required" }, { status: 422 });
    }

    const supabase = createServiceSupabaseClient();

    // Retry up to 5 times on code collision
    let inserted = null;
    let lastError = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const { data, error } = await supabase
        .from("envoy_codes")
        .insert({ code, clerk_user_id, created_by: adminId })
        .select()
        .single();

      if (!error) { inserted = data; break; }
      // 23505 = unique violation — retry with a new code
      if (error.code !== "23505") { lastError = error; break; }
    }

    if (!inserted) {
      throw lastError ?? new Error("Failed to generate unique code after 5 attempts");
    }

    return NextResponse.json(
      { code: inserted.code, clerk_user_id: inserted.clerk_user_id },
      { status: 201 }
    );
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}
