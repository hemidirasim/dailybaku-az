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
    const { key, name, description, permissionIds } = body;

    if (!key || !name) {
      return NextResponse.json(
        { error: 'Rol açarı və adı tələb olunur' },
        { status: 400 }
      );
    }

    // Check if role key already exists
    const existingRole = await prisma.role.findUnique({
      where: { key },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Bu rol açarı artıq istifadə olunur' },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        key,
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

    return NextResponse.json(role);
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

    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

