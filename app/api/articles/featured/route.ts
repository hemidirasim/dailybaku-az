import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        publishedAt: {
          lte: new Date(),
        },
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
        publishedAt: 'desc',
      },
      take: limit,
    });

    const formattedArticles = articles.map((article: typeof articles[0]) => {
      const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
      const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);
      
      return {
        id: article.id,
        title: translation?.title || '',
        slug: translation?.slug || '',
        excerpt: translation?.excerpt || '',
        image_url: article.images[0]?.url || null,
        published_at: article.publishedAt,
        categories: {
          name: categoryTranslation?.name || article.category?.slug || 'Uncategorized',
          slug: article.category?.slug || '',
        },
      };
    });

    return NextResponse.json(formattedArticles);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

