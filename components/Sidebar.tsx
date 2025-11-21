'use client';

import { Article } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Advertisement } from '@/components/Advertisement';

interface SidebarProps {
  recentArticles: Article[];
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
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(article.published_at).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
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