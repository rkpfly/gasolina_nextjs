// Single source of truth for valid check-in locations. There is one form
// instance per city (selected via ?place=), each with its own QR link.
export const ALLOWED_CITIES = ['Melbourne', 'Sydney', 'Singapore'] as const;
export type CheckinCity = (typeof ALLOWED_CITIES)[number];

// Default dialing code per city — used server-side to normalise local numbers
// to E.164 when the attendee doesn't type a country prefix.
export const CITY_DIAL_CODE: Record<CheckinCity, string> = {
  Melbourne: '+61',
  Sydney: '+61',
  Singapore: '+65',
};

// Case-insensitive match → canonical value (or null).
export function resolveCity(raw?: string | null): CheckinCity | null {
  if (!raw) return null;
  const hit = ALLOWED_CITIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  return hit ?? null;
}
