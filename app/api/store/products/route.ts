export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// GET /api/store/products
// Query params: category, source, minPrice, maxPrice, page (default 1), limit (default 24)
// Sort: tevatha_certified DESC, tevatha_rank ASC NULLS LAST, safety_score DESC NULLS LAST
// Excludes soft-deleted and non-active products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const source   = searchParams.get("source");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)));
    const offset   = (page - 1) * limit;

    const supabase = createServiceSupabaseClient();

    let query = supabase
      .from("store_products")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .eq("status", "active")
      .order("tevatha_certified", { ascending: false })
      .order("tevatha_rank",      { ascending: true,  nullsFirst: false })
      .order("safety_score",      { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq("category", category);
    if (source)   query = query.eq("source", source);
    if (minPrice) query = query.gte("min_price_usd", parseInt(minPrice, 10));
    if (maxPrice) query = query.lte("min_price_usd", parseInt(maxPrice, 10));

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ products: data ?? [], total: count ?? 0, page });
  } catch (err) {
    console.error("[GET /api/store/products]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
