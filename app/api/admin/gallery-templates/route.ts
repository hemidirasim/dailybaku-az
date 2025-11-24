import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.galleryTemplate.findMany({
      include: {
        translations: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, type, columns, settings, isActive, az, en, images } = body;

    const template = await prisma.galleryTemplate.create({
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

