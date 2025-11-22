import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopArticles from '@/components/TopArticles';
import ArticleGallery from '@/components/ArticleGallery';
import { Advertisement } from '@/components/Advertisement';
import ShareButtons from '@/components/ShareButtons';

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
  const articles = await prisma.article.findMany({
    where: {
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
      publishedAt: 'desc',
    },
    take: 10, // Daha çox götür ki, title-i olmayanları filter etdikdən sonra kifayət qədər olsun
  });

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
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const [article, recentArticles] = await Promise.all([
    getArticle(slug, locale),
    getRecentArticles(locale),
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <Advertisement position="article-top" locale={locale} />
            {article.category && (
              <Link href={`/${locale}/category/${article.category.slug}`}>
                <Badge className="mb-4">{article.category.name}</Badge>
              </Link>
            )}

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="mb-6">
              <ShareButtons 
                title={article.title} 
                url={`/${locale}/article/${article.slug}`}
                locale={locale}
              />
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              {article.author && (
                <Link 
                  href={`/${locale}/author/${article.author.id}`}
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{article.author.name}</span>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
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
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{article.views} views</span>
              </div>
            </div>

            {article.image_url && (
              <div className="relative w-full h-[500px] mb-8 rounded-lg overflow-hidden">
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Şəkil Qalereyası - Content-dən sonra */}
            {article.images && article.images.length > 1 && (
              <ArticleGallery images={article.images} title={article.title} />
            )}

            <div className="mt-8 pt-6 border-t">
              <ShareButtons 
                title={article.title} 
                url={`/${locale}/article/${article.slug}`}
                locale={locale}
              />
            </div>
            
            {/* Author Info Box */}
            {article.author && (
              <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <Link 
                  href={`/${locale}/author/${article.author.id}`}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 hover:opacity-80 transition-opacity group"
                >
                  {article.author.avatar ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 flex-shrink-0">
                      <Image
                        src={article.author.avatar}
                        alt={article.author.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600 flex-shrink-0">
                      {article.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-red-600 transition-colors">
                      {article.author.name}
                    </h3>
                    {article.author.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {article.author.bio}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            )}
            
            <Advertisement position="article-bottom" locale={locale} />
          </article>

          <div className="lg:col-span-1">
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
