'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

async function getTechArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/texno?locale=${locale}&limit=4`,
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
    console.error('Error fetching tech articles:', error);
    return [];
  }
}

export default function BusinessTechAudioSection() {
  const pathname = usePathname();
  const [techArticles, setTechArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getTechArticles(currentLocale).then(setTechArticles);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  const allArticles = techArticles.slice(0, 4);

  if (allArticles.length === 0) {
    return null;
  }

  return (
    <div className="py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground font-serif">
            {locale === 'az' ? 'Texno' : 'Tech'}
          </h2>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allArticles.map((article, index) => (
            <Link
              key={article.id || index}
              href={`/${locale}/article/${article.slug}`}
              className="block group"
            >
              <div className="relative">
                {/* Thumbnail Image */}
                {article.image_url && (
                  <div className="relative w-full h-56 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-serif line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {locale === 'az' ? '25 dəq dinlə' : '25 MIN LISTEN'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

