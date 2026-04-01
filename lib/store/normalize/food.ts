// lib/store/normalize/food.ts
// Maps RawOFFProduct | RawCSVProduct → StoreProduct with FoodBW biological_wealth.

import type { StoreProduct, RawOFFProduct, RawCSVProduct, FoodBW } from "../types";
import { makeSlug, slugify, parseFloatOrNull, parseIntOrNull, parseBool, splitPipe } from "./shared";

type PreparationValue = FoodBW["preparation"];

const PREPARATION_VALUES: PreparationValue[] = [
  "just_add_water",
  "freeze_dried",
  "dehydrated",
  "whole_grain",
];

function parsePreparation(val: string | undefined | null): PreparationValue {
  if (!val) return null;
  const cleaned = val.trim().toLowerCase().replace(/\s+/g, "_") as PreparationValue;
  return PREPARATION_VALUES.includes(cleaned) ? cleaned : null;
}

/**
 * Normalize an Open Food Facts product into a StoreProduct.
 * OFF has no price or shelf-life data → status='review', several nulls.
 */
export function normalizeOFFFood(raw: RawOFFProduct): {
  product: Omit<StoreProduct, "id" | "created_at" | "updated_at">;
  errors: string[];
} {
  const errors: string[] = [];

  // Grade: OFF uses a–e lowercase; map e→F, others uppercase
  let grade: string | null = null;
  if (raw.nutriscore_grade) {
    const g = raw.nutriscore_grade.trim().toLowerCase();
    grade = g === "e" ? "F" : g.toUpperCase();
  }

  const bw: FoodBW = {
    category: "food",
    calories_per_dollar: null, // no price data from OFF
    shelf_life_years: null,    // not reliably available in OFF
    seed_reproducible: false,
    servings_total: null,
    calories_per_serving: null,
    protein_g_per_serving: raw.nutriments?.["proteins_100g"] ?? null,
    dietary_restrictions: [],
    preparation: null,
  };

  const title = (raw.product_name ?? "").trim();
  if (!title) errors.push("product_name is empty");

  const slug = makeSlug(title || "unnamed", raw._id);

  const images: string[] = [];
  if (raw.image_url) images.push(raw.image_url);

  return {
    product: {
      source: "open_food_facts",
      source_id: raw._id,
      tevatha_certified: false,
      tevatha_rank: null,
      title,
      slug,
      // flag review: no price → calories_per_dollar null; no shelf life
      status: "review",
      category: "food",
      brand: raw.brands?.trim() || null,
      description: null,
      images: images.length ? images : null,
      highlights: null,
      tags: raw.categories_tags?.slice(0, 10) ?? null,
      grade,
      safety_score: null,
      biological_wealth: bw,
      min_price_usd: null,
      accepts_crypto: false,
      fulfillment_type: "direct",
      vendor_name: null,
      external_url: `https://world.openfoodfacts.org/product/${raw._id}`,
      raw_data: raw as unknown as Record<string, unknown>,
      last_synced_at: new Date().toISOString(),
      deleted_at: null,
    },
    errors,
  };
}

/**
 * Normalize a CSV row into a StoreProduct for the food category.
 * CSV may have price + calorie data → computes calories_per_dollar.
 */
export function normalizeCSVFood(raw: RawCSVProduct): {
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

  const caloriesPer100g = parseFloatOrNull(raw["calories_per_100g"]);
  const caloriesPerServing = parseFloatOrNull(raw["calories_per_serving"]);
  const servingsTotal = parseIntOrNull(raw["servings_total"]);
  const shelfLifeYears = parseFloatOrNull(raw["shelf_life_years"]);
  const proteinPer = parseFloatOrNull(raw["protein_g_per_serving"]);

  // calories_per_dollar computable only when both price and calorie data available
  let caloriesPerDollar: number | null = null;
  if (priceRaw && priceRaw > 0 && caloriesPerServing !== null && servingsTotal !== null) {
    const totalCalories = caloriesPerServing * servingsTotal;
    const priceUsd = priceRaw / 100;
    caloriesPerDollar = parseFloat((totalCalories / priceUsd).toFixed(1));
  } else if (priceRaw && priceRaw > 0 && caloriesPer100g !== null) {
    // Rough estimate if we have density but not per-serving/total
    caloriesPerDollar = null; // insufficient to compute accurately
  }

  const dietStr = raw["dietary_restrictions"] ?? "";
  const dietaryRestrictions = dietStr
    ? dietStr.split("|").map((s) => s.trim()).filter(Boolean)
    : [];

  const status: StoreProduct["status"] =
    shelfLifeYears === null ? "review" : "active";

  const bw: FoodBW = {
    category: "food",
    calories_per_dollar: caloriesPerDollar,
    shelf_life_years: shelfLifeYears,
    seed_reproducible: parseBool(raw["seed_reproducible"]),
    servings_total: servingsTotal,
    calories_per_serving: caloriesPerServing,
    protein_g_per_serving: proteinPer,
    dietary_restrictions: dietaryRestrictions,
    preparation: parsePreparation(raw["preparation"]),
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
      category: "food",
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
