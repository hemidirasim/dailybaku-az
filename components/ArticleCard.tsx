import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  article: Article & { categories?: { name: string; slug: string } };
  featured?: boolean;
}

export default function ArticleCard({
  article,
  featured = false,
}: ArticleCardProps) {
  const formattedDate = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
  });

  if (featured) {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block relative h-[500px] overflow-hidden rounded-lg"
      >
        <Image
          src={article.image_url || '/placeholder.jpg'}
          alt={article.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-red-600 hover:bg-red-700 text-white">
            SPORT
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-gray-200 mb-2">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>{formattedDate}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group">
      <Link href={`/article/${article.slug}`} className="block">
        {article.categories && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs">
              {article.categories.name}
            </Badge>
          </div>
        )}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
          {article.title}
        </h3>
      </Link>
    </div>
  );
}