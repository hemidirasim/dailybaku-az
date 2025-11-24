import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'az';
    const limit = parseInt(searchParams.get('limit') || '5');

    const articles = await prisma.article.findMany({
      where: {
        featured: true,
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
            translations: {
              where: { locale: locale }
            }
          }
        }
      },
      orderBy: {
        publishedAt: { sort: 'desc', nulls: 'last' }
      },
      take: limit * 2, // Daha çox götür ki, title-i olmayanları filter etdikdən sonra kifayət qədər olsun
    });

    const formattedArticles = articles
      .map((article: typeof articles[0]) => {
        const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
        const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);
        
        // Əgər translation yoxdursa və ya title boşdursa, null qaytar
        if (!translation || !translation.title || translation.title.trim() === '') {
          return null;
        }
        
        return {
          id: article.id,
          title: translation.title,
          slug: translation.slug || '',
          excerpt: translation.excerpt || '',
          content: translation.content || '',
          image_url: article.images[0]?.url || null,
          published_at: article.publishedAt,
          category: categoryTranslation?.name || article.category?.slug || null,
          category_slug: article.category?.slug || null,
        };
      })
      .filter((article): article is NonNullable<typeof article> => article !== null)
      .slice(0, limit); // Son limit qədər götür

    return NextResponse.json(formattedArticles);
  } catch (error: any) {
    console.error('Featured articles error:', error);
    // Return empty array instead of error to prevent 404
    return NextResponse.json([]);
  }
}
