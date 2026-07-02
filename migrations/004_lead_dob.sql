-- Adds an optional date-of-birth column to lead_submissions so forms can
-- capture DOB (e.g. the home newsletter swapped its city field for DOB).
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS dob DATE;
