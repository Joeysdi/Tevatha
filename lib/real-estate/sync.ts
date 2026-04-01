// lib/real-estate/sync.ts
// Orchestrator — called by the cron API route every 2 days.
// Each source is wrapped in try/catch: one failure doesn't abort others.
// Rate-limit guard: skips if combined count would exceed 480/month.

import { fetchSimplyRets }           from "./sources/simplyrets";
import { fetchRentcast }             from "./sources/rentcast";
import { normalizeMLSListing, normalizeAggregatorListing } from "./normalize";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { encryptCoords, approxCoord } from "@/lib/crypto/field-encrypt";
import type { Property, SyncResult, PropertySyncLog } from "./types";

// 2-second pause to avoid slamming rate limits on paginated calls
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Monthly usage guard ────────────────────────────────────────────────────────
// Read last 30 days of sync logs to estimate consumption
async function estimateMonthlyUsage(): Promise<number> {
  const supabase = createServiceSupabaseClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("property_sync_log")
    .select("records_fetched")
    .neq("source", "tevatha")
    .gte("ran_at", since);

  return (data ?? []).reduce((sum: number, row: { records_fetched: number }) => sum + (row.records_fetched ?? 0), 0);
}

async function writeSyncLog(
  source: string,
  fetched: number,
  upserted: number,
  errors: unknown[] | null,
  durationMs: number
): Promise<PropertySyncLog> {
  const supabase = createServiceSupabaseClient();
  const entry = {
    source,
    records_fetched: fetched,
    records_upserted: upserted,
    errors: errors ? { items: errors } : null,
    duration_ms: durationMs,
  };
  const { data } = await supabase
    .from("property_sync_log")
    .insert(entry)
    .select()
    .single();
  return data as PropertySyncLog;
}

async function upsertProperties(properties: Property[]): Promise<number> {
  if (!properties.length) return 0;
  const supabase = createServiceSupabaseClient();

  // Strip the auto-generated id so Supabase assigns it on insert.
  // Encrypt exact coords and store approx values for public display.
  const rows = await Promise.all(
    properties.map(async ({ id: _id, ...rest }) => {
      const lat = (rest as Record<string, unknown>).lat as number | undefined;
      const lng = (rest as Record<string, unknown>).lng as number | undefined;

      if (lat != null && lng != null) {
        try {
          const { latEnc, latIv, lngEnc, lngIv } = await encryptCoords(lat, lng);
          return {
            ...rest,
            lat:           approxCoord(lat, 2),
            lng:           approxCoord(lng, 2),
            lat_approx:    approxCoord(lat, 2),
            lng_approx:    approxCoord(lng, 2),
            lat_encrypted: latEnc,
            lat_iv:        latIv,
            lng_encrypted: lngEnc,
            lng_iv:        lngIv,
          };
        } catch (e) {
          // If encryption fails (e.g. missing key), still upsert with approx only
          console.error("[sync] coord encryption error:", e);
          return {
            ...rest,
            lat:        approxCoord(lat, 2),
            lng:        approxCoord(lng, 2),
            lat_approx: approxCoord(lat, 2),
            lng_approx: approxCoord(lng, 2),
          };
        }
      }
      return rest;
    })
  );

  const { data, error } = await supabase
    .from("properties")
    .upsert(rows, {
      onConflict: "source,source_id",
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) throw error;
  return (data ?? []).length;
}

// ── Main orchestrator ──────────────────────────────────────────────────────────
export async function runSync(): Promise<SyncResult> {
  const logs: PropertySyncLog[] = [];
  let totalFetched  = 0;
  let totalUpserted = 0;

  // ── Rate-limit guard ────────────────────────────────────────────────────────
  const monthlyUsage = await estimateMonthlyUsage();
  if (monthlyUsage >= 480) {
    console.warn("[sync] Monthly API quota near limit — skipping external sources");
    const log = await writeSyncLog("guard", 0, 0, ["quota_near_limit"], 0);
    return { logs: [log], total_fetched: 0, total_upserted: 0, skipped: true };
  }

  // ── SimplyRETS ──────────────────────────────────────────────────────────────
  {
    const t0 = Date.now();
    const errors: unknown[] = [];
    let fetched  = 0;
    let upserted = 0;

    try {
      const raw = await fetchSimplyRets(25);
      await delay(2000);
      fetched = raw.length;
      totalFetched += fetched;

      const normalized: Property[] = [];
      for (const r of raw) {
        try {
          const p = await normalizeMLSListing(r);
          if (p) normalized.push(p);
        } catch (e) {
          errors.push({ listing: r.listingId, error: String(e) });
        }
      }

      upserted = await upsertProperties(normalized);
      totalUpserted += upserted;
    } catch (e) {
      errors.push(String(e));
      console.error("[sync] simplyrets error:", e);
    }

    const log = await writeSyncLog("mls", fetched, upserted, errors.length ? errors : null, Date.now() - t0);
    logs.push(log);
  }

  // ── RentCast ────────────────────────────────────────────────────────────────
  {
    const t0 = Date.now();
    const errors: unknown[] = [];
    let fetched  = 0;
    let upserted = 0;

    try {
      const raw = await fetchRentcast(10);
      await delay(2000);
      fetched = raw.length;
      totalFetched += fetched;

      const normalized: Property[] = [];
      for (const r of raw) {
        try {
          const p = await normalizeAggregatorListing(r);
          if (p) normalized.push(p);
        } catch (e) {
          errors.push({ id: r.id, error: String(e) });
        }
      }

      upserted = await upsertProperties(normalized);
      totalUpserted += upserted;
    } catch (e) {
      errors.push(String(e));
      console.error("[sync] rentcast error:", e);
    }

    const log = await writeSyncLog("aggregator", fetched, upserted, errors.length ? errors : null, Date.now() - t0);
    logs.push(log);
  }

  return { logs, total_fetched: totalFetched, total_upserted: totalUpserted, skipped: false };
}
