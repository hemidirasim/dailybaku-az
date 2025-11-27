'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface ToggleSwitchProps {
  articleId: string;
  field: 'featured' | 'agenda';
  initialValue: boolean;
  onToggle?: (newValue: boolean) => void;
}

export default function ToggleSwitch({
  articleId,
  field,
  initialValue,
  onToggle,
}: ToggleSwitchProps) {
  const [checked, setChecked] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (newValue: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field,
          value: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update');
      }

      setChecked(newValue);
      if (onToggle) {
        onToggle(newValue);
      }
    } catch (error) {
      console.error('Error toggling:', error);
      // Revert on error
      setChecked(!newValue);
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




