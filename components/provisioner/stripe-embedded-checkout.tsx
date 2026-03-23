// components/provisioner/stripe-embedded-checkout.tsx
"use client";

import { useMemo, useCallback, useState } from "react";
import { loadStripe }                      from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
}                                          from "@stripe/react-stripe-js";
import { createEmbeddedCheckoutSession }   from "@/app/actions/stripe";
import type { CartItem }                   from "@/lib/cart/store";

// Instantiate once outside the component — prevents re-initialisation on re-render.
// loadStripe is a no-op after the first call (returns the cached Promise).
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface Props {
  items:   CartItem[];
  onClose: () => void;
}

export function StripeEmbeddedCheckout({ items, onClose }: Props) {
  const [initError, setInitError] = useState<string | null>(null);

  // Build line-items once from the snapshot of items at render time.
  // Memoised so the fetchClientSecret callback reference stays stable.
  const lineItems = useMemo(
    () =>
      items
        .filter((i) => !i.highTicket && !!i.stripePriceId)
        .map((i) => ({ priceId: i.stripePriceId!, qty: i.qty })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally empty — snapshot on mount, do not recreate session on re-render
  );

  // EmbeddedCheckoutProvider calls this once to get the client_secret.
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    try {
      const { clientSecret } = await createEmbeddedCheckoutSession(lineItems);
      return clientSecret;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message === "UNAUTHORIZED"
            ? "Please sign in to complete your purchase."
            : err.message
          : "Checkout session could not be created.";
      setInitError(msg);
      return ""; // state update triggers re-render to error UI; no throw avoids React error boundary
    }
  }, [lineItems]);

  // ── Error state ───────────────────────────────────────────────────────────
  if (initError) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 px-4 text-center">
        <span className="font-mono text-[28px] opacity-30">⚠</span>
        <p className="font-mono text-[11px] text-red-bright leading-relaxed max-w-[260px]">
          {initError}
        </p>
        <button
          onClick={onClose}
          className="font-mono text-[10px] text-text-mute2 hover:text-gold-bright
                     border border-border-protocol rounded-lg px-4 py-2
                     hover:border-gold-protocol/40 transition-all duration-200"
        >
          ← Back to cart
        </button>
      </div>
    );
  }

  // ── Embedded checkout form ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Back link */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 font-mono text-[10px] text-text-mute2
                   hover:text-gold-bright transition-colors mb-4 self-start"
      >
        ← Back to cart
      </button>

      {/* Stripe mounts its iFrame here. Stripe's own styles control the inner UI;
          the appearance is customised in the session creation (if needed via
          appearance.theme). We wrap in a neutral container so the iFrame blends. */}
      <div
        id="stripe-embedded-checkout"
        className="flex-1 overflow-auto rounded-xl"
        style={{ minHeight: 420 }}
      >
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
