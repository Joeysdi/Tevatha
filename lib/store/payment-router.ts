// lib/store/payment-router.ts
// Pure functions — no async, no DB calls.
// Determines payment rail and fulfillment split for cart items.

import type { CartItem } from "@/lib/cart/store";

export interface SplitCart {
  direct: CartItem[];
  dropship: CartItem[];
}

export interface RoutePaymentResult {
  rail: "stripe" | "solana";
  meta: {
    dropshipVendors: string[];
  };
}

/**
 * Split cart items into direct-fulfilled vs. dropship-fulfilled groups.
 */
export function splitCart(items: CartItem[]): SplitCart {
  const direct: CartItem[] = [];
  const dropship: CartItem[] = [];

  for (const item of items) {
    if (item.fulfillment_type === "dropship") {
      dropship.push(item);
    } else {
      direct.push(item);
    }
  }

  return { direct, dropship };
}

/**
 * Determine the payment rail for a set of cart items.
 *
 * Rules:
 * - Any item with highTicket=true → Solana
 * - Any item with price_usdc >= 500 → Solana
 * - Any DB item missing stripe_price_id → Solana fallback
 * - Otherwise → Stripe
 *
 * Collects dropship vendor names for Stripe metadata injection.
 */
export function routePayment(items: CartItem[]): RoutePaymentResult {
  const { dropship } = splitCart(items);
  const dropshipVendors = Array.from(
    new Set(dropship.map((i) => i.vendor_name).filter((v): v is string => !!v))
  );

  const needsSolana = items.some(
    (item) =>
      item.highTicket ||
      item.priceUsdc >= 500 ||
      // DB products without a Stripe price ID fall back to Solana
      (item.source === "db" && !item.stripePriceId)
  );

  return {
    rail: needsSolana ? "solana" : "stripe",
    meta: { dropshipVendors },
  };
}
