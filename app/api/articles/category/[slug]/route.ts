import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = req.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'az';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        translations: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get articles from this category
    const articles = await prisma.article.findMany({
      where: {
        categoryId: category.id,
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

    const categoryTranslation = category.translations.find((t: { locale: string }) => t.locale === locale);

    const result = articles.map((article: typeof articles[0]) => {
      const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
      const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);
      
      return {
        id: article.id,
        title: translation?.title || '',
        slug: translation?.slug || '',
        excerpt: translation?.excerpt || '',
        image_url: article.images[0]?.url || null,
        category: categoryTranslation?.name || article.category?.slug || '',
        published_at: article.publishedAt,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching category articles:', error);
    // Return empty array instead of error to prevent 404
    return NextResponse.json([]);
  }
}

