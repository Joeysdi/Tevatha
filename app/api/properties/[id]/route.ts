export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// GET /api/properties/[id]  — fetch by UUID or slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createServiceSupabaseClient();

    // Try UUID first, then slug
    const isUUID = /^[0-9a-f-]{36}$/i.test(id);
    const query  = isUUID
      ? supabase.from("properties").select("*").eq("id", id).is("deleted_at", null).single()
      : supabase.from("properties").select("*").eq("slug", id).is("deleted_at", null).single();

    const { data, error } = await query;
    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/properties/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
