// app/actions/stripe.ts
"use server";

import { auth }       from "@clerk/nextjs/server";
import { getStripe }  from "@/lib/stripe/client";
import { randomUUID } from "crypto";

export interface CheckoutLineItem {
  priceId: string;
  qty:     number;
}

/**
 * Creates an embedded Stripe Checkout session.
 * Returns the client_secret and order_id — both safe to pass to the browser.
 * The secret key never leaves the server.
 */
export async function createEmbeddedCheckoutSession(
  items: CheckoutLineItem[]
): Promise<{ clientSecret: string; orderId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");

  if (!items.length) throw new Error("Cart is empty");

  const invalids = items.filter((i) => !i.priceId || typeof i.priceId !== "string");
  if (invalids.length) throw new Error("Invalid price ID in cart");

  const orderId = randomUUID();
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "https://tevatha.com";

  const session = await getStripe().checkout.sessions.create({
    ui_mode:              "embedded",
    mode:                 "payment",
    payment_method_types: ["card"],
    line_items: items.map((i) => ({
      price:    i.priceId,
      quantity: Math.max(1, Math.round(i.qty)),
    })),
    // return_url receives {CHECKOUT_SESSION_ID} template variable from Stripe
    return_url: `${appUrl}/provisioner/checkout/return?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    metadata: {
      // Keys MUST match what webhook/handleCheckoutSessionCompleted reads
      order_id:   orderId,
      user_id:    userId,
      item_count: String(items.length),
    },
  });

  if (!session.client_secret) {
    throw new Error("Stripe did not return a client_secret — check ui_mode is 'embedded'");
  }

  return { clientSecret: session.client_secret, orderId };
}
