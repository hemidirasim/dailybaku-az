'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import { az, enUS } from 'date-fns/locale';
import { useMemo, useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    image_url?: string | null;
    category?: string;
    published_at: Date | string | null;
  };
  featured?: boolean;
}

export default function ArticleCard({
  article,
  featured = false,
}: ArticleCardProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const locale = useMemo(() => {
    const segments = pathname.split('/');
    return segments[1] === 'en' ? 'en' : 'az';
  }, [pathname]);
  const dateLocale = locale === 'az' ? az : enUS;
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const formattedDate = mounted && article.published_at
    ? formatDistanceToNow(new Date(article.published_at), {
        addSuffix: true,
        locale: dateLocale,
      })
    : '';
  
  const formattedTime = mounted && article.published_at
    ? format(new Date(article.published_at), 'HH:mm', { locale: dateLocale })
    : '';

  if (featured) {
    return (
      <Link
        href={`/${locale}/article/${article.slug}`}
        className="group block relative h-[500px] overflow-hidden rounded-lg"
      >
        <Image
          src={article.image_url || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={article.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {article.category && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-red-600 hover:bg-red-700 text-white">
              {article.category}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-gray-200 mb-2">{article.excerpt}</p>
          )}
          {mounted && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  const demoImage = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800';
  const imageUrl = article.image_url || demoImage;

  return (
    <div className="group">
      <Link href={`/${locale}/article/${article.slug}`} className="block">
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        {article.category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
          </div>
        )}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed line-clamp-2">
          {article.excerpt || article.title.substring(0, 100) + '...'}
        </p>
        {article.published_at && mounted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formattedTime}</span>
            <span className="mx-1">•</span>
            <span>{formattedDate}</span>
          </div>
        )}
      </Link>
    </div>
  );
}