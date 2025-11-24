import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az';

  // Ana səhifələr
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/az`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    // Kateqoriyalar
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        translations: true,
      },
    });

    const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category: typeof categories[0]) => {
      const azSlug = category.translations.find((t: { locale: string }) => t.locale === 'az')?.name;
      const enSlug = category.translations.find((t: { locale: string }) => t.locale === 'en')?.name;
      
      return [
        {
          url: `${baseUrl}/az/category/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/en/category/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        },
      ];
    });

    // Published və silinməmiş xəbərlər
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        publishedAt: {
          not: null,
        },
      },
      include: {
        translations: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    const articlePages: MetadataRoute.Sitemap = articles.flatMap((article: typeof articles[0]) => {
      const azTranslation = article.translations.find((t: { locale: string }) => t.locale === 'az');
      const enTranslation = article.translations.find((t: { locale: string }) => t.locale === 'en');
      
      const pages: MetadataRoute.Sitemap = [];
      
      if (azTranslation?.slug) {
        pages.push({
          url: `${baseUrl}/az/article/${azTranslation.slug}`,
          lastModified: article.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }
      
      if (enTranslation?.slug) {
        pages.push({
          url: `${baseUrl}/en/article/${enTranslation.slug}`,
          lastModified: article.updatedAt,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      }
      
      return pages;
    });

    return [...staticPages, ...categoryPages, ...articlePages];
  } catch (error: any) {
    console.error('Sitemap generation error:', error);
    // Xəta halında yalnız statik səhifələri qaytar
    return staticPages;
  }
}

