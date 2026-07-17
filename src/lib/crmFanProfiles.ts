import 'server-only';

import mongoose, { Types, type Document } from 'mongoose';

// Second source of truth for every guest-capture flow on this site — check-in,
// the lead forms, and the registration form — alongside Zoho (see `lib/zoho.ts`).
// This talks to a Mongo `fanprofiles` collection that is OWNED BY ANOTHER
// APPLICATION — the Mongoose schema and the `__v` field live elsewhere. We
// deliberately use the raw driver (`connection.db.collection`), not a Mongoose
// model, so this module neither validates nor owns the schema.

const MONGODB_URI = process.env.MONGODB_URI?.trim();
// Lowercase — Mongo collection names are case-sensitive and the existing
// collection is `fanprofiles` (mongoose's default pluralised, lowercased name).
const COLLECTION_NAME = 'fanprofiles';

// `fanprofiles` is a shared multi-tenant collection owned by another app. Every
// read and write from THIS project is scoped to our organization, so we neither
// match nor overwrite another brand's guests. Env-only — no fallback: the CRM
// path is treated as unconfigured until CHECKIN_ORGANIZATION_ID is set. The name
// predates this module serving the lead/registration forms too; it is the same
// organization for all three, so the var is kept as-is to avoid a redeploy.
const ORGANIZATION_ID = process.env.CHECKIN_ORGANIZATION_ID?.trim();

function orgObjectId(): Types.ObjectId {
  if (!ORGANIZATION_ID) throw new Error('CHECKIN_ORGANIZATION_ID is not configured');
  return new Types.ObjectId(ORGANIZATION_ID);
}

// Mirrors the owning app's Mongoose `fanProfile` schema (Louder/CRM). We write
// this exact shape — displayName, flat phone + phones[], email + emails[],
// location[], status/source, consent — so records surface in the CRM's
// leads/contacts list, not just the raw fan count. Legacy phone/name aliases
// are kept in the read type so older documents still resolve on lookup.
type FanProfileDocument = Document & {
  firstName?: string | null; lastName?: string | null; fullName?: string | null; name?: string | null;
  displayName?: string | null;
  email?: string | null; emails?: string[] | null;
  phoneE164?: string | null; phone?: string | null; phones?: string[] | null;
  mobile?: string | null; mobileNumber?: string | null; phoneNumber?: string | null;
  gender?: string | null; dob?: string | Date | null;
  place?: string | null;
  location?: Array<{ city?: string | null; state?: string | null; country?: string | null; isPrimary?: boolean }> | null;
  zohoContactId?: string | null;
  customFields?: Record<string, unknown> | null;
};

// gender is an enum in the owning schema; anything outside it is dropped rather
// than written (raw-driver writes bypass Mongoose validation, so we guard here).
const VALID_GENDERS = ['male', 'female', 'non-binary', 'other', 'prefer_not_to_say'];
function toGenderEnum(gender: string | null | undefined): string | undefined {
  if (!gender) return undefined;
  const value = String(gender).trim().toLowerCase();
  return VALID_GENDERS.includes(value) ? value : undefined;
}

// Mongo signals a unique-index violation as error code 11000.
function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

// Mongo stores dob as a Date, but Zoho's Date_of_Birth accepts only 'YYYY-MM-DD'
// and rejects a full ISO timestamp with "invalid data". Both shapes appear in the
// collection, since check-ins written from the form store it as a plain string.
function asDateOnly(dob: string | Date | null | undefined): string | null {
  if (!dob) return null;
  if (dob instanceof Date) return Number.isNaN(dob.getTime()) ? null : dob.toISOString().slice(0, 10);
  return String(dob).slice(0, 10) || null;
}

// `source` is an enum in the owning app's schema. Raw-driver writes bypass
// Mongoose validation, so an off-enum value would persist silently and show up
// as unknown in the CRM — only ever pass one of these. `website_checkin` already
// exists in the collection; the other two must be present in the owning app's
// fanProfile enum before this ships.
export type FanProfileSource = 'website_checkin' | 'website_lead' | 'website_registration';

