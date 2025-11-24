'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

async function getLatestArticles(locale: string, limit: number = 5) {
  try {
    const response = await fetch(
      `${typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az')}/api/articles/recent?locale=${locale}&limit=${limit}&offset=0`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

export default function HeaderNews() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [loading, setLoading] = useState(false);

  // Locale-i təyin et və xəbərləri yüklə
  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);
    setLoading(true);

    // Həmişə son 5 xəbəri gətir
    getLatestArticles(currentLocale, 5).then((articles) => {
      setArticles(articles);
      setLoading(false);
    });
  }, [pathname]);

  const latestLabel = locale === 'az' ? 'SON XƏBƏRLƏR' : 'LATEST';

  // Duplicate articles for seamless loop (2 times for smooth scrolling)
  const duplicatedArticles = articles.length > 0 
    ? [...articles, ...articles] 
    : [];

  // Don't render if no articles
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-background border-t border-b border-border py-2 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-4 relative">
        <div className="bg-foreground text-background px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap rounded z-10 flex-shrink-0">
          <div className="w-3 h-3 rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-background animate-pulse"></div>
          </div>
          <span className="text-xs font-bold uppercase">{latestLabel}</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-scroll">
            {duplicatedArticles.map((article, index) => {
              if (!article || !article.title) return null;
              return (
                <span key={`${article.id || index}-${index}`} className="inline-flex items-center gap-4 whitespace-nowrap flex-shrink-0 mr-4">
                  <Link
                    href={article.slug ? `/${locale}/article/${article.slug}` : '#'}
                    className="text-sm text-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {article.title}
                  </Link>
                  <span className="text-muted-foreground">|</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
