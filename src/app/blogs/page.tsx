// app/journal/page.tsx
import { query } from '@/lib/database/db';
import { getPageMetadata } from '@/lib/database/db'; // Add this import!
import JournalClient from './JournalClient';

export const revalidate = 60; // Revalidate cache every 60 seconds

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Pass the exact slug you used in your admin panel for this page
  return await getPageMetadata('/blogs'); 
}

// 2. Your existing server component logic
export default async function JournalPage() {
    // Fetch only published blog posts, ordered by newest first
    const { rows } = await query(`
        SELECT * FROM blog_posts 
        WHERE published = true 
        ORDER BY published_at DESC
    `, []);

    // Map database snake_case to frontend camelCase
    const posts = rows.map((row: any) => ({
        _id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        coverImage: row.cover_image, // Make sure your DB column matches this!
        author: row.author,
        tags: row.tags || [],
        publishedAt: row.published_at,
        createdAt: row.created_at,
    }));

    return (
        <JournalClient initialPosts={posts} />
    );
}