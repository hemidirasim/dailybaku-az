import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Grid3x3, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function MediaPage() {
  const articles = await prisma.article.findMany({
    include: {
      images: true,
    },
  });

  let galleryTemplates: any[] = [];
  try {
    galleryTemplates = await prisma.galleryTemplate.findMany({
      include: {
        translations: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching gallery templates:', error);
    // If the table doesn't exist yet, galleryTemplates will be empty array
    galleryTemplates = [];
  }

  const allImages = articles.flatMap((article: typeof articles[0]) => article.images);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Media</h1>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Şəkil Yüklə
        </Button>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList>
          <TabsTrigger value="images">Şəkillər</TabsTrigger>
          <TabsTrigger value="galleries">Qalereya Şablonları</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allImages.map((image: typeof allImages[0]) => (
              <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={image.url}
                  alt={image.alt || 'Image'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="destructive" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {allImages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Hələ heç bir şəkil yüklənməyib</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="galleries" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Qalereya Şablonları</h2>
            <Link href="/admin/media/galleries/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Şablon
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryTemplates.map((template: typeof galleryTemplates[0]) => {
              const azName = template.translations.find((t: { locale: string }) => t.locale === 'az')?.name || template.slug;
              return (
                <div key={template.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-gray-100">
                    {template.images.length > 0 ? (
                      <div className={`grid gap-1 h-full p-2 ${
                        template.type === 'grid' 
                          ? `grid-cols-${Math.min(template.columns, template.images.length)}`
                          : 'grid-cols-1'
                      }`}>
                        {template.images.slice(0, template.columns * 2).map((img: typeof template.images[0]) => (
                          <div key={img.id} className="relative">
                            <Image
                              src={img.url}
                              alt={img.alt || ''}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Grid3x3 className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{azName}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Tip: {template.type} | Sütunlar: {template.columns}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/admin/media/galleries/${template.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          Redaktə et
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {galleryTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Grid3x3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Hələ heç bir qalereya şablonu yoxdur</p>
              <Link href="/admin/media/galleries/new" className="mt-4 inline-block">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk şablonu yarat
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

