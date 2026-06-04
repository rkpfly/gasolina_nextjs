import { NextResponse } from 'next/server';
import { 
  getSeoPages, 
  createSeoPage, 
  updateSeoPage, 
  deleteSeoPage 
} from '@/lib/database/db';

// READ (GET)
export async function GET() {
  try {
    const pages = await getSeoPages();
    return NextResponse.json(pages);
  } catch (error: any) {
    console.error("Error fetching SEO pages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE (POST)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const newPage = await createSeoPage(data);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating SEO page:", error);
    
    // Handle unique constraint violation for the slug
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An SEO page with this slug already exists.' }, { status: 409 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE (PUT)
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID is required for updating' }, { status: 400 });
    }

    const updatedPage = await updateSeoPage(data.id, data);
    return NextResponse.json(updatedPage);
  } catch (error: any) {
    console.error("Error updating SEO page:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    await deleteSeoPage(id);
    return NextResponse.json({ success: true, message: 'SEO page deleted' });
  } catch (error: any) {
    console.error("Error deleting SEO page:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}