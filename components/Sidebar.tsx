'use client';

import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Advertisement } from '@/components/Advertisement';

interface RecentArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string | null;
  published_at: Date | string | null;
}

interface SidebarProps {
  recentArticles: RecentArticle[];
}

export default function Sidebar({ recentArticles }: SidebarProps) {
  const pathname = usePathname();
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] === 'en' ? 'en' : 'az';
  }, [pathname]);
  return (
    <aside className="space-y-8">
      <Advertisement position="sidebar" locale={locale} />
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">
          <span className="text-red-600">Xəbər lenti</span>
        </h3>
        <ul className="space-y-4">
          {recentArticles.map((article) => (
            <li key={article.id} className="flex items-start gap-2">
              <span className="text-red-600 text-lg mt-1">•</span>
              <div className="flex-1">
                {article.published_at && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {format(new Date(article.published_at), 'dd MMMM yyyy, HH:mm', { 
                      locale: locale === 'az' ? az : enUS 
                    })}
                  </p>
                )}
                <Link
                  href={`/${locale}/article/${article.slug}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {article.title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}