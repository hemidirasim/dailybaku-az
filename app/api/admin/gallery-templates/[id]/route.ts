import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const template = await prisma.galleryTemplate.findUnique({
      where: { id },
      include: {
        translations: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
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
    const { slug, type, columns, settings, isActive, az, en, images } = body;
    const { id } = await params;

    // Delete existing translations and images
    await Promise.all([
      prisma.galleryTemplateTranslation.deleteMany({
        where: { galleryTemplateId: id },
      }),
      prisma.galleryTemplateImage.deleteMany({
        where: { galleryTemplateId: id },
      }),
    ]);

    // Update template and create new translations and images
    const template = await prisma.galleryTemplate.update({
      where: { id },
      data: {
        slug,
        type: type || 'grid',
        columns: columns || 3,
        settings: settings || null,
        isActive: isActive !== false,
        translations: {
          create: [
            { locale: 'az', name: az.name, description: az.description || null },
            { locale: 'en', name: en.name || az.name, description: en.description || null },
          ],
        },
        images: {
          create: images?.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || null,
            caption: img.caption || null,
            order: img.order !== undefined ? img.order : index,
          })) || [],
        },
      },
      include: {
        translations: true,
        images: true,
      },
    });

    return NextResponse.json(template);
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
    await prisma.galleryTemplate.delete({
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

