'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { X, Upload, Image as ImageIcon, Plus, Check, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
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

const articleSchema = z.object({
  authorId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.string().default('draft'), // 'draft' or 'published'
  publishedAt: z.string().optional().nullable(),
  az: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
  }),
  en: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
  }),
});

type ArticleFormData = z.infer<typeof articleSchema>;

type ArticleUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

interface ArticleFormProps {
  article?: {
    id: string;
    authorId: string | null;
    categoryId: string | null;
    featured: boolean;
    status: string;
    publishedAt: Date | null;
    translations: Array<{
      locale: string;
      title: string;
      slug: string;
      excerpt?: string | null;
      content: string;
    }>;
    images: Array<{
      id: string;
      url: string;
      alt?: string | null;
      order: number;
      isPrimary: boolean;
    }>;
    tags?: Array<{
      id: string;
      tag: {
        id: string;
        translations: Array<{
          locale: string;
          name: string;
        }>;
      };
    }>;
  };
  categories?: Array<{
    id: string;
    translations: Array<{
      locale: string;
      name: string;
    }>;
  }>;
  users?: ArticleUser[];
}

// Slug oluşturma fonksiyonu
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Baştan ve sondan tireleri kaldır
};

const fallbackSlug = (locale: string) => `${locale}-${Date.now()}`;