export interface CrmFanProfile {
  id: string; firstName: string | null; lastName: string | null; email: string | null; phoneE164: string;
  gender: string | null; dob: string | null; place: string | null; zohoContactId: string | null;
}
export interface FanProfileInput {
  firstName?: string | null; lastName?: string | null; email?: string | null;
  // At least one of phoneE164 / email is required — they are the only identity
  // keys we can dedup on. `upsertFanProfile` throws when both are missing.
  phoneE164?: string | null;
  gender?: string | null; dob?: string | null; place?: string | null; zohoContactId?: string | null;
  source: FanProfileSource;
  // Free-form provenance for the CRM (e.g. the LeadForm's `form_type`). Lands
  // under `customFields`, which the owning app treats as an open bag.
  formType?: string | null;
}

declare global { var mongooseConnection: Promise<typeof mongoose> | undefined; }

export function isCrmConfigured(): boolean { return Boolean(MONGODB_URI && ORGANIZATION_ID); }

async function getFanProfiles() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (!global.mongooseConnection) global.mongooseConnection = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const connection = await global.mongooseConnection;
  return connection.connection.db!.collection<FanProfileDocument>(COLLECTION_NAME);
}

// Name lives in `displayName`; number in the flat `phone` (with `phones[]` as a
// fallback); city in `location[0]`. Legacy aliases stay in the chain so older
// documents still resolve. The Zoho id is mirrored to `customFields.zohoRecordId`
// — the field the owning app reads — as well as our own `zohoContactId`.
function asProfile(profile: FanProfileDocument): CrmFanProfile {
  const [nameFirst, ...nameRest] = (profile.fullName || profile.name || profile.displayName || '').trim().split(/\s+/);
  return {
    id: profile._id.toString(), firstName: profile.firstName ?? nameFirst ?? null,
    lastName: profile.lastName ?? (nameRest.join(' ') || null),
    email: profile.email ?? profile.emails?.[0] ?? null,
    phoneE164: profile.phoneE164 || profile.phone || profile.phones?.[0] || profile.mobile || profile.mobileNumber || profile.phoneNumber || '',
    gender: profile.gender ?? null, dob: asDateOnly(profile.dob),
    place: profile.place ?? profile.location?.[0]?.city ?? null,
    zohoContactId: profile.zohoContactId ?? (profile.customFields?.zohoRecordId as string | undefined) ?? null,
  };
}

// Match a guest within our org by any known phone shape (or email, when given),
// skipping soft-deleted records. Mirrors the owning app's dedup on phone/email.
function identityQuery(phoneE164?: string | null, email?: string | null) {
  const or: Record<string, unknown>[] = [];
  if (phoneE164) {
    or.push(
      { phoneE164 }, { phone: phoneE164 }, { phones: phoneE164 },
      { mobile: phoneE164 }, { mobileNumber: phoneE164 }, { phoneNumber: phoneE164 },
    );
  }
  if (email) or.push({ email }, { emails: email });
  return { organizationId: orgObjectId(), deletedAt: null, $or: or };
}

export async function findFanProfileByPhone(phoneE164: string): Promise<CrmFanProfile | null> {
  const profile = await (await getFanProfiles()).findOne(identityQuery(phoneE164));
  return profile ? asProfile(profile) : null;
}

// Best-effort mirror for the lead + registration forms. Those submissions are
// already durably captured in Postgres before this runs, so the CRM is a
// secondary sink: a Mongo outage must never fail the visitor's request or lose
// the lead. Resolves to null (having logged) instead of throwing. The check-in
// route deliberately does NOT use this — there, Mongo is a primary sink.
export async function syncFanProfile(input: FanProfileInput): Promise<CrmFanProfile | null> {
  if (!isCrmConfigured()) return null;
  try {
    return await upsertFanProfile(input);
  } catch (err) {
    console.error(`[crmFanProfiles] ${input.source} sync failed`, err);
    return null;
  }
}

