// app/api/stripe/checkout/route.ts
import { auth }            from "@clerk/nextjs/server";
import { NextResponse }    from "next/server";
import { getStripe }       from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { priceId: string; qty?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { priceId, qty = 1 } = body;

  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json({ error: "priceId is required" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tevatha.com";

  try {
    const session = await stripe.checkout.sessions.create({
      mode:                "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price:    priceId,
          quantity: qty,
        },
      ],
      metadata: {
        clerk_user_id: userId,
        price_id:      priceId,
      },
      success_url: `${appUrl}/shop?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/shop?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe session creation failed";
    console.error("[stripe/checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
