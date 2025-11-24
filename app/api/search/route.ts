import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const locale = searchParams.get('locale') || 'az';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        count: 0,
      });
    }

    const searchTerm = query.trim();

    // Axtarış: başlıq və məzmun üçün
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ],
        translations: {
          some: {
            locale: locale,
            OR: [
              {
                title: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                excerpt: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                content: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      },
      include: {
        translations: {
          where: {
            locale: locale,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
        category: {
          include: {
            translations: {
              where: {
                locale: locale,
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: { sort: 'desc', nulls: 'last' },
      },
      take: limit * 2, // Daha çox götür ki, title-i olmayanları filter etdikdən sonra kifayət qədər olsun
    });

    const formattedResults = articles
      .map((article) => {
        const translation = article.translations[0];
        const categoryTranslation = article.category?.translations[0];
        
        // Əgər translation yoxdursa və ya title boşdursa, null qaytar
        if (!translation || !translation.title || translation.title.trim() === '') {
          return null;
        }
        
        return {
          id: article.id,
          title: translation.title,
          slug: translation.slug || '',
          excerpt: translation.excerpt || '',
          image_url: article.images[0]?.url || null,
          category: categoryTranslation?.name || article.category?.slug || '',
          published_at: article.publishedAt,
        };
      })
      .filter((article): article is NonNullable<typeof article> => article !== null)
      .slice(0, limit); // Son limit qədər götür

    return NextResponse.json({
      results: formattedResults,
      count: formattedResults.length,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Axtarış xətası' },
      { status: 500 }
    );
  }
}
