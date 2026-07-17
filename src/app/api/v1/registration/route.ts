import { NextRequest, NextResponse } from 'next/server';
import {
  normalizePhone,
  splitName,
  findContactByPhoneOrEmail,
  createRegistrationContact,
} from '@/lib/zoho';
import { ensureRegistrationsTable, insertRegistration } from '@/lib/database/registrations';
import { syncFanProfile } from '@/lib/crmFanProfiles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AU_DIAL = '+61'; // Louder. is a Melbourne brand — default local numbers to AU
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // 1. Parse + validate
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const phoneRaw = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (phoneRaw.replace(/[\s()+-]/g, '').length < 6) {
    return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });
  }

  const phoneE164 = normalizePhone(phoneRaw, AU_DIAL);

  // Last_Name is the only required Zoho field. Fall back to the email local-part
  // when no name is supplied so the CRM record is still identifiable.
  const { firstName, lastName } = name
    ? splitName(name)
    : { firstName: null as string | null, lastName: email.split('@')[0] || 'Guest' };

  // 2. Zoho CRM — dedup by phone OR email; only create when not already present.
  let zohoStatus = 'pending';
  let zohoContactId: string | null = null;
  let zohoError: string | null = null;
  try {
    const existing = await findContactByPhoneOrEmail({ phoneE164, email });
    if (existing) {
      zohoStatus = 'duplicate';
      zohoContactId = existing.id;
    } else {
      try {
        const { id } = await createRegistrationContact({ firstName, lastName, email, phoneE164 });
        zohoStatus = 'created';
        zohoContactId = id;
      } catch (e) {
        // race: a unique-email collision between our search and create
        if (e instanceof Error && e.message === 'DUPLICATE') {
          zohoStatus = 'duplicate';
        } else {
          throw e;
        }
      }
    }
  } catch (e) {
    zohoStatus = 'error';
    zohoError = e instanceof Error ? e.message : String(e);
    console.error('[v1/registration] zoho', e);
  }

  // 3. Capture the exact submission payload in our own table (regardless of Zoho).
  const userAgent = req.headers.get('user-agent');
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    null;

  let dbOk = false;
  try {
    await ensureRegistrationsTable();
    await insertRegistration({
      email,
      phone: phoneRaw,
      phoneE164,
      fullName: name || null,
      payload: body, // exact body as received
      zohoContactId,
      zohoStatus,
      zohoError,
      userAgent,
      ip,
    });
    dbOk = true;
  } catch (e) {
    console.error('[v1/registration] db', e);
  }

  // 4. Mirror into the Mongo CRM, carrying the Zoho id when we have one so the
  // two systems stay cross-referenced. Best-effort: step 3 already captured the
  // submission, so a CRM outage must not fail the registration.
  await syncFanProfile({
    firstName,
    lastName,
    email,
    phoneE164,
    zohoContactId,
    source: 'website_registration',
  });

  // If both sinks failed there's nothing captured to retry against → error.
  if (!dbOk && zohoStatus === 'error') {
    return NextResponse.json({ error: 'Registration failed, please try again' }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    duplicate: zohoStatus === 'duplicate',
    zoho: { status: zohoStatus, id: zohoContactId },
  });
}
