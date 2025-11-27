'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { az as azLocale, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BusinessNewsSection from '@/components/BusinessNewsSection';

async function getFeaturedArticles(locale: string = 'az', limit: number = 20) {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/featured?locale=${locale}&limit=${limit}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any, index: number) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || `https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800`,
    }));
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

async function getRecentArticles(locale: string = 'az', limit: number = 10) {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/recent?locale=${locale}&limit=${limit}&offset=0`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

async function getAgendaArticles(locale: string = 'az', limit: number = 6) {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    // Gündəm kateqoriyasından xəbərləri gətir
    const response = await fetch(
      `${baseUrl}/api/articles/category/gundem?locale=${locale}&limit=${limit}`,
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
    console.error('Error fetching agenda articles:', error);
    return [];
  }
}


export default function FeaturedWithNewsList() {
  const pathname = usePathname();
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [agendaArticles, setAgendaArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);
    setLoading(true);

    // Bütün featured xəbərləri gətir (manşet üçün 5, grid üçün qalan)
    Promise.all([
      getFeaturedArticles(currentLocale, 20).then((articles) => {
        console.log('FeaturedWithNewsList - Featured articles loaded:', articles.length);
        setFeaturedArticles(articles);
        return articles;
      }),
      getRecentArticles(currentLocale).then((articles) => {
        console.log('FeaturedWithNewsList - Recent articles loaded:', articles.length);
        setRecentArticles(articles);
        return articles;
      }),
      getAgendaArticles(currentLocale, 6).then((articles) => {
        console.log('FeaturedWithNewsList - Agenda articles loaded:', articles.length);
        setAgendaArticles(articles);
        return articles;
      })
    ]).finally(() => {
      setLoading(false);
    });
  }, [pathname]);

  // Manşetdə ilk 5 featured xəbər
  const displayFeatured = featuredArticles.slice(0, 5);
  // Grid-də gündəm xəbərləri
  const recentGridArticles = agendaArticles.slice(0, 6); // İlk 6 gündəm xəbəri

  // Auto-play slider
  useEffect(() => {
    if (displayFeatured.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === displayFeatured.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [displayFeatured.length]);

  const scrollPrev = () => setCurrentSlide((prev) => (prev === 0 ? displayFeatured.length - 1 : prev - 1));
  const scrollNext = () => setCurrentSlide((prev) => (prev === displayFeatured.length - 1 ? 0 : prev + 1));

  // Always render component
  if (loading) {
    return (
      <div className="border-b border-border pb-6 bg-background min-h-[500px]" data-testid="featured-with-news-list">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">
          <p>{locale === 'az' ? 'Xəbərlər yüklənir...' : 'Loading news...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border pb-6 bg-background" data-testid="featured-with-news-list">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Sol tərəf - 2 div: Manşet və Yeni Blok */}
          <div className="lg:col-span-5 space-y-6">
            {/* Div 1: Manşet Slider */}
            <div className="relative">
              {displayFeatured.length > 0 ? (
                <>
                  <div className="overflow-hidden rounded-lg relative">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                      {displayFeatured.map((article: any) => (
                        <div key={article.id} className="flex-[0_0_100%] min-w-0 relative h-[350px]">
                          <Link
                            href={article.slug ? `/${locale}/article/${article.slug}` : '#'}
                            className="group block relative h-full w-full overflow-hidden rounded-lg"
                          >
                            <img
                              src={article.image_url || article.image || article.imageUrl || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'}
                              alt={article.title}
                              className="object-cover transition-transform group-hover:scale-105 w-full h-full"
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <h2 className="text-3xl font-bold mb-2 group-hover:text-red-600 transition-colors">
                                {article.title}
                              </h2>
                              <p className="text-gray-200 mb-2">
                                {article.excerpt || article.title.substring(0, 150) + '...'}
                              </p>
                              {mounted && article.published_at && (
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                  <span>
                                    {format(new Date(article.published_at), 'HH:mm', { locale: locale === 'az' ? azLocale : enUS })}
                                  </span>
                                  <span className="mx-1">•</span>
                                  <span>
                                    {formatDistanceToNow(new Date(article.published_at), { 
                                      addSuffix: true,
                                      locale: locale === 'az' ? azLocale : enUS
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Navigation Buttons */}
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted rounded-lg">
                  <p>{locale === 'az' ? 'Featured xəbərlər yoxdur' : 'No featured articles'}</p>
                </div>
              )}
            </div>

            {/* Div 2: 6 bərabər blok */}
            {recentGridArticles.length > 0 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-foreground font-serif">
                    {locale === 'az' ? 'Gündəm' : 'Agenda'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentGridArticles.map((article, index) => (
                  <Link
                    key={article.id || index}
                    href={`/${locale}/article/${article.slug}`}
                    className="group block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-full h-48">
                      <img
                        src={article.image || article.imageUrl || article.image_url || '/demo/news1.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-lg font-bold leading-tight group-hover:text-red-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt || article.title.substring(0, 100) + '...'}
                      </p>
                      {article.published_at && mounted && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(article.published_at), 'HH:mm', { locale: locale === 'az' ? azLocale : enUS })}
                          <span className="mx-1">•</span>
                          {format(new Date(article.published_at), locale === 'az' ? 'd MMMM yyyy' : 'MMMM d, yyyy', { locale: locale === 'az' ? azLocale : enUS })}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ tərəf - 1 div: Xəbər lenti və Biznes xəbərləri */}
          <div className="lg:col-span-3">
            <Sidebar recentArticles={recentArticles} />
            <BusinessNewsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
