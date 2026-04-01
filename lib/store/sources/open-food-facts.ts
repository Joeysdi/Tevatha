// lib/store/sources/open-food-facts.ts
// Fetches emergency/survival food products from Open Food Facts API.
// User-Agent is required by OFF terms of service.

import type { RawOFFProduct } from "../types";

const USER_AGENT = "Tevatha/1.0 (tevatha.com)";
const BASE_URL   = "https://world.openfoodfacts.org";

interface OFFSearchResponse {
  products: RawOFFProduct[];
  count: number;
}

function isUsable(p: RawOFFProduct): boolean {
  return !!(p.product_name && p.product_name.trim() && p.nutriments);
}

function dedupeById(products: RawOFFProduct[]): RawOFFProduct[] {
  const seen = new Set<string>();
  const out: RawOFFProduct[] = [];
  for (const p of products) {
    if (p._id && !seen.has(p._id)) {
      seen.add(p._id);
      out.push(p);
    }
  }
  return out;
}

async function fetchSearch(): Promise<RawOFFProduct[]> {
  const url =
    `${BASE_URL}/cgi/search.pl` +
    `?search_terms=emergency+survival+food&json=1&page_size=50`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`OFF search HTTP ${res.status}`);

  const data: OFFSearchResponse = await res.json();
  return (data.products ?? []).filter(isUsable);
}

async function fetchCategory(): Promise<RawOFFProduct[]> {
  const url = `${BASE_URL}/category/emergency-food.json`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`OFF category HTTP ${res.status}`);

  const data: OFFSearchResponse = await res.json();
  return (data.products ?? []).filter(isUsable);
}

/**
 * Fetch emergency/survival food products from Open Food Facts.
 * Combines two endpoints and deduplicates by barcode (_id).
 */
export async function fetchOpenFoodFacts(): Promise<RawOFFProduct[]> {
  const results = await Promise.allSettled([fetchSearch(), fetchCategory()]);

  const combined: RawOFFProduct[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      combined.push(...r.value);
    } else {
      console.warn("[open-food-facts] fetch error:", r.reason);
    }
  }

  return dedupeById(combined);
}
