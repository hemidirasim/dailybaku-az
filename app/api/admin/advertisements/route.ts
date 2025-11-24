import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, imageUrl, htmlCode, linkUrl, position, order, isActive } = body;

    const advertisement = await prisma.advertisement.create({
      data: {
        type: type || 'image',
        imageUrl: type === 'image' ? imageUrl : null,
        htmlCode: type === 'html' ? htmlCode : null,
        linkUrl: linkUrl || null,
        position,
        order: order || 0,
        isActive: isActive !== false,
        translations: {
          create: [
            { locale: 'az', title: null },
            { locale: 'en', title: null },
          ],
        },
      },
    });

    return NextResponse.json(advertisement);
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

    const advertisements = await prisma.advertisement.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(advertisements);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

