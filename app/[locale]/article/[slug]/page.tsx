import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, Edit } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopArticles from '@/components/TopArticles';
import ArticleGallery from '@/components/ArticleGallery';
import { Advertisement } from '@/components/Advertisement';
import ShareButtons from '@/components/ShareButtons';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Metadata } from 'next';

const ArticleImageClient = dynamic(() => import('@/components/ArticleImage'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[250px] md:h-[300px] rounded-lg overflow-hidden bg-gray-200 animate-pulse" />
  ),
});

async function getArticle(slug: string, locale: string) {
  // Əvvəlcə bu slug ilə hər hansı bir translation-da article axtaraq
  const article = await prisma.article.findFirst({
    where: {
      translations: {
        some: {
          slug,
        },
      },
      status: 'published',
      deletedAt: null,
    },
    include: {
      translations: true,
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      category: {
        include: {
          translations: true,
        },
      },
      author: true,
    },
  });

  if (!article) return null;

  // Seçilmiş dil üçün translation tapmağa çalışaq
  const translation = article.translations.find((t: { locale: string }) => t.locale === locale);

  // Əgər seçilmiş dil üçün translation yoxdursa, redirect et
  if (!translation) {
    return { redirect: true, locale };
  }

  // Əgər translation varsa amma title boşdursa, redirect et
  if (!translation.title || translation.title.trim() === '') {
    return { redirect: true, locale };
  }

  // Views sayını artır
  await prisma.article.update({
    where: { id: article.id },
    data: { views: article.views + 1 },
  });

  const categoryTranslation = article.category?.translations.find((t: { locale: string }) => t.locale === locale);

  return {
    ...article,
    id: article.id,
    redirect: false,
    title: translation.title || '',
    slug: translation.slug || '',
    excerpt: translation.excerpt || '',
    content: translation.content || '',
    category: article.category
      ? {
          id: article.category.id,
          slug: article.category.slug,
          name: categoryTranslation?.name || article.category.slug,
        }
      : null,
    author: article.author ? {
      id: article.author.id,
      name: article.author.name || article.author.email || 'Admin',
      email: article.author.email,
      avatar: article.author.avatar,
      bio: locale === 'az' ? article.author.bioAz : article.author.bioEn,
    } : null,
    image_url: article.images.find((img: { isPrimary: boolean }) => img.isPrimary)?.url || article.images[0]?.url || null,
    images: article.images,
    views: article.views + 1,
    published_at: article.publishedAt,
  };
}

