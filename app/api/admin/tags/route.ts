import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tags);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

// POST - Create a new tag
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, az, en } = body;

    const tag = await prisma.tag.create({
      data: {
        slug,
        translations: {
          create: [
            { locale: 'az', name: az.name },
            { locale: 'en', name: en.name },
          ],
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

