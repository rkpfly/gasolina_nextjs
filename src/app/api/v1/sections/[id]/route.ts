import { NextResponse } from 'next/server';
import { updateSection, deleteSection } from '@/lib/database/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Safely parse metadata if it comes in as a string from the frontend
    if (typeof body.metadata === 'string') {
      if (body.metadata.trim() !== '') {
        try {
          body.metadata = JSON.parse(body.metadata);
        } catch (e) {
          return NextResponse.json({ error: 'Invalid metadata JSON format' }, { status: 400 });
        }
      } else {
        body.metadata = null;
      }
    }

    const updatedSection = await updateSection(id, body);

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error("PUT Section Error:", error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    await deleteSection(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Section Error:", error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}