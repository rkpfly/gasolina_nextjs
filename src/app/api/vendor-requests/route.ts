import { query } from '@/lib/database/db';
import { NextResponse } from 'next/server';

// Roles offered on the /careers "Join The Team" form. Kept in sync with the
// roster cards + the <select> options in CareersClient.tsx.
const ALLOWED_ROLES = ['promoter', 'influencer', 'artist', 'musician', 'vocalist'];

// ─── POST: Store a vendor/talent application from the careers page ──────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      first_name,
      last_name,
      country_code,
      phone,
      email,
      role,
      collaboration_date,
      portfolio_link,
      source_url: body_source_url,
    } = body;

    // 1. Validate required fields
    if (!first_name || !phone || !email || !role) {
      return NextResponse.json(
        { error: 'first_name, phone, email and role are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 2. Capture IP + source URL for tracking (mirrors lead_submissions)
    const ip_address =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'Unknown IP';
    const source_url = body_source_url || request.headers.get('referer') || 'Direct';

    // 3. Insert into the database
    const sql = `
      INSERT INTO vendor_requests
        (first_name, last_name, country_code, phone, email, role,
         collaboration_date, portfolio_link, ip_address, source_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at;
    `;

    const values = [
      first_name,
      last_name || null,
      country_code || '+61',
      phone,
      email,
      role,
      collaboration_date || null, // 'YYYY-MM-DD' from the date input, or null
      portfolio_link || null,
      ip_address,
      source_url,
    ];

    const result = await query(sql, values);

    return NextResponse.json(
      { success: true, id: result.rows[0].id, message: 'Vendor request captured' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/vendor-requests]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
