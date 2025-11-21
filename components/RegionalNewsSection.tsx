'use client';

import { supabase } from '@/lib/supabase';
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

async function getArticles() {
  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .order('published_at', { ascending: false })
    .limit(6);

  if (!articles) return [];
  
  return articles.map((article, index) => ({
    ...article,
    image_url: article.image_url || demoImages[index % demoImages.length],
  }));
}

export default function RegionalNewsSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getArticles().then(setArticles);
  }, [pathname]);

  const defaultArticles = [
    {
      id: 1,
      category: 'Culture',
      title: 'Incongruous Jeepers Jellyfish One Far Well Known',
      excerpt: 'Within spread beside the ouch sulky and this wonderfully and as the well and where',
      slug: null,
    },
    {
      id: 2,
      category: 'Politic , Sport',
      title: 'This Nudged Jeepers While Much The Less',
      excerpt: 'Within spread beside the ouch sulky and this wonderfully and as the well and where',
      slug: null,
    },
  ];

  const regions = [
    { name: 'EUROPE', subtitle: 'SUBTITLE' },
    { name: 'ASIA', subtitle: 'SUBTITLE' },
    { name: 'MIDDLE EAST', subtitle: 'SUBTITLE' },
  ];

  // Her bölge için 2 makale
  const getArticlesForRegion = (regionIndex: number) => {
    if (articles.length >= 6) {
      const startIndex = regionIndex * 2;
      return articles.slice(startIndex, startIndex + 2).map(a => ({
        category: a.categories?.name || 'Culture',
        title: a.title,
        excerpt: a.excerpt || 'Within spread beside the ouch sulky and this wonderfully and as the well and where',
        slug: a.slug,
      }));
    }
    return defaultArticles;
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {regions.map((region, regionIndex) => {
            const regionArticles = getArticlesForRegion(regionIndex);
            return (
              <div
                key={regionIndex}
                className={`${
                  regionIndex < regions.length - 1 ? 'border-r border-gray-200 pr-6' : ''
                } ${regionIndex > 0 ? 'pl-6' : ''}`}
              >
                {/* Region Header */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-red-600 uppercase">
                      {region.name}
                    </h3>
                    <span className="text-xs font-normal text-gray-400 uppercase">
                      {region.subtitle}
                    </span>
                  </div>
                </div>

                {/* Articles */}
                <div className="space-y-6">
                  {regionArticles.map((article, articleIndex) => (
                    <div
                      key={articleIndex}
                      className={`${
                        articleIndex < regionArticles.length - 1
                          ? 'border-b border-gray-200 pb-6'
                          : ''
                      }`}
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
                          <h3 className="text-base font-bold text-black leading-tight mb-2 hover:text-red-600 transition-colors">
                            {article.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-base font-bold text-black leading-tight mb-2">
                          {article.title}
                        </h3>
                      )}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

