// app/api/contribute/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { track, name, email } = body;

  if (!track || !name || !email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  if (track === "dev") {
    const { error } = await supabase.from("contributions").insert({
      track:   "dev",
      name:    name.trim(),
      email:   email.toLowerCase().trim(),
      github:  body.github?.trim() ?? null,
      skills:  body.skills ?? [],
      note:    body.note?.trim() ?? null,
    });
    if (error) {
      console.error("contribution insert error:", error.message);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
  } else if (track === "listing") {
    const { item, brand, url, category, note } = body;
    if (!item || !brand || !url || !category) {
      return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
    }
    const { error } = await supabase.from("contributions").insert({
      track:    "listing",
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      item:     item.trim(),
      brand:    brand.trim(),
      url:      url.trim(),
      category: category,
      note:     note?.trim() ?? null,
    });
    if (error) {
      console.error("contribution insert error:", error.message);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
