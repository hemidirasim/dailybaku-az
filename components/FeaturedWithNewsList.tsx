'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const demoImages = [
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1591055/pexels-photo-1591055.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
];

async function getFeaturedArticles(locale: string = 'az') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/featured?locale=${locale}&limit=5`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any, index: number) => ({
      ...article,
      image_url: article.image_url || demoImages[index % demoImages.length],
    }));
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

async function getRecentArticles(locale: string = 'az') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/recent?locale=${locale}&limit=5`,
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    dragFree: false,
    align: 'start',
  });

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getFeaturedArticles(currentLocale).then(setFeaturedArticles);
    getRecentArticles(currentLocale).then(setRecentArticles);
  }, [pathname]);

  const displayFeatured = featuredArticles;
  const displayRecent = recentArticles;

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Don't render if no articles
  if (displayFeatured.length === 0 && displayRecent.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Article Slider - Left Side */}
          <div className="lg:col-span-2 relative">
            {displayFeatured.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                  <div className="flex">
                    {displayFeatured.map((article: any) => (
                      <div key={article.id} className="flex-[0_0_100%] min-w-0 relative h-[500px]">
                        <Link
                          href={article.slug ? `/${locale}/article/${article.slug}` : '#'}
                          className="group block relative h-full w-full overflow-hidden rounded-lg"
                        >
                          <Image
                            src={article.image_url || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105 grayscale"
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
              <div className="text-center py-12 text-muted-foreground">
                <p>{locale === 'az' ? 'Featured xəbərlər yoxdur' : 'No featured articles'}</p>
              </div>
            )}
          </div>

          {/* News List - Right Side */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-white">
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

