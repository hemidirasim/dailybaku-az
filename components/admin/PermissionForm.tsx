'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const permissionSchema = z.object({
  key: z.string().min(1, 'Açar tələb olunur'),
  name: z.string().min(1, 'Ad tələb olunur'),
  category: z.string().min(1, 'Kateqoriya tələb olunur'),
  description: z.string().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permission?: {
    id: string;
    key: string;
    name: string;
    category: string;
    description: string | null;
  };
}

const CATEGORIES = [
  { value: 'articles', label: 'Xəbərlər' },
  { value: 'categories', label: 'Kateqoriyalar' },
  { value: 'menus', label: 'Menü' },
  { value: 'pages', label: 'Səhifələr' },
  { value: 'users', label: 'İstifadəçilər' },
  { value: 'roles', label: 'Rollar' },
  { value: 'permissions', label: 'İcazələr' },
  { value: 'media', label: 'Media' },
  { value: 'settings', label: 'Parametrlər' },
  { value: 'other', label: 'Digər' },
];

export default function PermissionForm({ permission }: PermissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: permission
      ? {
          key: permission.key,
          name: permission.name,
          category: permission.category,
          description: permission.description || '',
        }
      : {
          key: '',
          name: '',
          category: '',
          description: '',
        },
  });

  const onSubmit = async (data: PermissionFormData) => {
    setLoading(true);
    try {
      const url = permission
        ? `/api/admin/permissions/${permission.id}`
        : '/api/admin/permissions';
      const method = permission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Xəta baş verdi');
      }

      toast.success(permission ? 'İcazə yeniləndi' : 'İcazə yaradıldı');
      router.push('/dashboard/permissions');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>İcazə Məlumatları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="key">Açar *</Label>
            <Input
              id="key"
              {...register('key')}
              placeholder="articles.create"
              disabled={!!permission}
            />
            {errors.key && (
              <p className="text-sm text-red-500 mt-1">{errors.key.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Unikal açar (məsələn: articles.create, categories.edit)
            </p>
          </div>

          <div>
            <Label htmlFor="name">Ad *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Xəbər yaratma"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Kateqoriya *</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya seçin" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Təsvir</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="İcazə haqqında qısa təsvir"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : permission ? 'Yenilə' : 'Yarat'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
