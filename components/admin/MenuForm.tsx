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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const menuSchema = z.object({
  parentId: z.string().optional().nullable(),
  type: z.enum(['category', 'page', 'custom']).default('custom'),
  targetId: z.string().optional().nullable(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  showInHeader: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
  az: z.object({
    title: z.string().min(1, 'Başlıq (AZ) tələb olunur'),
    url: z.string().optional(),
  }),
  en: z.object({
    title: z.string().min(1, 'Başlıq (EN) tələb olunur'),
    url: z.string().optional(),
  }),
});

type MenuFormData = z.infer<typeof menuSchema>;

interface MenuFormProps {
  menu?: {
    id: string;
    parentId: string | null;
    type: string;
    targetId: string | null;
    order: number;
    isActive: boolean;
    showInHeader: boolean;
    showInFooter: boolean;
    translations: Array<{
      locale: string;
      title: string;
      url?: string | null;
    }>;
  };
  parentMenus?: Array<{
    id: string;
    translations: Array<{
      locale: string;
      title: string;
    }>;
  }>;
  categories?: Array<{
    id: string;
    slug: string;
    translations: Array<{
      locale: string;
      name: string;
    }>;
  }>;
  pages?: Array<{
    id: string;
    slug: string;
    translations: Array<{
      locale: string;
      title: string;
      slug: string;
    }>;
  }>;
}

export default function MenuForm({ menu, parentMenus = [], categories = [], pages = [] }: MenuFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableParents, setAvailableParents] = useState(parentMenus);
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [availablePages, setAvailablePages] = useState(pages);

  useEffect(() => {
    // Fetch parent menus if not provided
    if (parentMenus.length === 0) {
      fetch('/api/admin/menus')
        .then((res) => res.json())
        .then((data) => {
          const filtered = menu
            ? data.filter((m: any) => m.id !== menu.id)
            : data;
          setAvailableParents(filtered);
        });
    }

    // Fetch categories if not provided
    if (categories.length === 0) {
      fetch('/api/admin/categories')
        .then((res) => res.json())
        .then((data) => setAvailableCategories(data || []))
        .catch((error) => {
          console.error('Error fetching categories:', error);
          setAvailableCategories([]);
        });
    }

    // Fetch pages if not provided
    if (pages.length === 0) {
      fetch('/api/admin/pages')
        .then((res) => res.json())
        .then((data) => setAvailablePages(data || []))
        .catch((error) => {
          console.error('Error fetching pages:', error);
          setAvailablePages([]);
        });
    }
  }, [menu, parentMenus, categories, pages]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
        defaultValues: menu
      ? {
          parentId: menu.parentId || null,
          type: (menu.type as 'category' | 'page' | 'custom') || 'custom',
          targetId: menu.targetId || null,
          order: menu.order,
          isActive: menu.isActive,
          showInHeader: menu.showInHeader ?? true,
          showInFooter: menu.showInFooter ?? false,
          az: {
            title: menu.translations.find((t) => t.locale === 'az')?.title || '',
            url: menu.translations.find((t) => t.locale === 'az')?.url || '',
          },
          en: {
            title: menu.translations.find((t) => t.locale === 'en')?.title || '',
            url: menu.translations.find((t) => t.locale === 'en')?.url || '',
          },
        }
      : {
          parentId: null,
          type: 'custom' as 'category' | 'page' | 'custom',
          targetId: null,
          order: 0,
          isActive: true,
          showInHeader: true,
          showInFooter: false,
          az: { title: '', url: '' },
          en: { title: '', url: '' },
        },
  });

  const menuType = watch('type');
  const targetId = watch('targetId');
  const azTitle = watch('az.title');
  const enTitle = watch('en.title');

  // Category seçildikdə URL-i avtomatik doldur
  useEffect(() => {
    if (menuType === 'category' && targetId) {
      const selectedCategory = availableCategories.find((c) => c.id === targetId);
      if (selectedCategory) {
        const azTranslation = selectedCategory.translations.find((t) => t.locale === 'az');
        const enTranslation = selectedCategory.translations.find((t) => t.locale === 'en');
        
        // Başlığı avtomatik doldur (yalnız boşdursa)
        if (azTranslation?.name && !azTitle) {
          setValue('az.title', azTranslation.name);
        }
        if (enTranslation?.name && !enTitle) {
          setValue('en.title', enTranslation.name);
        }
        
        // URL-i avtomatik doldur
        setValue('az.url', `/az/category/${selectedCategory.slug}`);
        setValue('en.url', `/en/category/${selectedCategory.slug}`);
      }
    } else if (menuType === 'page' && targetId) {
      const selectedPage = availablePages.find((p) => p.id === targetId);
      if (selectedPage) {
        const azTranslation = selectedPage.translations.find((t) => t.locale === 'az');
        const enTranslation = selectedPage.translations.find((t) => t.locale === 'en');
        
        // Başlığı avtomatik doldur (yalnız boşdursa)
        if (azTranslation?.title && !azTitle) {
          setValue('az.title', azTranslation.title);
        }
        if (enTranslation?.title && !enTitle) {
          setValue('en.title', enTranslation.title);
        }
        
        // URL-i avtomatik doldur
        setValue('az.url', `/az/page/${azTranslation?.slug || selectedPage.slug}`);
        setValue('en.url', `/en/page/${enTranslation?.slug || selectedPage.slug}`);
      }
    }
  }, [menuType, targetId, availableCategories, availablePages, setValue, azTitle, enTitle]);

  const onSubmit = async (data: MenuFormData) => {
    setLoading(true);
    try {
      const url = menu ? `/api/admin/menus/${menu.id}` : '/api/admin/menus';
      const method = menu ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success(menu ? 'Menu yeniləndi' : 'Menu yaradıldı');
      router.push('/dashboard/menus');
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
            <Label htmlFor="type">Menu Tipi</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => {
                setValue('type', value as 'category' | 'page' | 'custom');
                setValue('targetId', null);
                setValue('az.title', '');
                setValue('en.title', '');
                setValue('az.url', '');
                setValue('en.url', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Menu tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Bölmə</SelectItem>
                <SelectItem value="page">Statik Səhifə</SelectItem>
                <SelectItem value="custom">Xüsusi URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {menuType === 'category' && (
            <div>
              <Label htmlFor="targetId">Bölmə Seçin</Label>
              <Select
                value={watch('targetId') || 'none'}
                onValueChange={(value) => setValue('targetId', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bölmə seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bölmə seçin</SelectItem>
                  {availableCategories.map((category) => {
                    const azName = category.translations.find((t) => t.locale === 'az')?.name;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {azName || category.slug}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {menuType === 'page' && (
            <div>
              <Label htmlFor="targetId">Statik Səhifə Seçin</Label>
              <Select
                value={watch('targetId') || 'none'}
                onValueChange={(value) => setValue('targetId', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statik səhifə seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Statik səhifə seçin</SelectItem>
                  {availablePages.map((page) => {
                    const azTitle = page.translations.find((t) => t.locale === 'az')?.title;
                    return (
                      <SelectItem key={page.id} value={page.id}>
                        {azTitle || page.slug}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}


          <div>
            <Label htmlFor="parentId">Ana Menu</Label>
            <Select
              value={watch('parentId') || 'none'}
              onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ana menu seçin (boş buraxa bilərsiniz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ana menu yoxdur</SelectItem>
                {availableParents.map((parent) => {
                  const azTitle = parent.translations.find((t) => t.locale === 'az')?.title;
                  return (
                    <SelectItem key={parent.id} value={parent.id}>
                      {azTitle || parent.id}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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

          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Görünmə Yerləri</h4>
            <div className="flex items-center space-x-2">
              <Switch
                id="showInHeader"
                checked={watch('showInHeader')}
                onCheckedChange={(checked) => setValue('showInHeader', checked)}
              />
              <Label htmlFor="showInHeader">Header-də göstər</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="showInFooter"
                checked={watch('showInFooter')}
                onCheckedChange={(checked) => setValue('showInFooter', checked)}
              />
              <Label htmlFor="showInFooter">Footer-də göstər</Label>
            </div>
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
                <Label htmlFor="az-title">Başlıq (AZ)</Label>
                <Input
                  id="az-title"
                  {...register('az.title')}
                  placeholder="Menu başlığı"
                />
                {errors.az?.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.az.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="az-url">URL (AZ)</Label>
                <Input
                  id="az-url"
                  {...register('az.url')}
                  placeholder="/page-url"
                  disabled={menuType === 'category' || menuType === 'page'}
                />
                {(menuType === 'category' || menuType === 'page') && (
                  <p className="text-xs text-gray-500 mt-1">
                    URL avtomatik olaraq yaradılır
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="en" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="en-title">Başlıq (EN)</Label>
                <Input
                  id="en-title"
                  {...register('en.title')}
                  placeholder="Menu title"
                />
                {errors.en?.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.en.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="en-url">URL (EN)</Label>
                <Input
                  id="en-url"
                  {...register('en.url')}
                  placeholder="/page-url"
                  disabled={menuType === 'category' || menuType === 'page'}
                />
                {(menuType === 'category' || menuType === 'page') && (
                  <p className="text-xs text-gray-500 mt-1">
                    URL avtomatik olaraq yaradılır
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : menu ? 'Yenilə' : 'Yarat'}
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

