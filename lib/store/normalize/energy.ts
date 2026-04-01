// lib/store/normalize/energy.ts
// Maps RawCSVProduct → StoreProduct with EnergyBW biological_wealth.

import type { StoreProduct, RawCSVProduct, EnergyBW } from "../types";
import { makeSlug, slugify, parseFloatOrNull, parseIntOrNull, parseBool, splitPipe } from "./shared";

export function normalizeCSVEnergy(raw: RawCSVProduct): {
  product: Omit<StoreProduct, "id" | "created_at" | "updated_at">;
  errors: string[];
} {
  const errors: string[] = [];

  const title = (raw["name"] ?? "").trim();
  if (!title) errors.push("name is required");

  const sku = (raw["sku"] ?? "").trim();
  if (!sku) errors.push("sku is required");

  const priceRaw = parseIntOrNull(raw["price_usd"]);
  if (priceRaw === null) errors.push("price_usd must be a valid integer (cents)");

  const wattHours = parseFloatOrNull(raw["watt_hours"]);
  const lifecycleCycles = parseIntOrNull(raw["lifecycle_cycles"]);
  const continuousWatts = parseFloatOrNull(raw["continuous_watts"]);
  const peakWatts = parseFloatOrNull(raw["peak_watts"]);
  const chargeTimeHours = parseFloatOrNull(raw["charge_time_hours"]);

  // Flag review if primary energy stat is missing
  const status: StoreProduct["status"] =
    wattHours === null ? "review" : "active";

  const bw: EnergyBW = {
    category: "energy",
    watt_hours: wattHours,
    lifecycle_cycles: lifecycleCycles,
    emp_shielded: parseBool(raw["emp_shielded"]),
    continuous_watts: continuousWatts,
    peak_watts: peakWatts,
    charge_time_hours: chargeTimeHours,
  };

  const images = splitPipe(raw["images"]);
  const highlights = splitPipe(raw["highlights"]);
  const tags = splitPipe(raw["tags"]);

  const sourceId = sku || slugify(title).slice(0, 24);

  return {
    product: {
      source: "csv",
      source_id: sourceId,
      tevatha_certified: parseBool(raw["tevatha_certified"]),
      tevatha_rank: parseIntOrNull(raw["tevatha_rank"]),
      title,
      slug: makeSlug(title, sourceId),
      status,
      category: "energy",
      brand: raw["brand"]?.trim() || null,
      description: raw["description"]?.trim() || null,
      images: images.length ? images : null,
      highlights: highlights.length ? highlights : null,
      tags: tags.length ? tags : null,
      grade: raw["grade"]?.trim() || null,
      safety_score: parseIntOrNull(raw["safety_score"]),
      biological_wealth: bw,
      min_price_usd: priceRaw,
      accepts_crypto: parseBool(raw["accepts_crypto"]),
      fulfillment_type: raw["fulfillment_type"] === "dropship" ? "dropship" : "direct",
      vendor_name: raw["vendor_name"]?.trim() || null,
      external_url: raw["external_url"]?.trim() || null,
      raw_data: raw as unknown as Record<string, unknown>,
      last_synced_at: new Date().toISOString(),
      deleted_at: null,
    },
    errors,
  };
}
