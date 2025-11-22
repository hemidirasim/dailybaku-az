import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const dateLocale = locale === 'az' ? az : enUS;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3063'}/api/authors/${id}?locale=${locale}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    const { author, articles } = data;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Author Info */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {author.avatar ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 flex-shrink-0">
                <Image
                  src={author.avatar}
                  alt={author.name || 'Author'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400 flex-shrink-0">
                {author.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{author.name || author.email}</h1>
              {author.bio && (
                <p className="text-gray-600 leading-relaxed">{author.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Author Articles */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {locale === 'az' ? 'Müəllifin Xəbərləri' : 'Author Articles'} ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>{locale === 'az' ? 'Hələ heç bir xəbər yoxdur' : 'No articles yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article.id}
                href={`/${locale}/article/${article.slug}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                {article.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-xs font-bold text-red-600 uppercase mb-2">
                    {article.category}
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                      {article.excerpt}
                    </p>
                  )}
                  {article.published_at && (
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(article.published_at), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
}
