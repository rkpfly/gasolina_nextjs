import { NextResponse } from 'next/server';
import { createSection, getSectionsByPageId, pool } from '@/lib/database/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page_id = searchParams.get('page_id');

    if (page_id) {
      // Use your existing db function if filtering by a specific page
      const sections = await getSectionsByPageId(parseInt(page_id));
      return NextResponse.json(sections);
    } else {
      // Use the pool to query
      const result = await pool.query(`
        SELECT id, page_id, section_id, type, title, content, metadata, display_order, is_active, created_at, updated_at
        FROM sections
        ORDER BY page_id ASC, display_order ASC
      `);
      
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error("GET Sections Error:", error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract the specific arguments required by your createSection function
    const { page_id, section_id, type, ...restData } = body;

    // Safely parse metadata if it comes in as a string from the frontend
    if (typeof restData.metadata === 'string' && restData.metadata.trim() !== '') {
      try {
        restData.metadata = JSON.parse(restData.metadata);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid metadata JSON format' }, { status: 400 });
      }
    } else if (!restData.metadata) {
      restData.metadata = {};
    }

    const newSection = await createSection(
      parseInt(page_id), 
      section_id, 
      type, 
      restData
    );

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error("POST Section Error:", error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}