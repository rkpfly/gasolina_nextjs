import { NextRequest, NextResponse } from 'next/server';
import { createContact, normalizePhone, splitName } from '@/lib/zoho';
import { resolveCity, CITY_DIAL_CODE } from '@/app/checkin/cities';

export async function POST(req: NextRequest) {
  try {
    const { phone, place, email, fullName, gender, dob } = await req.json();

    const city = resolveCity(place);
    if (!city) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }
    if (!phone || !email || !fullName) {
      return NextResponse.json({ error: 'Phone, email and name are required' }, { status: 400 });
    }

    const { firstName, lastName } = splitName(String(fullName));

    try {
      const { id } = await createContact({
        firstName,
        lastName,
        email: String(email).trim(),
        phoneE164: normalizePhone(String(phone), CITY_DIAL_CODE[city]),
        dob: dob || null,
        gender: gender || null,
        city, // lead is owned by "DamiClub" — set inside createContact, not from the client
      });
      return NextResponse.json({ success: true, id });
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE') {
        // Someone with this email already exists — treat as already registered.
        return NextResponse.json({ success: true, alreadyExists: true });
      }
      throw err;
    }
  } catch (err) {
    console.error('[checkin/register]', err);
    return NextResponse.json({ error: 'Registration failed, please try again' }, { status: 502 });
  }
}
