import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

async function getArticle(slug: string) {
  const { data: article } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('slug', slug)
    .maybeSingle();

  if (!article) return null;

  await supabase
    .from('articles')
    .update({ views: article.views + 1 })
    .eq('id', article.id);

  return article;
}

async function getRecentArticles() {
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(5);

  return articles || [];
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, recentArticles] = await Promise.all([
    getArticle(params.slug),
    getRecentArticles(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            {article.categories && (
              <Link href={`/category/${article.categories.slug}`}>
                <Badge className="mb-4">{article.categories.name}</Badge>
              </Link>
            )}

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.published_at).toLocaleDateString('az-AZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
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

            <div className="prose prose-lg max-w-none">
              {article.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <div className="lg:col-span-1">
            <Sidebar recentArticles={recentArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}