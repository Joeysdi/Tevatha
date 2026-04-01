// app/api/solana/invoice/route.ts
// POST /api/solana/invoice
// Body: { productId: string, qty: number, userId: string }
// Returns: SolanaInvoice

import { NextRequest, NextResponse } from "next/server";
import { auth }                       from "@clerk/nextjs/server";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { generateEphemeralReference } from "@/lib/solana/treasury";
import { buildSolanaPayInvoice }       from "@/lib/solana/pay";
import { getProductById }              from "@/lib/provisioner/catalog";
import type { SolanaInvoice }          from "@/types/treasury";

// Node.js runtime required — @solana/web3.js needs Buffer
export const runtime = undefined; // explicitly use default Node.js runtime

interface InvoiceRequestBody {
  productId: string;
  qty:       number;
  variantId?: string;  // DB variant UUID — present for store_products items
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

  const { productId, qty, variantId } = body;
  if (!productId || typeof qty !== "number" || qty < 1 || qty > 10) {
    return NextResponse.json(
      { error: "productId and qty (1–10) are required" },
      { status: 400 }
    );
  }

  // ── Lookup product — static catalog first, then DB store ─────────────
  let resolvedName: string;
  let resolvedSku: string;
  let resolvedPriceUsdc: number;
  let resolvedInStock: boolean;

  const staticProduct = getProductById(productId);

  if (staticProduct) {
    if (!staticProduct.highTicket) {
      return NextResponse.json(
        { error: "Product is not eligible for Solana payment rail" },
        { status: 400 }
      );
    }
    if (!staticProduct.inStock) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 409 });
    }
    resolvedName      = staticProduct.name;
    resolvedSku       = staticProduct.sku;
    resolvedPriceUsdc = staticProduct.priceUsdc;
    resolvedInStock   = staticProduct.inStock;
  } else {
    // Secondary lookup: store_products JOIN store_variants
    const svc = createServiceSupabaseClient();
    let variantQuery = svc
      .from("store_variants")
      .select("*, store_products!inner(title, deleted_at, status)")
      .eq("product_id", productId);

    if (variantId) {
      variantQuery = variantQuery.eq("id", variantId);
    } else {
      variantQuery = variantQuery.eq("in_stock", true).order("price_usd", { ascending: true }).limit(1);
    }

    const { data: variantRows } = await variantQuery;
    const variant = variantRows?.[0];

    if (!variant) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const storeProduct = variant.store_products as { title: string; deleted_at: string | null; status: string };
    if (storeProduct.deleted_at || storeProduct.status === "archived") {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }
    if (!variant.in_stock) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 409 });
    }

    resolvedName      = storeProduct.title;
    resolvedSku       = variant.sku;
    resolvedPriceUsdc = variant.price_usdc;
    resolvedInStock   = variant.in_stock;
  }

  void resolvedInStock; // used above for guard only

  // ── Compute total ────────────────────────────────────────────────────
  const totalUsdc = parseFloat((resolvedPriceUsdc * qty).toFixed(2));

  // ── Generate ephemeral reference keypair (OPOS) ───────────────────────
  const { publicKey: referenceKey } = generateEphemeralReference();

  // ── Build Solana Pay invoice ──────────────────────────────────────────
  const invoice: SolanaInvoice = buildSolanaPayInvoice({
    amountUsdc: totalUsdc,
    label:      `Tevatha Provisioner — ${resolvedName}`,
    message:    `${qty}× ${resolvedName} (${resolvedSku})`,
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
