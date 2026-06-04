// app/gallery/page.tsx
import { query } from '@/lib/database/db';
import { getPageMetadata } from '@/lib/database/db'; // Added SEO import
import GalleryClient from './GalleryClient';
import { GalleryPost } from '../api/admin/gallery/types';
import { MediaAsset } from '@/lib/media';

export const revalidate = 60; 

// 1. Generate Metadata securely on the server
export async function generateMetadata() {
  // Pass the exact slug for your gallery page
  return await getPageMetadata('/gallery');
}

// 2. Render the Server Component and fetch data
export default async function GalleryPage() {
    // 1. Fetch Dynamic Gallery Posts (The Grid)
    const postsQuery = query('SELECT * FROM gallery_posts ORDER BY display_order ASC', []);
    
    // 2. Fetch Fixed Media Slots (Hero & Aftermovie)
    const slotsQuery = query("SELECT * FROM \"MediaAssets\" WHERE page_route = '/gallery'", []);

    // Run both queries simultaneously for maximum performance
    const [{ rows: postRows }, { rows: slotRows }] = await Promise.all([postsQuery, slotsQuery]);

    // Map the media slots to a dictionary object: { "hero-video": { ...assetData } }
    const mediaSlots = Object.fromEntries(
        (slotRows as MediaAsset[]).map((asset) => [asset.html_id, asset])
    );

    return (
        <GalleryClient 
            initialPosts={postRows as GalleryPost[]} 
            mediaSlots={mediaSlots} 
        />
    );
}