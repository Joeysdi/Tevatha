// app/api/webhooks/stripe/route.ts
//
// MANDATE: Uses `await request.text()` for raw payload extraction.
// The deprecated `bodyParser: false` / `config` export is NOT used.
// Next.js App Router does NOT use Pages Router bodyParser conventions.

import { NextRequest, NextResponse } from "next/server";
import Stripe                         from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/client";
import { createServiceSupabaseClient }        from "@/lib/supabase/server";

// ── Explicitly Node.js runtime — Stripe SDK requires Node crypto APIs ──
export const runtime = 'nodejs';

// Public route — Stripe cannot authenticate to Clerk
// This route is excluded from proxy.ts auth guard via /api/webhooks/(.*)

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Extract raw payload — MANDATED APPROACH ────────────────────────
  // `await request.text()` gives us the exact byte-for-byte payload string
  // that Stripe signed. Any other method (json(), arrayBuffer() cast, etc.)
  // may alter encoding and will cause signature verification to fail.
  const rawBody    = await request.text();
  const sigHeader  = request.headers.get("stripe-signature");

  if (!sigHeader) {
    console.warn("[stripe-webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // ── 2. Verify HMAC signature ──────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sigHeader,
      getStripeWebhookSecret()
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", msg);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${msg}` },
      { status: 400 }
    );
  }

  // ── 3. Idempotency check ──────────────────────────────────────────────
  // Attempt to INSERT the event ID. If it already exists (unique constraint),
  // the insert fails and we return 200 immediately — preventing double-processing
  // on Stripe retries or network duplicates.
  const supabase = createServiceSupabaseClient();

  const { error: idempotencyError } = await supabase
    .from("processed_events")
    .insert({
      id:           event.id,
      rail:         "stripe",
      order_id:     getOrderIdFromEvent(event) ?? "unknown",
      processed_at: new Date().toISOString(),
    });

  if (idempotencyError) {
    // PostgreSQL unique violation code = "23505"
    if (idempotencyError.code === "23505") {
      console.info(
        `[stripe-webhook] Duplicate event ${event.id} — returning 200 OK`
      );
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Any other DB error — log and return 500 for Stripe retry
    console.error("[stripe-webhook] Idempotency insert error:", idempotencyError);
    return NextResponse.json(
      { error: "Internal idempotency check failed" },
      { status: 500 }
    );
  }

  // ── 4. Route event types ──────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          supabase
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          supabase
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
          supabase
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(
          event.data.object as Stripe.Charge,
          supabase
        );
        break;

      default:
        // Unhandled event types — acknowledge without processing
        console.info(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }
  } catch (handlerErr) {
    // Handler failed AFTER idempotency record was written.
    // Log the error but do NOT return 500 — Stripe would retry and hit idempotency.
    // Instead, write a failure flag and alert via Supabase realtime / monitoring.
    console.error(
      `[stripe-webhook] Handler error for ${event.id}:`,
      handlerErr instanceof Error ? handlerErr.message : handlerErr
    );

    await supabase
      .from("processed_events")
      .update({ handler_error: String(handlerErr), updated_at: new Date().toISOString() })
      .eq("id", event.id);
  }

  return NextResponse.json({ received: true });
}

// ── Event handlers ─────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createServiceSupabaseClient>
): Promise<void> {
  const orderId = session.metadata?.order_id;
  const userId  = session.metadata?.user_id;

  if (!orderId || !userId) {
    throw new Error(
      `checkout.session.completed missing metadata: order_id=${orderId}, user_id=${userId}`
    );
  }

  const { error } = await supabase
    .from("orders")
    .upsert({
      id:               orderId,
      user_id:          userId,
      rail:             "stripe",
      status:           "paid",
      amount_cents:     session.amount_total ?? 0,
      stripe_event_id:  session.payment_intent as string | null,
      stripe_session_id:session.id,
      paid_at:          new Date().toISOString(),
      updated_at:       new Date().toISOString(),
    }, { onConflict: "id" });

  if (error) throw new Error(`Order upsert failed: ${error.message}`);

  // Provision access (extend as needed — e.g. unlock gated content, send email)
  await provisionOrderAccess(orderId, userId, supabase);

  console.info(`[stripe-webhook] Order ${orderId} marked paid for user ${userId}`);
}

async function handlePaymentIntentSucceeded(
  pi: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createServiceSupabaseClient>
): Promise<void> {
  // Secondary confirmation — most provisioning happens on checkout.session.completed
  // This handler catches direct PaymentIntent flows (not Checkout)
  const orderId = pi.metadata?.order_id;
  if (!orderId) return;

  await supabase
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "pending");
}

async function handlePaymentIntentFailed(
  pi: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createServiceSupabaseClient>
): Promise<void> {
  const orderId = pi.metadata?.order_id;
  if (!orderId) return;

  const { error } = await supabase
    .from("orders")
    .update({
      status:         "failed",
      failure_reason: pi.last_payment_error?.message ?? "unknown",
      updated_at:     new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error(`Order failure update failed: ${error.message}`);
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  supabase: ReturnType<typeof createServiceSupabaseClient>
): Promise<void> {
  const orderId = charge.metadata?.order_id;
  if (!orderId) return;

  await supabase
    .from("orders")
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("id", orderId);
}

// ── Access provisioning ────────────────────────────────────────────────────

async function provisionOrderAccess(
  orderId: string,
  userId:  string,
  supabase: ReturnType<typeof createServiceSupabaseClient>
): Promise<void> {
  // Fetch order line items to determine what access to grant
  const { data: order } = await supabase
    .from("orders")
    .select("line_items")
    .eq("id", orderId)
    .single();

  if (!order) return;

  // Extend here: unlock Supabase RLS-protected content, trigger email, etc.
  console.info(`[provision] Access provisioned for order ${orderId}, user ${userId}`);
}

// ── Helper: extract order ID from any event type ────────────────────────────

function getOrderIdFromEvent(event: Stripe.Event): string | null {
  const obj = event.data.object as unknown as Record<string, unknown>;
  // Try metadata first (set during checkout creation)
  if (typeof obj.metadata === "object" && obj.metadata !== null) {
    const meta = obj.metadata as Record<string, string>;
    if (meta.order_id) return meta.order_id;
  }
  // Fall back to Stripe session/PI ID as order identifier
  if (typeof obj.id === "string") return obj.id;
  return null;
}
