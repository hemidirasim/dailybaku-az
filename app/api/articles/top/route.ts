import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const locale = searchParams.get('locale') || 'az';
    const limit = parseInt(searchParams.get('limit') || '4');

    const articles = await prisma.article.findMany({
      where: {
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
      skip: offset,
      take: limit,
    });

    const formattedArticles = articles.map((article: typeof articles[0]) => {
      const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
      const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);
      
      return {
        id: article.id,
        title: translation?.title || '',
        slug: translation?.slug || '',
        image_url: article.images[0]?.url || null,
        categories: {
          name: categoryTranslation?.name || article.category?.slug || 'Uncategorized',
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

