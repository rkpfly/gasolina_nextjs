import 'server-only';

import mongoose, { Types, type Document } from 'mongoose';

// Second source of truth for the guest check-in flow, alongside Zoho
// (see `lib/zoho.ts`). This talks to a Mongo `fanprofiles` collection that is
// OWNED BY ANOTHER APPLICATION — the Mongoose schema and the `__v` field live
// elsewhere. We deliberately use the raw driver (`connection.db.collection`),
// not a Mongoose model, so this module neither validates nor owns the schema.

const MONGODB_URI = process.env.MONGODB_URI?.trim();
// Lowercase — Mongo collection names are case-sensitive and the existing
// collection is `fanprofiles` (mongoose's default pluralised, lowercased name).
const COLLECTION_NAME = 'fanprofiles';

// `fanprofiles` is a shared multi-tenant collection owned by another app. Every
// read and write from THIS project is scoped to our organization, so we neither
// match nor overwrite another brand's guests. Env-only — no fallback: the CRM
// path is treated as unconfigured until CHECKIN_ORGANIZATION_ID is set.
const ORGANIZATION_ID = process.env.CHECKIN_ORGANIZATION_ID?.trim();

function orgObjectId(): Types.ObjectId {
  if (!ORGANIZATION_ID) throw new Error('CHECKIN_ORGANIZATION_ID is not configured');
  return new Types.ObjectId(ORGANIZATION_ID);
}

type FanProfileDocument = Document & {
  firstName?: string | null; lastName?: string | null; fullName?: string | null; name?: string | null;
  displayName?: string | null;
  email?: string | null; phoneE164?: string | null; phone?: string | null; mobile?: string | null;
  mobileNumber?: string | null; phoneNumber?: string | null; gender?: string | null; dob?: string | Date | null;
  place?: string | null; zohoContactId?: string | null;
};

// Mongo stores dob as a Date, but Zoho's Date_of_Birth accepts only 'YYYY-MM-DD'
// and rejects a full ISO timestamp with "invalid data". Both shapes appear in the
// collection, since check-ins written from the form store it as a plain string.
function asDateOnly(dob: string | Date | null | undefined): string | null {
  if (!dob) return null;
  if (dob instanceof Date) return Number.isNaN(dob.getTime()) ? null : dob.toISOString().slice(0, 10);
  return String(dob).slice(0, 10) || null;
}

export interface CrmFanProfile {
  id: string; firstName: string | null; lastName: string | null; email: string | null; phoneE164: string;
  gender: string | null; dob: string | null; place: string | null; zohoContactId: string | null;
}
export interface FanProfileInput {
  firstName?: string | null; lastName?: string | null; email?: string | null; phoneE164: string;
  gender?: string | null; dob?: string | null; place?: string | null; zohoContactId?: string | null;
}

declare global { var mongooseConnection: Promise<typeof mongoose> | undefined; }

export function isCrmConfigured(): boolean { return Boolean(MONGODB_URI && ORGANIZATION_ID); }

async function getFanProfiles() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (!global.mongooseConnection) global.mongooseConnection = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const connection = await global.mongooseConnection;
  return connection.connection.db!.collection<FanProfileDocument>(COLLECTION_NAME);
}

// Names live in `displayName` on these documents, not fullName/name — keep all
// three in the fallback chain so a hit returns a real firstName, not "null".
function asProfile(profile: FanProfileDocument): CrmFanProfile {
  const [nameFirst, ...nameRest] = (profile.fullName || profile.name || profile.displayName || '').trim().split(/\s+/);
  return {
    id: profile._id.toString(), firstName: profile.firstName ?? nameFirst ?? null,
    lastName: profile.lastName ?? (nameRest.join(' ') || null), email: profile.email ?? null,
    phoneE164: profile.phoneE164 || profile.phone || profile.mobile || profile.mobileNumber || profile.phoneNumber || '',
    gender: profile.gender ?? null, dob: asDateOnly(profile.dob), place: profile.place ?? null,
    zohoContactId: profile.zohoContactId ?? null,
  };
}

const phoneQuery = (phoneE164: string) => ({ organizationId: orgObjectId(), $or: [
  { phoneE164 }, { phone: phoneE164 }, { mobile: phoneE164 }, { mobileNumber: phoneE164 }, { phoneNumber: phoneE164 },
] });

export async function findFanProfileByPhone(phoneE164: string): Promise<CrmFanProfile | null> {
  const profile = await (await getFanProfiles()).findOne(phoneQuery(phoneE164));
  return profile ? asProfile(profile) : null;
}

// Upsert preserves CRM-only fields and makes phoneE164 the shared sync key.
export async function upsertFanProfile(input: FanProfileInput): Promise<CrmFanProfile> {
  const profiles = await getFanProfiles();
  const existing = await profiles.findOne(phoneQuery(input.phoneE164));
  const fields = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  const now = new Date();
  if (existing) {
    await profiles.updateOne({ _id: existing._id }, { $set: { ...fields, updatedAt: now } });
    return asProfile({ ...existing, ...fields, updatedAt: now } as FanProfileDocument);
  }
  const organizationId = orgObjectId();
  const inserted = await profiles.findOneAndUpdate(
    { organizationId, phoneE164: input.phoneE164 },
    { $set: { ...fields, updatedAt: now }, $setOnInsert: { organizationId, createdAt: now } },
    { upsert: true, returnDocument: 'after' }
  );
  return asProfile(inserted!);
}
