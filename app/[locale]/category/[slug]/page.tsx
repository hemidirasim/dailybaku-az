import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';

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

  return articles.map((article: typeof articles[0]) => {
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
}

async function getRecentArticles(locale: string) {
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
    take: 5,
  });

  return articles.map((article: typeof articles[0]) => {
    const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
    return {
      id: article.id,
      title: translation?.title || '',
      slug: translation?.slug || '',
      excerpt: translation?.excerpt || '',
      image_url: article.images[0]?.url || null,
      published_at: article.publishedAt,
    };
  });
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