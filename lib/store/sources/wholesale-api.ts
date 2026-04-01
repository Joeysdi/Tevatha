// lib/store/sources/wholesale-api.ts
//
// Generic wholesale API connector scaffold.
// Mirrors the orchestrator pattern from lib/real-estate/sync.ts.
//
// Config env vars:
//   WHOLESALE_API_URL  — base endpoint URL (e.g. https://api.supplier.com/v1/products)
//   WHOLESALE_API_KEY  — API key sent as Authorization: Bearer header
//
// Usage note: export const runtime = 'nodejs'
//   This file is a library module, not a route. Import it from a Node.js route
//   (e.g. /api/store/sync) which declares `export const runtime = 'nodejs'`.
//
// When the wholesale endpoint URLs and response schema are known, fill in the
// field mapping in mapToRawCSVProduct() below.

import type { RawCSVProduct } from "@/lib/store/types";

// ── Config ────────────────────────────────────────────────────────────────────

function getConfig(): { url: string; key: string } {
  const url = process.env.WHOLESALE_API_URL;
  const key  = process.env.WHOLESALE_API_KEY;
  if (!url) throw new Error("[wholesale-api] WHOLESALE_API_URL is not set");
  if (!key) throw new Error("[wholesale-api] WHOLESALE_API_KEY is not set");
  return { url, key };
}

// ── Raw API response shape (fill in when endpoint schema is known) ─────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WholesaleAPIItem = Record<string, any>;

// ── Field mapping (update when supplier schema is known) ──────────────────────

function mapToRawCSVProduct(item: WholesaleAPIItem): RawCSVProduct {
  // Map supplier-specific JSON fields → RawCSVProduct (string dict).
  // The existing normalizers (food/water/energy) handle conversion from here.
  // Example mapping — replace keys with actual API field names:
  return {
    name:        String(item.name        ?? item.title ?? ""),
    category:    String(item.category    ?? ""),
    brand:       String(item.brand       ?? item.manufacturer ?? ""),
    description: String(item.description ?? ""),
    price:       String(item.price       ?? item.unit_price ?? ""),
    sku:         String(item.sku         ?? item.id ?? ""),
    // Add additional field mappings here when supplier schema is confirmed
    ...Object.fromEntries(
      Object.entries(item).map(([k, v]) => [k, String(v ?? "")])
    ),
  };
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

/**
 * Fetches products from the configured wholesale API endpoint.
 * Returns an array of RawCSVProduct (string dict) — existing normalizers handle conversion.
 *
 * @param limit  Max records to request (passed as ?limit= query param if supported)
 */
export async function fetchWholesaleProducts(limit = 100): Promise<RawCSVProduct[]> {
  const { url, key } = getConfig();

  const endpoint = new URL(url);
  endpoint.searchParams.set("limit", String(limit));

  const res = await fetch(endpoint.toString(), {
    method:  "GET",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Accept":        "application/json",
    },
    // 30-second timeout via AbortController
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(
      `[wholesale-api] HTTP ${res.status} ${res.statusText} from ${endpoint.toString()}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();

  // Handle both array and { data: [] } response shapes
  const items: WholesaleAPIItem[] = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.products)
        ? json.products
        : [];

  return items.map(mapToRawCSVProduct);
}
