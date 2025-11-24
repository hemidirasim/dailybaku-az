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
    const { name, description, permissionIds } = body;
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rol tapılmadı' }, { status: 404 });
    }

    // Delete existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Update role and create new permissions
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description: description || null,
        rolePermissions: {
          create: permissionIds?.map((permissionId: string) => ({
            permissionId,
          })) || [],
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRole);
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

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rol tapılmadı' }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json(
        { error: 'Sistem rolları silinə bilməz' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
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

