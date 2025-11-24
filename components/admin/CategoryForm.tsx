'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const categorySchema = z.object({
  slug: z.string().min(1, 'Slug tələb olunur'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  az: z.object({
    name: z.string().min(1, 'Ad (AZ) tələb olunur'),
    description: z.string().optional(),
  }),
  en: z.object({
    name: z.string().min(1, 'Ad (EN) tələb olunur'),
    description: z.string().optional(),
  }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    slug: string;
    order: number;
    isActive: boolean;
    translations: Array<{
      locale: string;
      name: string;
      description?: string | null;
    }>;
  };
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          slug: category.slug,
          order: category.order,
          isActive: category.isActive,
          az: {
            name: category.translations.find((t) => t.locale === 'az')?.name || '',
            description: category.translations.find((t) => t.locale === 'az')?.description || '',
          },
          en: {
            name: category.translations.find((t) => t.locale === 'en')?.name || '',
            description: category.translations.find((t) => t.locale === 'en')?.description || '',
          },
        }
      : {
          slug: '',
          order: 0,
          isActive: true,
          az: { name: '', description: '' },
          en: { name: '', description: '' },
        },
  });

  // AZ adı değiştiğinde slug'ı otomatik oluştur
  const azName = watch('az.name');
  useEffect(() => {
    if (!category && azName) {
      const autoSlug = generateSlug(azName);
      setValue('slug', autoSlug);
    }
  }, [azName, category, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
      const method = category ? 'PUT' : 'POST';

      // Slug'ı otomatik oluştur (eğer boşsa)
      const processedData = {
        ...data,
        slug: data.slug || (data.az.name ? generateSlug(data.az.name) : ''),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success(category ? 'Bölmə yeniləndi' : 'Bölmə yaradıldı');
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      toast.error('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ümumi Məlumatlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="order">Sıra</Label>
            <Input
              id="order"
              type="number"
              {...register('order', { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Aktiv</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Çevirilər</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="az" className="w-full">
            <TabsList>
              <TabsTrigger value="az">Azərbaycan</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="az" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="az-name">Ad (AZ)</Label>
                <Input
                  id="az-name"
                  {...register('az.name')}
                  placeholder="Bölmə adı"
                />
                {errors.az?.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.az.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="az-description">Təsvir (AZ)</Label>
                <Textarea
                  id="az-description"
                  {...register('az.description')}
                  placeholder="Bölmə təsviri"
                  rows={4}
                />
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="en-name">Ad (EN)</Label>
                <Input
                  id="en-name"
                  {...register('en.name')}
                  placeholder="Category name"
                />
                {errors.en?.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.en.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="en-description">Təsvir (EN)</Label>
                <Textarea
                  id="en-description"
                  {...register('en.description')}
                  placeholder="Category description"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : category ? 'Yenilə' : 'Yarat'}
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

