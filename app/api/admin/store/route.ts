export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { slugify }                   from "@/lib/store/normalize/shared";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";

// GET /api/admin/store — all products including review/draft
// ?includeDeleted=true → includes soft-deleted
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = req.nextUrl;
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const supabase = createServiceSupabaseClient();

    let query = supabase
      .from("store_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!includeDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ products: data ?? [] });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}

// POST /api/admin/store — create manual product
// Forces source='manual', tevatha_certified=true by default
// Auto-generates slug if absent
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    // Enforce manual source
    body.source = "manual";
    if (body.tevatha_certified === undefined) {
      body.tevatha_certified = true;
    }

    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = slugify(body.title) + "-" + Date.now().toString(36);
    }

    // Strip client-supplied id/timestamps
    delete body.id;
    delete body.created_at;
    delete body.updated_at;

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("store_products")
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
