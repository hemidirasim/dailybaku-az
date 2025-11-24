import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string; // Required permission key
  requireAdmin?: boolean; // If true, only admin can access
}

export default async function ProtectedRoute({
  children,
  permission,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/dashboard/login');
  }

  const userRole = (session.user as any).role;
  const userId = (session.user as any).id;

  // Admin always has access
  if (userRole === 'admin') {
    return <>{children}</>;
  }

  // If requireAdmin is true, only admin can access
  if (requireAdmin) {
    redirect('/dashboard/login');
  }

  // Check permission if provided
  if (permission) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.role) {
      redirect('/dashboard/login');
    }

    // Admin role has all permissions
    if (user.role === 'admin') {
      return <>{children}</>;
    }

    // Get role and check permissions
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

    if (!role) {
      redirect('/dashboard');
    }

    const hasPermission = role.rolePermissions.some(
      (rp) => rp.permission.key === permission
    );

    if (!hasPermission) {
      redirect('/dashboard');
    }
  }

  return <>{children}</>;
}
