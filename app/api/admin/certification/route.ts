export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";

// PUT /api/admin/certification
// Body: {
//   ids:    string[],
//   action: 'approve' | 'reject',
//   note?:  string,
//   type:   'product' | 'property'
// }
// Batch-updates status on store_products or properties.
// For 'reject': appends note to raw_data.review_notes[] (JSONB audit trail).
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { ids, action, note, type } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 422 });
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 422 });
    }
    if (type !== "product" && type !== "property") {
      return NextResponse.json({ error: "type must be 'product' or 'property'" }, { status: 422 });
    }

    const supabase = createServiceSupabaseClient();
    const table = type === "product" ? "store_products" : "properties";
    const newStatus = action === "approve" ? "active" : "archived";

    if (action === "approve") {
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    } else {
      // For reject: update status + append note to raw_data.review_notes[]
      // Process each row individually to safely append to JSONB array
      for (const id of ids) {
        const { data: row } = await supabase
          .from(table)
          .select("raw_data")
          .eq("id", id)
          .single();

        const rawData = (row?.raw_data as Record<string, unknown>) ?? {};
        const existingNotes = Array.isArray(rawData.review_notes)
          ? rawData.review_notes
          : [];

        const noteEntry = {
          note:     note ?? "",
          rejected_at: new Date().toISOString(),
        };

        await supabase
          .from(table)
          .update({
            status:     newStatus,
            raw_data:   { ...rawData, review_notes: [...existingNotes, noteEntry] },
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    }

    return NextResponse.json({ ok: true, updated: ids.length });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}
