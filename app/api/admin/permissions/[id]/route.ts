import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { name, category, description } = body;
    const { id } = await params;

    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return NextResponse.json({ error: 'İcazə tapılmadı' }, { status: 404 });
    }

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        category,
        description: description || null,
      },
    });

    return NextResponse.json(updatedPermission);
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

    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: true,
      },
    });

    if (!permission) {
      return NextResponse.json({ error: 'İcazə tapılmadı' }, { status: 404 });
    }

    // If permission is used in roles, don't delete
    if (permission.rolePermissions.length > 0) {
      return NextResponse.json(
        { error: 'Bu icazə rollarda istifadə olunur, silinə bilməz' },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
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
