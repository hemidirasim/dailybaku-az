'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface StatusToggleSwitchProps {
  articleId: string;
  initialStatus: 'published' | 'draft';
  onToggle?: (newStatus: 'published' | 'draft') => void;
}

export default function StatusToggleSwitch({
  articleId,
  initialStatus,
  onToggle,
}: StatusToggleSwitchProps) {
  const [status, setStatus] = useState<'published' | 'draft'>(initialStatus);
  const [loading, setLoading] = useState(false);
  const checked = status === 'published';

  const handleToggle = async (newChecked: boolean) => {
    const newStatus = newChecked ? 'published' : 'draft';
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: 'status',
          value: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      const data = await response.json();
      setStatus(data.status);
      if (onToggle) {
        onToggle(data.status);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      // Revert on error - keep the previous status
      // Don't update state, it will remain as it was
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={checked}
          onCheckedChange={handleToggle}
          disabled={loading}
        />
      )}
    </div>
  );
}

