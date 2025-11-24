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
    const { parentId, type, targetId, order, isActive, showInHeader, showInFooter, az, en } = body;

    const menu = await prisma.menu.create({
      data: {
        parentId: parentId || null,
        type: type || 'custom',
        targetId: targetId || null,
        order: order || 0,
        isActive: isActive !== false,
        showInHeader: showInHeader !== false,
        showInFooter: showInFooter === true,
        translations: {
          create: [
            { locale: 'az', title: az.title, url: az.url || null },
            { locale: 'en', title: en.title, url: en.url || null },
          ],
        },
      },
    });

    return NextResponse.json(menu);
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

    const menus = await prisma.menu.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(menus);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

