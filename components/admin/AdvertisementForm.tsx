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

const advertisementSchema = z.object({
  type: z.enum(['image', 'html']),
  imageUrl: z.string().optional().nullable(),
  htmlCode: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  position: z.string().min(1, 'Pozisiya tələb olunur'),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

type AdvertisementFormData = z.infer<typeof advertisementSchema>;

interface AdvertisementFormProps {
  advertisement?: {
    id: string;
    type: string;
    imageUrl: string | null;
    htmlCode: string | null;
    linkUrl: string | null;
    position: string;
    order: number;
    isActive: boolean;
  };
}

const POSITIONS = [
  { value: 'header', label: 'Header (Başlıq)' },
  { value: 'sidebar', label: 'Sidebar (Yan panel)' },
  { value: 'footer', label: 'Footer (Alt)' },
  { value: 'content-top', label: 'Məzmun üstü' },
  { value: 'content-bottom', label: 'Məzmun altı' },
  { value: 'article-top', label: 'Məqalə üstü' },
  { value: 'article-bottom', label: 'Məqalə altı' },
];

export default function AdvertisementForm({ advertisement }: AdvertisementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(advertisement?.imageUrl || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdvertisementFormData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: advertisement
      ? {
          type: advertisement.type as 'image' | 'html',
          imageUrl: advertisement.imageUrl,
          htmlCode: advertisement.htmlCode,
          linkUrl: advertisement.linkUrl,
          position: advertisement.position,
          order: advertisement.order,
          isActive: advertisement.isActive,
        }
      : {
          type: 'image',
          imageUrl: null,
          htmlCode: null,
          linkUrl: null,
          position: 'sidebar',
          order: 0,
          isActive: true,
        },
  });

  const adType = watch('type');

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
      setImageUrl(data.url);
      setValue('imageUrl', data.url);
      toast.success('Şəkil yükləndi');
    } catch (error) {
      toast.error('Şəkil yüklənmədi');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AdvertisementFormData) => {
    setLoading(true);
    try {
      const url = advertisement
        ? `/api/admin/advertisements/${advertisement.id}`
        : '/api/admin/advertisements';
      const method = advertisement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success(advertisement ? 'Reklam yeniləndi' : 'Reklam yaradıldı');
      router.push('/dashboard/advertisements');
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
            <Label htmlFor="type">Reklam Tipi</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as 'image' | 'html')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tip seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Şəkil</SelectItem>
                <SelectItem value="html">HTML Kod</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="position">Pozisiya</Label>
            <Select
              value={watch('position')}
              onValueChange={(value) => setValue('position', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pozisiya seçin" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
            )}
          </div>

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

      {adType === 'image' && (
        <Card>
          <CardHeader>
            <CardTitle>Şəkil Reklamı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkUrl">Link URL (Şəkilə klikləndikdə)</Label>
              <Input
                id="linkUrl"
                {...register('linkUrl')}
                placeholder="https://example.com"
              />
            </div>

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

            {imageUrl && (
              <div className="relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={imageUrl}
                    alt="Advertisement"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setValue('imageUrl', null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {adType === 'html' && (
        <Card>
          <CardHeader>
            <CardTitle>HTML Reklamı</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="htmlCode">HTML Kod</Label>
              <Textarea
                id="htmlCode"
                {...register('htmlCode')}
                placeholder="<div>Reklam HTML kodu</div>"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : advertisement ? 'Yenilə' : 'Yarat'}
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

