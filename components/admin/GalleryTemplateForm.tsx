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
import { generateSlug } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const galleryTemplateSchema = z.object({
  slug: z.string().min(1, 'Slug tələb olunur'),
  type: z.string().default('grid'),
  columns: z.number().default(3),
  isActive: z.boolean().default(true),
  az: z.object({
    name: z.string().min(1, 'Ad (AZ) tələb olunur'),
    description: z.string().optional(),
  }),
  en: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

type GalleryTemplateFormData = z.infer<typeof galleryTemplateSchema>;

interface GalleryTemplateFormProps {
  template?: {
    id: string;
    slug: string;
    type: string;
    columns: number;
    isActive: boolean;
    translations: Array<{
      locale: string;
      name: string;
      description?: string | null;
    }>;
    images: Array<{
      id: string;
      url: string;
      alt?: string | null;
      order: number;
    }>;
  };
}

import { generateSlug } from '@/lib/utils';

export default function GalleryTemplateForm({ template }: GalleryTemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; alt?: string; caption?: string; order: number }>>(
    template?.images.map((img) => ({
      url: img.url,
      alt: img.alt || '',
      caption: (img as any).caption || '',
      order: img.order,
    })) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GalleryTemplateFormData>({
    resolver: zodResolver(galleryTemplateSchema),
    defaultValues: template
      ? {
          slug: template.slug,
          type: template.type,
          columns: template.columns,
          isActive: template.isActive,
          az: {
            name: template.translations.find((t) => t.locale === 'az')?.name || '',
            description: template.translations.find((t) => t.locale === 'az')?.description || '',
          },
          en: {
            name: template.translations.find((t) => t.locale === 'en')?.name || '',
            description: template.translations.find((t) => t.locale === 'en')?.description || '',
          },
        }
      : {
          slug: '',
          type: 'grid',
          columns: 3,
          isActive: true,
          az: { name: '', description: '' },
          en: { name: '', description: '' },
        },
  });

  const azName = watch('az.name');

  useEffect(() => {
    if (!template && azName) {
      setValue('slug', generateSlug(azName));
    }
  }, [azName, template, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImages([...images, { url: data.url, alt: '', caption: '', order: images.length }]);
      toast.success('Şəkil yükləndi');
    } catch (error) {
      toast.error('Şəkil yüklənmədi');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: GalleryTemplateFormData) => {
    setLoading(true);
    try {
      const url = template ? `/api/admin/gallery-templates/${template.id}` : '/api/admin/gallery-templates';
      const method = template ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            caption: img.caption,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success(template ? 'Şablon yeniləndi' : 'Şablon yaradıldı');
      router.push('/dashboard/media');
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
            <Label htmlFor="type">Tip</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tip seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
                <SelectItem value="slider">Slider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="columns">Sütunlar</Label>
            <Input
              id="columns"
              type="number"
              min="1"
              max="12"
              {...register('columns', { valueAsNumber: true })}
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
          <CardTitle>Şəkillər</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Şəkil yüklə</p>
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={image.url}
                        alt={image.alt || `Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="Alt text (alt başlıq)"
                        value={image.alt}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index].alt = e.target.value;
                          setImages(newImages);
                        }}
                        className="text-xs"
                      />
                      <Textarea
                        placeholder="Caption (açıqlama)"
                        value={image.caption || ''}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[index].caption = e.target.value;
                          setImages(newImages);
                        }}
                        className="text-xs"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  placeholder="Şablon adı"
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
                  placeholder="Şablon təsviri"
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
                  placeholder="Template name"
                />
              </div>
              <div>
                <Label htmlFor="en-description">Təsvir (EN)</Label>
                <Textarea
                  id="en-description"
                  {...register('en.description')}
                  placeholder="Template description"
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : template ? 'Yenilə' : 'Yarat'}
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

