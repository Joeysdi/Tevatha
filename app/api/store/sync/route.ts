export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { runStoreSync } from "@/lib/store/sync";

// POST /api/store/sync
// Called by Vercel Cron or manually from admin UI.
// Auth: x-cron-secret header must match CRON_SECRET env var.
export async function POST(req: NextRequest) {
  const secret   = process.env.CRON_SECRET;
  const incoming = req.headers.get("x-cron-secret");

  if (!secret || incoming !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runStoreSync();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/store/sync]", err);
    return NextResponse.json({ error: "Sync failed", detail: String(err) }, { status: 500 });
  }
}
