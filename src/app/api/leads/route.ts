import { query } from '@/lib/database/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extract fields (city, dob and booking_date are all optional — forms opt in)
    const {
      form_type, f_name, l_name, email, phone, city, dob, booking_date,
      total_guests, description, company_name, source_url: body_source_url
    } = body;

    // 2. Validate required fields (city is optional so newsletter/DOB forms work)
    if (!form_type || !f_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Extract IP and Source URL 
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown IP';
    const source_url = body_source_url || request.headers.get('referer') || 'Direct';

    const region = null;
    const country = null;

    // 4. Insert into the database (city, dob + booking_date are optional/nullable)
    const sql = `
      INSERT INTO lead_submissions
      (form_type, f_name, l_name, email, phone, city, region, country, ip_address, source_url, total_guests, description, company_name, dob, booking_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
      booking_date || null  // 'YYYY-MM-DD' chosen day (VIP = Saturdays only), or null
    ];

    await query(sql, values);

    return NextResponse.json({ success: true, message: 'Lead captured' }, { status: 200 });

  } catch (error: any) {
    console.error("Lead Submission Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}