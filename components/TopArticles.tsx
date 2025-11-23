'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

async function getAgendaArticles(offset: number = 0, locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://dailybaku.midiya.az');
    const response = await fetch(
      `${baseUrl}/api/articles/agenda?offset=${offset}&limit=4&locale=${locale}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      console.error('Agenda articles API error:', response.status, response.statusText);
      return [];
    }
    
    const articles = await response.json();
    return articles || [];
  } catch (error) {
    console.error('Error fetching agenda articles:', error);
    return [];
  }
}

export default function TopArticles({ offset = 0 }: { offset?: number }) {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getAgendaArticles(offset, currentLocale).then((data) => {
      setArticles(data);
    });
  }, [pathname, offset]);

  // Don't render until mounted (client-side only)
  if (!mounted) {
    return null;
  }

  // Don't render if no articles
  if (articles.length === 0) {
    return null;
  }

  // Format articles for display (4 articles)
  const displayArticles = articles.slice(0, 4).map((article: any) => ({
    category: article.category || 'Xəbər',
    title: article.title || '',
    slug: article.slug || null,
  }));

  return (
    <div className="border-b border-gray-200 pb-4 md:pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0">
          {displayArticles.map((article, index) => (
            <div
              key={index}
              className={`
                py-3 md:py-4
                ${index < displayArticles.length - 1 
                  ? 'md:border-r border-gray-200 md:pr-4' 
                  : ''
                }
                ${index > 0 
                  ? 'md:pl-4' 
                  : ''
                }
                ${index < displayArticles.length - 1 && index > 0
                  ? 'border-b md:border-b-0 border-gray-200 pb-3 md:pb-0'
                  : index < displayArticles.length - 1
                  ? 'border-b md:border-b-0 border-gray-200 pb-3 md:pb-0'
                  : ''
                }
              `}
            >
              <div className="mb-2">
                <span className="text-xs font-bold text-black uppercase">
                  {article.category}
                </span>
              </div>
              {article.slug ? (
                <Link
                  href={`/${locale}/article/${article.slug}`}
                  className="block"
                >
                  <h3 className="text-sm font-bold text-black leading-tight hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-sm font-bold text-black leading-tight">
                  {article.title}
                </h3>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