// Upsert in the owning app's schema shape. Identity fields are refreshed on
// every call (so Zoho ↔ Mongo converge); CRM metadata + consent are stamped
// only on first insert (first-touch wins), which keeps the original `source` —
// a guest who first arrived as a lead stays attributed to the lead form even
// after they later check in. The raw driver bypasses Mongoose, so schema
// defaults and timestamps are written explicitly here.
export async function upsertFanProfile(input: FanProfileInput): Promise<CrmFanProfile> {
  const profiles = await getFanProfiles();
  const organizationId = orgObjectId();
  const now = new Date();

  const phone = input.phoneE164 || undefined;
  const email = input.email ? input.email.trim().toLowerCase() : undefined;
  if (!phone && !email) throw new Error('upsertFanProfile requires a phone or an email');

  const displayName = [input.firstName, input.lastName].filter(Boolean).join(' ').trim() || undefined;
  const gender = toGenderEnum(input.gender);
  const dob = input.dob ? new Date(input.dob) : undefined;

  // Identity snapshot — always refreshed.
  const $set: Record<string, unknown> = { updatedAt: now, lastSyncedAt: now };
  if (displayName) $set.displayName = displayName;
  if (email) $set.email = email;
  if (phone) $set.phone = phone;
  if (gender) $set.gender = gender;
  if (dob && !Number.isNaN(dob.getTime())) $set.dob = dob;
  if (input.place) $set.location = [{ city: input.place, isPrimary: true }];
  if (input.formType) $set['customFields.formType'] = input.formType;
  if (input.zohoContactId) {
    $set['customFields.zohoRecordId'] = input.zohoContactId;
    $set.zohoContactId = input.zohoContactId;
  }

  const $addToSet: Record<string, unknown> = {};
  if (email) $addToSet.emails = email;
  if (phone) $addToSet.phones = phone;

  // CRM metadata + consent + schema defaults — first-touch only. No `tags`: in
  // this collection tags are import-batch labels, not provenance markers.
  const $setOnInsert: Record<string, unknown> = {
    organizationId,
    createdAt: now,
    source: input.source,
    status: 'new_lead',
    hasAttended: false,
    vip: false,
    deletedAt: null,
    consent: { emailOptIn: true, smsOptIn: false, whatsappOptIn: false, consentedAt: now },
  };

  const update: Record<string, unknown> = { $set, $setOnInsert };
  if (Object.keys($addToSet).length) update.$addToSet = $addToSet;

  // Update an existing guest in place (by _id) to avoid clobbering the owning
  // app's fields; otherwise insert a fresh, fully-shaped document. The insert
  // filter must key on `email` where we have one, because the owning app holds a
  // UNIQUE partial index on {organizationId, email} — keying on phone instead
  // would try to insert a second document for an existing email and be rejected.
  const existing = await profiles.findOne(identityQuery(phone, email));
  const filter = existing
    ? { _id: existing._id }
    : email
      ? { organizationId, email }
      : { organizationId, phone };

  try {
    const saved = await profiles.findOneAndUpdate(filter, update, { upsert: true, returnDocument: 'after' });
    return asProfile(saved!);
  } catch (err) {
    // A concurrent insert for the same email can land between our findOne and
    // the upsert, tripping the unique index. The winner is a valid match for
    // this guest, so re-read it and apply our update in place.
    if (!isDuplicateKeyError(err)) throw err;
    const winner = await profiles.findOne(identityQuery(phone, email));
    if (!winner) throw err;
    const merged = await profiles.findOneAndUpdate({ _id: winner._id }, update, { returnDocument: 'after' });
    return asProfile(merged!);
  }
}
