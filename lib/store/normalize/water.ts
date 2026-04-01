// lib/store/normalize/water.ts
// Maps RawCSVProduct → StoreProduct with WaterBW biological_wealth.
// Water products come from CSV/manual only (no OFF water data source).

import type { StoreProduct, RawCSVProduct, WaterBW } from "../types";
import { makeSlug, slugify, parseFloatOrNull, parseIntOrNull, parseBool, splitPipe } from "./shared";

export function normalizeCSVWater(raw: RawCSVProduct): {
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

  const gpdPurification = parseFloatOrNull(raw["gpd_purification"]);
  const micronFiltration = parseFloatOrNull(raw["micron_filtration"]);
  const maintenanceInterval = parseIntOrNull(raw["maintenance_interval_days"]);
  const totalGallons = parseFloatOrNull(raw["total_gallons_lifetime"]);

  // Flag review if primary water capability stat is missing
  const status: StoreProduct["status"] =
    gpdPurification === null ? "review" : "active";

  const bw: WaterBW = {
    category: "water",
    gpd_purification: gpdPurification,
    micron_filtration: micronFiltration,
    maintenance_interval_days: maintenanceInterval,
    total_gallons_lifetime: totalGallons,
    removes_viruses: parseBool(raw["removes_viruses"]),
    removes_bacteria: parseBool(raw["removes_bacteria"]),
    removes_chemicals: parseBool(raw["removes_chemicals"]),
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
      category: "water",
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
