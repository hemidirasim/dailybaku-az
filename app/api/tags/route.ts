import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
      .map((tag: typeof tags[0]) => {
        const translation = tag.translations.find((t: { locale: string }) => t.locale === locale);
        if (!translation) return null;
        
        // Yalnız published və silinməmiş xəbərləri say
        const publishedArticles = tag.articles.filter(
          (at: typeof tag.articles[0]) => at.article.status === 'published' && !at.article.deletedAt
        );
        
        return {
          id: tag.id,
          slug: tag.slug,
          name: translation.name,
          articleCount: publishedArticles.length,
        };
      })
      .filter((tag: any) => tag !== null)
      .sort((a: any, b: any) => (b?.articleCount || 0) - (a?.articleCount || 0))
      .map((tag: any) => ({
        id: tag!.id,
        slug: tag!.slug,
        name: tag!.name,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Return empty array instead of error to prevent 404
    return NextResponse.json([]);
  }
}

