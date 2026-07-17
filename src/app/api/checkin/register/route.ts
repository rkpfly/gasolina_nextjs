import { NextRequest, NextResponse } from 'next/server';
import { createContact, isZohoConfigured, normalizePhone, splitName } from '@/lib/zoho';
import { isCrmConfigured, upsertFanProfile } from '@/lib/crmFanProfiles';
import { resolveCity, CITY_DIAL_CODE } from '@/app/checkin/cities';

// Step 2: write each first-time guest to both Zoho and the local Mongo CRM. The
// guest lands in whichever of the two is configured; only losing both blocks
// check-in, since a write that reaches one source still records the guest.
export async function POST(req: NextRequest) {
  const zohoUp = isZohoConfigured();
  const crmUp = isCrmConfigured();
  try {
    if (!zohoUp && !crmUp) {
      return NextResponse.json({ error: 'Check-in is not available right now' }, { status: 503 });
    }

    const { phone, place, email, fullName, gender, dob } = await req.json();

    const city = resolveCity(place);
    if (!city) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }
    if (!phone || !email || !fullName) {
      return NextResponse.json({ error: 'Phone, email and name are required' }, { status: 400 });
    }

    const { firstName, lastName } = splitName(String(fullName));
    const phoneE164 = normalizePhone(String(phone), CITY_DIAL_CODE[city]);
    const profile = {
      firstName,
      lastName,
      email: String(email).trim(),
      phoneE164,
      gender: gender || null,
      dob: dob || null,
      place: city,
      source: 'website_checkin' as const,
    };

    try {
      // Write to both sources in parallel. The lead is owned by "DamiClub" —
      // that tag is applied inside createContact, never trusted from the client.
      const [zohoResult] = await Promise.all([
        zohoUp ? createContact({ ...profile, city }) : null,
        crmUp ? upsertFanProfile(profile) : null,
      ]);
      // Backfill the Zoho id onto the Mongo document once the create succeeds.
      if (crmUp && zohoResult) await upsertFanProfile({ ...profile, zohoContactId: zohoResult.id });
      return NextResponse.json({ success: true, id: zohoResult?.id });
    } catch (err) {
      // Someone with this email already exists in Zoho — treat as registered,
      // and still record them locally so the CRM stays in sync.
      if (err instanceof Error && err.message === 'DUPLICATE') {
        if (crmUp) await upsertFanProfile(profile);
        return NextResponse.json({ success: true, alreadyExists: true });
      }
      throw err;
    }
  } catch (err) {
    console.error('[checkin/register]', err);
    return NextResponse.json({ error: 'Registration failed, please try again' }, { status: 502 });
  }
}
