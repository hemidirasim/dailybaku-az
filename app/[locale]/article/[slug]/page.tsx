import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Advertisement } from '@/components/Advertisement';
import ShareButtons from '@/components/ShareButtons';

async function getArticle(slug: string, locale: string) {
  const article = await prisma.article.findFirst({
    where: {
      translations: {
        some: {
          slug,
          locale,
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
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!article) return null;

  // Views sayını artır
  await prisma.article.update({
    where: { id: article.id },
    data: { views: article.views + 1 },
  });

  const translation = article.translations.find((t) => t.locale === locale);
  const categoryTranslation = article.category?.translations.find((t) => t.locale === locale);

  return {
    ...article,
    title: translation?.title || '',
    slug: translation?.slug || '',
    excerpt: translation?.excerpt || '',
    content: translation?.content || '',
    category: article.category
      ? {
          id: article.category.id,
          slug: article.category.slug,
          name: categoryTranslation?.name || article.category.slug,
        }
      : null,
    author: article.author?.name || article.author?.email || 'Admin',
    image_url: article.images.find((img) => img.isPrimary)?.url || article.images[0]?.url || null,
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
      publishedAt: {
        lte: new Date(),
      },
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
    take: 5,
  });

  return articles.map((article) => {
    const translation = article.translations.find((t) => t.locale === locale);
    return {
      id: article.id,
      title: translation?.title || '',
      slug: translation?.slug || '',
      excerpt: translation?.excerpt || '',
      image_url: article.images[0]?.url || null,
      published_at: article.publishedAt,
    };
  });
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

  if (!article) {
    notFound();
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
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
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

            <div className="mt-8 pt-6 border-t">
              <ShareButtons 
                title={article.title} 
                url={`/${locale}/article/${article.slug}`}
                locale={locale}
              />
            </div>
            
            {/* Şəkil qalereyası */}
            {article.images && article.images.length > 1 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                {article.images
                  .filter((img) => !img.isPrimary)
                  .map((image) => (
                    <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.alt || article.title}
                        fill
                        className="object-cover"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
            <Advertisement position="article-bottom" locale={locale} />
          </article>

          <div className="lg:col-span-1">
            <Sidebar recentArticles={recentArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}