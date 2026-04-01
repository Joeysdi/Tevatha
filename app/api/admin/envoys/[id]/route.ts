export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/envoys/[id] — toggle is_active
// Body: { is_active: boolean }
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { is_active } = await req.json();

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "is_active must be a boolean" }, { status: 422 });
    }

    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("envoy_codes")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}

// DELETE /api/admin/envoys/[id] — soft-disable (is_active=false, history preserved)
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;

    const supabase = createServiceSupabaseClient();
    const { error } = await supabase
      .from("envoy_codes")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}
