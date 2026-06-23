import 'server-only';

// Direct Zoho CRM client. No database — credentials come from env, and the
// access token is cached in module memory (refreshed on demand / on 401).
//
// All leads seeded from this project are flagged with a lead owner/source of
// "DamiClub" (see LEAD_OWNER) so they can be distinguished inside Zoho from
// records created by other Louder properties sharing the same CRM.

const REGION = process.env.ZOHO_REGION || 'com';
const CLIENT_ID = process.env.ZOHO_CLIENT_ID!;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN!;

const ACCOUNTS = `https://accounts.zoho.${REGION}`;

// The brand that owns every lead created from this app. Set server-side only —
// never trusted from the client. Override with ZOHO_LEAD_OWNER if needed.
export const LEAD_OWNER = process.env.ZOHO_LEAD_OWNER || 'DamiClub';

// In-memory token cache. On serverless this lives per warm instance — each cold
// start just refreshes once, which is fine.
let cached: { token: string; apiDomain: string; expiresAt: number } | null = null;

async function getAccessToken(force = false): Promise<{ token: string; apiDomain: string }> {
  if (!force && cached && cached.expiresAt - Date.now() > 60_000) {
    return { token: cached.token, apiDomain: cached.apiDomain };
  }

  const params = new URLSearchParams({
    refresh_token: REFRESH_TOKEN,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const res = await fetch(`${ACCOUNTS}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(data.error || `Zoho token refresh failed (${res.status})`);
  }

  cached = {
    token: data.access_token,
    apiDomain: data.api_domain || `https://www.zohoapis.${REGION}`,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return { token: cached.token, apiDomain: cached.apiDomain };
}

// Authorized request helper with one automatic retry on token expiry.
async function zohoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let { token, apiDomain } = await getAccessToken();
  const doFetch = (t: string) =>
    fetch(`${apiDomain}${path}`, {
      ...init,
      headers: {
        Authorization: `Zoho-oauthtoken ${t}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      cache: 'no-store',
    });

  let res = await doFetch(token);
  if (res.status === 401) {
    ({ token } = await getAccessToken(true));
    res = await doFetch(token);
  }
  return res;
}

// ── Phone normalization ─────────────────────────────────────────────────────
// Dedup only works if we search with the SAME format the records are stored in.
// Standardize to E.164 (+<countrycode><number>). The default country code is
// passed in per location (AU = +61, SG = +65).
export function normalizePhone(raw: string, countryCode = '+61'): string {
  const n = raw.trim().replace(/[\s()-]/g, '');
  if (n.startsWith('+')) return n;
  if (n.startsWith('00')) return '+' + n.slice(2);
  if (n.startsWith('0')) return countryCode + n.slice(1); // local AU/SG → E.164
  return countryCode + n;
}

// ── Search Contacts by phone ────────────────────────────────────────────────
export interface FoundContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export async function findContactByPhone(phoneE164: string): Promise<FoundContact | null> {
  // Search both Phone and Mobile. `+` must be URL-encoded in the criteria.
  const criteria = `((Phone:equals:${phoneE164})or(Mobile:equals:${phoneE164}))`;
  const res = await zohoFetch(`/crm/v3/Contacts/search?criteria=${encodeURIComponent(criteria)}`);

  if (res.status === 204) return null; // Zoho returns 204 for "no match"
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Contact search failed (${res.status})`);
  }

  const data = await res.json();
  const row = data?.data?.[0];
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.First_Name ?? null,
    lastName: row.Last_Name ?? null,
    email: row.Email ?? null,
  };
}

// ── Create Contact ──────────────────────────────────────────────────────────
export interface NewContact {
  firstName?: string | null;
  lastName: string; // required by Zoho
  email: string;
  phoneE164: string;
  dob?: string | null; // 'YYYY-MM-DD'
  gender?: string | null;
  city: string; // check-in location
}

export async function createContact(c: NewContact): Promise<{ id: string }> {
  const record: Record<string, any> = {
    Last_Name: c.lastName,
    First_Name: c.firstName || undefined,
    Email: c.email,
    Phone: c.phoneE164,
    Lead_Source: 'Website Check-in',
    Description: `Checked in at ${c.city} via ${LEAD_OWNER}.`,
  };
  if (c.dob) record.Date_of_Birth = c.dob;
  if (c.gender && process.env.ZOHO_GENDER_FIELD) record[process.env.ZOHO_GENDER_FIELD] = c.gender;
  if (process.env.ZOHO_CHECKIN_CITY_FIELD) record[process.env.ZOHO_CHECKIN_CITY_FIELD] = c.city;

  // Owner / brand tag — the "additional column" that marks this lead as ours.
  // Written to a custom field (API name in ZOHO_OWNER_FIELD); falls back to a
  // Description-only flag (above) if no custom field is configured.
  if (process.env.ZOHO_OWNER_FIELD) record[process.env.ZOHO_OWNER_FIELD] = LEAD_OWNER;

  const res = await zohoFetch(`/crm/v3/Contacts`, {
    method: 'POST',
    body: JSON.stringify({ data: [record], trigger: [] }),
  });

  const data = await res.json().catch(() => ({}));
  const row = data?.data?.[0];

  // Email is a unique field in Zoho → a duplicate email returns DUPLICATE_DATA.
  if (row?.code === 'DUPLICATE_DATA') {
    throw new Error('DUPLICATE');
  }
  if (!res.ok || row?.code !== 'SUCCESS') {
    throw new Error(row?.message || data?.message || `Contact create failed (${res.status})`);
  }
  return { id: row.details.id };
}

// ── Name splitting helper ───────────────────────────────────────────────────
// First word → First_Name, everything after the first space → Last_Name.
//   "Priya"               → { firstName: null,    lastName: "Priya" }
//   "Priya Sharma"        → { firstName: "Priya", lastName: "Sharma" }
//   "Priya Kumari Sharma" → { firstName: "Priya", lastName: "Kumari Sharma" }
// Last_Name is the only required Zoho field, so a single word falls back there.
export function splitName(full: string): { firstName: string | null; lastName: string } {
  const trimmed = full.trim().replace(/\s+/g, ' ');
  const firstSpace = trimmed.indexOf(' ');
  if (firstSpace === -1) return { firstName: null, lastName: trimmed };
  return {
    firstName: trimmed.slice(0, firstSpace),
    lastName: trimmed.slice(firstSpace + 1),
  };
}

// ── Search Contacts by phone OR email ────────────────────────────────────────
// Used by the registration form to avoid pushing duplicates: if a contact
// already exists under either the phone (Phone/Mobile) or the email, we skip the
// create. Pass whichever identifiers you have.
export async function findContactByPhoneOrEmail(opts: {
  phoneE164?: string | null;
  email?: string | null;
}): Promise<FoundContact | null> {
  const clauses: string[] = [];
  if (opts.phoneE164) {
    clauses.push(`(Phone:equals:${opts.phoneE164})`, `(Mobile:equals:${opts.phoneE164})`);
  }
  if (opts.email) {
    clauses.push(`(Email:equals:${opts.email})`);
  }
  if (clauses.length === 0) return null;

  const criteria = clauses.length === 1 ? clauses[0] : `(${clauses.join('or')})`;
  const res = await zohoFetch(`/crm/v3/Contacts/search?criteria=${encodeURIComponent(criteria)}`);

  if (res.status === 204) return null; // no match
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Contact search failed (${res.status})`);
  }

  const data = await res.json();
  const row = data?.data?.[0];
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.First_Name ?? null,
    lastName: row.Last_Name ?? null,
    email: row.Email ?? null,
  };
}

// ── Create Contact from the registration form ────────────────────────────────
// Like createContact() but for the registration flow (no check-in city). The
// brand owner tag is applied the same way as elsewhere.
export interface RegistrationLead {
  firstName?: string | null;
  lastName: string; // required by Zoho
  email: string;
  phoneE164: string;
}

export async function createRegistrationContact(c: RegistrationLead): Promise<{ id: string }> {
  const record: Record<string, any> = {
    Last_Name: c.lastName,
    First_Name: c.firstName || undefined,
    Email: c.email,
    Phone: c.phoneE164,
    Lead_Source: 'Website Registration',
    Description: `Registered via ${LEAD_OWNER} registration form.`,
  };
  if (process.env.ZOHO_OWNER_FIELD) record[process.env.ZOHO_OWNER_FIELD] = LEAD_OWNER;

  const res = await zohoFetch(`/crm/v3/Contacts`, {
    method: 'POST',
    body: JSON.stringify({ data: [record], trigger: [] }),
  });

  const data = await res.json().catch(() => ({}));
  const row = data?.data?.[0];

  // Email is unique in Zoho → a duplicate email returns DUPLICATE_DATA.
  if (row?.code === 'DUPLICATE_DATA') {
    throw new Error('DUPLICATE');
  }
  if (!res.ok || row?.code !== 'SUCCESS') {
    throw new Error(row?.message || data?.message || `Contact create failed (${res.status})`);
  }
  return { id: row.details.id };
}
