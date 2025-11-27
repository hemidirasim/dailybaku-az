import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

async function searchArticles(query: string, locale: string) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();

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
    take: 50,
  });

  return articles
    .map((article) => {
      const translation = article.translations[0];
      if (!translation) return null;

      const categoryTranslation = article.category?.translations[0];
      const image = article.images[0];

      return {
        id: article.id,
        title: translation.title,
        slug: translation.slug,
        excerpt: translation.excerpt || '',
        published_at: article.publishedAt,
        image_url: image?.url || null,
        category: categoryTranslation?.name || null,
      };
    })
    .filter((article): article is NonNullable<typeof article> => article !== null);
}

function formatDate(dateString: Date | null, locale: string) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'HH:mm • d MMMM, yyyy', {
      locale: locale === 'en' ? enUS : az,
    });
  } catch {
    return '';
  }
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;

  if (!q || q.trim().length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {locale === 'az' ? 'Axtarış' : 'Search'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'az' 
              ? 'Axtarış sorğusu daxil edin' 
              : 'Please enter a search query'}
          </p>
        </div>
      </div>
    );
  }

  const articles = await searchArticles(q, locale);

  const translations = {
    az: {
      title: 'Axtarış nəticələri',
      noResults: 'Nəticə tapılmadı',
      found: 'tapıldı',
      articles: 'xəbər',
    },
    en: {
      title: 'Search Results',
      noResults: 'No results found',
      found: 'found',
      articles: 'article',
    },
  };

  const t = translations[locale as 'az' | 'en'] || translations.az;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t.title}
        </h1>
        <p className="text-muted-foreground mb-6">
          &quot;{q}&quot; üçün {articles.length} {t.articles} {t.found}
        </p>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">{t.noResults}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/${locale}/article/${article.slug}`}
                className="block group"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors">
                  {article.image_url && (
                    <div className="relative w-full h-32 md:h-24 rounded-lg overflow-hidden">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 20vw"
                      />
                    </div>
                  )}
                  <div className={article.image_url ? 'md:col-span-4' : 'md:col-span-5'}>
                    {article.category && (
                      <span className="text-xs font-bold text-red-600 uppercase mb-2 block">
                        {article.category}
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    {article.published_at && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(article.published_at, locale)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




