export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// GET /api/envoy/validate?code=ENV-XXXXXX
// Public — unprotected. Rate-limited via middleware (envoyLimiter: 20 req/min).
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code || !code.startsWith("ENV-") || code.length !== 10) {
    return NextResponse.json({ valid: false });
  }

  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("envoy_codes")
      .select("code")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ valid: !!data });
  } catch (err) {
    console.error("[GET /api/envoy/validate]", err);
    return NextResponse.json({ valid: false });
  }
}
