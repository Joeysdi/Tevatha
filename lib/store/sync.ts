// lib/store/sync.ts
// Store product sync orchestrator — Open Food Facts + CSV import pipeline.
// Two-phase upsert: products first (get IDs), then variants (FK backfill).
// Each source in try/catch — one failure doesn't abort others.

import { fetchOpenFoodFacts }         from "./sources/open-food-facts";
import { normalizeOFFFood }           from "./normalize/food";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import type {
  StoreProduct,
  StoreVariant,
  ProductSyncLog,
  StoreSyncResult,
  RawCSVProduct,
} from "./types";

// ── Quota guard: skip OFF if a successful sync ran in last 24h ────────────────
async function offSyncedRecently(): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("product_sync_log")
    .select("id")
    .eq("source", "open_food_facts")
    .gte("ran_at", since)
    .is("errors", null)
    .limit(1);

  return (data ?? []).length > 0;
}

async function writeSyncLog(
  source: string,
  fetched: number,
  upserted: number,
  errors: unknown[] | null,
  durationMs: number
): Promise<ProductSyncLog> {
  const supabase = createServiceSupabaseClient();
  const entry = {
    source,
    records_fetched: fetched,
    records_upserted: upserted,
    errors: errors ? { items: errors } : null,
    duration_ms: durationMs,
  };
  const { data } = await supabase
    .from("product_sync_log")
    .insert(entry)
    .select()
    .single();
  return data as ProductSyncLog;
}

// ── Two-phase upsert ──────────────────────────────────────────────────────────
// Phase 1: upsert products ON CONFLICT (source, source_id) → get id map
// Phase 2: assign product_id on variants, upsert ON CONFLICT (sku)
// Phase 3: update min_price_usd on products from cheapest variant

type ProductRow = Omit<StoreProduct, "id" | "created_at" | "updated_at" | "store_variants">;
type VariantRow = Omit<StoreVariant, "id" | "created_at" | "updated_at"> & { product_source_id: string };

interface UpsertBatch {
  products: ProductRow[];
  // Variants keyed by product source_id — resolved to product_id after phase 1
  variantsBySourceId: Record<string, Omit<StoreVariant, "id" | "created_at" | "updated_at" | "product_id">[]>;
}

async function upsertBatch(batch: UpsertBatch): Promise<number> {
  if (!batch.products.length) return 0;

  const supabase = createServiceSupabaseClient();

  // Phase 1: upsert products
  const { data: upsertedProducts, error: productError } = await supabase
    .from("store_products")
    .upsert(batch.products, {
      onConflict: "source,source_id",
      ignoreDuplicates: false,
    })
    .select("id, source_id");

  if (productError) throw productError;

  const sourceIdToId: Record<string, string> = {};
  for (const row of upsertedProducts ?? []) {
    if (row.source_id) sourceIdToId[row.source_id] = row.id;
  }

  // Phase 2: upsert variants (if any)
  const allVariants: Omit<StoreVariant, "id" | "created_at" | "updated_at">[] = [];
  for (const [sourceId, variants] of Object.entries(batch.variantsBySourceId)) {
    const productId = sourceIdToId[sourceId];
    if (!productId) continue;
    for (const v of variants) {
      allVariants.push({ ...v, product_id: productId });
    }
  }

  if (allVariants.length > 0) {
    const { error: variantError } = await supabase
      .from("store_variants")
      .upsert(allVariants, { onConflict: "sku", ignoreDuplicates: false });

    if (variantError) throw variantError;
  }

  // Phase 3: update min_price_usd from cheapest variant
  if ((upsertedProducts ?? []).length > 0) {
    const productIds = (upsertedProducts ?? []).map((p) => p.id);
    for (const productId of productIds) {
      const { data: cheapest } = await supabase
        .from("store_variants")
        .select("price_usd")
        .eq("product_id", productId)
        .eq("in_stock", true)
        .order("price_usd", { ascending: true })
        .limit(1)
        .single();

      if (cheapest) {
        await supabase
          .from("store_products")
          .update({ min_price_usd: cheapest.price_usd })
          .eq("id", productId);
      }
    }
  }

  return (upsertedProducts ?? []).length;
}

// ── Open Food Facts source ────────────────────────────────────────────────────
async function syncOpenFoodFacts(): Promise<{ fetched: number; upserted: number; errors: unknown[] }> {
  const errors: unknown[] = [];
  let fetched = 0;

  const raw = await fetchOpenFoodFacts();
  fetched = raw.length;

  const products: ProductRow[] = [];
  for (const r of raw) {
    try {
      const { product, errors: normErrors } = normalizeOFFFood(r);
      if (normErrors.length > 0) {
        errors.push({ id: r._id, errors: normErrors });
      }
      if (product.title) {
        products.push(product as ProductRow);
      }
    } catch (e) {
      errors.push({ id: r._id, error: String(e) });
    }
  }

  const upserted = await upsertBatch({ products, variantsBySourceId: {} });

  return { fetched, upserted, errors };
}

// ── CSV row batch upsert (called from import route) ───────────────────────────
export async function upsertCSVProducts(
  rows: ProductRow[]
): Promise<{ upserted: number }> {
  const upserted = await upsertBatch({ products: rows, variantsBySourceId: {} });
  return { upserted };
}

// ── Main orchestrator ─────────────────────────────────────────────────────────
export async function runStoreSync(): Promise<StoreSyncResult> {
  const logs: ProductSyncLog[] = [];
  let totalFetched = 0;
  let totalUpserted = 0;

  // ── Open Food Facts ─────────────────────────────────────────────────────────
  {
    const t0 = Date.now();
    let fetched = 0;
    let upserted = 0;
    const errors: unknown[] = [];

    try {
      const recentlyRan = await offSyncedRecently();
      if (recentlyRan) {
        const log = await writeSyncLog("open_food_facts", 0, 0, null, 0);
        logs.push(log);
        console.log("[store-sync] OFF skipped — successful sync ran within last 24h");
      } else {
        const result = await syncOpenFoodFacts();
        fetched = result.fetched;
        upserted = result.upserted;
        errors.push(...result.errors);
        totalFetched += fetched;
        totalUpserted += upserted;

        const log = await writeSyncLog(
          "open_food_facts",
          fetched,
          upserted,
          errors.length ? errors : null,
          Date.now() - t0
        );
        logs.push(log);
      }
    } catch (e) {
      errors.push(String(e));
      console.error("[store-sync] open_food_facts error:", e);
      const log = await writeSyncLog("open_food_facts", fetched, upserted, errors, Date.now() - t0);
      logs.push(log);
    }
  }

  return {
    logs,
    total_fetched: totalFetched,
    total_upserted: totalUpserted,
    skipped: false,
  };
}