export default function ArticleForm({ article, categories = [], users = [] }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; alt?: string; caption?: string; order: number; isPrimary: boolean }>>(
    article?.images.map((img) => ({
      url: img.url,
      alt: img.alt || '',
      caption: (img as any).caption || '',
      order: img.order,
      isPrimary: img.isPrimary,
    })) || []
  );
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [availableUsers, setAvailableUsers] = useState<ArticleUser[]>(users);
  const [availableTags, setAvailableTags] = useState<Array<{
    id: string;
    translations: Array<{
      locale: string;
      name: string;
    }>;
  }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((at) => at.tag.id) || []
  );
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState({ az: '', en: '' });
  const [creatingTag, setCreatingTag] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableGalleryTemplates, setAvailableGalleryTemplates] = useState<Array<{
    id: string;
    slug: string;
    type: string;
    columns: number;
    translations: Array<{
      locale: string;
      name: string;
    }>;
  }>>([]);
  const [selectedGalleryTemplate, setSelectedGalleryTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/admin/categories')
        .then((res) => res.json())
        .then((data) => setAvailableCategories(data || []));
    }

    if (users.length === 0) {
      fetch('/api/admin/users')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const usersList = data.map((user: any) => ({
              id: user.id,
              name: user.name ?? null,
              email: user.email,
              role: user.role,
            }));
            setAvailableUsers(usersList);
            
            // Yeni xəbər üçün default admin müəllif təyin et
            if (!article) {
              const adminUser = usersList.find((u: any) => u.role === 'admin');
              if (adminUser) {
                setValue('authorId', adminUser.id);
              }
            }
          } else {
            setAvailableUsers([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
          setAvailableUsers([]);
        });
    } else if (!article) {
      // Users artıq mövcuddursa və yeni xəbərdirsə, admin-i təyin et
      const adminUser = users.find((u: any) => u.role === 'admin');
      if (adminUser) {
        setValue('authorId', adminUser.id);
      }
    }
    
    // Fetch tags
    fetch('/api/admin/tags')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableTags(data);
        } else {
          setAvailableTags([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching tags:', error);
        setAvailableTags([]);
      });

    // Fetch gallery templates
    fetch('/api/admin/gallery-templates')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableGalleryTemplates(data);
        } else {
          setAvailableGalleryTemplates([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching gallery templates:', error);
        setAvailableGalleryTemplates([]);
      });
  }, [categories, users]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          authorId: article.authorId || null,
          categoryId: article.categoryId || null,
          featured: article.featured,
          status: article.status || 'draft',
          publishedAt: article.publishedAt
            ? new Date(article.publishedAt).toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm formatı
            : null,
          az: {
            title: article.translations.find((t) => t.locale === 'az')?.title || '',
            slug: article.translations.find((t) => t.locale === 'az')?.slug || '',
            excerpt: article.translations.find((t) => t.locale === 'az')?.excerpt || '',
            content: article.translations.find((t) => t.locale === 'az')?.content || '',
          },
          en: {
            title: article.translations.find((t) => t.locale === 'en')?.title || '',
            slug: article.translations.find((t) => t.locale === 'en')?.slug || '',
            excerpt: article.translations.find((t) => t.locale === 'en')?.excerpt || '',
            content: article.translations.find((t) => t.locale === 'en')?.content || '',
          },
        }
      : {
          authorId: null,
          categoryId: null,
          featured: false,
          status: 'draft',
          publishedAt: new Date().toISOString().slice(0, 16), // Cari tarix və saat
          az: { title: '', slug: '', excerpt: '', content: '' },
          en: { title: '', slug: '', excerpt: '', content: '' },
        },
  });

  // AZ başlığı değiştiğinde slug'ı otomatik oluştur
  const azTitle = watch('az.title');
  useEffect(() => {
    if (!article && azTitle) {
      const autoSlug = generateSlug(azTitle);
      setValue('az.slug', autoSlug);
    }
  }, [azTitle, article, setValue]);

  // EN başlığı değiştiğinde slug'ı otomatik oluştur
  const enTitle = watch('en.title');
  useEffect(() => {
    if (!article && enTitle) {
      const autoSlug = generateSlug(enTitle);
      setValue('en.slug', autoSlug);
    }
  }, [enTitle, article, setValue]);


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
      setImages([...images, { url: data.url, alt: '', caption: '', order: images.length, isPrimary: images.length === 0 }]);
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

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
  };

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  const handleCreateTag = async () => {
    const tagName = newTagName.az.trim() || searchQuery.trim();
    if (!tagName) {
      toast.error('Tag adı (AZ) tələb olunur');
      return;
    }

    setCreatingTag(true);
    try {
      const slug = generateSlug(tagName);
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          az: { name: tagName },
          en: { name: newTagName.en || tagName },
        }),
      });

      if (!response.ok) {
        throw new Error('Tag yaradılmadı');
      }

      const newTag = await response.json();
      setAvailableTags([...availableTags, newTag]);
      setSelectedTags([...selectedTags, newTag.id]);
      setNewTagName({ az: '', en: '' });
      setSearchQuery('');
      toast.success('Tag yaradıldı və seçildi');
    } catch (error) {
      toast.error('Tag yaradılmadı');
    } finally {
      setCreatingTag(false);
    }
  };

  const onSubmit = async (data: ArticleFormData, status: 'draft' | 'published' = 'published') => {
    setLoading(true);
    try {
      const url = article ? `/api/admin/articles/${article.id}` : '/api/admin/articles';
      const method = article ? 'PUT' : 'POST';

      // Slug'ları otomatik oluştur (eğer boşsa)
      const processedData = {
        ...data,
        status: status, // Status parametrindən gəlir
        authorId: data.authorId || null,
        az: {
          ...data.az,
          slug: data.az.slug
            ? generateSlug(data.az.slug)
            : data.az.title
            ? generateSlug(data.az.title)
            : fallbackSlug('az'),
        },
        en: {
          ...data.en,
          slug: data.en.slug
            ? generateSlug(data.en.slug)
            : data.en.title
            ? generateSlug(data.en.title)
            : fallbackSlug('en'),
        },
        images: images.map((img, index) => ({
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          order: index,
          isPrimary: img.isPrimary,
        })),
        tagIds: selectedTags,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error('Xəta baş verdi');
      }

      toast.success(
        status === 'draft'
          ? (article ? 'Qaralama yeniləndi' : 'Qaralama yaradıldı')
          : (article ? 'Xəbər yeniləndi' : 'Xəbər yaradıldı')
      );
      router.push('/admin/articles');
      router.refresh();
    } catch (error) {
      toast.error('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 2 Sütun Layout - Sol geniş, sağ dar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Sütun - Geniş (Başlıq və Məzmun) */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Başlıq və Məzmun</CardTitle>
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
                      placeholder="Xəbər başlığı"
                    />
                    {errors.az?.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.az.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="az-excerpt">Qısa Məzmun (AZ)</Label>
                    <Textarea
                      id="az-excerpt"
                      {...register('az.excerpt')}
                      placeholder="Qısa məzmun"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="az-content">Məzmun (AZ)</Label>
                    <div className="quill-editor-wrapper" style={{ height: '240px' }}>
                      <ReactQuill
                        theme="snow"
                        value={watch('az.content') || ''}
                        onChange={(value) => setValue('az.content', value)}
                        placeholder="Xəbər məzmunu"
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
                      placeholder="Article title"
                    />
                    {errors.en?.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.en.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="en-excerpt">Qısa Məzmun (EN)</Label>
                    <Textarea
                      id="en-excerpt"
                      {...register('en.excerpt')}
                      placeholder="Excerpt"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="en-content">Məzmun (EN)</Label>
                    <div className="quill-editor-wrapper" style={{ height: '240px' }}>
                      <ReactQuill
                        theme="snow"
                        value={watch('en.content') || ''}
                        onChange={(value) => setValue('en.content', value)}
                        placeholder="Article content"
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

          {/* Şəkil Qalereyası - Məzmunun altında */}
          <Card>
            <CardHeader>
              <CardTitle>Şəkil Qalereyası</CardTitle>
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
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                          <Image
                            src={image.url}
                            alt={image.alt || `Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
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
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => moveImageUp(index)}
                              disabled={index === 0}
                              title="Yuxarı"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => moveImageDown(index)}
                              disabled={index === images.length - 1}
                              title="Aşağı"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant={image.isPrimary ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                              onClick={() => setPrimaryImage(index)}
                            >
                              Primary
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Sütun - Dar (Ümumi Məlumatlar, Şəkil və Tarix) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Düymələr */}
          <div className="space-y-2">
            <Button 
              type="button" 
              onClick={handleSubmit((data) => onSubmit(data, 'published'))} 
              disabled={loading} 
              className="w-full"
            >
              {loading ? 'Saxlanılır...' : article ? 'Yenilə və Paylaş' : 'Yarat və Paylaş'}
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))} 
              disabled={loading} 
              variant="outline"
              className="w-full"
            >
              {loading ? 'Saxlanılır...' : 'Qaralama olaraq saxla'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Ləğv et
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ümumi Məlumatlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="authorId">Müəllif</Label>
                {availableUsers.length > 0 ? (
                  <Select
                    value={watch('authorId') || 'none'}
                    onValueChange={(value) => setValue('authorId', value === 'none' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Müəllif seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Müəllif seçin</SelectItem>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}{' '}
                          {user.role === 'admin' ? '(Admin)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Müəllif tapılmadı. Əvvəlcə istifadəçi yaradın.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="categoryId">Bölmə</Label>
                <Select
                  value={watch('categoryId') || 'none'}
                  onValueChange={(value) => setValue('categoryId', value === 'none' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bölmə seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bölmə yoxdur</SelectItem>
                    {availableCategories.map((category) => {
                      const azName = category.translations.find((t) => t.locale === 'az')?.name;
                      return (
                        <SelectItem key={category.id} value={category.id}>
                          {azName || category.id}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={watch('featured')}
                  onCheckedChange={(checked) => setValue('featured', checked)}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>

              <div>
                <Label>Taglar</Label>
                <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tagPopoverOpen}
                      className="w-full justify-between"
                    >
                      Tag seçin və ya yeni tag yaradın
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command shouldFilter={true}>
                      <CommandInput 
                        placeholder="Tag axtarın..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandGroup>
                          {availableTags.map((tag) => {
                            const azName = tag?.translations?.find((t) => t.locale === 'az')?.name || tag.id;
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                              <CommandItem
                                key={tag.id}
                                value={azName}
                                onSelect={() => {
                                  if (isSelected) {
                                    setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                                  } else {
                                    setSelectedTags([...selectedTags, tag.id]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                {azName}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                        <CommandEmpty>
                          <div className="py-4 px-2 space-y-3">
                            <p className="text-sm text-gray-500 text-center">
                              "{searchQuery}" adlı tag tapılmadı.
                            </p>
                            <div className="border-t pt-3 space-y-2">
                              <p className="text-sm font-medium">Yeni tag yarat</p>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Tag adı (AZ)"
                                  value={newTagName.az || searchQuery}
                                  onChange={(e) => setNewTagName({ ...newTagName, az: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleCreateTag();
                                    }
                                  }}
                                />
                                <Input
                                  placeholder="Tag adı (EN) - İstəyə bağlı"
                                  value={newTagName.en}
                                  onChange={(e) => setNewTagName({ ...newTagName, en: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleCreateTag();
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  className="w-full"
                                  onClick={handleCreateTag}
                                  disabled={creatingTag || !(newTagName.az.trim() || searchQuery.trim())}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  {creatingTag ? 'Yaradılır...' : `"${searchQuery || newTagName.az || 'Yeni tag'}" yarat`}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CommandEmpty>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {selectedTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = availableTags.find((t) => t.id === tagId);
                      const azName = tag?.translations?.find((t) => t.locale === 'az')?.name || tagId;
                      return (
                        <div
                          key={tagId}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm"
                        >
                          {azName}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTags(selectedTags.filter((id) => id !== tagId));
                            }}
                            className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Şəkil və Tarix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="publishedAt">Nəşr Tarixi</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  {...register('publishedAt')}
                />
              </div>

              <div>
                <Label htmlFor="galleryTemplate">Qalereya Şablonu</Label>
                <Select
                  value={selectedGalleryTemplate || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setSelectedGalleryTemplate(null);
                    } else {
                      setSelectedGalleryTemplate(value);
                      // Şablon seçildiğinde şablonun şəkillərini yüklə
                      const template = availableGalleryTemplates.find((t) => t.id === value);
                      if (template) {
                        fetch(`/api/admin/gallery-templates/${value}`)
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.images && data.images.length > 0) {
                              setImages(
                                data.images.map((img: any) => ({
                                  url: img.url,
                                  alt: img.alt || '',
                                  caption: (img as any).caption || '',
                                  order: img.order,
                                  isPrimary: img.order === 0,
                                }))
                              );
                              toast.success('Qalereya şablonu şəkilləri yükləndi');
                            }
                          })
                          .catch((error) => {
                            console.error('Error loading template images:', error);
                          });
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qalereya şablonu seçin (istəyə bağlı)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Şablon istifadə etmə</SelectItem>
                    {availableGalleryTemplates.map((template) => {
                      const azName = template.translations.find((t) => t.locale === 'az')?.name;
                      return (
                        <SelectItem key={template.id} value={template.id}>
                          {azName || template.slug} ({template.type}, {template.columns} sütun)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedGalleryTemplate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Şablon seçildi. Şəkillər avtomatik yüklənəcək.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

