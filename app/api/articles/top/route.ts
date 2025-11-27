import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get('locale') || 'az';

    // Müəyyən kateqoriyalar: Siyasət, Biznes, Texno, Avto
    const categorySlugs = ['siyaset', 'biznes', 'texno', 'avto'];

    // Hər kateqoriya üçün son 3 saat ərzində ən çox oxunan 1 xəbəri götür
    // Əgər 3 saat ərzində yoxdursa, 12 saat ərzində axtar
    const articlesPromises = categorySlugs.map(async (slug) => {
      const category = await prisma.category.findUnique({
        where: { slug },
      });

      if (!category) {
        console.log(`[TopArticles] Category not found: ${slug}`);
        return null;
      }

      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      // Əvvəlcə son 3 saat ərzində axtar (yalnız publishedAt olan xəbərlər)
      // Minimum views məhdudiyyəti yoxdur - hətta views: 0 olsa belə görünəcək
      let article = await prisma.article.findFirst({
        where: {
          categoryId: category.id,
          status: 'published',
          deletedAt: null,
          publishedAt: {
            gte: threeHoursAgo,
            lte: now,
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
        orderBy: [
          { views: 'desc' },
          { publishedAt: 'desc' },
        ],
        take: 1,
      });

      // Əgər 3 saat ərzində xəbər yoxdursa, 12 saat ərzində axtar (yalnız publishedAt olan xəbərlər)
      if (!article) {
        article = await prisma.article.findFirst({
          where: {
            categoryId: category.id,
            status: 'published',
            deletedAt: null,
            publishedAt: {
              gte: twelveHoursAgo,
              lte: now,
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
          orderBy: [
            { views: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: 1,
        });
      }

      // Əgər 12 saat ərzində də xəbər yoxdursa, hər kateqoriyadan ən çox oxunan xəbəri götür (tarix məhdudiyyəti olmadan)
      if (!article) {
        article = await prisma.article.findFirst({
          where: {
            categoryId: category.id,
            status: 'published',
            deletedAt: null,
            OR: [
              { publishedAt: null },
              { publishedAt: { lte: now } }
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
          orderBy: [
            { views: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: 1,
        });
      }

      if (!article) {
        console.log(`[TopArticles] ❌ No article found for category: ${slug} (checked 3h, 12h, and all time)`);
        // Əgər heç bir xəbər tapılmadısa, kateqoriyada ümumiyyətlə xəbər varmı yoxla
        const anyArticle = await prisma.article.findFirst({
          where: {
            categoryId: category.id,
            status: 'published',
            deletedAt: null,
          },
          include: {
            translations: true,
          },
          take: 1,
        });
        if (anyArticle) {
          const totalCount = await prisma.article.count({ 
            where: { 
              categoryId: category.id, 
              status: 'published', 
              deletedAt: null 
            } 
          });
          console.log(`[TopArticles] ⚠️ Category ${slug} has ${totalCount} published articles but none match time/views criteria. Sample article: id=${anyArticle.id}, views=${anyArticle.views}, publishedAt=${anyArticle.publishedAt}, hasTranslations=${anyArticle.translations.length > 0}`);
          
          // Top 5 xəbəri göstər
          const topArticles = await prisma.article.findMany({
            where: {
              categoryId: category.id,
              status: 'published',
              deletedAt: null,
              OR: [
                { publishedAt: null },
                { publishedAt: { lte: now } }
              ],
            },
            orderBy: {
              views: 'desc',
            },
            take: 5,
            include: {
              translations: {
                where: {
                  locale: locale,
                },
              },
            },
          });
          console.log(`[TopArticles] Top 5 articles for ${slug}:`, topArticles.map((a: any) => ({
            id: a.id,
            views: a.views,
            publishedAt: a.publishedAt,
            hasTranslation: a.translations.length > 0,
            title: a.translations[0]?.title?.substring(0, 50) || 'NO TITLE',
          })));
        } else {
          console.log(`[TopArticles] ❌ Category ${slug} has no published articles at all`);
        }
        return null;
      }

      console.log(`[TopArticles] ✅ Found article for category: ${slug}, articleId: ${article.id}, views: ${article.views}, publishedAt: ${article.publishedAt}`);

      const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
      const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);

      console.log(`[TopArticles] Translation check for category: ${slug}, articleId: ${article.id}, requested locale: ${locale}, hasTranslation: ${!!translation}, title: ${translation?.title || 'N/A'}, allTranslations: ${JSON.stringify(article.translations.map((t: any) => ({ locale: t.locale, hasTitle: !!t.title, titleLength: t.title?.length || 0, titlePreview: t.title?.substring(0, 30) || 'NO TITLE' })))}`);

      if (!translation || !translation.title || translation.title.trim() === '') {
        console.log(`[TopArticles] ❌ No translation or empty title for category: ${slug}, articleId: ${article.id}, requested locale: ${locale}, available locales: ${article.translations.map((t: any) => t.locale).join(', ')}`);
        // Əgər requested locale üçün translation yoxdursa, həmin kateqoriyadan başqa xəbər axtar
        console.log(`[TopArticles] 🔄 Searching for another article in category ${slug} with ${locale} translation...`);
        
        // Bütün xəbərləri götür və translation-u olan birini tap
        const articlesWithTranslation = await prisma.article.findMany({
          where: {
            categoryId: category.id,
            status: 'published',
            deletedAt: null,
            OR: [
              { publishedAt: null },
              { publishedAt: { lte: now } }
            ],
            translations: {
              some: {
                locale: locale,
                title: {
                  not: '',
                },
              },
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
          orderBy: [
            { views: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: 1,
        });

        if (articlesWithTranslation.length > 0) {
          const articleWithTranslation = articlesWithTranslation[0];
          const foundTranslation = articleWithTranslation.translations.find((t: { locale: string }) => t.locale === locale);
          const foundCategoryTranslation = articleWithTranslation.category?.translations.find((t: { locale: string }) => t.locale === locale);
          
          console.log(`[TopArticles] ✅ Found article with ${locale} translation for category: ${slug}, articleId: ${articleWithTranslation.id}`);
          
          return {
            id: articleWithTranslation.id,
            title: foundTranslation!.title,
            slug: foundTranslation!.slug || '',
            image_url: articleWithTranslation.images[0]?.url || null,
            categories: {
              name: foundCategoryTranslation?.name || articleWithTranslation.category?.slug || 'Uncategorized',
            },
          };
        }
        
        console.log(`[TopArticles] ❌ No articles found with ${locale} translation for category: ${slug}`);
        return null;
      }

      console.log(`[TopArticles] ✅ Article will be returned for category: ${slug}, articleId: ${article.id}, title: ${translation.title.substring(0, 50)}...`);

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
