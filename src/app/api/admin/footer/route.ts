import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/database/db'; // Update to your DB utility path

// GET: Fetch all initial data for the admin footer page
export async function GET() {
  try {
    // 1. Fetch Contact Info (First row)
    const contactRes = await query(`SELECT * FROM "FooterContact" ORDER BY id ASC LIMIT 1`, []);
    const contact = contactRes.rows[0] || null;

    // 2. Fetch Territories
    const territoriesRes = await query(`SELECT * FROM "FooterTerritories" ORDER BY sort_order ASC, id ASC`, []);
    const territories = territoriesRes.rows;

    // 3. Fetch Legal Pages (Exclude 'content' to keep payload light on initial load)
    const legalRes = await query(`SELECT id, slug, label, href, is_active, image_url FROM "FooterLegal" ORDER BY id ASC`, []);
    const legalPages = legalRes.rows;

    // 4. Fetch Socials
    const socialsRes = await query(`SELECT * FROM "FooterSocials" ORDER BY sort_order ASC, id ASC`, []);
    const socials = socialsRes.rows;

    return NextResponse.json({
      contact,
      territories,
      legalPages,
      socials
    });
  } catch (error) {
    console.error('[GET /api/admin/footer]', error);
    return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
  }
}

// PATCH: Handle saving updates for any section
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, ...data } = body;

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    // Footer renders in the root layout, so purge the whole layout's cache
    // to surface this edit on the next request.
    revalidatePath('/', 'layout');

    if (section === 'contact') {
      const sql = `
        UPDATE "FooterContact" 
        SET phone1 = $1, phone2 = $2, email = $3, copy_year = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 RETURNING *
      `;
      const values = [data.phone1, data.phone2, data.email, data.copy_year, data.is_active, data.id];
      const result = await query(sql, values);
      return NextResponse.json(result.rows[0]);
    }

    if (section === 'territory') {
      const sql = `
        UPDATE "FooterTerritories" 
        SET city = $1, href = $2, sort_order = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 RETURNING *
      `;
      const values = [data.city, data.href, data.sort_order, data.is_active, data.id];
      const result = await query(sql, values);
      return NextResponse.json(result.rows[0]);
    }

    if (section === 'legal') {
      // Includes the TipTap HTML 'content'
      const sql = `
        UPDATE "FooterLegal" 
        SET label = $1, href = $2, content = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP, image_url = $6
        WHERE id = $5 RETURNING *
      `;
      const values = [data.label, data.href, data.content, data.is_active, data.id, data.image_url];
      const result = await query(sql, values);

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json(
          { error: "Footer item not found" }, 
          { status: 404 }
        );
      }


      return NextResponse.json(result.rows[0]);
    }

    if (section === 'social') {
      const sql = `
        UPDATE "FooterSocials"
        SET href = $1, is_active = $2, icon_class = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 RETURNING *
      `;
      const values = [data.href, data.is_active, data.icon_class, data.id];
      const result = await query(sql, values);
      return NextResponse.json(result.rows[0]);
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });

  } catch (error) {
    console.error('[PATCH /api/admin/footer]', error);
    return NextResponse.json({ error: 'Failed to update footer data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Footer renders in the root layout, so purge the whole layout's cache
    // to surface this new entry on the next request.
    revalidatePath('/', 'layout');

    if (data.section === 'legal') {
      const sql = `
        INSERT INTO "FooterLegal" (slug, label, href, content, is_active, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      const values = [data.slug, data.label, data.href, data.content, data.is_active, data.image_url];
      
      // Execute your query here (adjust based on how you call your DB)
      const result = await query(sql, values);

      return NextResponse.json({ success: true, id: result.rows[0].id });
    }

    if (data.section === 'social') {
      const sql = `
        INSERT INTO "FooterSocials" (platform, label, href, icon_class, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [
        data.platform,
        data.label,
        data.href,
        data.icon_class,
        data.is_active ?? true,
        data.sort_order ?? 0,
      ];

      const result = await query(sql, values);

      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { section, id } = await req.json();

    if (!section || !id) {
      return NextResponse.json({ error: 'Section and id are required' }, { status: 400 });
    }

    // Footer renders in the root layout, so purge the whole layout's cache.
    revalidatePath('/', 'layout');

    if (section === 'social') {
      await query(`DELETE FROM "FooterSocials" WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error) {
    console.error('[DELETE /api/admin/footer]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}