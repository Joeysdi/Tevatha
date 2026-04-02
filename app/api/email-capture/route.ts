// app/api/email-capture/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("email_subscribers")
    .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("email_capture insert error:", error.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
