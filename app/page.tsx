import { supabase } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

async function getArticles() {
  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .order('published_at', { ascending: false })
    .limit(10);

  return articles || [];
}

async function getFeaturedArticle() {
  const { data: article } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('featured', true)
    .single();

  return article;
}

export default async function Home() {
  const [featuredArticle, articles] = await Promise.all([
    getFeaturedArticle(),
    getArticles(),
  ]);

  const regularArticles = articles.filter((a) => !a.featured).slice(0, 3);
  const recentArticles = articles.slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {featuredArticle && (
              <div className="relative">
                <ArticleCard article={featuredArticle} featured />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Sidebar recentArticles={recentArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}