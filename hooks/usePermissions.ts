'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    async function fetchPermissions() {
      // If session is not loaded yet, wait
      if (status === 'loading') {
        return;
      }

      const currentUserId = session?.user ? (session.user as any).id : undefined;

      // If user hasn't changed, don't fetch again
      if (currentUserId === previousUserIdRef.current && previousUserIdRef.current !== undefined) {
        return;
      }

      // Update previous user ID
      previousUserIdRef.current = currentUserId;

      if (!session?.user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setLoading(true);
      
      try {
        const response = await fetch('/api/admin/user/permissions', {
          signal,
        });
        
        if (signal.aborted) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        } else {
          setPermissions([]);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPermissions();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [status, session?.user?.id]); // Use session.user.id instead of session object

  const hasPermission = useCallback((permissionKey: string): boolean => {
    if (!session?.user) return false;
    
    // Admin role always has all permissions
    if ((session.user as any).role === 'admin') {
      return true;
    }

    return permissions.includes(permissionKey);
  }, [permissions, session?.user]);

  const hasAnyPermission = useCallback((permissionKeys: string[]): boolean => {
    if (!session?.user) return false;
    
    // Admin role always has all permissions
    if ((session.user as any).role === 'admin') {
      return true;
    }

    return permissionKeys.some(key => permissions.includes(key));
  }, [permissions, session?.user]);

  const hasAllPermissions = useCallback((permissionKeys: string[]): boolean => {
    if (!session?.user) return false;
    
    // Admin role always has all permissions
    if ((session.user as any).role === 'admin') {
      return true;
    }

    return permissionKeys.every(key => permissions.includes(key));
  }, [permissions, session?.user]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
