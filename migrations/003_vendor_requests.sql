-- Talent / vendor signups from the /careers "Join The Team" application form.
-- One row per submission. Captures broken-out fields plus request context.
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS vendor_requests (
  id                 BIGSERIAL PRIMARY KEY,
  first_name         TEXT NOT NULL,
  last_name          TEXT,
  country_code       TEXT        DEFAULT '+61',
  phone              TEXT NOT NULL,
  email              TEXT NOT NULL,
  role               TEXT NOT NULL,   -- promoter | influencer | artist | musician | vocalist
  collaboration_date DATE,
  portfolio_link     TEXT,
  ip_address         TEXT,
  source_url         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_requests_role    ON vendor_requests (role);
CREATE INDEX IF NOT EXISTS idx_vendor_requests_created ON vendor_requests (created_at DESC);
