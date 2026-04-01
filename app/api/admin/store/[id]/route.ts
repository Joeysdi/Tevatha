export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { auth }                      from "@clerk/nextjs/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");
  return userId;
}

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/store/[id] — update product
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body   = await req.json();

    delete body.id;
    delete body.created_at;

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("store_products")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: msg === "unauthenticated" ? 401 : 500 });
  }
}

// DELETE /api/admin/store/[id] — soft-delete (sets deleted_at + status='archived')
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const supabase = createServiceSupabaseClient();
    const { error } = await supabase
      .from("store_products")
      .update({ deleted_at: new Date().toISOString(), status: "archived" })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: msg === "unauthenticated" ? 401 : 500 });
  }
}
