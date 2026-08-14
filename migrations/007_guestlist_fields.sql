-- Guestlist-specific attributes. Existing lead columns continue to hold the
-- primary guest name, booking date, guest count and additional information.
-- Safe to run repeatedly.

ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS guest_names TEXT;
ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS vip BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN NOT NULL DEFAULT FALSE;
