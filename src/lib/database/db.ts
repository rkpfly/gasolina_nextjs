// lib/db.ts
import { Metadata } from 'next';
import { Pool } from 'pg';
import 'server-only';
import { PAGE_MAP, PageSlug } from '../config/page-map';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Keep this if your VPS Postgres enforces SSL
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

/**
 * Database Operations for Admin Content Management
 * All queries use standard Node 'pg' pool
 */

// ============================================
// PAGES
// ============================================

export async function getPages() {
  const result = await query(`
    SELECT id, slug, title, description, created_at, updated_at
    FROM pages
    ORDER BY title ASC
  `);
  return result.rows;
}

export async function getPageBySlug(slug: string) {
  const result = await query(`
    SELECT id, slug, title, description, created_at, updated_at
    FROM pages
    WHERE slug = $1
  `, [slug]);
  return result.rows[0];
}

// ============================================
// SECTIONS
// ============================================

export async function getSectionsByPageId(pageId: number) {
  const result = await query(`
    SELECT id, page_id, section_id, type, title, content, metadata, display_order, is_active, created_at, updated_at
    FROM sections
    WHERE page_id = $1 AND is_active = true
    ORDER BY display_order ASC
  `, [pageId]);
  return result.rows;
}

export async function getSectionById(sectionId: number) {
  const result = await query(`
    SELECT id, page_id, section_id, type, title, content, metadata, display_order, is_active, created_at, updated_at
    FROM sections
    WHERE id = $1
  `, [sectionId]);
  return result.rows[0];
}

export async function createSection(pageId: number, sectionId: string, type: string, data: any) {
  const result = await query(`
    INSERT INTO sections (page_id, section_id, type, title, content, metadata, display_order)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
    RETURNING id, page_id, section_id, type, title, content, metadata, display_order, is_active, created_at, updated_at
  `, [
    pageId, 
    sectionId, 
    type, 
    data.title || null, 
    data.content || null, 
    JSON.stringify(data.metadata || {}), 
    data.display_order || 0
  ]);
  return result.rows[0];
}

export async function updateSection(sectionId: number, data: any) {
  const result = await query(`
    UPDATE sections
    SET 
      title = COALESCE($1, title),
      content = COALESCE($2, content),
      metadata = COALESCE($3::jsonb, metadata),
      display_order = COALESCE($4, display_order),
      is_active = COALESCE($5, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, page_id, section_id, type, title, content, metadata, display_order, is_active, created_at, updated_at
  `, [
    data.title || null,
    data.content || null,
    data.metadata ? JSON.stringify(data.metadata) : null,
    data.display_order !== undefined ? data.display_order : null,
    data.is_active !== undefined ? data.is_active : null,
    sectionId
  ]);
  return result.rows[0];
}

export async function deleteSection(sectionId: number) {
  await query(`DELETE FROM sections WHERE id = $1`, [sectionId]);
}

// ============================================
// VIDEOS
// ============================================

export async function getVideosBySection(sectionId: number) {
  const result = await query(`
    SELECT id, section_id, title, video_url, thumbnail_url, description, duration, display_order, created_at, updated_at
    FROM videos
    WHERE section_id = $1
    ORDER BY display_order ASC
  `, [sectionId]);
  return result.rows;
}

export async function createVideo(sectionId: number, data: any) {
  const result = await query(`
    INSERT INTO videos (section_id, title, video_url, thumbnail_url, description, duration, display_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, section_id, title, video_url, thumbnail_url, description, duration, display_order, created_at, updated_at
  `, [
    sectionId, 
    data.title, 
    data.video_url, 
    data.thumbnail_url || null, 
    data.description || null, 
    data.duration || null, 
    data.display_order || 0
  ]);
  return result.rows[0];
}

