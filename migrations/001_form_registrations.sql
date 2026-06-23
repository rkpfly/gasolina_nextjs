-- Registration form submissions (the "Something Loud is on the horizon" / registration page).
-- One row per submission, capturing the EXACT payload plus the Zoho CRM sync outcome.
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS form_registrations (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- broken-out fields for easy querying
  email           TEXT,
  phone           TEXT,            -- raw, exactly as submitted
  phone_e164      TEXT,            -- normalized (+61…) — what we dedup Zoho against
  full_name       TEXT,

  -- the exact submission body as received
  payload         JSONB NOT NULL,

  -- Zoho CRM sync result
  zoho_contact_id TEXT,            -- Zoho Contacts record id (created or matched)
  zoho_status     TEXT NOT NULL DEFAULT 'pending',  -- created | duplicate | error | pending
  zoho_error      TEXT,

  -- request context
  source          TEXT NOT NULL DEFAULT 'registration',
  user_agent      TEXT,
  ip              TEXT
);

CREATE INDEX IF NOT EXISTS idx_form_registrations_email   ON form_registrations (lower(email));
CREATE INDEX IF NOT EXISTS idx_form_registrations_phone   ON form_registrations (phone_e164);
CREATE INDEX IF NOT EXISTS idx_form_registrations_created ON form_registrations (created_at DESC);
