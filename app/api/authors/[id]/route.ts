import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'az';

    const author = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bioAz: true,
        bioEn: true,
      },
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Müəllif tapılmadı' },
        { status: 404 }
      );
    }

    // Müəllifin xəbərləri
    const articles = await prisma.article.findMany({
      where: {
        authorId: id,
        status: 'published',
        deletedAt: null,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ],
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
      take: 20,
    });

    const formattedArticles = articles.map((article) => {
      const translation = article.translations[0];
      const categoryTranslation = article.category?.translations[0];
      
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

    return NextResponse.json({
      author: {
        ...author,
        bio: locale === 'az' ? author.bioAz : author.bioEn,
      },
      articles: formattedArticles,
      count: formattedArticles.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}
