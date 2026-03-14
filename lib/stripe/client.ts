// lib/stripe/client.ts
import Stripe from "stripe";

// Singleton pattern — prevents connection churn in serverless
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

  _stripe = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
    // Disable telemetry in production
    telemetry: process.env.NODE_ENV !== "production",
  });

  return _stripe;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return secret;
}
