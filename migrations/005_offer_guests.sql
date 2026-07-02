-- Offer submissions moved from a single `gender` field to a free-text guest
-- list: each attendee's full name + Male/Female/Other, including the birthday
-- person / hen. Broken out into its own column so staff can read the list when
-- reviewing allocation, while the same value is still mirrored inside payload.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE offer_submissions ADD COLUMN IF NOT EXISTS guests TEXT;
