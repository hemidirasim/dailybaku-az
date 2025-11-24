'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import { Clock } from 'lucide-react';

async function getWorldArticles(locale: string = 'az', limit: number = 6) {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/dunya?locale=${locale}&limit=${limit}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'dunya' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
    }));
  } catch (error) {
    console.error('Error fetching world articles:', error);
    return [];
  }
}

export default function RegionalNewsSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  const dateLocale = useMemo(() => (locale === 'az' ? az : enUS), [locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    // Dünya xəbərləri gətir
    getWorldArticles(currentLocale, 6).then(setArticles);
  }, [pathname]);


  // Dünya xəbərləri - hamısı Dünya kateqoriyasından
  const worldArticles = articles.slice(0, 6).map(a => ({
    category: a.categories?.name || a.category || (locale === 'az' ? 'Dünya' : 'World'),
    title: a.title,
    excerpt: a.excerpt || '',
    slug: a.slug,
    published_at: a.published_at,
  }));

  return (
    <div className="border-b border-border pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Dünya Header */}
          <div className="lg:col-span-3">
            <div className="mb-3 pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-foreground capitalize">
                {locale === 'az' ? 'Dünya' : 'World'}
              </h3>
            </div>
          </div>

          {/* Right Column - Articles */}
          <div className="lg:col-span-9">
            <div className="space-y-4">
              {worldArticles.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  {locale === 'az' ? 'Xəbərlər yüklənir...' : 'Loading news...'}
                </div>
              )}
              {worldArticles.map((article, articleIndex) => (
                <div
                  key={articleIndex}
                  className={articleIndex < worldArticles.length - 1 ? 'pb-3 border-b border-border' : ''}
                >
                  {article.slug ? (
                    <Link
                      href={`/${locale}/article/${article.slug}`}
                      className="block group"
                    >
                      <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5">
                      {article.title}
                    </h3>
                  )}
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  {article.published_at && mounted && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(article.published_at), 'HH:mm', { locale: dateLocale })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

