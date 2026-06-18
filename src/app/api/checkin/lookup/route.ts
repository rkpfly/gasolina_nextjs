import { NextRequest, NextResponse } from 'next/server';
import { findContactByPhone, normalizePhone } from '@/lib/zoho';
import { resolveCity, CITY_DIAL_CODE } from '@/app/checkin/cities';

export async function POST(req: NextRequest) {
  try {
    const { phone, place } = await req.json();

    const city = resolveCity(place);
    if (!city) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }
    if (!phone || String(phone).trim().length < 6) {
      return NextResponse.json({ error: 'Valid phone number required' }, { status: 400 });
    }

    const phoneE164 = normalizePhone(String(phone), CITY_DIAL_CODE[city]);
    const contact = await findContactByPhone(phoneE164);

    if (contact) {
      return NextResponse.json({ found: true, firstName: contact.firstName });
    }
    return NextResponse.json({ found: false });
  } catch (err) {
    console.error('[checkin/lookup]', err);
    return NextResponse.json({ error: 'Lookup failed, please try again' }, { status: 502 });
  }
}
