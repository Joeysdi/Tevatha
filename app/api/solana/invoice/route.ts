// app/api/solana/invoice/route.ts
// POST /api/solana/invoice
// Body: { productId: string, qty: number, userId: string }
// Returns: SolanaInvoice

import { NextRequest, NextResponse } from "next/server";
import { auth }                       from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateEphemeralReference } from "@/lib/solana/treasury";
import { buildSolanaPayInvoice }       from "@/lib/solana/pay";
import { getProductById }              from "@/lib/provisioner/catalog";
import type { SolanaInvoice }          from "@/types/treasury";

// Node.js runtime required — @solana/web3.js needs Buffer
export const runtime = undefined; // explicitly use default Node.js runtime

interface InvoiceRequestBody {
  productId: string;
  qty:       number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth ─────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let body: InvoiceRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId, qty } = body;
  if (!productId || typeof qty !== "number" || qty < 1 || qty > 10) {
    return NextResponse.json(
      { error: "productId and qty (1–10) are required" },
      { status: 400 }
    );
  }

  // ── Lookup product ───────────────────────────────────────────────────
  const product = getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (!product.highTicket) {
    return NextResponse.json(
      { error: "Product is not eligible for Solana payment rail" },
      { status: 400 }
    );
  }
  if (!product.inStock) {
    return NextResponse.json({ error: "Product out of stock" }, { status: 409 });
  }

  // ── Compute total ────────────────────────────────────────────────────
  const totalUsdc = parseFloat((product.priceUsdc * qty).toFixed(2));

  // ── Generate ephemeral reference keypair (OPOS) ───────────────────────
  const { publicKey: referenceKey } = generateEphemeralReference();

  // ── Build Solana Pay invoice ──────────────────────────────────────────
  const invoice: SolanaInvoice = buildSolanaPayInvoice({
    amountUsdc: totalUsdc,
    label:      `Tevatha Provisioner — ${product.name}`,
    message:    `${qty}× ${product.name} (${product.sku})`,
    referenceKey,
  });

  // ── Persist invoice to Supabase ───────────────────────────────────────
  // This creates a pending order row. The Helius webhook upgrades it to 'paid'.
  const supabase = await createServerSupabaseClient();

  const { error: dbError } = await supabase.from("solana_invoices").insert({
    invoice_id:    invoice.invoiceId,
    user_id:       userId,
    product_id:    productId,
    qty,
    amount_usdc:   totalUsdc,
    reference_key: referenceKey,
    recipient_ata: invoice.recipientAta,
    status:        "pending",
    expires_at:    invoice.expiresAt,
    created_at:    invoice.createdAt,
  });

  if (dbError) {
    console.error("[invoice] Supabase insert error:", dbError);
    return NextResponse.json(
      { error: "Failed to persist invoice" },
      { status: 500 }
    );
  }

  // ── Return invoice (bigint serialized as string) ───────────────────────
  return NextResponse.json({
    ...invoice,
    amountLamports: invoice.amountLamports.toString(), // bigint → string for JSON
  });
}
