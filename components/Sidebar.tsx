'use client';

import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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

async function getMoreArticles(locale: string, offset: number = 0, limit: number = 10) {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/recent?locale=${locale}&limit=${limit}&offset=${offset}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching more articles:', error);
    return [];
  }
}

export default function Sidebar({ recentArticles: initialArticles }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<RecentArticle[]>(initialArticles);
  const [offset, setOffset] = useState(initialArticles.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLLIElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pathname, setPathname] = useState<string>('');
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const locale = useMemo(() => {
    if (typeof window === 'undefined' || !pathname) return 'az';
    const segments = pathname.split('/');
    return segments[1] === 'en' ? 'en' : 'az';
  }, [pathname]);

  useEffect(() => {
    // Client-side only
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    const currentPathname = window.location.pathname;
    setPathname(currentPathname);
    
    // İlk xəbərləri set et
    setArticles(initialArticles);
    setOffset(initialArticles.length);
  }, [initialArticles]);

  // Loading və hasMore ref-lərini update et
  useEffect(() => {
    loadingRef.current = loading;
    hasMoreRef.current = hasMore;
  }, [loading, hasMore]);

  // Daha çox xəbər yüklə
  const loadMoreArticles = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    
    loadingRef.current = true;
    // Loading state-i gizlət - gözləmə olmadan yüklə
    // setLoading(true);
    
    try {
      const currentOffset = offset;
      const newArticles = await getMoreArticles(locale, currentOffset, 10);
      
      if (newArticles.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        setArticles(prev => {
          // Duplicate olmaması üçün yoxla
          const existingIds = new Set(prev.map(a => a.id));
          const uniqueNewArticles = newArticles.filter((a: RecentArticle) => !existingIds.has(a.id));
          return [...prev, ...uniqueNewArticles];
        });
        setOffset(currentOffset + newArticles.length);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      loadingRef.current = false;
      // setLoading(false);
    }
  }, [locale, offset]);

  // Scroll event listener ilə scroll-u izlə
  useEffect(() => {
    if (!scrollContainerRef.current || !mounted) return;

    const container = scrollContainerRef.current;
    
    const handleScroll = () => {
      if (loadingRef.current || !hasMoreRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;
      
      // Əgər scroll bottom 500px-dən azdırsa, yüklə (daha tez preload)
      if (scrollBottom < 500) {
        loadMoreArticles();
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreArticles, mounted]);

  return (
    <aside className="space-y-8">
      <Advertisement position="sidebar" locale={locale} />
      <div className="border border-border rounded-lg p-6 bg-card">
        <h3 className="text-lg font-bold mb-4">
          <span className="text-red-600 dark:text-red-400">{locale === 'az' ? 'Xəbər lenti' : 'News Feed'}</span>
        </h3>
        <div 
          ref={scrollContainerRef}
          className="max-h-[600px] overflow-y-auto pr-2"
        >
          <ul className="space-y-4">
            {articles.map((article, index) => (
              <li key={article.id} className="flex items-start gap-3">
                {article.image_url && (
                  <Link
                    href={`/${locale}/article/${article.slug}`}
                    className="flex-shrink-0 w-20 h-20 rounded overflow-hidden relative"
                  >
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  {article.published_at && mounted && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(article.published_at), 'dd MMMM yyyy, HH:mm', { 
                        locale: locale === 'az' ? az : enUS 
                      })}
                    </p>
                  )}
                  <Link
                    href={`/${locale}/article/${article.slug}`}
                    className="text-[15px] font-medium hover:text-red-600 dark:hover:text-red-400 transition-colors block"
                  >
                    {article.title}
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {/* Sentinel element for infinite scroll - hidden, no loading indicator */}
            {hasMore && (
              <li ref={sentinelRef} className="h-1" />
            )}
          </ul>
        </div>
      </div>
    </aside>
  );
}