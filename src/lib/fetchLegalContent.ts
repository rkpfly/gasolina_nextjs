import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Isolate this clone to its own schema (see src/lib/database/db.ts).
  options: `-c search_path=${process.env.DB_SCHEMA || "gasolina"}`,
});

export async function getLegalContentBySlug(slug: string) {
  const { rows } = await pool.query(
    `
    SELECT id, slug, label, href, content, is_active, image_url
    FROM "FooterLegal"
    WHERE slug = $1
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}