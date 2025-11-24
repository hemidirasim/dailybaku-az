'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

async function getLifeStyleArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    // Life Style kateqoriyasının slug-u "life-style"
    const response = await fetch(
      `${baseUrl}/api/articles/category/life-style?locale=${locale}&limit=5`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'life-style' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
      author: article.author || '',
      role: article.role || '',
    }));
  } catch (error) {
    console.error('Error fetching lifestyle articles:', error);
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

export default function LifeStyleSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getLifeStyleArticles(currentLocale).then(setArticles);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="py-8">
        <h2 className="text-[17px] font-bold text-foreground mb-6">
          {locale === 'az' ? 'Life Style' : 'Life Style'}
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

  return (
    <div className="py-8">
      <h2 className="text-[17px] font-bold text-foreground mb-6">
        {locale === 'az' ? 'Life Style' : 'Life Style'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {articles.map((article: any, index: number) => (
          <Link
            key={article.id || index}
            href={`/${locale}/article/${article.slug}`}
            className="block group"
          >
            {/* Image */}
            <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
              {article.image_url ? (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Author/Source */}
            {article.author && (
              <p className="text-xs text-muted-foreground mb-2">
                {article.author}
                {article.role && ` / ${article.role}`}
              </p>
            )}

            {/* Title */}
            <h3 className="text-base font-bold mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-foreground line-clamp-2">
              {article.title}
            </h3>

            {/* Read Time / Date */}
            {article.published_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(article.published_at, locale)}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

