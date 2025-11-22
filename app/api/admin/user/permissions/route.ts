import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Admin role always has all permissions
    if (userRole === 'admin') {
      const allPermissions = await prisma.permission.findMany({
        select: { key: true },
      });
      return NextResponse.json({
        permissions: allPermissions.map(p => p.key),
      });
    }

    // Get user's role from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ permissions: [] });
    }

    // If user has role string, find role by key
    if (user.role && user.role !== 'admin') {
      const role = await prisma.role.findFirst({
        where: { key: user.role },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (role) {
        const permissions = role.rolePermissions.map(
          (rp) => rp.permission.key
        );
        return NextResponse.json({ permissions });
      }
    }

    return NextResponse.json({ permissions: [] });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
