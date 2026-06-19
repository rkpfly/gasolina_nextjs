import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

// Submissions can change at any time, so never cache this endpoint.
export const dynamic = 'force-dynamic';

/**
 * Runs the preferred (ordered) query first; if it fails — e.g. the table is
 * missing a `created_at` column on some deployments — it transparently falls
 * back to the simpler query so the admin view still loads.
 */
async function safeRows(orderedSql: string, fallbackSql: string, params: unknown[] = []) {
  try {
    const result = await query(orderedSql, params);
    return result.rows;
  } catch {
    const result = await query(fallbackSql, params);
    return result.rows;
  }
}

// ─── GET: Fetch lead submissions + VIP reservations ──────────────────────────
export async function GET(request: NextRequest) {
  try {
    // Optional ?formType=offer_signup narrows the lead set (used by the
    // dedicated Offer Submissions page) and skips the VIP reservation fetch.
    const formType = request.nextUrl.searchParams.get('formType');

    let leads;
    if (formType) {
      leads = await safeRows(
        `SELECT * FROM lead_submissions WHERE form_type = $1 ORDER BY created_at DESC`,
        `SELECT * FROM lead_submissions WHERE form_type = $1`,
        [formType]
      );
    } else {
      leads = await safeRows(
        `SELECT * FROM lead_submissions ORDER BY created_at DESC`,
        `SELECT * FROM lead_submissions`
      );
    }

    // VIP reservations come from a separate table (event booking flow). It is
    // only relevant on the unfiltered view; a missing table must not break the
    // whole endpoint, so it gets its own guard.
    let vipReservations: unknown[] = [];
    if (!formType) {
      try {
        vipReservations = await safeRows(
          `SELECT * FROM vip_reservations ORDER BY created_at DESC`,
          `SELECT * FROM vip_reservations`
        );
      } catch (err) {
        console.error('[GET /api/admin/submissions] vip_reservations unavailable', err);
        vipReservations = [];
      }
    }

    return NextResponse.json({ leads, vipReservations });
  } catch (error) {
    console.error('[GET /api/admin/submissions]', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
