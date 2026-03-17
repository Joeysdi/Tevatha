// app/api/stripe/checkout/route.ts
import { auth }         from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripe }    from "@/lib/stripe/client";
import { randomUUID }   from "crypto";

export const runtime = "nodejs";

interface LineItem {
  priceId: string;
  qty:     number;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { items?: LineItem[]; priceId?: string; qty?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Support both single-item (legacy) and cart (multi-item) formats
  let lineItems: LineItem[];
  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    lineItems = body.items;
  } else if (body.priceId) {
    lineItems = [{ priceId: body.priceId, qty: body.qty ?? 1 }];
  } else {
    return NextResponse.json({ error: "items or priceId is required" }, { status: 400 });
  }

  if (lineItems.some((i) => !i.priceId || typeof i.priceId !== "string")) {
    return NextResponse.json({ error: "All items must have a valid priceId" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tevatha.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                 "payment",
      payment_method_types: ["card"],
      line_items: lineItems.map((i) => ({
        price:    i.priceId,
        quantity: Math.max(1, Math.round(i.qty)),
      })),
      // Keys MUST match what webhook/handleCheckoutSessionCompleted reads:
      //   session.metadata?.order_id  → "order_id"
      //   session.metadata?.user_id   → "user_id"
      metadata: {
        order_id:   randomUUID(),
        user_id:    userId,
        item_count: String(lineItems.length),
      },
      success_url: `${appUrl}/provisioner?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/provisioner?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe session creation failed";
    console.error("[stripe/checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
