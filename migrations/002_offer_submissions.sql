-- Fixed-offer signup submissions (birthday, hens, ...). One row per submission;
-- the full form is captured in `payload` (jsonb). Mirrors the table already
-- created on the VPS. Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS offer_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_key    TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_submissions_offer_key    ON offer_submissions (offer_key);
CREATE INDEX IF NOT EXISTS idx_offer_submissions_submitted_at ON offer_submissions (submitted_at DESC);
