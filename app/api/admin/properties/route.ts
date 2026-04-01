export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";

// GET /api/admin/properties — list all (including drafts/deleted)
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceSupabaseClient();
    const { data, count, error } = await supabase
      .from("properties")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("tevatha_certified", { ascending: false })
      .order("tevatha_rank",      { ascending: true, nullsFirst: false })
      .order("created_at",        { ascending: false });

    if (error) throw error;
    return NextResponse.json({ properties: data ?? [], total: count ?? 0 });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}

// POST /api/admin/properties — create Tevatha-Certified listing
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .substring(0, 80) + "-" + Date.now().toString(36);
    }

    // Force source = tevatha for admin-created listings
    body.source            = "tevatha";
    body.tevatha_certified = body.tevatha_certified ?? true;

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("properties")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}
