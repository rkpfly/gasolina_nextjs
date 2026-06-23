import 'server-only';
import { query } from './db';

// Storage for the registration form ("Something Loud is on the horizon").
// Every submission is captured here verbatim (payload jsonb) alongside the Zoho
// sync outcome, so nothing is lost even if the CRM call fails.

const CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS form_registrations (
    id              BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    email           TEXT,
    phone           TEXT,
    phone_e164      TEXT,
    full_name       TEXT,
    payload         JSONB NOT NULL,
    zoho_contact_id TEXT,
    zoho_status     TEXT NOT NULL DEFAULT 'pending',
    zoho_error      TEXT,
    source          TEXT NOT NULL DEFAULT 'registration',
    user_agent      TEXT,
    ip              TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_form_registrations_email   ON form_registrations (lower(email));
  CREATE INDEX IF NOT EXISTS idx_form_registrations_phone   ON form_registrations (phone_e164);
  CREATE INDEX IF NOT EXISTS idx_form_registrations_created ON form_registrations (created_at DESC);
`;

// Lazily ensure the table exists (once per warm instance). The canonical way to
// provision it is `node scripts/create-registrations-table.js`; this is a safety
// net so the route works even if that migration was never run.
let ensured: Promise<void> | null = null;
export function ensureRegistrationsTable(): Promise<void> {
  if (!ensured) {
    ensured = query(CREATE_SQL)
      .then(() => undefined)
      .catch((err) => {
        ensured = null; // allow a retry on the next request
        throw err;
      });
  }
  return ensured;
}

export interface RegistrationRow {
  email: string | null;
  phone: string | null;
  phoneE164: string | null;
  fullName: string | null;
  payload: unknown;            // exact submission body
  zohoContactId: string | null;
  zohoStatus: string;          // created | duplicate | error | pending
  zohoError: string | null;
  source?: string;
  userAgent: string | null;
  ip: string | null;
}

export async function insertRegistration(r: RegistrationRow): Promise<{ id: string }> {
  const res = await query(
    `INSERT INTO form_registrations
       (email, phone, phone_e164, full_name, payload, zoho_contact_id, zoho_status, zoho_error, source, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      r.email,
      r.phone,
      r.phoneE164,
      r.fullName,
      JSON.stringify(r.payload ?? {}),
      r.zohoContactId,
      r.zohoStatus,
      r.zohoError,
      r.source || 'registration',
      r.userAgent,
      r.ip,
    ]
  );
  return { id: String(res.rows[0].id) };
}
