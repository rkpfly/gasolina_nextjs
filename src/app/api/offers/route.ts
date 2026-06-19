import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

// Always read live from the DB — never serve a build-time cached snapshot.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // We only select the exact columns needed for the public UI cards.
    // We also include 'category' because your frontend UI uses it for the badge!
    const sql = `
      SELECT 
        id,
        slug, 
        offer_title, 
        short_description, 
        thumbnail_url, 
        category,
        expiry_date 
      FROM offers 
      WHERE is_active = TRUE 
      ORDER BY 
        is_featured DESC,   -- Puts featured (TRUE) items at the top
        priority DESC,      -- Then sorts by your custom priority number
        created_at DESC;    -- Finally, falls back to the newest offers
    `;

    const result = await query(sql, []);

    // Optionally: If you want to automatically filter out expired offers from the 
    // public view, you could add this to the WHERE clause:
    // "AND expiry_date > CURRENT_TIMESTAMP"

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET /api/offers]', error);
    return NextResponse.json(
      { error: 'Failed to fetch active offers' }, 
      { status: 500 }
    );
  }
}