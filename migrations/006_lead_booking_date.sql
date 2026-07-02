-- Adds an optional booking-date column to lead_submissions so forms can capture
-- the day a guest wants to book (e.g. the VIP table request only offers
-- Saturdays). Separate from `dob`. Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE lead_submissions ADD COLUMN IF NOT EXISTS booking_date DATE;
