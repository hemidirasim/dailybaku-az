'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      // If session is not loaded yet, wait
      if (status === 'loading') {
        return;
      }

      if (!session?.user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const userRole = (session.user as any).role;
      
      // Admin always has all permissions (optimization)
      if (userRole === 'admin') {
        // Still fetch to populate the array, but we know admin has access
        try {
          const response = await fetch('/api/admin/user/permissions');
          if (response.ok) {
            const data = await response.json();
            setPermissions(data.permissions || []);
          } else {
            // If API fails, admin still has access (fallback)
            setPermissions([]);
          }
        } catch (error) {
          console.error('Error fetching permissions:', error);
          // Admin still has access even if API fails
          setPermissions([]);
        }
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/user/permissions');
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [session, status]);

  const hasPermission = useMemo(() => {
    return (permissionKey: string): boolean => {
      if (!session?.user) return false;
      
      // Admin role always has all permissions
      if ((session.user as any).role === 'admin') {
        return true;
      }

      return permissions.includes(permissionKey);
    };
  }, [permissions, session]);

  const hasAnyPermission = useMemo(() => {
    return (permissionKeys: string[]): boolean => {
      if (!session?.user) return false;
      
      // Admin role always has all permissions
      if ((session.user as any).role === 'admin') {
        return true;
      }

      return permissionKeys.some(key => permissions.includes(key));
    };
  }, [permissions, session]);

  const hasAllPermissions = useMemo(() => {
    return (permissionKeys: string[]): boolean => {
      if (!session?.user) return false;
      
      // Admin role always has all permissions
      if ((session.user as any).role === 'admin') {
        return true;
      }

      return permissionKeys.every(key => permissions.includes(key));
    };
  }, [permissions, session]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
