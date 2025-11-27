import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import type { Metadata } from 'next';

async function getCategory(slug: string, locale: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!category) return null;

  const translation = category.translations.find((t: { locale: string }) => t.locale === locale);
  return {
    ...category,
    name: translation?.name || category.slug,
  };
}

async function getCategoryArticles(categoryId: string, locale: string) {
  const articles = await prisma.article.findMany({
    where: {
      categoryId,
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
    take: 20,
  });

  return articles
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
        image_url: article.images[0]?.url || null,
        category: categoryTranslation?.name || article.category?.slug || '',
        published_at: article.publishedAt,
      };
    })
    .filter((article): article is NonNullable<typeof article> => article !== null);
}

async function getRecentArticles(locale: string) {
  try {
    // Əvvəlcə agenda=true olan xəbərləri gətir
    const agendaArticles = await prisma.article.findMany({
      where: {
        agenda: true,
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
      },
      orderBy: {
        publishedAt: { sort: 'desc', nulls: 'last' }
      },
      take: 10,
    });

    // Əgər agenda xəbərləri kifayət etmirsə, digər xəbərləri də gətir
    const remainingLimit = 5 - agendaArticles.length;
    let otherArticles: typeof agendaArticles = [];
    
    if (remainingLimit > 0) {
      otherArticles = await prisma.article.findMany({
        where: {
          agenda: false,
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
        },
        orderBy: {
          publishedAt: { sort: 'desc', nulls: 'last' }
        },
        take: remainingLimit * 2,
      });
    }

    // Birləşdir: əvvəlcə agenda xəbərləri, sonra digərləri
    const articles = [...agendaArticles, ...otherArticles];

    return articles
      .map((article: typeof articles[0]) => {
        const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
        
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
          published_at: article.publishedAt,
        };
      })
      .filter((article): article is NonNullable<typeof article> => article !== null)
      .slice(0, 5); // Son 5 qədər götür
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const category = await getCategory(slug, locale);

  if (!category) {
    return {
      title: locale === 'az' ? 'Kateqoriya tapılmadı' : 'Category not found',
      description: locale === 'az' ? 'Axtardığınız kateqoriya tapılmadı' : 'The category you are looking for was not found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az';
  const categoryUrl = `${baseUrl}/${locale}/category/${category.slug}`;
  const title = `${category.name} - Daily Baku`;
  const description = locale === 'az' 
    ? `${category.name} kateqoriyasındakı son xəbərlər və məqalələr`
    : `Latest news and articles in ${category.name} category`;

  return {
    title,
    description,
    keywords: `${category.name}, ${locale === 'az' ? 'xəbər, Azərbaycan' : 'news, Azerbaijan'}`,
    openGraph: {
      title,
      description,
      url: categoryUrl,
      siteName: 'Daily Baku',
      locale: locale === 'az' ? 'az_AZ' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: categoryUrl,
      languages: {
        'az-AZ': `${baseUrl}/az/category/${category.slug}`,
        'en-US': `${baseUrl}/en/category/${category.slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const category = await getCategory(slug, locale);

  if (!category) {
    notFound();
  }

  const [articles, recentArticles] = await Promise.all([
    getCategoryArticles(category.id, locale),
    getRecentArticles(locale),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{category.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article: typeof articles[0]) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {articles.length === 0 && (
              <p className="text-muted-foreground text-center py-12">
                Bu kateqoriyada hələ xəbər yoxdur.
              </p>
            )}
          </div>

          <div className="lg:col-span-1">
            <Sidebar recentArticles={recentArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}