'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

async function getPoliticalArticles(locale: string = 'az') {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/category/siyaset?locale=${locale}&limit=15`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any) => ({
      ...article,
      image_url: article.image_url || article.image || article.imageUrl || null,
      categories: article.category ? { name: article.category, slug: article.category_slug || 'siyaset' } : null,
      published_at: article.published_at,
      excerpt: article.excerpt || '',
      author: article.author || '',
      role: article.role || '',
    }));
  } catch (error) {
    console.error('Error fetching political articles:', error);
    return [];
  }
}

export default function ArticleDetailSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getPoliticalArticles(currentLocale).then(setArticles);
  }, [pathname]);

  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);
  const bottomArticles = secondaryArticles;
  const sidebarArticles = articles.slice(3, 9).map((article: any) => ({
    title: article.title || '',
    slug: article.slug || null,
  }));
  const sideArticles = articles.slice(9, 11);
  const sideArticle1 = sideArticles[0];
  const sideArticle2 = sideArticles[1];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateLocale = locale === 'az' ? 'az-AZ' : 'en-US';
    const month = date.toLocaleDateString(dateLocale, { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });
    return `${time} • ${month} ${day}, ${year}`;
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground font-serif">
            {locale === 'az' ? 'Siyasət' : 'Politics'}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {sidebarArticles.length > 0 ? (
              sidebarArticles.map((article, index) => (
                <div key={article.slug || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  {article.slug ? (
                    <Link href={`/${locale}/article/${article.slug}`}>
                      <h3 className="text-sm font-bold text-foreground leading-tight hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                      {article.title}
                    </h3>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                {locale === 'az' ? 'Siyasi xəbərlər yüklənir...' : 'Loading political news...'}
              </div>
            )}
          </div>

          {/* Main Article - Center */}
          <div className="lg:col-span-7">
            {heroArticle ? (
              <>
                <div className="relative mb-6">
                  <Image
                    src={heroArticle.image_url || '/placeholder-news.jpg'}
                    alt={heroArticle.title}
                    width={800}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {heroArticle.slug ? (
                  <Link href={`/${locale}/article/${heroArticle.slug}`}>
                    <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                      {heroArticle.title}
                    </h1>
                  </Link>
                ) : (
                  <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                    {heroArticle.title}
                  </h1>
                )}

                {heroArticle.excerpt && (
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {heroArticle.excerpt}
                  </p>
                )}

                {/* Two Articles Below Main Article */}
                {bottomArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {bottomArticles.map((article: any, index: number) => {
                      return (
                        <div key={article.id || index}>
                          <div className="relative mb-4">
                            <Image
                              src={article.image_url || '/placeholder-news.jpg'}
                              alt={article.title}
                              width={400}
                              height={250}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                          {article.slug ? (
                            <Link href={`/${locale}/article/${article.slug}`}>
                              <h2 className="text-xl font-bold text-foreground mb-2 leading-tight hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                                {article.title}
                              </h2>
                            </Link>
                          ) : (
                            <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
                              {article.title}
                            </h2>
                          )}
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>{locale === 'az' ? 'Siyasi xəbərlər yüklənir...' : 'Loading political news...'}</p>
              </div>
            )}
          </div>

          {/* Side Articles - Right */}
          <div className="lg:col-span-3 space-y-8">
            {/* First Side Article */}
            {sideArticle1 && (
              <div>
                <div className="relative mb-4">
                  <Image
                    src={sideArticle1.image_url || '/placeholder-news.jpg'}
                    alt={sideArticle1.title}
                    width={300}
                    height={200}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {sideArticle1.slug ? (
                  <Link href={`/${locale}/article/${sideArticle1.slug}`}>
                    <h2 className="text-lg font-bold text-foreground mb-3 leading-tight hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                      {sideArticle1.title}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-lg font-bold text-foreground mb-3 leading-tight">
                    {sideArticle1.title}
                  </h2>
                )}

                {sideArticle1.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {sideArticle1.excerpt}
                  </p>
                )}

                {sideArticle1.published_at && (
                  <p className="text-xs text-muted-foreground mb-4">
                    {sideArticle1.author && sideArticle1.role ? (
                      <>By {sideArticle1.author} / {sideArticle1.role} on {formatDate(sideArticle1.published_at)}</>
                    ) : (
                      formatDate(sideArticle1.published_at)
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Second Side Article */}
            {sideArticle2 && (
              <div>
                <div className="relative mb-4">
                  <Image
                    src={sideArticle2.image_url || '/placeholder-news.jpg'}
                    alt={sideArticle2.title}
                    width={300}
                    height={200}
                    className="w-full h-auto object-cover"
                  />
                </div>

                {sideArticle2.slug ? (
                  <Link href={`/${locale}/article/${sideArticle2.slug}`}>
                    <h2 className="text-lg font-bold text-foreground mb-3 leading-tight hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                      {sideArticle2.title}
                    </h2>
                  </Link>
                ) : (
                  <h2 className="text-lg font-bold text-foreground mb-3 leading-tight">
                    {sideArticle2.title}
                  </h2>
                )}

                {sideArticle2.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {sideArticle2.excerpt}
                  </p>
                )}

                {sideArticle2.published_at && (
                  <p className="text-xs text-muted-foreground mb-4">
                    {sideArticle2.author && sideArticle2.role ? (
                      <>By {sideArticle2.author} / {sideArticle2.role} on {formatDate(sideArticle2.published_at)}</>
                    ) : (
                      formatDate(sideArticle2.published_at)
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

