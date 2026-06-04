import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/db'; 

const CRM_UPLOAD_URL = process.env.CRM_API_URL
  ? `${process.env.CRM_API_URL}/api/media`
  : 'https://147.79.70.30.nip.io:8990/api/media';

// Helper function to handle sending files to your CRM
async function uploadToCRM(file: File, folder: string): Promise<string> {
  const crmForm = new FormData();
  crmForm.append('file', file);
  crmForm.append('folder', folder);

  const crmRes = await fetch(CRM_UPLOAD_URL, {
    method: 'POST',
    body: crmForm,
    headers: {
      ...(process.env.CRM_API_SECRET && {
        Authorization: `Bearer ${process.env.CRM_API_SECRET}`,
      }),
    },
  });

  if (!crmRes.ok) {
    const err = await crmRes.json().catch(() => ({}));
    throw new Error(err.error ?? 'CRM upload failed');
  }

  const crmData = await crmRes.json();
  const fileUrl = crmData.file?.url ?? crmData.url ?? null;

  if (!fileUrl) throw new Error('CRM did not return a file URL');
  return fileUrl;
}

// ─── GET: Fetch all offers ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'created_at';
    
    const allowedSorts = ['created_at', 'expiry_date', 'priority', 'clicks', 'views', 'redemptions'];
    const orderBy = allowedSorts.includes(sort) ? sort : 'created_at';
    // Priority and Clicks usually look better descending, Dates might vary, default to DESC
    const direction = 'DESC'; 

    const sql = `SELECT * FROM offers ORDER BY ${orderBy} ${direction}`;
    const result = await query(sql, []);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[GET /api/admin/offers]', error);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

// ─── POST: Create or Update an offer ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const id = formData.get('id') as string | null; 
    
    // Core requirements
    const offer_title = formData.get('offer_title') as string;
    const expiry_date = formData.get('expiry_date') as string;
    const slug = formData.get('slug') as string;

    if (!offer_title || !expiry_date || !slug) {
      return NextResponse.json({ error: 'Title, Slug, and Expiry Date are required' }, { status: 400 });
    }

    // Handle Files
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    const sponsorLogoFile = formData.get('sponsorLogoFile') as File | null;
    const folder = 'offers';

    let thumbnailUrl = formData.get('thumbnail_url') as string | null;
    let sponsorLogoUrl = formData.get('sponsor_logo_url') as string | null;

    try {
      if (thumbnailFile) thumbnailUrl = await uploadToCRM(thumbnailFile, folder);
      if (sponsorLogoFile) sponsorLogoUrl = await uploadToCRM(sponsorLogoFile, folder);
    } catch (uploadError: any) {
      return NextResponse.json({ error: uploadError.message }, { status: 502 });
    }

    if (!thumbnailUrl) {
      return NextResponse.json({ error: 'A thumbnail file or thumbnail_url is required' }, { status: 400 });
    }

    // Extract remaining fields
    const short_description = formData.get('short_description') as string | null;
    const start_date = formData.get('start_date') as string || new Date().toISOString();
    const offer_code = formData.get('offer_code') as string | null;
    const description = formData.get('description') as string | null;
    const how_to_redeem = formData.get('how_to_redeem') as string | null;
    const terms_and_conditions = formData.get('terms_and_conditions') as string | null;
    const offer_type = formData.get('offer_type') as string | null;
    const is_active = formData.get('is_active') === 'true';
    const is_featured = formData.get('is_featured') === 'true';
    const category = formData.get('category') as string | null;
    const sponsor_name = formData.get('sponsor_name') as string | null;
    const sponsor_website = formData.get('sponsor_website') as string | null;
    const background_color = formData.get('background_color') as string | null;
    const text_color = formData.get('text_color') as string | null;
    const priority = parseInt(formData.get('priority') as string) || 0;
    const max_redemptions = formData.get('max_redemptions') ? parseInt(formData.get('max_redemptions') as string) : null;
    const redemption_limit_per_user = parseInt(formData.get('redemption_limit_per_user') as string) || 1;
    const external_link = formData.get('external_link') as string | null;
    
    // Handle tags (PostgreSQL array mapping)
    const tagsRaw = formData.get('tags') as string | null;
    let tags: string[] | null = null;
    if (tagsRaw) {
      try { tags = JSON.parse(tagsRaw); } catch { tags = [tagsRaw]; }
    }

    // Handle SEO JSON
    const seoRaw = formData.get('seo') as string | null;
    let seo = null; // defaults to empty object in DB per your schema if null
    if (seoRaw) {
      try {
        // Just checking if it's valid JSON before passing to pg
        JSON.parse(seoRaw);
        seo = seoRaw; 
      } catch {
        seo = '{}';
      }
    }

    let sql = '';
    const values = [
      thumbnailUrl, offer_title, short_description, expiry_date, start_date,
      offer_code, description, how_to_redeem, terms_and_conditions, offer_type,
      is_active, is_featured, category, tags, sponsor_name, sponsorLogoUrl,
      sponsor_website, background_color, text_color, priority, max_redemptions,
      redemption_limit_per_user, external_link, slug, seo
    ];

    if (id) {
      // UPDATE existing offer
      sql = `
        UPDATE offers SET
          thumbnail_url = $1, offer_title = $2, short_description = $3, expiry_date = $4, start_date = $5,
          offer_code = $6, description = $7, how_to_redeem = $8, terms_and_conditions = $9, offer_type = $10,
          is_active = $11, is_featured = $12, category = $13, tags = $14, sponsor_name = $15, sponsor_logo_url = $16,
          sponsor_website = $17, background_color = $18, text_color = $19, priority = $20, max_redemptions = $21,
          redemption_limit_per_user = $22, external_link = $23, slug = $24, seo = $25, updated_at = CURRENT_TIMESTAMP
        WHERE id = $26 RETURNING *;
      `;
      values.push(id);
    } else {
      // INSERT new offer
      sql = `
        INSERT INTO offers (
          thumbnail_url, offer_title, short_description, expiry_date, start_date,
          offer_code, description, how_to_redeem, terms_and_conditions, offer_type,
          is_active, is_featured, category, tags, sponsor_name, sponsor_logo_url,
          sponsor_website, background_color, text_color, priority, max_redemptions,
          redemption_limit_per_user, external_link, slug, seo
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25
        ) RETURNING *;
      `;
    }

    const result = await query(sql, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[POST /api/admin/offers]', error);
    // Add specific duplicate key catch for the 'slug' field
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Slug must be unique. An offer with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Request failed' }, { status: 500 });
  }
}

// ─── DELETE: Remove an offer ───────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await query(`DELETE FROM offers WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/offers]', error);
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}