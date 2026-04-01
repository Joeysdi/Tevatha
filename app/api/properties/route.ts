export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// GET /api/properties
// Query params: source, type, minPrice, maxPrice, offGrid, page, limit
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const source   = searchParams.get("source");
  const type     = searchParams.get("type");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const offGrid  = searchParams.get("offGrid");
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit    = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
  const offset   = (page - 1) * limit;

  try {
    const supabase = createServiceSupabaseClient();

    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .eq("status", "active")
      .order("tevatha_certified", { ascending: false })
      .order("tevatha_rank",      { ascending: true,  nullsFirst: false })
      .order("safety_score",      { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (source)   query = query.eq("source", source);
    if (type)     query = query.eq("property_type", type);
    if (minPrice) query = query.gte("price_usd", parseInt(minPrice, 10) * 100);
    if (maxPrice) query = query.lte("price_usd", parseInt(maxPrice, 10) * 100);
    if (offGrid === "true") query = query.not("off_grid_capacity", "is", null);

    const { data, count, error } = await query;
    if (error) throw error;

    // Strip encrypted fields and exact coords from public response.
    // Expose only lat_approx/lng_approx (~1km precision).
    const properties = (data ?? []).map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { lat_encrypted, lat_iv, lng_encrypted, lng_iv, lat, lng, ...rest } = p as typeof p & {
        lat_encrypted?: string; lat_iv?: string;
        lng_encrypted?: string; lng_iv?: string;
        lat?: number; lng?: number;
      };
      return {
        ...rest,
        lat: rest.lat_approx ?? null,
        lng: rest.lng_approx ?? null,
      };
    });

    return NextResponse.json({ properties, total: count ?? 0, page });
  } catch (err) {
    console.error("[GET /api/properties]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
