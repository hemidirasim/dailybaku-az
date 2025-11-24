import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const { parentId, type, targetId, order, isActive, showInHeader, showInFooter, az, en } = body;
    const { id } = await params;

    // Delete existing translations
    await prisma.menuTranslation.deleteMany({
      where: { menuId: id },
    });

    // Update menu and create new translations
    const menu = await prisma.menu.update({
      where: { id },
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
    await prisma.menu.delete({
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

