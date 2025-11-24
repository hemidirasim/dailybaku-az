import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { field, value } = body; // field: 'featured', 'agenda', or 'status', value: boolean (for featured/agenda) or string (for status)
    const { id } = await params;

    if (field !== 'featured' && field !== 'agenda' && field !== 'status') {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    // Check if article exists
    const existing = await prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Update only the specified field
    let updateData: { featured?: boolean; agenda?: boolean; status?: string; publishedAt?: Date | null } = {};
    if (field === 'featured') {
      updateData.featured = Boolean(value);
    } else if (field === 'agenda') {
      updateData.agenda = Boolean(value);
    } else if (field === 'status') {
      // Accept status value from request (can be 'published' or 'draft')
      const newStatus = (value === 'published' || value === 'draft') ? value : (existing.status === 'published' ? 'draft' : 'published');
      updateData.status = newStatus;
      // If publishing, set publishedAt to now if it's null
      if (newStatus === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
    });

    // Return only the updated fields
    return NextResponse.json({
      id: article.id,
      featured: article.featured,
      agenda: article.agenda,
      status: article.status,
    });
  } catch (error: any) {
    console.error('Toggle error:', error);
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi', details: error.stack },
      { status: 500 }
    );
  }
}

