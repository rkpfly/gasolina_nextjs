import { NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

export async function POST(req: Request) {
  try {
    const { page_slug, section_key, content, is_active } = await req.json();

    // The UPSERT query
    const result = await query(`
      INSERT INTO page_blocks (page_slug, section_key, content, is_active)
      VALUES ($1, $2, $3, COALESCE($4, true))
      ON CONFLICT (page_slug, section_key) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [page_slug, section_key, content, is_active]);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Failed to upsert page block:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}