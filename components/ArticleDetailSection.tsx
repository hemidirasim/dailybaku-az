'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

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
    .limit(10);

  if (!articles) return [];
  
  return articles.map((article, index) => ({
    ...article,
    image_url: article.image_url || demoImages[index % demoImages.length],
  }));
}

export default function ArticleDetailSection() {
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
      title: 'This Nudged Jeepers Ded Sesulky Oite Ten Around Style3',
      slug: null,
      image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      excerpt: 'This nudged jeepers less dogged sheared opposite then around but a due heinous square subtle amphibiously chameleon palpable tyrannical aboard removed much outside and without vicious scallop flapped newt as.',
      content: 'With a large decorative initial capital letter, this is the body text that continues in a two-column layout. The text flows naturally and provides detailed information about the article topic.',
      author: 'Maxin Dalton',
      role: 'Editor',
      published_at: '2016-06-01T00:00:00Z',
      categories: { name: 'UNCATEGORIZED', slug: 'uncategorized' },
    },
    {
      id: 2,
      title: 'Timmediately Quail Was Inverse Much So Remade Dimly Salmon',
      slug: null,
      image_url: 'https://images.pexels.com/photos/1591055/pexels-photo-1591055.jpeg?auto=compress&cs=tinysrgb&w=800',
      excerpt: 'Nesciunt mumblecore blog, wayfarers voluptate VHS vice before they sold out delectus direct trade. Wullamco dolore',
      content: 'With a large decorative initial capital letter, this is the body text that continues in a two-column layout.',
      author: 'Maxin Dalton',
      role: 'Editor',
      published_at: '2015-03-05T00:00:00Z',
      categories: { name: 'CULTURE', slug: 'culture' },
    },
  ];

  const defaultBottomArticles = [
    {
      id: 3,
      title: 'Incongruous Jeepers Jellyfish One Far Well Known',
      slug: null,
      image_url: 'https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=800',
      excerpt: 'Within spread beside the ouch sulky and this wonderfully and as the well and where supply much hyena so tolerantly recast hawk darn woodpecker.',
      categories: { name: 'CULTURE', slug: 'culture' },
    },
    {
      id: 4,
      title: 'This Nudged Jeepers While Much The Less',
      slug: null,
      image_url: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800',
      excerpt: 'Nudged jeepers less dogged sheared opposite then around but a due heinous square subtle amphibiously chameleon palpable tyrannical aboard removed much outside.',
      categories: { name: 'SPORT', slug: 'sport' },
    },
  ];

  const sidebarArticles = [
    { category: 'Culture', title: 'Incongruous Jeepers Jellyfish One Far Well Known', excerpt: 'Short excerpt text here' },
    { category: 'Politic , Sport', title: 'This Nudged Jeepers While Much The Less', excerpt: 'Short excerpt text here' },
    { category: 'Uncategorized', title: 'This Nudged Jeepers Ded Sesulky Oite Ten Around Style3', excerpt: 'Short excerpt text here' },
    { category: 'Culture , Europe', title: 'Timmediately Quail Was Inverse Much So Remade Dimly Salmon', excerpt: 'Short excerpt text here' },
    { category: 'Europe , Finance', title: 'Unanimous Haltered Loud One Trod Trigly Style Four', excerpt: 'Short excerpt text here' },
    { category: 'Technology', title: 'New Technology Breakthrough in Digital Innovation', excerpt: 'Latest developments in tech industry' },
    { category: 'Health , Science', title: 'Medical Research Reveals Important Findings', excerpt: 'New discoveries in healthcare sector' },
    { category: 'Business', title: 'Economic Growth Shows Positive Trends This Quarter', excerpt: 'Market analysis and financial updates' },
    { category: 'Entertainment', title: 'Latest Film Festival Highlights Cultural Diversity', excerpt: 'Arts and entertainment news' },
    { category: 'Sports', title: 'Championship Finals Set to Begin Next Week', excerpt: 'Sports updates and match results' },
    { category: 'Politics', title: 'New Policy Changes Announced by Government', excerpt: 'Political developments and analysis' },
    { category: 'Education', title: 'University Research Program Receives Major Funding', excerpt: 'Educational news and updates' },
  ];

  const mainArticle = articles[0] || defaultArticles[0];
  const sideArticle1 = articles[1] || defaultArticles[1];
  const sideArticle2 = articles[2] || defaultArticles[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateLocale = locale === 'az' ? 'az-AZ' : 'en-US';
    const month = date.toLocaleDateString(dateLocale, { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {sidebarArticles.map((article, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-sm font-bold text-black leading-tight">
                  {article.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Main Article - Center */}
          <div className="lg:col-span-7">
            <div className="relative mb-6">
              <Image
                src={mainArticle.image_url || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={mainArticle.title}
                width={800}
                height={400}
                className="w-full h-auto object-cover grayscale"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  {mainArticle.categories?.name || 'UNCATEGORIZED'}
                </div>
              </div>
            </div>

            {mainArticle.slug ? (
              <Link href={`/${locale}/article/${mainArticle.slug}`}>
                <h1 className="text-3xl font-bold text-black mb-4 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                  {mainArticle.title}
                </h1>
              </Link>
            ) : (
              <h1 className="text-3xl font-bold text-black mb-4 leading-tight">
                {mainArticle.title}
              </h1>
            )}

            <p className="text-gray-700 mb-4 leading-relaxed">
              {mainArticle.excerpt}
            </p>

            {/* Two Articles Below Main Article */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {(articles.length >= 5 ? articles.slice(3, 5) : defaultBottomArticles).map((article, index) => {
                return (
                  <div key={index}>
                    <div className="relative mb-4">
                      <Image
                        src={article.image_url || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={article.title}
                        width={400}
                        height={250}
                        className="w-full h-auto object-cover grayscale"
                      />
                      <div className="absolute top-4 left-4">
                        <div className="bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {article.categories?.name || 'UNCATEGORIZED'}
                        </div>
                      </div>
                    </div>
                    {article.slug ? (
                      <Link href={`/${locale}/article/${article.slug}`}>
                        <h2 className="text-xl font-bold text-black mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                          {article.title}
                        </h2>
                      </Link>
                    ) : (
                      <h2 className="text-xl font-bold text-black mb-2 leading-tight">
                        {article.title}
                      </h2>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Side Articles - Right */}
          <div className="lg:col-span-3 space-y-8">
            {/* First Side Article */}
            <div>
              <div className="relative mb-4">
                <Image
                  src={sideArticle1.image_url || 'https://images.pexels.com/photos/1591055/pexels-photo-1591055.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={sideArticle1.title}
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover grayscale"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    {sideArticle1.categories?.name || 'CULTURE'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-2">
                This nudged jeepers less dogged
              </p>

              {sideArticle1.slug ? (
                <Link href={`/${locale}/article/${sideArticle1.slug}`}>
                  <h2 className="text-lg font-bold text-black mb-3 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                    {sideArticle1.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-lg font-bold text-black mb-3 leading-tight">
                  {sideArticle1.title}
                </h2>
              )}

              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {sideArticle1.excerpt}
              </p>

              <p className="text-xs text-gray-600 mb-4">
                By {sideArticle1.author} / {sideArticle1.role} on {formatDate(sideArticle1.published_at)}
              </p>
            </div>

            {/* Second Side Article */}
            <div>
              <div className="relative mb-4">
                <Image
                  src={sideArticle2.image_url || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={sideArticle2.title}
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover grayscale"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    {sideArticle2.categories?.name || 'CULTURE'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-2">
                This nudged jeepers less dogged
              </p>

              {sideArticle2.slug ? (
                <Link href={`/${locale}/article/${sideArticle2.slug}`}>
                  <h2 className="text-lg font-bold text-black mb-3 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                    {sideArticle2.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="text-lg font-bold text-black mb-3 leading-tight">
                  {sideArticle2.title}
                </h2>
              )}

              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {sideArticle2.excerpt}
              </p>

              <p className="text-xs text-gray-600 mb-4">
                By {sideArticle2.author} / {sideArticle2.role} on {formatDate(sideArticle2.published_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

