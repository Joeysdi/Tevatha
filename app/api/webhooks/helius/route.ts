// app/api/webhooks/helius/route.ts
//
// Helius Enhanced Transaction Webhook.
// Watches all transactions touching the treasury USDC ATA.
// Matches transactions to pending invoices via the ephemeral reference key.

import { NextRequest, NextResponse }   from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { verifyUsdcTransfer }           from "@/lib/solana/treasury";
import type {
  HeliusWebhookPayload,
  HeliusTokenTransfer,
} from "@/types/treasury";

export const runtime = undefined; // Node.js runtime required for web3.js

// ── Authorization header verification ─────────────────────────────────────
function verifyHeliusAuthorization(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const secret     = process.env.HELIUS_WEBHOOK_AUTH_SECRET;

  if (!secret) {
    // If not configured, log a severe warning but don't block in development
    if (process.env.NODE_ENV === "production") {
      console.error("[helius-webhook] HELIUS_WEBHOOK_AUTH_SECRET not set in production");
      return false;
    }
    console.warn("[helius-webhook] HELIUS_WEBHOOK_AUTH_SECRET not set — skipping auth in dev");
    return true;
  }

  // Helius sends the secret as a Bearer token OR as the raw Authorization value
  // depending on webhook configuration. Support both formats.
  const provided = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return provided === secret;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Verify Helius authorization ────────────────────────────────────
  if (!verifyHeliusAuthorization(request)) {
    console.warn("[helius-webhook] Unauthorized request — invalid Authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse payload ──────────────────────────────────────────────────
  let payloads: HeliusWebhookPayload[];
  try {
    // Helius sends an array of enhanced transactions
    const body = await request.text();
    const parsed = JSON.parse(body);
    payloads = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  const results: Array<{ signature: string; status: string }> = [];

  // ── 3. Process each transaction in the payload ────────────────────────
  for (const tx of payloads) {
    const result = await processTransaction(tx, supabase);
    results.push({ signature: tx.signature, status: result });
  }

  return NextResponse.json({ processed: results });
}

// ── Transaction processor ───────────────────────────────────────────────────

async function processTransaction(
  tx:       HeliusWebhookPayload,
  supabase: ReturnType<typeof createServiceSupabaseClient>
): Promise<string> {
  const { signature } = tx;

  // ── 3a. Idempotency check ───────────────────────────────────────────
  const { error: idempotencyError } = await supabase
    .from("processed_events")
    .insert({
      id:           signature,
      rail:         "solana_usdc",
      order_id:     "pending_match",   // Updated once invoice is matched
      processed_at: new Date().toISOString(),
    });

  if (idempotencyError) {
    if (idempotencyError.code === "23505") {
      console.info(`[helius-webhook] Duplicate tx ${signature} — skipping`);
      return "duplicate";
    }
    console.error("[helius-webhook] Idempotency error:", idempotencyError);
    return "idempotency_error";
  }

  // ── 3b. Extract USDC transfers to treasury ATA ──────────────────────
  const usdcTransfers = extractUsdcTransfers(tx);
  if (usdcTransfers.length === 0) {
    console.info(`[helius-webhook] No USDC transfers in tx ${signature}`);
    return "no_usdc_transfer";
  }

  // ── 3c. Match to pending invoice via reference key ────────────────────
  // The reference key appears in the transaction's account keys.
  // Helius exposes this in accountData[].account — we check all accounts.
  const txAccountKeys = (tx.accountData ?? []).map((a) => a.account);

  // Query all pending invoices whose reference key appears in this tx
  const { data: invoices, error: invoiceQueryError } = await supabase
    .from("solana_invoices")
    .select("*")
    .eq("status", "pending")
    .in("reference_key", txAccountKeys);

  if (invoiceQueryError) {
    console.error("[helius-webhook] Invoice query error:", invoiceQueryError);
    return "invoice_query_error";
  }

  if (!invoices || invoices.length === 0) {
    console.info(
      `[helius-webhook] No pending invoice matched for tx ${signature}. ` +
      `Accounts: ${txAccountKeys.slice(0, 5).join(", ")}`
    );
    return "no_invoice_match";
  }

  // ── 3d. Verify on-chain USDC transfer amount ──────────────────────────
  const invoice = invoices[0]; // Reference keys are unique — at most one match

  const { verified, actualAmount, error: verifyError } = await verifyUsdcTransfer(
    signature,
    invoice.amount_usdc,
    invoice.reference_key
  );

  if (!verified) {
    console.error(
      `[helius-webhook] Verification failed for invoice ${invoice.invoice_id}:`,
      verifyError
    );

    // Mark invoice as failed with reason
    await supabase
      .from("solana_invoices")
      .update({
        status:         "failed",
        failure_reason: verifyError ?? "on-chain verification failed",
        tx_signature:   signature,
        updated_at:     new Date().toISOString(),
      })
      .eq("invoice_id", invoice.invoice_id);

    return "verification_failed";
  }

  // ── 3e. Mark invoice paid + create order ─────────────────────────────
  const now = new Date().toISOString();

  // Update invoice status
  const { error: invoiceUpdateError } = await supabase
    .from("solana_invoices")
    .update({
      status:       "paid",
      tx_signature: signature,
      paid_at:      now,
      actual_usdc:  actualAmount,
      updated_at:   now,
    })
    .eq("invoice_id", invoice.invoice_id);

  if (invoiceUpdateError) {
    console.error("[helius-webhook] Invoice update error:", invoiceUpdateError);
    return "invoice_update_error";
  }

  // Upsert order record
  const { error: orderError } = await supabase
    .from("orders")
    .upsert({
      id:           invoice.invoice_id,
      user_id:      invoice.user_id,
      rail:         "solana_usdc",
      status:       "paid",
      amount_usdc:  actualAmount,
      tx_signature: signature,
      paid_at:      now,
      created_at:   invoice.created_at,
      updated_at:   now,
      line_items:   [{
        productId: invoice.product_id,
        qty:       invoice.qty,
        unitUsdc:  invoice.amount_usdc / invoice.qty,
      }],
    }, { onConflict: "id" });

  if (orderError) {
    console.error("[helius-webhook] Order upsert error:", orderError);
    return "order_upsert_error";
  }

  // Update processed_events with matched order ID
  await supabase
    .from("processed_events")
    .update({ order_id: invoice.invoice_id })
    .eq("id", signature);

  console.info(
    `[helius-webhook] Invoice ${invoice.invoice_id} paid. ` +
    `Tx: ${signature}, Amount: ${actualAmount} USDC`
  );

  return "paid";
}

// ── Helper: extract USDC token transfers from Helius enhanced tx ────────────

function extractUsdcTransfers(tx: HeliusWebhookPayload): HeliusTokenTransfer[] {
  const usdcMintMainnet = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const usdcMintDevnet  = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

  return (tx.tokenTransfers ?? []).filter(
    (t) => t.mint === usdcMintMainnet || t.mint === usdcMintDevnet
  );
}
