'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import { Clock } from 'lucide-react';

async function getBusinessArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/biznes?locale=${locale}&limit=7`,
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
    console.error('Error fetching business articles:', error);
    return [];
  }
}

export default function BusinessNewsSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getBusinessArticles(currentLocale).then(setArticles);
  }, [pathname]);

  if (!mounted || articles.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="text-sm font-bold text-foreground mb-4 font-serif">
        {locale === 'az' ? 'Biznes' : 'Business'}
      </h3>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article.id || index}
            href={`/${locale}/article/${article.slug}`}
            className="block group"
          >
            <div className="flex gap-3">
              {/* Thumbnail Image */}
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
              
              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                {article.published_at && mounted && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(article.published_at), 'HH:mm', { locale: locale === 'en' ? enUS : az })}
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      {format(new Date(article.published_at), locale === 'az' ? 'd MMMM, yyyy' : 'MMMM d, yyyy', { locale: locale === 'en' ? enUS : az })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

