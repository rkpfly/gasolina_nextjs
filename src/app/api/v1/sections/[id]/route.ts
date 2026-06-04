import { NextRequest, NextResponse } from 'next/server';
import { updateSection, deleteSection } from '@/lib/database/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);

    const body = await request.json();

    if (typeof body.metadata === 'string') {
      if (body.metadata.trim() !== '') {
        try {
          body.metadata = JSON.parse(body.metadata);
        } catch {
          return NextResponse.json(
            { error: 'Invalid metadata JSON format' },
            { status: 400 }
          );
        }
      } else {
        body.metadata = null;
      }
    }

    const updatedSection = await updateSection(sectionId, body);

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('PUT Section Error:', error);
    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sectionId = parseInt(id);

    await deleteSection(sectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Section Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}