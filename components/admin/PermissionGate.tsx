'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
  showWhileLoading?: boolean; // If true, show children while loading (default: true)
}

export default function PermissionGate({
  children,
  permission,
  requireAdmin = false,
  fallback = null,
  showWhileLoading = true,
}: PermissionGateProps) {
  const { data: session } = useSession();
  const { hasPermission, loading } = usePermissions();

  // Memoize the permission check to avoid unnecessary re-renders
  const hasAccess = useMemo(() => {
    // If loading and showWhileLoading is true, show children
    if (loading && showWhileLoading) {
      return true;
    }

    // If still loading, return false to show fallback
    if (loading) {
      return false;
    }

    const userRole = (session?.user as any)?.role;

    // Admin always has access
    if (userRole === 'admin') {
      return true;
    }

    // If requireAdmin is true, only admin can access
    if (requireAdmin) {
      return false;
    }

    // Check permission if provided
    if (permission) {
      return hasPermission(permission);
    }

    // If no permission required, allow access
    return true;
  }, [loading, session, hasPermission, permission, requireAdmin, showWhileLoading]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
