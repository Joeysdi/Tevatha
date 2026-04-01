-- 003_store_products.sql
-- Biological Wealth storefront: food / water / energy DB-backed products

-- ── store_products ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source + certification
  source            TEXT NOT NULL CHECK (source IN ('tevatha','open_food_facts','csv','manual')),
  source_id         TEXT,                          -- external dedup key
  tevatha_certified BOOLEAN NOT NULL DEFAULT false,
  tevatha_rank      INT,                           -- lower = higher sort priority

  -- Product meta
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','draft','review','archived')),
  category          TEXT NOT NULL CHECK (category IN ('food','water','energy')),
  brand             TEXT,
  description       TEXT,
  images            TEXT[],
  highlights        TEXT[],
  tags              TEXT[],

  -- Grading
  grade             TEXT,
  safety_score      INT CHECK (safety_score BETWEEN 0 AND 100),

  -- Biological wealth stats (category-specific JSONB)
  biological_wealth JSONB,

  -- Pricing (denormalized from cheapest variant; updated by sync)
  min_price_usd     BIGINT,

  -- Payment + fulfillment
  accepts_crypto    BOOLEAN DEFAULT false,
  fulfillment_type  TEXT NOT NULL DEFAULT 'direct' CHECK (fulfillment_type IN ('direct','dropship')),

  -- Vendor info (dropship)
  vendor_name       TEXT,
  external_url      TEXT,

  -- Raw source data
  raw_data          JSONB,

  -- Timestamps
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

-- ── store_variants ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_variants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,

  label             TEXT NOT NULL,
  sku               TEXT NOT NULL UNIQUE,

  -- Pricing
  price_usd         BIGINT NOT NULL,              -- cents
  price_usdc        FLOAT NOT NULL DEFAULT 0,
  stripe_price_id   TEXT,

  -- Stock
  in_stock          BOOLEAN NOT NULL DEFAULT true,
  stock_qty         INT,

  -- Variant-level biological wealth override
  biological_wealth JSONB,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── product_sync_log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_sync_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source           TEXT NOT NULL,
  records_fetched  INT NOT NULL DEFAULT 0,
  records_upserted INT NOT NULL DEFAULT 0,
  errors           JSONB,
  duration_ms      INT,
  ran_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_store_products_certified_rank
  ON store_products (tevatha_certified DESC, tevatha_rank ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_store_products_source_id
  ON store_products (source, source_id);

CREATE INDEX IF NOT EXISTS idx_store_products_slug
  ON store_products (slug);

CREATE INDEX IF NOT EXISTS idx_store_products_deleted_at
  ON store_products (deleted_at);

CREATE INDEX IF NOT EXISTS idx_store_products_category
  ON store_products (category);

CREATE INDEX IF NOT EXISTS idx_store_products_status
  ON store_products (status);

CREATE INDEX IF NOT EXISTS idx_store_products_min_price_usd
  ON store_products (min_price_usd);

-- ── updated_at triggers (reuse set_updated_at() defined in 002) ───────────────
CREATE OR REPLACE TRIGGER trg_store_products_updated_at
  BEFORE UPDATE ON store_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_store_variants_updated_at
  BEFORE UPDATE ON store_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
