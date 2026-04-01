// lib/store/types.ts

// ── BiologicalWealth — discriminated union keyed by category ─────────────────

export type FoodBW = {
  category: "food";
  calories_per_dollar: number | null;
  shelf_life_years: number | null;
  seed_reproducible: boolean;
  servings_total: number | null;
  calories_per_serving: number | null;
  protein_g_per_serving: number | null;
  dietary_restrictions: string[];
  preparation: "just_add_water" | "freeze_dried" | "dehydrated" | "whole_grain" | null;
};

export type WaterBW = {
  category: "water";
  gpd_purification: number | null;
  micron_filtration: number | null;
  maintenance_interval_days: number | null;
  total_gallons_lifetime: number | null;
  removes_viruses: boolean;
  removes_bacteria: boolean;
  removes_chemicals: boolean;
};

export type EnergyBW = {
  category: "energy";
  watt_hours: number | null;
  lifecycle_cycles: number | null;
  emp_shielded: boolean;
  continuous_watts: number | null;
  peak_watts: number | null;
  charge_time_hours: number | null;
};

export type BiologicalWealth = FoodBW | WaterBW | EnergyBW;

// ── StoreProduct — mirrors store_products schema ─────────────────────────────

export interface StoreProduct {
  id: string;
  source: "tevatha" | "open_food_facts" | "csv" | "manual";
  source_id: string | null;
  tevatha_certified: boolean;
  tevatha_rank: number | null;
  title: string;
  slug: string;
  status: "active" | "draft" | "review" | "archived";
  category: "food" | "water" | "energy";
  brand: string | null;
  description: string | null;
  images: string[] | null;
  highlights: string[] | null;
  tags: string[] | null;
  grade: string | null;
  safety_score: number | null;
  biological_wealth: BiologicalWealth | null;
  min_price_usd: number | null;
  accepts_crypto: boolean;
  fulfillment_type: "direct" | "dropship";
  vendor_name: string | null;
  external_url: string | null;
  raw_data: Record<string, unknown> | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joined variants (present on detail fetches)
  store_variants?: StoreVariant[];
}

// ── StoreVariant — mirrors store_variants schema ─────────────────────────────

export interface StoreVariant {
  id: string;
  product_id: string;
  label: string;
  sku: string;
  price_usd: number;
  price_usdc: number;
  stripe_price_id: string | null;
  in_stock: boolean;
  stock_qty: number | null;
  biological_wealth: BiologicalWealth | null;
  created_at: string;
  updated_at: string;
}

// ── Cart extension ───────────────────────────────────────────────────────────

// These are additive fields on CartItem (backward compat — absence = static/direct)
export interface CartItemExtension {
  variant_id?: string;           // DB variant ID; absent for static catalog items
  source?: "static" | "db";     // absent treated as 'static'
  fulfillment_type?: "direct" | "dropship";
  vendor_name?: string;
}

// ── Raw source types ─────────────────────────────────────────────────────────

export interface RawOFFProduct {
  _id: string;
  product_name: string | null;
  brands: string | null;
  nutriscore_grade: string | null;
  nutriments: {
    "energy-kcal_100g"?: number;
    "proteins_100g"?: number;
    [key: string]: number | undefined;
  } | null;
  categories_tags: string[] | null;
  image_url?: string | null;
}

export type RawCSVProduct = Record<string, string>;

// ── Sync result ──────────────────────────────────────────────────────────────

export interface ProductSyncLog {
  id: string;
  source: string;
  records_fetched: number;
  records_upserted: number;
  errors: unknown | null;
  duration_ms: number | null;
  ran_at: string;
}

export interface StoreSyncResult {
  logs: ProductSyncLog[];
  total_fetched: number;
  total_upserted: number;
  skipped: boolean;
}
