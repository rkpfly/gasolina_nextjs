import { NextResponse } from 'next/server';
import { query } from '@/lib/database/db';

// Always read live from the DB — never serve a build-time cached snapshot.
export const dynamic = 'force-dynamic';

// ─── GET: Latest published blog posts (public — used by the home teaser) ───────
export async function GET() {
  try {
    const { rows } = await query(
      `
      SELECT id, slug, title, excerpt, cover_image, author, tags, published_at, created_at
      FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT 6
    `,
      []
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[GET /api/blogs]', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}
