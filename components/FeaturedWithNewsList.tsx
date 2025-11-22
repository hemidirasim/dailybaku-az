'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

async function getFeaturedArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3063');
    const response = await fetch(
      `${baseUrl}/api/articles/featured?locale=${locale}&limit=5`,
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

async function getRecentArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3063');
    const response = await fetch(
      `${baseUrl}/api/articles/recent?locale=${locale}&limit=20`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

export default function FeaturedWithNewsList() {
  const pathname = usePathname();
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);
    setLoading(true);

    Promise.all([
      getFeaturedArticles(currentLocale).then((articles) => {
        console.log('FeaturedWithNewsList - Featured articles loaded:', articles.length);
        setFeaturedArticles(articles);
        return articles;
      }),
      getRecentArticles(currentLocale).then((articles) => {
        console.log('FeaturedWithNewsList - Recent articles loaded:', articles.length);
        setRecentArticles(articles);
        return articles;
      })
    ]).finally(() => {
      setLoading(false);
    });
  }, [pathname]);

  const displayFeatured = featuredArticles;
  const displayRecent = recentArticles;

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
      <div className="border-b border-gray-200 pb-6 bg-white min-h-[500px]" data-testid="featured-with-news-list">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
          <p>Xəbərlər yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 pb-6 bg-white" data-testid="featured-with-news-list">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol tərəf - 2 div: Manşet və Yeni Blok */}
          <div className="lg:col-span-2 space-y-6">
            {/* Div 1: Manşet Slider */}
            <div className="relative">
              {displayFeatured.length > 0 ? (
                <>
                  <div className="overflow-hidden rounded-lg relative">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                      {displayFeatured.map((article: any) => (
                        <div key={article.id} className="flex-[0_0_100%] min-w-0 relative h-[500px]">
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
                            <div className="absolute top-4 left-4">
                              <div className="bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                {article.category || 'SPORT'}
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <h2 className="text-3xl font-bold mb-2 group-hover:text-red-600 transition-colors">
                                {article.title}
                              </h2>
                              {article.excerpt && (
                                <p className="text-gray-200 mb-2">{article.excerpt}</p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>{formatDistanceToNow(new Date(article.published_at), { 
                                  addSuffix: true,
                                  locale: locale === 'az' ? az : enUS
                                })}</span>
                              </div>
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
                <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg">
                  <p>{locale === 'az' ? 'Featured xəbərlər yoxdur' : 'No featured articles'}</p>
                </div>
              )}
            </div>

            {/* Div 2: Yeni Blok - Solda 1 böyük xəbər, Sağda 4 kiçik xəbər */}
            {displayRecent.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol tərəf - 1 böyük xəbər */}
                <div className="lg:col-span-2">
                  {displayRecent[0] && (
                    <Link
                      href={`/${locale}/article/${displayRecent[0].slug}`}
                      className="block group"
                    >
                      <div className="relative w-full h-[400px] mb-4 rounded-lg overflow-hidden">
                        <img
                          src={displayRecent[0].image || displayRecent[0].imageUrl || displayRecent[0].image_url || "/demo/news1.jpg"}
                          alt={displayRecent[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-red-600 transition-colors">
                        {displayRecent[0].title}
                      </h3>
                      {displayRecent[0].published_at && (
                        <p className="text-sm text-gray-500">
                          {new Date(displayRecent[0].published_at).toLocaleDateString(
                            locale === 'az' ? 'az-AZ' : 'en-US',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </p>
                      )}
                    </Link>
                  )}
                </div>

                {/* Sağ tərəf - 4 kiçik xəbər */}
                <div className="lg:col-span-1">
                  <div className="space-y-4">
                    {displayRecent.slice(1, 5).map((article, index) => (
                      <Link
                        key={article.id || index}
                        href={`/${locale}/article/${article.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={article.image || article.imageUrl || article.image_url || "/demo/news1.jpg"}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold mb-2 group-hover:text-red-600 transition-colors ">
                            {article.title}
                          </h4>
                          {article.published_at && (
                            <p className="text-xs text-gray-500">
                              {new Date(article.published_at).toLocaleDateString(
                                locale === 'az' ? 'az-AZ' : 'en-US',
                                { day: 'numeric', month: 'long', year: 'numeric' }
                              )}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sağ tərəf - 1 div: Xəbər lenti */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-white sticky top-4">
              <h3 className="text-lg font-bold mb-4">
                <span className="text-red-600">Xəbər lenti</span>
              </h3>
              {displayRecent.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <ul className="space-y-4">
                    {displayRecent.map((article) => {
                      const date = new Date(article.published_at);
                      const dateLocale = locale === 'az' ? az : enUS;
                      const dateStr = format(date, 'd MMMM yyyy, HH:mm', { locale: dateLocale });

                      return (
                        <li key={article.id} className="flex items-start gap-2">
                          <span className="text-red-600 text-lg mt-1">•</span>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              {dateStr}
                            </p>
                            {article.slug ? (
                              <Link
                                href={`/${locale}/article/${article.slug}`}
                                className="text-sm font-medium hover:text-red-600 transition-colors block"
                              >
                                {article.title}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium">{article.title}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>{locale === 'az' ? 'Xəbər yoxdur' : 'No news'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
