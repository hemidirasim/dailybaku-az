import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, isActive, az, en } = body;

    // Slug-ları avtomatik yarat
    const azSlug = az.slug || generateSlug(az.title);
    const enSlug = en.slug || generateSlug(en.title);
    const mainSlug = slug || azSlug;

    const page = await prisma.page.create({
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

