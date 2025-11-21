import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'az';
    const limit = parseInt(searchParams.get('limit') || '15');

    const tags = await prisma.tag.findMany({
      include: {
        translations: true,
        articles: {
          include: {
            article: true,
          },
        },
      },
      take: limit,
    });

    const result = tags
      .map((tag) => {
        const translation = tag.translations.find((t) => t.locale === locale);
        if (!translation) return null;
        
        // Yalnız published və silinməmiş xəbərləri say
        const publishedArticles = tag.articles.filter(
          (at) => at.article.status === 'published' && !at.article.deletedAt
        );
        
        return {
          id: tag.id,
          slug: tag.slug,
          name: translation.name,
          articleCount: publishedArticles.length,
        };
      })
      .filter((tag) => tag !== null)
      .sort((a, b) => (b?.articleCount || 0) - (a?.articleCount || 0))
      .map((tag) => ({
        id: tag!.id,
        slug: tag!.slug,
        name: tag!.name,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

