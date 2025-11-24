import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Səhifə tapılmadı' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, isActive, az, en } = body;
    const { id } = await params;

    // Slug-ları avtomatik yarat
    const azSlug = az.slug || generateSlug(az.title);
    const enSlug = en.slug || generateSlug(en.title);
    const mainSlug = slug || azSlug;

    // Delete existing translations
    await prisma.pageTranslation.deleteMany({
      where: { pageId: id },
    });

    // Update page and create new translations
    const page = await prisma.page.update({
      where: { id },
      data: {
        slug: mainSlug,
        isActive: isActive !== false,
        translations: {
          create: [
            {
              locale: 'az',
              title: az.title,
              slug: azSlug,
              content: az.content || '',
            },
            {
              locale: 'en',
              title: en.title,
              slug: enSlug,
              content: en.content || '',
            },
          ],
        },
      },
    });

    return NextResponse.json(page);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

