import { query } from '@/lib/database/db';
import { NextResponse } from 'next/server';
import { syncFanProfile } from '@/lib/crmFanProfiles';
import { normalizePhone } from '@/lib/zoho';

// LeadForm posts `phone` as the picker's dial code concatenated with whatever
// the visitor typed, plus the dial code itself as `country_code`. Split them
// back apart so a locally-formatted number ("0412…") becomes real E.164
// ("+61412…") rather than "+610412…", which would never match the check-in
// path's lookup. Returns null when there is no actual number — a form that
// omits the phone field still posts the bare dial code.
function toE164(phone: unknown, countryCode: unknown): string | null {
  const raw = String(phone ?? '').replace(/[\s()-]/g, '').trim();
  const dial = String(countryCode ?? '').replace(/[\s()-]/g, '').trim();
  if (!raw) return null;

  const local = dial && raw.startsWith(dial) ? raw.slice(dial.length) : raw;
  if (local.replace(/\D/g, '').length < 5) return null;

  return normalizePhone(local, dial || '+61');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extract fields (city, dob and booking_date are all optional — forms opt in)
    const {
      form_type, f_name, l_name, email, phone, city, dob, booking_date,
      total_guests, description, company_name, source_url: body_source_url,
      country_code, guest_names, vip, newsletter_consent
    } = body;

    // 2. Validate required fields (city is optional so newsletter/DOB forms work)
    if (!form_type || !f_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (
      form_type === 'guestlist_request' &&
      (!phone || !booking_date || (!guest_names && !total_guests))
    ) {
      return NextResponse.json(
        { error: 'Guestlist requests require a phone, booking date, and guest names or count' },
        { status: 400 }
      );
    }

    // 3. Extract IP and Source URL 
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
    const source_url = body_source_url || request.headers.get('referer') || 'Direct';

    const region = null;
    const country = null;

    // 4. Insert into the database (city, dob + booking_date are optional/nullable)
    const sql = `
      INSERT INTO lead_submissions
      (form_type, f_name, l_name, email, phone, city, region, country, ip_address, source_url, total_guests, description, company_name, dob, booking_date, guest_names, vip, newsletter_consent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id;
    `;

    const values = [
      form_type,
      f_name,
      l_name || null,
      email || null,
      phone || null,
      city || null,
      region,
      country,
      ip_address,
      source_url,
      total_guests ? parseInt(total_guests) : null,
      description || null,
      company_name || null, // <--- Dedicated company name injection
      dob || null,          // 'YYYY-MM-DD' from the date input, or null
      booking_date || null, // 'YYYY-MM-DD' chosen day (VIP = Saturdays only), or null
      guest_names || null,
      vip === true,
      newsletter_consent === true
    ];

    await query(sql, values);

    // 5. Mirror the lead into the Mongo CRM. Best-effort by design: the row is
    // already committed above, so a CRM outage must not fail the submission.
    await syncFanProfile({
      firstName: f_name || null,
      lastName: l_name || null,
      email: email || null,
      phoneE164: toE164(phone, country_code),
      dob: dob || null,
      place: city || null,
      source: 'website_lead',
      formType: form_type,
    });

    return NextResponse.json({ success: true, message: 'Lead captured' }, { status: 200 });

  } catch (error: unknown) {
    console.error("Lead Submission Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
