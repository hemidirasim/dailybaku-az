import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'az';
    const limit = parseInt(searchParams.get('limit') || '5');

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
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    const formattedArticles = articles.map((article) => {
      const translation = article.translations.find((t) => t.locale === locale);
      
      return {
        id: article.id,
        title: translation?.title || '',
        slug: translation?.slug || '',
        excerpt: translation?.excerpt || '',
        image_url: article.images[0]?.url || null,
        published_at: article.publishedAt,
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

