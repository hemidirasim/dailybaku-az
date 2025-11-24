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
import dynamic from 'next/dynamic';

// Quill editor-u dinamik import ilə yüklə (SSR problemi üçün)
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // CSS-i dinamik yüklə
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
      link.rel = 'stylesheet';
      if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    }
    return RQ;
  },
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
  }
);

const pageSchema = z.object({
  slug: z.string().optional(),
  isActive: z.boolean().default(true),
  az: z.object({
    title: z.string().min(1, 'Başlıq (AZ) tələb olunur'),
    slug: z.string().optional(),
    content: z.string().optional(),
  }),
  en: z.object({
    title: z.string().min(1, 'Başlıq (EN) tələb olunur'),
    slug: z.string().optional(),
    content: z.string().optional(),
  }),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageFormProps {
  page?: {
    id: string;
    slug: string;
    isActive: boolean;
    translations: Array<{
      locale: string;
      title: string;
      slug: string;
      content: string;
    }>;
  };
}

import { generateSlug } from '@/lib/utils';

export default function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: page
      ? {
          slug: page.slug,
          isActive: page.isActive,
          az: {
            title: page.translations.find((t) => t.locale === 'az')?.title || '',
            slug: page.translations.find((t) => t.locale === 'az')?.slug || '',
            content: page.translations.find((t) => t.locale === 'az')?.content || '',
          },
          en: {
            title: page.translations.find((t) => t.locale === 'en')?.title || '',
            slug: page.translations.find((t) => t.locale === 'en')?.slug || '',
            content: page.translations.find((t) => t.locale === 'en')?.content || '',
          },
        }
      : {
          slug: '',
          isActive: true,
          az: { title: '', slug: '', content: '' },
          en: { title: '', slug: '', content: '' },
        },
  });

  // AZ başlığı değiştiğinde slug'ı otomatik oluştur
  const azTitle = watch('az.title');
  useEffect(() => {
    if (azTitle) {
      const autoSlug = generateSlug(azTitle);
      setValue('az.slug', autoSlug);
      // Ana slug-ı da yenilə
      setValue('slug', autoSlug);
    }
  }, [azTitle, setValue]);

  // EN başlığı değiştiğinde slug'ı otomatik oluştur
  const enTitle = watch('en.title');
  useEffect(() => {
    if (enTitle) {
      const autoSlug = generateSlug(enTitle);
      setValue('en.slug', autoSlug);
    }
  }, [enTitle, setValue]);


  const onSubmit = async (data: PageFormData) => {
    setLoading(true);
    try {
      const url = page ? `/api/admin/pages/${page.id}` : '/api/admin/pages';
      const method = page ? 'PUT' : 'POST';

      // Slug-ları avtomatik yarat
      const azSlug = data.az.slug || generateSlug(data.az.title);
      const enSlug = data.en.slug || generateSlug(data.en.title);
      const mainSlug = data.slug || azSlug;

      const processedData = {
        ...data,
        slug: mainSlug,
        az: {
          ...data.az,
          slug: generateSlug(azSlug),
        },
        en: {
          ...data.en,
          slug: generateSlug(enSlug),
        },
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success(page ? 'Səhifə yeniləndi' : 'Səhifə yaradıldı');
      router.push('/dashboard/pages');
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
          <CardTitle>Məzmun</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="az" className="w-full">
            <TabsList>
              <TabsTrigger value="az">Azərbaycan</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="az" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="az-title">Başlıq (AZ)</Label>
                <Input
                  id="az-title"
                  {...register('az.title')}
                  placeholder="Səhifə başlığı"
                />
                {errors.az?.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.az.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="az-content">Məzmun (AZ)</Label>
                <div className="quill-editor-wrapper" style={{ height: '400px' }}>
                  <ReactQuill
                    theme="snow"
                    value={watch('az.content') || ''}
                    onChange={(value) => setValue('az.content', value)}
                    placeholder="Səhifə məzmunu"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    className="bg-white"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="en-title">Başlıq (EN)</Label>
                <Input
                  id="en-title"
                  {...register('en.title')}
                  placeholder="Page title"
                />
                {errors.en?.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.en.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="en-content">Məzmun (EN)</Label>
                <div className="quill-editor-wrapper" style={{ height: '400px' }}>
                  <ReactQuill
                    theme="snow"
                    value={watch('en.content') || ''}
                    onChange={(value) => setValue('en.content', value)}
                    placeholder="Page content"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    className="bg-white"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : page ? 'Yenilə' : 'Yarat'}
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

