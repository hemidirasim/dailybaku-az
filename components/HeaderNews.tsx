'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

async function getLatestArticles(locale: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/recent?locale=${locale}&limit=5`,
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

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getLatestArticles(currentLocale).then(setArticles);
  }, [pathname]);

  const latestLabel = locale === 'az' ? 'SON XƏBƏRLƏR' : 'LATEST';

  // Duplicate articles for seamless loop (only if we have articles)
  const duplicatedArticles = articles.length > 0 
    ? [...articles, ...articles]
    : [];

  // Don't render if no articles
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-b border-gray-200 py-2 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-4 relative">
        <div className="bg-black text-white px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap rounded z-10 flex-shrink-0">
          <div className="w-3 h-3 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <span className="text-xs font-bold uppercase">{latestLabel}</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-4 text-sm text-black animate-scroll">
            {duplicatedArticles.map((article, index) => {
              if (!article || !article.title) return null;
              return (
                <div key={`${article.id || index}-${index}`} className="flex items-center gap-4 whitespace-nowrap flex-shrink-0">
                  <Link
                    href={article.slug ? `/${locale}/article/${article.slug}` : '#'}
                    className="hover:text-red-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                  <span className="text-gray-300">|</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}