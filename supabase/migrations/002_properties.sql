-- 002_properties.sql
-- Resilience Real Estate Marketplace tables

-- ── properties ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source + certification
  source                TEXT NOT NULL CHECK (source IN ('tevatha','mls','aggregator')),
  source_id             TEXT,                          -- external dedup key
  tevatha_certified     BOOLEAN NOT NULL DEFAULT false,
  tevatha_rank          INT,                           -- lower = higher sort priority

  -- Listing meta
  title                 TEXT NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','pending','sold','draft')),
  property_type         TEXT NOT NULL
                          CHECK (property_type IN ('land','residential','compound','bunker','farm','cabin','retreat')),

  -- Location
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  zip                   TEXT,
  country               TEXT,
  lat                   FLOAT8,
  lng                   FLOAT8,
  acres                 FLOAT8,

  -- Pricing
  price_usd             BIGINT,                        -- cents
  price_display         TEXT,
  accepts_crypto        BOOLEAN DEFAULT false,

  -- Standard specs
  bedrooms              INT,
  bathrooms             FLOAT4,
  sqft                  INT,
  year_built            INT,

  -- Resilience-specific (NULL for MLS/aggregator rows)
  off_grid_capacity     TEXT CHECK (off_grid_capacity IN ('full','partial','grid-tied-backup')),
  resource_autonomy_days INT,
  water_source          TEXT[],
  power_systems         TEXT[],
  food_production       TEXT,
  defensive_infrastructure TEXT,
  communications        TEXT[],
  elevation_ft          INT,
  distance_to_city_mi   FLOAT4,
  natural_hazard_score  INT CHECK (natural_hazard_score BETWEEN 0 AND 100),
  community_type        TEXT CHECK (community_type IN ('solo','small','intentional')),

  -- Media + meta
  images                TEXT[],
  description           TEXT,
  highlights            TEXT[],
  tags                  TEXT[],
  grade                 TEXT,
  safety_score          INT CHECK (safety_score BETWEEN 0 AND 100),
  external_url          TEXT,
  raw_data              JSONB,

  -- Timestamps
  last_synced_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

-- ── property_inquiries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  user_id     TEXT,                                    -- Clerk user ID (optional)
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','read','responded')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── property_sync_log ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_sync_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source           TEXT NOT NULL,
  records_fetched  INT NOT NULL DEFAULT 0,
  records_upserted INT NOT NULL DEFAULT 0,
  errors           JSONB,
  duration_ms      INT,
  ran_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_properties_certified_rank
  ON properties (tevatha_certified DESC, tevatha_rank ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_properties_source_id
  ON properties (source, source_id);

CREATE INDEX IF NOT EXISTS idx_properties_slug
  ON properties (slug);

CREATE INDEX IF NOT EXISTS idx_properties_deleted_at
  ON properties (deleted_at);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