export async function updateVideo(videoId: number, data: any) {
  const result = await query(`
    UPDATE videos
    SET 
      title = COALESCE($1, title),
      video_url = COALESCE($2, video_url),
      thumbnail_url = COALESCE($3, thumbnail_url),
      description = COALESCE($4, description),
      duration = COALESCE($5, duration),
      display_order = COALESCE($6, display_order),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING id, section_id, title, video_url, thumbnail_url, description, duration, display_order, created_at, updated_at
  `, [
    data.title || null,
    data.video_url || null,
    data.thumbnail_url || null,
    data.description || null,
    data.duration || null,
    data.display_order !== undefined ? data.display_order : null,
    videoId
  ]);
  return result.rows[0];
}

export async function deleteVideo(videoId: number) {
  await query(`DELETE FROM videos WHERE id = $1`, [videoId]);
}

// ============================================
// IMAGES
// ============================================

export async function getImagesBySection(sectionId: number) {
  const result = await query(`
    SELECT id, section_id, title, image_url, alt_text, caption, display_order, created_at, updated_at
    FROM images
    WHERE section_id = $1
    ORDER BY display_order ASC
  `, [sectionId]);
  return result.rows;
}

export async function createImage(sectionId: number, data: any) {
  const result = await query(`
    INSERT INTO images (section_id, title, image_url, alt_text, caption, display_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, section_id, title, image_url, alt_text, caption, display_order, created_at, updated_at
  `, [
    sectionId, 
    data.title || null, 
    data.image_url, 
    data.alt_text || null, 
    data.caption || null, 
    data.display_order || 0
  ]);
  return result.rows[0];
}

export async function updateImage(imageId: number, data: any) {
  const result = await query(`
    UPDATE images
    SET 
      title = COALESCE($1, title),
      image_url = COALESCE($2, image_url),
      alt_text = COALESCE($3, alt_text),
      caption = COALESCE($4, caption),
      display_order = COALESCE($5, display_order),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, section_id, title, image_url, alt_text, caption, display_order, created_at, updated_at
  `, [
    data.title || null,
    data.image_url || null,
    data.alt_text || null,
    data.caption || null,
    data.display_order !== undefined ? data.display_order : null,
    imageId
  ]);
  return result.rows[0];
}

export async function deleteImage(imageId: number) {
  await query(`DELETE FROM images WHERE id = $1`, [imageId]);
}

// ============================================
// BLOG POSTS
// ============================================

export async function getBlogPosts(published: boolean = true) {
  if (published) {
    const result = await query(`
      SELECT id, slug, title, excerpt, featured_image, author, published, created_at, updated_at, published_at 
      FROM blog_posts 
      WHERE published = true 
      ORDER BY published_at DESC
    `);
    return result.rows;
  } else {
    const result = await query(`
      SELECT id, slug, title, excerpt, featured_image, author, published, created_at, updated_at, published_at 
      FROM blog_posts 
      ORDER BY updated_at DESC
    `);
    return result.rows;
  }
}

export async function getBlogPostBySlug(slug: string) {
  const result = await query(`
    SELECT id, slug, title, excerpt, content, featured_image, author, published, created_at, updated_at, published_at
    FROM blog_posts
    WHERE slug = $1
  `, [slug]);
  return result.rows[0];
}

