-- 004_envoy_rbac.sql
-- Envoy attribution system + RBAC support + field-level encryption columns
-- All changes are ADDITIVE — no existing column types/constraints modified.

-- ── envoy_codes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS envoy_codes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT        UNIQUE NOT NULL,             -- format: ENV-XXXXXX
  clerk_user_id   TEXT        NOT NULL,                    -- envoy's Clerk user ID
  created_by      TEXT        NOT NULL,                    -- admin's Clerk user ID
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_envoy_codes_code
  ON envoy_codes (code);

-- Reuse set_updated_at() trigger (defined in 002_properties.sql)
CREATE OR REPLACE TRIGGER trg_envoy_codes_updated_at
  BEFORE UPDATE ON envoy_codes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── referral_attributions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_attributions (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                    TEXT        NOT NULL REFERENCES envoy_codes(code) ON DELETE RESTRICT,
  referred_clerk_user_id  TEXT        NOT NULL,
  order_id                UUID        REFERENCES orders(id) ON DELETE SET NULL,
  attributed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_attributions_code
  ON referral_attributions (code);

CREATE INDEX IF NOT EXISTS idx_referral_attributions_referred_user
  ON referral_attributions (referred_clerk_user_id);

-- ── Additive columns: property_inquiries (PII encryption) ────────────────────
ALTER TABLE property_inquiries
  ADD COLUMN IF NOT EXISTS encrypted_name  TEXT,
  ADD COLUMN IF NOT EXISTS name_iv         TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_email TEXT,
  ADD COLUMN IF NOT EXISTS email_iv        TEXT;

-- ── Additive columns: properties (coordinate encryption + approx public coords) ─
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS lat_approx    FLOAT8,   -- ~1km precision, public-safe
  ADD COLUMN IF NOT EXISTS lng_approx    FLOAT8,
  ADD COLUMN IF NOT EXISTS lat_encrypted TEXT,     -- exact lat, admin-only
  ADD COLUMN IF NOT EXISTS lat_iv        TEXT,
  ADD COLUMN IF NOT EXISTS lng_encrypted TEXT,     -- exact lng, admin-only
  ADD COLUMN IF NOT EXISTS lng_iv        TEXT;
