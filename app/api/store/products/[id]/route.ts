export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f-]{36}$/i;

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/store/products/[id]
// Accepts UUID or slug. Includes variants. Returns 404 if soft-deleted.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = createServiceSupabaseClient();

    const isUuid = UUID_RE.test(id);
    const column = isUuid ? "id" : "slug";

    const { data, error } = await supabase
      .from("store_products")
      .select("*, store_variants(*)")
      .eq(column, id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/store/products/[id]]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
