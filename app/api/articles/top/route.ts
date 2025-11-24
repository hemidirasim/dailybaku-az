import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'az';

    // Müəyyən kateqoriyalar: Siyasət, Biznes, Texno, Avto
    const categorySlugs = ['siyaset', 'biznes', 'texno', 'avto'];

    // Hər kateqoriya üçün ən çox oxunan 1 xəbəri götür
    const articlesPromises = categorySlugs.map(async (slug) => {
      const category = await prisma.category.findUnique({
        where: { slug },
      });

      if (!category) {
        return null;
      }

      const article = await prisma.article.findFirst({
        where: {
          categoryId: category.id,
          status: 'published',
          deletedAt: null,
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: new Date() } }
          ],
        },
        include: {
          translations: true,
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
          category: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: {
          views: 'desc',
        },
        take: 1,
      });

      if (!article) {
        return null;
      }

      const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
      const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);

      if (!translation || !translation.title || translation.title.trim() === '') {
        return null;
      }

      return {
        id: article.id,
        title: translation.title,
        slug: translation.slug || '',
        image_url: article.images[0]?.url || null,
        categories: {
          name: categoryTranslation?.name || article.category?.slug || 'Uncategorized',
        },
      };
    });

    const articles = await Promise.all(articlesPromises);
    const formattedArticles = articles.filter((article): article is NonNullable<typeof article> => article !== null);

    return NextResponse.json(formattedArticles);
  } catch (error: any) {
    console.error('Top articles error:', error);
    // Return empty array instead of error to prevent 404
    return NextResponse.json([]);
  }
}
