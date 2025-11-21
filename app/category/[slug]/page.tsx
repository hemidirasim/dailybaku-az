import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';

async function getCategory(slug: string) {
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  return category;
}

async function getCategoryArticles(categoryId: string) {
  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false });

  return articles || [];
}

async function getRecentArticles() {
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(5);

  return articles || [];
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  const [articles, recentArticles] = await Promise.all([
    getCategoryArticles(category.id),
    getRecentArticles(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{category.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article: typeof articles[0]) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {articles.length === 0 && (
              <p className="text-muted-foreground text-center py-12">
                Bu kateqoriyada hələ xəbər yoxdur.
              </p>
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