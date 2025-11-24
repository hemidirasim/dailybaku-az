'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

async function getWorldArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/dunya?locale=${locale}&limit=9`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
    }));
  } catch (error) {
    console.error('Error fetching world articles:', error);
    return [];
  }
}

export default function WorldMainSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getWorldArticles(currentLocale).then(setArticles);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  if (articles.length === 0) {
    return null;
  }

  const mainArticle = articles[0];
  const sidebarArticles = articles.slice(1, 6); // 5 articles for right sidebar
  const bottomArticles = articles.slice(6, 9); // 3 articles for bottom grid

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', {
        locale: locale === 'en' ? enUS : az,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4 pb-2 border-b border-border">
          <h2 className="text-xs font-bold text-foreground capitalize">
            {locale === 'az' ? 'Dünya' : 'World'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Article Text */}
          <div className="lg:col-span-4">
            {mainArticle && (
              <Link href={`/${locale}/article/${mainArticle.slug}`} className="block group">
                <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight font-serif group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {mainArticle.title}
                </h1>
                {mainArticle.excerpt && (
                  <p className="text-base text-muted-foreground leading-relaxed mb-4">
                    {mainArticle.excerpt}
                  </p>
                )}
                {mainArticle.published_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(mainArticle.published_at)}</span>
                    <span className="mx-1">•</span>
                    <span>{locale === 'az' ? '14 dəq oxu' : '14 MIN READ'}</span>
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Center Column - Main Article Image */}
          <div className="lg:col-span-5">
            {mainArticle && mainArticle.image_url && (
              <Link href={`/${locale}/article/${mainArticle.slug}`} className="block group">
                <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src={mainArticle.image_url}
                    alt={mainArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                </div>
              </Link>
            )}
          </div>

          {/* Right Column - "In Case You Missed It" Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {sidebarArticles.map((article, index) => (
                <Link
                  key={article.id || index}
                  href={`/${locale}/article/${article.slug}`}
                  className="block group"
                >
                  <div className="flex gap-3">
                    {article.image_url && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground leading-snug mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      {article.published_at && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(article.published_at)}</span>
                          <span className="mx-1">•</span>
                          <span>{locale === 'az' ? '5 dəq oxu' : '5 MIN READ'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - "In Case You Missed It" Grid */}
        {bottomArticles.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bottomArticles.map((article, index) => (
                <Link
                  key={article.id || index}
                  href={`/${locale}/article/${article.slug}`}
                  className="block group"
                >
                  {article.image_url && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <h3 className="text-base font-bold text-foreground leading-snug mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-serif">
                    {article.title}
                  </h3>
                  {article.published_at && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(article.published_at)}</span>
                      <span className="mx-1">•</span>
                      <span>{locale === 'az' ? '6 dəq oxu' : '6 MIN READ'}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

