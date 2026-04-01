export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/real-estate/sync";

// POST /api/properties/sync
// Called by Vercel Cron every 2 days OR manually from admin UI.
// Auth: x-cron-secret header must match CRON_SECRET env var.
export async function POST(req: NextRequest) {
  const secret    = process.env.CRON_SECRET;
  const incoming  = req.headers.get("x-cron-secret");

  // Allow admin UI calls that carry the secret, or reject
  if (!secret || incoming !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/properties/sync]", err);
    return NextResponse.json({ error: "Sync failed", detail: String(err) }, { status: 500 });
  }
}
