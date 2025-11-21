'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

async function getGundemArticles(locale: string = 'az') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/category/gndm?locale=${locale}&limit=6`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching gundem articles:', error);
    return [];
  }
}

export default function GundemSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [loading, setLoading] = useState(true);

  const dateLocale = useMemo(() => (locale === 'az' ? az : enUS), [locale]);

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);
    setLoading(true);

    getGundemArticles(currentLocale)
      .then(setArticles)
      .finally(() => setLoading(false));
  }, [pathname]);

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            {locale === 'az' ? 'Gündəm' : 'Agenda'}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{locale === 'az' ? 'Yüklənir...' : 'Loading...'}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{locale === 'az' ? 'Gündəm xəbərləri yoxdur' : 'No agenda news'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
            const formattedDate = article.published_at
              ? formatDistanceToNow(new Date(article.published_at), {
                  addSuffix: true,
                  locale: dateLocale,
                })
              : '';
            
            const formattedTime = article.published_at
              ? new Date(article.published_at).toLocaleTimeString(locale === 'az' ? 'az-AZ' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div key={article.id} className="group">
                <Link href={`/${locale}/article/${article.slug}`} className="block">
                  {article.image_url && (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  {article.category && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formattedTime}</span>
                    <span className="mx-1">•</span>
                    <span>{formattedDate}</span>
                  </div>
                </Link>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}

