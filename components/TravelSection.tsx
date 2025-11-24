'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

async function getMultimediaArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/multimedia?locale=${locale}&limit=8`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'multimedia' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
      author: article.author || '',
      role: article.role || '',
    }));
  } catch (error) {
    console.error('Error fetching multimedia articles:', error);
    return [];
  }
}

function formatDate(dateString: string, locale: string) {
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

export default function TravelSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getMultimediaArticles(currentLocale).then(setArticles);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="py-8">
        <h2 className="text-sm font-bold text-foreground mb-6 font-serif">
          {locale === 'az' ? 'Multimedia' : 'Multimedia'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {locale === 'az' ? 'Yüklənir...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  const heroArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);

  return (
    <div className="py-8">
      <h2 className="text-sm font-bold text-foreground mb-6 font-serif">
        {locale === 'az' ? 'Multimedia' : 'Multimedia'}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Article */}
        <div className="lg:col-span-4">
          {heroArticle && (
            <Link
              href={`/${locale}/article/${heroArticle.slug}`}
              className="block group"
            >
              <h3 className="text-2xl font-bold mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-foreground font-serif">
                {heroArticle.title}
              </h3>
              {heroArticle.excerpt && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-4">
                  {heroArticle.excerpt}
                </p>
              )}
              {heroArticle.published_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(heroArticle.published_at, locale)}</span>
                </div>
              )}
            </Link>
          )}
        </div>

        {/* Center Column - Large Image */}
        <div className="lg:col-span-5">
          {heroArticle && (
            <Link
              href={`/${locale}/article/${heroArticle.slug}`}
              className="block group"
            >
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden mb-2">
                {heroArticle.image_url ? (
                  <Image
                    src={heroArticle.image_url}
                    alt={heroArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
              </div>
              {heroArticle.author && (
                <p className="text-xs text-muted-foreground">
                  {heroArticle.author}
                  {heroArticle.role && ` / ${heroArticle.role}`}
                </p>
              )}
            </Link>
          )}
        </div>

        {/* Right Column - Sidebar Articles */}
        <div className="lg:col-span-3 space-y-6">
          {sidebarArticles.map((article: any, index: number) => (
            <Link
              key={article.id || index}
              href={`/${locale}/article/${article.slug}`}
              className="block group"
            >
              <div className="flex gap-3">
                {/* Thumbnail Image */}
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-foreground line-clamp-2">
                    {article.title}
                  </h4>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
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
      </div>
    </div>
  );
}

