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
// Return type uses a discriminated union — errors are returned, never thrown.
// Throwing from a Server Action in Next.js 15 triggers React's full-page error
// boundary even when the caller has a try/catch. Returning error objects keeps
// all error handling client-side.
export async function createEmbeddedCheckoutSession(
  items: CheckoutLineItem[],
  metadataOverride?: Record<string, string>
): Promise<{ clientSecret: string; orderId: string } | { error: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Please sign in to complete your purchase." };

    if (!items.length) return { error: "Your cart is empty." };

    const invalids = items.filter((i) => !i.priceId || typeof i.priceId !== "string");
    if (invalids.length) return { error: "One or more items have an invalid price. Please refresh and try again." };

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
      return_url: `${appUrl}/provisioner/checkout/return?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      metadata: {
        order_id:   orderId,
        user_id:    userId,
        item_count: String(items.length),
        ...metadataOverride,
      },
    });

    if (!session.client_secret) {
      return { error: "Checkout session could not be created. Please try again." };
    }

    return { clientSecret: session.client_secret, orderId };
  } catch (err) {
    console.error("[stripe/session]", err);
    const msg = err instanceof Error ? err.message : "Checkout session could not be created.";
    return { error: msg };
  }
}
