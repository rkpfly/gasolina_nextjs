import { NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

// Submissions can change at any time, so never cache this endpoint.
export const dynamic = 'force-dynamic';

// ─── GET: Fetch talent/vendor applications from the careers form ───────────────
export async function GET() {
  try {
    let rows;
    try {
      const result = await query(`SELECT * FROM vendor_requests ORDER BY created_at DESC`);
      rows = result.rows;
    } catch {
      // Fallback if the deployment is missing a created_at column.
      const result = await query(`SELECT * FROM vendor_requests`);
      rows = result.rows;
    }

    return NextResponse.json({ requests: rows });
  } catch (error) {
    console.error('[GET /api/admin/vendor-requests]', error);
    return NextResponse.json({ error: 'Failed to fetch vendor requests' }, { status: 500 });
  }
}
