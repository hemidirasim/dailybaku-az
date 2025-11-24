'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

async function getLifeStyleArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/life-style?locale=${locale}&limit=3`,
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
    }));
  } catch (error) {
    console.error('Error fetching lifestyle articles:', error);
    return [];
  }
}

async function getEducationArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/tehsil?locale=${locale}&limit=3`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'tehsil' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
    }));
  } catch (error) {
    console.error('Error fetching education articles:', error);
    return [];
  }
}

async function getTravelArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/seyahet?locale=${locale}&limit=3`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'seyahet' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
    }));
  } catch (error) {
    console.error('Error fetching travel articles:', error);
    return [];
  }
}

async function getAutoArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/avto?locale=${locale}&limit=4`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'avto' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
      author: article.author || '',
      role: article.role || '',
    }));
  } catch (error) {
    console.error('Error fetching auto articles:', error);
    return [];
  }
}

export default function WorldReportSection() {
  const pathname = usePathname();
  const [autoArticles, setAutoArticles] = useState<any[]>([]);
  const [lifeStyleArticles, setLifeStyleArticles] = useState<any[]>([]);
  const [educationArticles, setEducationArticles] = useState<any[]>([]);
  const [travelArticles, setTravelArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    Promise.all([
      getAutoArticles(currentLocale),
      getLifeStyleArticles(currentLocale),
      getEducationArticles(currentLocale),
      getTravelArticles(currentLocale),
    ]).then(([auto, lifestyle, education, travel]) => {
      setAutoArticles(auto);
      setLifeStyleArticles(lifestyle);
      setEducationArticles(education);
      setTravelArticles(travel);
    });
  }, [pathname]);

  const mainArticle = autoArticles[0];
  const bottomArticles = autoArticles.slice(1, 4);
  
  // Life Style xəbərləri Modul 1 üçün
  const lifeStyleSidebarArticles = useMemo(() => {
    return lifeStyleArticles.map((article: any) => ({
      category: article.categories?.name || article.category || (locale === 'az' ? 'Life Style' : 'Life Style'),
      title: article.title,
      excerpt: article.excerpt || '',
      slug: article.slug,
      published_at: article.published_at,
    }));
  }, [lifeStyleArticles, locale]);

  // Təhsil xəbərləri Modul 2 üçün
  const educationSidebarArticles = useMemo(() => {
    return educationArticles.map((article: any) => ({
      category: article.categories?.name || article.category || (locale === 'az' ? 'Təhsil' : 'Education'),
      title: article.title,
      excerpt: article.excerpt || '',
      slug: article.slug,
      published_at: article.published_at,
    }));
  }, [educationArticles, locale]);

  // Səyahət xəbərləri Modul 3 üçün
  const travelSidebarArticles = useMemo(() => {
    return travelArticles.map((article: any) => ({
      category: article.categories?.name || article.category || (locale === 'az' ? 'Səyahət' : 'Travel'),
      title: article.title,
      excerpt: article.excerpt || '',
      slug: article.slug,
      published_at: article.published_at,
    }));
  }, [travelArticles, locale]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm • d MMMM, yyyy', {
        locale: locale === 'en' ? enUS : az,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="border-b border-border pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Article - Left */}
          <div className="lg:col-span-6">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-foreground font-serif">
                {locale === 'az' ? 'Avto' : 'Auto'}
              </h2>
            </div>
            {!mainArticle ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{locale === 'az' ? 'Avto xəbərləri yüklənir...' : 'Loading auto news...'}</p>
              </div>
            ) : (
              <>
                {/* Əsas xəbər */}
                {mainArticle.slug ? (
                  <Link href={`/${locale}/article/${mainArticle.slug}`} className="block group">
                    {mainArticle.image_url && (
                      <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-4">
                        <Image
                          src={mainArticle.image_url}
                          alt={mainArticle.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight font-serif group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {mainArticle.title}
                    </h1>
                  </Link>
                ) : (
                  <>
                    {mainArticle.image_url && (
                      <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-4">
                        <Image
                          src={mainArticle.image_url}
                          alt={mainArticle.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight font-serif">
                      {mainArticle.title}
                    </h1>
                  </>
                )}

                {mainArticle.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                    {mainArticle.excerpt}
                  </p>
                )}

                {mainArticle.published_at && mounted && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(mainArticle.published_at)}</span>
                  </div>
                )}

                {/* Aşağıdakı 3 kiçik xəbər */}
                {bottomArticles.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="space-y-4">
                      {bottomArticles.map((article: any, index: number) => (
                        <div key={article.id || index}>
                          {article.slug ? (
                            <Link href={`/${locale}/article/${article.slug}`} className="block group">
                              <div className="flex gap-3">
                                {article.image_url && (
                                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                                    <Image
                                      src={article.image_url}
                                      alt={article.title}
                                      width={96}
                                      height={96}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-serif line-clamp-2">
                                    {article.title}
                                  </h3>
                                  {article.published_at && mounted && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{format(new Date(article.published_at), 'HH:mm', { locale: locale === 'en' ? enUS : az })}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex gap-3">
                              {article.image_url && (
                                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                                  <Image
                                    src={article.image_url}
                                    alt={article.title}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 font-serif line-clamp-2">
                                  {article.title}
                                </h3>
                                {article.published_at && mounted && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{format(new Date(article.published_at), 'HH:mm', { locale: locale === 'en' ? enUS : az })}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebars - Right (3 Columns) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Module 1 - Life Style Column */}
              <div>
                <h3 className="text-xs font-bold text-foreground capitalize mb-3 pb-2 border-b border-border">
                  {locale === 'az' ? 'Life Style' : 'Life Style'}
                </h3>
                <div className="space-y-4">
                  {lifeStyleSidebarArticles.map((article, index) => (
                    <div
                      key={index}
                      className={index < lifeStyleSidebarArticles.length - 1 ? 'pb-4 border-b border-border' : ''}
                    >
                      {article.slug ? (
                        <Link
                          href={`/${locale}/article/${article.slug}`}
                          className="block group"
                        >
                          <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-serif">
                            {article.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 font-serif">
                          {article.title}
                        </h3>
                      )}
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      {article.published_at && mounted && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(article.published_at), 'HH:mm', { locale: locale === 'en' ? enUS : az })}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Module 2 - Education Column */}
              <div>
                <h3 className="text-xs font-bold text-foreground capitalize mb-3 pb-2 border-b border-border">
                  {locale === 'az' ? 'Təhsil' : 'Education'}
                </h3>
                <div className="space-y-4">
                  {educationSidebarArticles.map((article, index) => (
                    <div
                      key={index}
                      className={index < educationSidebarArticles.length - 1 ? 'pb-4 border-b border-border' : ''}
                    >
                      {article.slug ? (
                        <Link
                          href={`/${locale}/article/${article.slug}`}
                          className="block group"
                        >
                          <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-serif">
                            {article.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 font-serif">
                          {article.title}
                        </h3>
                      )}
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      {article.published_at && mounted && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(article.published_at), 'HH:mm', { locale: locale === 'en' ? enUS : az })}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Module 3 - Travel Column */}
              <div>
                <h3 className="text-xs font-bold text-foreground capitalize mb-3 pb-2 border-b border-border">
                  {locale === 'az' ? 'Səyahət' : 'Travel'}
                </h3>
                <div className="space-y-4">
                  {travelSidebarArticles.map((article, index) => (
                    <div
                      key={index}
                      className={index < travelSidebarArticles.length - 1 ? 'pb-4 border-b border-border' : ''}
                    >
                      {article.slug ? (
                        <Link
                          href={`/${locale}/article/${article.slug}`}
                          className="block group"
                        >
                          <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-serif">
                            {article.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 font-serif">
                          {article.title}
                        </h3>
                      )}
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      {article.published_at && mounted && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(article.published_at), 'HH:mm', { locale: locale === 'en' ? enUS : az })}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