export async function createBlogPost(data: any) {
  try {
    const result = await query(`
      INSERT INTO blog_posts (
        slug, title, excerpt, content, featured_image, author, published, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.slug, 
      data.title, 
      data.excerpt || null, 
      data.content, 
      data.featured_image || null, 
      data.author || null, 
      data.published || false, 
      data.published ? new Date().toISOString() : null
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
}

export async function updateBlogPost(blogId: number, data: any) {
  try {
    const result = await query(`
      UPDATE blog_posts
      SET 
        slug = CASE WHEN $1::boolean THEN $2 ELSE slug END,
        title = CASE WHEN $3::boolean THEN $4 ELSE title END,
        excerpt = CASE WHEN $5::boolean THEN $6 ELSE excerpt END,
        content = CASE WHEN $7::boolean THEN $8 ELSE content END,
        published = CASE WHEN $9::boolean THEN $10::boolean ELSE published END,
        published_at = CASE 
          WHEN $11::boolean = true AND published_at IS NULL THEN CURRENT_TIMESTAMP 
          ELSE published_at 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      data.slug !== undefined, data.slug,
      data.title !== undefined, data.title,
      data.excerpt !== undefined, data.excerpt,
      data.content !== undefined, data.content,
      data.published !== undefined, data.published,
      data.published === true,
      blogId
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Database Update Error:", error);
    throw new Error(`Failed to update blog post ${blogId}`);
  }
}

export async function deleteBlogPost(blogId: number) {
  await query(`DELETE FROM blog_posts WHERE id = $1`, [blogId]);
}

// ============================================
// SETTINGS
// ============================================

export async function getSetting(key: string) {
  const result = await query(`
    SELECT id, key, value, updated_at FROM settings WHERE key = $1
  `, [key]);
  return result.rows[0];
}

export async function getAllSettings() {
  const result = await query(`
    SELECT id, key, value, updated_at FROM settings
  `);
  return result.rows;
}

export async function setSetting(key: string, value: string) {
  const result = await query(`
    INSERT INTO settings (key, value) VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
    RETURNING id, key, value, updated_at
  `, [key, value]);
  return result.rows[0];
}

// ============================================
// SEO PAGES
// ============================================

export async function getSeoPages() {
  const result = await query(`
    SELECT * FROM seo_pages 
    ORDER BY created_at DESC
  `);
  return result.rows;
}

export async function getSeoPageBySlug(slug: string) {
  const result = await query(`
    SELECT * FROM seo_pages 
    WHERE slug = $1
  `, [slug]);
  return result.rows[0];
}

export async function getPageMetadata(slug: string): Promise<Metadata> {
  const seoData = await getSeoPageBySlug(slug);

  if (!seoData) {
    return { 
      title: "Dami Club | Elevate Your Nightlife Experience",
      description: "Curating Premium Bollywood Experiences Worldwide.",
     };
  }

  // Parse the config JSON (handles cases where it might be null or stringified)
  const config = typeof seoData.config === 'string' ? JSON.parse(seoData.config) : (seoData.config || {});

  return {
    title: seoData.title,
    description: seoData.description,
    alternates: { canonical: seoData.canonical_url },
    robots: seoData.robots,
    openGraph: {
      title: config.fallback_og_title ? seoData.title : seoData.og_title,
      description: config.fallback_og_desc ? seoData.description : seoData.og_description,
      images: seoData.og_image ? [{ url: seoData.og_image, alt: seoData.og_image_alt }] : undefined,
    },
    twitter: {
      card: seoData.twitter_card || 'summary_large_image',
      title: config.fallback_twitter_title ? seoData.title : seoData.twitter_title,
      description: config.fallback_twitter_desc ? seoData.description : seoData.twitter_description,
      images: seoData.twitter_image ? [seoData.twitter_image] : undefined,
    },
  };
}

export async function createSeoPage(data: any) {
  const result = await query(`
    INSERT INTO seo_pages (
      slug, title, description, 
      og_title, og_description, og_image, og_image_alt, 
      twitter_card, twitter_title, twitter_description, twitter_image, 
      canonical_url, robots, schema_json, config
    )
    VALUES (
      $1, $2, $3, 
      $4, $5, $6, $7, 
      $8, $9, $10, $11, 
      $12, $13, $14::jsonb, $15::jsonb
    )
    RETURNING *
  `, [
    data.slug, data.title || null, data.description || null, 
    data.og_title || null, data.og_description || null, data.og_image || null, data.og_image_alt || null, 
    data.twitter_card || 'summary_large_image', data.twitter_title || null, data.twitter_description || null, data.twitter_image || null, 
    data.canonical_url || null, data.robots || 'index, follow', 
    data.schema_json ? JSON.stringify(data.schema_json) : null,
    data.config ? JSON.stringify(data.config) : '{}'
  ]);
  return result.rows[0];
}

export async function updateSeoPage(id: number, data: any) {
  const result = await query(`
    UPDATE seo_pages
    SET 
      slug = COALESCE($1, slug),
      title = COALESCE($2, title),
      description = COALESCE($3, description),
      og_title = COALESCE($4, og_title),
      og_description = COALESCE($5, og_description),
      og_image = COALESCE($6, og_image),
      og_image_alt = COALESCE($7, og_image_alt),
      twitter_card = COALESCE($8, twitter_card),
      twitter_title = COALESCE($9, twitter_title),
      twitter_description = COALESCE($10, twitter_description),
      twitter_image = COALESCE($11, twitter_image),
      canonical_url = COALESCE($12, canonical_url),
      robots = COALESCE($13, robots),
      schema_json = COALESCE($14::jsonb, schema_json),
      config = COALESCE($15::jsonb, config),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $16
    RETURNING *
  `, [
    data.slug || null,
    data.title || null,
    data.description || null,
    data.og_title || null,
    data.og_description || null,
    data.og_image || null,
    data.og_image_alt || null,
    data.twitter_card || null,
    data.twitter_title || null,
    data.twitter_description || null,
    data.twitter_image || null,
    data.canonical_url || null,
    data.robots || null,
    data.schema_json ? JSON.stringify(data.schema_json) : null,
    data.config ? JSON.stringify(data.config) : null,
    id
  ]);
  return result.rows[0];
}

export async function deleteSeoPage(id: number) {
  await query(`DELETE FROM seo_pages WHERE id = $1`, [id]);
}

export async function getSectionsForPage(slug: string) {
  const pageId = PAGE_MAP[slug as PageSlug];

  if (!pageId) {
    console.warn(`No page ID mapped for slug: ${slug}`);
    return [];
  }

  return await getSectionsByPageId(pageId);
}

export async function getOfferBySlug(slug: string) {
  const result = await query(`
    SELECT 
      id, slug, offer_title, short_description, thumbnail_url, 
      category, expiry_date, description, how_to_redeem, 
      terms_and_conditions, offer_code, offer_type, seo
    FROM offers
    WHERE slug = $1
  `, [slug]);
  return result.rows[0];
}

// ============================================
// THEMES
// ============================================

export async function getThemes() {
  const result = await query(`SELECT * FROM themes ORDER BY created_at DESC`);
  return result.rows;
}

export async function getThemeById(id: string) {
  const result = await query(`SELECT * FROM themes WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function createTheme(data: any) {
  const result = await query(`
    INSERT INTO themes (id, slug, title, short_description, description, detailed_content, hero_image, thumbnail_url, gallery, template_name, seo_title, seo_description, seo_keywords, created_at)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::jsonb, $6, $7, $8::jsonb, $9, $10, $11, $12, CURRENT_TIMESTAMP)
    RETURNING *
  `, [
    data.slug, data.title, data.short_description, data.description, JSON.stringify(data.detailed_content || {}),
    data.hero_image, data.thumbnail_url, JSON.stringify(data.gallery || []), data.template_name,
    data.seo_title, data.seo_description, data.seo_keywords
  ]);
  return result.rows[0];
}

export async function updateTheme(id: string, data: any) {
  const result = await query(`
    UPDATE themes
    SET slug = $1, title = $2, short_description = $3, description = $4, detailed_content = $5::jsonb, 
        hero_image = $6, thumbnail_url = $7, gallery = $8::jsonb, template_name = $9, 
        seo_title = $10, seo_description = $11, seo_keywords = $12
    WHERE id = $13
    RETURNING *
  `, [
    data.slug, data.title, data.short_description, data.description, JSON.stringify(data.detailed_content),
    data.hero_image, data.thumbnail_url, JSON.stringify(data.gallery), data.template_name,
    data.seo_title, data.seo_description, data.seo_keywords, id
  ]);
  return result.rows[0];
}

export async function deleteTheme(id: string) {
  await query(`DELETE FROM themes WHERE id = $1`, [id]);
}

export async function getThemeBySlug(slug: string) {
  const result = await query(`
    SELECT id, slug, title, short_description, description, detailed_content, hero_image, thumbnail_url, template_name
    FROM themes
    WHERE slug = $1 AND is_active = true
  `, [slug]);
  
  return result.rows[0] || null;
}