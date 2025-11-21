'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const tagSchema = z.object({
  slug: z.string().min(1, 'Slug tələb olunur'),
  az: z.object({
    name: z.string().min(1, 'Ad (AZ) tələb olunur'),
  }),
  en: z.object({
    name: z.string().min(1, 'Ad (EN) tələb olunur'),
  }),
});

type TagFormData = z.infer<typeof tagSchema>;

interface TagFormProps {
  tag?: {
    id: string;
    slug: string;
    translations: Array<{
      locale: string;
      name: string;
    }>;
  };
}

// Slug oluşturma fonksiyonu
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function TagForm({ tag }: TagFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: tag
      ? {
          slug: tag.slug,
          az: {
            name: tag.translations.find((t) => t.locale === 'az')?.name || '',
          },
          en: {
            name: tag.translations.find((t) => t.locale === 'en')?.name || '',
          },
        }
      : {
          slug: '',
          az: { name: '' },
          en: { name: '' },
        },
  });

  // AZ adı değiştiğinde slug'ı otomatik oluştur
  const azName = watch('az.name');
  useEffect(() => {
    if (!tag && azName) {
      const autoSlug = generateSlug(azName);
      setValue('slug', autoSlug);
    }
  }, [azName, tag, setValue]);

  const onSubmit = async (data: TagFormData) => {
    setLoading(true);
    try {
      const url = tag ? `/api/admin/tags/${tag.id}` : '/api/admin/tags';
      const method = tag ? 'PUT' : 'POST';

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

      toast.success(tag ? 'Tag yeniləndi' : 'Tag yaradıldı');
      router.push('/admin/tags');
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
                  placeholder="Tag adı"
                />
                {errors.az?.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.az.name.message}</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="en-name">Ad (EN)</Label>
                <Input
                  id="en-name"
                  {...register('en.name')}
                  placeholder="Tag name"
                />
                {errors.en?.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.en.name.message}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : tag ? 'Yenilə' : 'Yarat'}
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

