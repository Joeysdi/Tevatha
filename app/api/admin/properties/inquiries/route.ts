export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, authErrorStatus } from "@/lib/auth/roles";
import { decryptField } from "@/lib/crypto/field-encrypt";

// GET /api/admin/properties/inquiries
// Returns all property inquiries with PII decrypted for admin display.
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("property_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Decrypt PII for each inquiry
    const decrypted = await Promise.all(
      (data ?? []).map(async (inquiry) => {
        let name  = inquiry.name  ?? null;
        let email = inquiry.email ?? null;

        if (inquiry.encrypted_name && inquiry.name_iv) {
          try { name = await decryptField(inquiry.encrypted_name, inquiry.name_iv); }
          catch { name = "[decrypt error]"; }
        }
        if (inquiry.encrypted_email && inquiry.email_iv) {
          try { email = await decryptField(inquiry.encrypted_email, inquiry.email_iv); }
          catch { email = "[decrypt error]"; }
        }

        // Strip raw encrypted fields from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { encrypted_name, name_iv, encrypted_email, email_iv, ...rest } = inquiry;
        return { ...rest, name, email };
      })
    );

    return NextResponse.json({ inquiries: decrypted });
  } catch (err) {
    const msg = String(err);
    return NextResponse.json({ error: msg }, { status: authErrorStatus(msg) });
  }
}