async function getRecentArticles(locale: string) {
  try {
    // Əvvəlcə agenda=true olan xəbərləri gətir
    const agendaArticles = await prisma.article.findMany({
      where: {
        agenda: true,
        status: 'published',
        deletedAt: null,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ],
      },
      include: {
        translations: true,
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
      orderBy: {
        publishedAt: { sort: 'desc', nulls: 'last' }
      },
      take: 10,
    });

    // Əgər agenda xəbərləri kifayət etmirsə, digər xəbərləri də gətir
    const remainingLimit = 5 - agendaArticles.length;
    let otherArticles: typeof agendaArticles = [];
    
    if (remainingLimit > 0) {
      otherArticles = await prisma.article.findMany({
        where: {
          agenda: false,
          status: 'published',
          deletedAt: null,
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: new Date() } }
          ],
        },
        include: {
          translations: true,
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
        },
        orderBy: {
          publishedAt: { sort: 'desc', nulls: 'last' }
        },
        take: remainingLimit * 2,
      });
    }

    // Birləşdir: əvvəlcə agenda xəbərləri, sonra digərləri
    const articles = [...agendaArticles, ...otherArticles];

    return articles
      .map((article: typeof articles[0]) => {
        const translation = article.translations.find((t: { locale: string }) => t.locale === locale);
        
        // Əgər translation yoxdursa və ya title boşdursa, null qaytar
        if (!translation || !translation.title || translation.title.trim() === '') {
          return null;
        }
        
        return {
          id: article.id,
          title: translation.title,
          slug: translation.slug || '',
          excerpt: translation.excerpt || '',
          image_url: article.images[0]?.url || null,
          published_at: article.publishedAt,
        };
      })
      .filter((article): article is NonNullable<typeof article> => article !== null)
      .slice(0, 5); // Son 5 qədər götür
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const article = await getArticle(slug, locale);

  if (!article || (article as any).redirect) {
    return {
      title: locale === 'az' ? 'Xəbər tapılmadı' : 'Article not found',
      description: locale === 'az' ? 'Axtardığınız xəbər tapılmadı' : 'The article you are looking for was not found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az';
  const articleUrl = `${baseUrl}/${locale}/article/${article.slug}`;
  const imageUrl = article.image_url 
    ? (article.image_url.startsWith('http') ? article.image_url : `${baseUrl}${article.image_url}`)
    : `${baseUrl}/og-image.jpg`;

  const title = `${article.title} - Daily Baku`;
  const description = article.excerpt || (locale === 'az' 
    ? 'Azərbaycanda və dünyada baş verən son xəbərlər' 
    : 'Latest news from Azerbaijan and around the world');

  return {
    title,
    description,
    keywords: article.category?.name 
      ? `${article.category.name}, ${locale === 'az' ? 'xəbər, Azərbaycan' : 'news, Azerbaijan'}`
      : locale === 'az' ? 'xəbər, Azərbaycan' : 'news, Azerbaijan',
    authors: article.author ? [{ name: article.author.name || 'Daily Baku' }] : undefined,
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: 'Daily Baku',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: locale === 'az' ? 'az_AZ' : 'en_US',
      type: 'article',
      publishedTime: article.published_at ? new Date(article.published_at).toISOString() : undefined,
      modifiedTime: article.published_at ? new Date(article.published_at).toISOString() : undefined,
      authors: article.author ? [article.author.name || 'Daily Baku'] : undefined,
      section: article.category?.name,
      tags: article.category ? [article.category.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: articleUrl,
      languages: {
        'az-AZ': `${baseUrl}/az/article/${article.slug}`,
        'en-US': `${baseUrl}/en/article/${article.slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const [article, recentArticles, session] = await Promise.all([
    getArticle(slug, locale),
    getRecentArticles(locale),
    getServerSession(authOptions),
  ]);

  // Əgər article tapılmadısa, 404
  if (!article) {
    notFound();
  }

  // Əgər article tapıldı amma translation yoxdursa və ya title boşdursa,
  // seçilmiş dilin əsas səhifəsinə redirect
  if ((article as any).redirect) {
    redirect(`/${locale}`);
  }

  // Admin session yoxla
  const isAdmin = session?.user && (session.user as any).role === 'admin';
  const articleId = article.id;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az';
  const articleUrl = `${baseUrl}/${locale}/article/${article.slug}`;
  
  // Helper function to normalize image URLs
  const normalizeImageUrl = (url: string | null | undefined): string => {
    if (!url) return `${baseUrl}/og-image.jpg`;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };
  
  const imageUrl = normalizeImageUrl(article.image_url);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: imageUrl,
    datePublished: article.published_at ? new Date(article.published_at).toISOString() : undefined,
    dateModified: article.published_at ? new Date(article.published_at).toISOString() : undefined,
    author: article.author ? {
      '@type': 'Person',
      name: article.author.name || 'Daily Baku',
    } : {
      '@type': 'Organization',
      name: 'Daily Baku',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Daily Baku',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: article.category?.name,
    keywords: article.category?.name || '',
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
          <article className="lg:col-span-5">
            {/* Print Logo and URL - Only visible when printing */}
            <div className="hidden text-center print-logo">
              <div
                className="font-bold text-center dark:font-normal mb-2"
                style={{ fontFamily: 'Chomsky, serif', fontSize: '2.5rem' }}
              >
                The Daily Baku
                {locale === 'en' && (
                  <div className="text-sm font-normal" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    International
                  </div>
                )}
              </div>
            </div>

            <Advertisement position="article-top" locale={locale} className="no-print" />
            <div className="flex items-center justify-between mb-4 no-print">
              {article.category && (
                <Link href={`/${locale}/category/${article.category.slug}`}>
                  <Badge>{article.category.name}</Badge>
                </Link>
              )}
              {isAdmin && articleId && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  <Link href={`/dashboard/articles/edit/${articleId}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    {locale === 'az' ? 'Redaktə et' : 'Edit'}
                  </Link>
                </Button>
              )}
            </div>

            {/* Title, Date və Foto - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Sol tərəf - Title və Tarix */}
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold mb-4 leading-tight">
                  {article.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-muted-foreground print-date">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 print:hidden" />
                    <span>
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString(locale === 'az' ? 'az-AZ' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>
                  {article.published_at && (
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(article.published_at).toLocaleTimeString(locale === 'az' ? 'az-AZ' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ tərəf - Foto */}
              {article.image_url && (
                <ArticleImageClient
                  imageUrl={normalizeImageUrl(article.image_url)}
                  alt={article.title}
                />
              )}
            </div>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed no-print">
                {article.excerpt}
              </p>
            )}

            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Print Copyright - Only visible when printing */}
            <div className="hidden print-copyright mt-8 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-600 text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
                © {new Date().getFullYear()} The Daily Baku. {locale === 'az' ? 'Bütün hüquqlar qorunur.' : 'All rights reserved.'}
              </p>
              {/* Print URL - Copyright-dan aşağıda */}
              <div className="text-xs text-gray-600 print-url text-center mt-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
                {articleUrl}
              </div>
            </div>

            {/* Şəkil Qalereyası - Content-dən sonra */}
            {article.images && article.images.length > 1 && (
              <ArticleGallery images={article.images} title={article.title} className="no-print" />
            )}

            <div className="mt-8 pt-6 border-t no-print">
              <ShareButtons 
                title={article.title} 
                url={`/${locale}/article/${article.slug}`}
                locale={locale}
              />
            </div>
            
            <Advertisement position="article-bottom" locale={locale} className="no-print" />
          </article>

          <div className="lg:col-span-3">
            <Sidebar recentArticles={recentArticles} />
          </div>
        </div>

        {/* TopArticles - Mobile versiyada article-dan sonra */}
        <div className="lg:hidden mt-8">
          <TopArticles locale={locale} />
        </div>
      </div>
    </div>
  );
}
