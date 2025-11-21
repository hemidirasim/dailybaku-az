'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const demoImages = [
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1591055/pexels-photo-1591055.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
];

async function getTopArticles(offset: number = 0, locale: string = 'az') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/top?offset=${offset}&limit=4&locale=${locale}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return [];
    
    const articles = await response.json();
    return articles.map((article: any, index: number) => ({
      ...article,
      image_url: article.image_url || demoImages[index % demoImages.length],
    }));
  } catch (error) {
    console.error('Error fetching top articles:', error);
    return [];
  }
}

export default function TopArticles({ offset = 0 }: { offset?: number }) {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getTopArticles(offset, currentLocale).then(setArticles);
  }, [pathname, offset]);

  const defaultArticles = [
    {
      category: 'Culture',
      title: 'Incongruous Jeepers Jellyfish One Far Well Known',
      slug: null,
    },
    {
      category: 'Uncategorized',
      title: 'This Nudged Jeepers Ded Sesulky Oite Ten Around Style3',
      slug: null,
    },
    {
      category: 'Culture , Europe',
      title: 'Timmediately Quail Was Inverse Much So Remade Dimly Salmon',
      slug: null,
    },
    {
      category: 'Politic , Sport',
      title: 'This Nudged Jeepers While Much The Less',
      slug: null,
    },
  ];

  const displayArticles = articles.length >= 4 
    ? articles.slice(0, 4).map(a => ({
        category: a.categories?.name || 'Uncategorized',
        title: a.title || '',
        slug: a.slug || null,
      }))
    : defaultArticles;

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {displayArticles.map((article, index) => (
            <div
              key={index}
              className={`${
                index < displayArticles.length - 1 ? 'border-r border-gray-200 pr-4' : ''
              } ${index > 0 ? 'pl-4' : ''}`}
            >
              <div className="mb-2">
                <span className="text-xs font-bold text-black uppercase">
                  {article.category}
                </span>
              </div>
              {article.slug ? (
                <Link
                  href={`/${locale}/article/${article.slug}`}
                  className="block"
                >
                  <h3 className="text-sm font-bold text-black leading-tight hover:text-red-600 transition-colors">
                    {article.title}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-sm font-bold text-black leading-tight">
                  {article.title}
                </h3>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

