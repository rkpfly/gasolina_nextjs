import { NextRequest, NextResponse } from 'next/server';
import { createContact, findContactByPhone, isZohoConfigured, normalizePhone } from '@/lib/zoho';
import { findFanProfileByPhone, isCrmConfigured, upsertFanProfile } from '@/lib/checkinCrm';
import { resolveCity, CITY_DIAL_CODE } from '@/app/checkin/cities';

// Step 1: look in Zoho first, then the local Mongo CRM. A record found in one is
// copied to the other, so the two converge over time; only a record absent from
// both sources reaches step 2 (register). Either source alone is enough to check
// a guest in — the cross-source sync is skipped while its counterpart is
// unconfigured and resumes on the next lookup.
export async function POST(req: NextRequest) {
  const zohoUp = isZohoConfigured();
  const crmUp = isCrmConfigured();
  try {
    // 503 only when BOTH sources are down; otherwise degrade to whichever is up.
    if (!zohoUp && !crmUp) {
      return NextResponse.json({ error: 'Check-in is not available right now' }, { status: 503 });
    }

    const { phone, place } = await req.json();

    const city = resolveCity(place);
    if (!city) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }
    if (!phone || String(phone).trim().length < 6) {
      return NextResponse.json({ error: 'Valid phone number required' }, { status: 400 });
    }

    const phoneE164 = normalizePhone(String(phone), CITY_DIAL_CODE[city]);
    const zohoContact = zohoUp ? await findContactByPhone(phoneE164) : null;
    const crmProfile = crmUp ? await findFanProfileByPhone(phoneE164) : null;

    // Zoho hit → mirror into the local CRM (best-effort convergence).
    if (zohoContact) {
      if (crmUp) {
        await upsertFanProfile({
          firstName: zohoContact.firstName,
          lastName: zohoContact.lastName,
          email: zohoContact.email,
          phoneE164,
          place: city,
          zohoContactId: zohoContact.id,
        });
      }
      return NextResponse.json({ found: true, firstName: zohoContact.firstName });
    }

    // CRM hit → push into Zoho and write the new Zoho id back onto the document.
    if (crmProfile) {
      if (zohoUp) {
        // Email is a unique required field in Zoho — no email means no sync.
        if (!crmProfile.email) {
          throw new Error('CRM profile cannot be synced to Zoho without an email address');
        }
        const { id } = await createContact({
          firstName: crmProfile.firstName,
          lastName: crmProfile.lastName || crmProfile.firstName || 'Guest',
          email: crmProfile.email,
          phoneE164,
          gender: crmProfile.gender,
          dob: crmProfile.dob,
          city,
        });
        await upsertFanProfile({ ...crmProfile, phoneE164, place: city, zohoContactId: id });
      }
      return NextResponse.json({ found: true, firstName: crmProfile.firstName });
    }

    return NextResponse.json({ found: false });
  } catch (err) {
    console.error('[checkin/lookup]', err);
    return NextResponse.json({ error: 'Lookup failed, please try again' }, { status: 502 });
  }
}
