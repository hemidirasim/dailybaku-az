'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteButtonProps {
  // Yeni prop adları
  id?: string;
  endpoint?: string;
  redirectUrl: string;
  title?: string;
  // Köhnə prop adları (backward compatibility üçün)
  itemId?: string;
  apiPath?: string;
  itemName?: string;
}

export default function DeleteButton({ 
  id, 
  endpoint, 
  redirectUrl, 
  title,
  // Köhnə prop adları
  itemId,
  apiPath,
  itemName
}: DeleteButtonProps) {
  // Backward compatibility: köhnə prop adlarını yeni adlara çevir
  const finalId = id || itemId || '';
  const finalEndpoint = endpoint || apiPath || '';
  const finalTitle = title || itemName;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!finalEndpoint) {
      toast.error('Endpoint təyin edilməyib');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(finalEndpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success('Xəbər silindi');
      setOpen(false);
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      toast.error('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xəbəri silmək istədiyinizə əminsiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            {finalTitle ? (
              <>
                <strong>"{finalTitle}"</strong> adlı xəbər silinəcək. Bu əməliyyat geri qaytarıla bilər.
              </>
            ) : (
              'Bu xəbər silinəcək. Bu əməliyyat geri qaytarıla bilər.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Ləğv et</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Silinir...' : 'Sil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

