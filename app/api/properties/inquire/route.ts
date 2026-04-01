export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

// POST /api/properties/inquire
// Replaces the stub at /api/provisioner/inquire for property leads.
// Clerk auth is optional — anonymous leads are accepted.
export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message, propertyId } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "name, email, and message are required" },
      { status: 422 }
    );
  }

  // Basic email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }

  // Clerk user ID optional
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId ?? null;
  } catch { /* anonymous */ }

  try {
    const supabase = createServiceSupabaseClient();
    const { error } = await supabase.from("property_inquiries").insert({
      property_id: propertyId ?? null,
      user_id:     userId,
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      message:     message.trim(),
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/properties/inquire]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
