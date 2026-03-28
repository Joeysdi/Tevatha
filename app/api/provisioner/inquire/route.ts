export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: store to Supabase inquiries table or send via Resend/SendGrid
  console.log("[provisioner/inquire]", body);
  return NextResponse.json({ ok: true });
}
