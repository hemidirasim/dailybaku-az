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
    .limit(10);

  if (!articles) return [];
  
  return articles.map((article, index) => ({
    ...article,
    image_url: article.image_url || demoImages[index % demoImages.length],
  }));
}

export default function WorldReportSection() {
  const pathname = usePathname();
  const [articles, setArticles] = useState<any[]>([]);
  const [locale, setLocale] = useState('az');

  useEffect(() => {
    const segments = pathname.split('/');
    const currentLocale = segments[1] === 'en' ? 'en' : 'az';
    setLocale(currentLocale);

    getArticles().then(setArticles);
  }, [pathname]);

  const defaultArticle = {
    id: 1,
    title: 'Incongruous Jeepers Jellyfish One Far Well Known',
    slug: null,
    excerpt: 'One aside wombat delicate caterpillar babbled much some broke capitally darn far awakened ravenouslywallaby krill a far in circa considering and shrewd gosh spluttered.',
    content: 'Within spread beside the ouch sulky this wonderfully and as the well and where supply much hyena so tolerantly recast hawk darn woodpecker. Within spread beside the ouch sulky this wonderfully and as the well and where supply much hyena so tolerantly recast hawk darn woodpecker. Nudged jeepers less dogged sheared opposite then around but a due heinous square subtle amphibiously chameleon palpable tyrannical aboard removed much outside and without vicious scallop flapped newt as.',
    author: 'Maxin Dalton',
    role: 'Editor',
    published_at: '2018-05-01T00:00:00Z',
  };

  const relatedArticles = [
    'This Nudged Jeepers While Much The Less',
    'This Nudged Jeepers Ded Sesulky Oite Ten Around Style3',
  ];

  const sidebarArticles = [
    {
      category: 'Culture',
      title: 'Incongruous Jeepers Jellyfish One Far Well Known',
      excerpt: 'Within spread beside the ouch sulky and this wonderfully and as the well',
      slug: null,
    },
    {
      category: 'Politic, Sport',
      title: 'This Nudged Jeepers While Much The Less',
      excerpt: 'Within spread beside the ouch sulky and this wonderfully and as the well',
      slug: null,
    },
    {
      category: 'Uncategorized',
      title: 'This Nudged Jeepers Ded Sesulky Oite Ten Around Style3',
      excerpt: 'Within spread beside the ouch sulky and this wonderfully and as the well',
      slug: null,
    },
  ];

  const mainArticle = articles[0] || defaultArticle;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateLocale = locale === 'az' ? 'az-AZ' : 'en-US';
    const month = date.toLocaleDateString(dateLocale, { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-red-600 mb-3 font-serif">World Report</h2>
          <p className="text-sm text-gray-700">
            Global Warning issue, USA Operation in Middle East & Myanmar News.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article - Left */}
          <div className="lg:col-span-6">
            {mainArticle.slug ? (
              <Link href={`/${locale}/article/${mainArticle.slug}`}>
                <h1 className="text-5xl font-bold text-black mb-5 leading-tight font-serif hover:text-red-600 transition-colors cursor-pointer">
                  {mainArticle.title}
                </h1>
              </Link>
            ) : (
              <h1 className="text-5xl font-bold text-black mb-5 leading-tight font-serif">
                {mainArticle.title}
              </h1>
            )}

            <p className="text-base italic text-gray-700 mb-5 leading-relaxed">
              {mainArticle.excerpt}
            </p>

            <p className="text-sm text-gray-600 mb-8">
              By {mainArticle.author} / {mainArticle.role} on {formatDate(mainArticle.published_at)}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-gray-700 leading-relaxed text-sm">
                <span className="text-7xl font-bold text-gray-300 float-left mr-3 leading-none" style={{ fontFamily: 'serif' }}>W</span>
                <p>
                  ithin spread beside the ouch sulky and this wonderfully and as the well and where supply much hyena so tolerantly recast hawk darn woodpecker less more so. This nudged jeepers less dogged sheared opposite then around but a due heinous square subtle
                </p>
              </div>
              <div className="text-gray-700 leading-relaxed text-sm">
                <p>
                  amphibiously chameleon palpable tyrannical aboard removed much outside and without vicious scallop flapped newt as. Some grimaced after after mercifully lion thus oppressive hello.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <ul className="space-y-2">
                {relatedArticles.map((title, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-600 text-lg mt-1">•</span>
                    <span className="text-sm text-gray-700">{title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebars - Right (2 Columns) */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Module 1 - First Column */}
              <div>
                <h3 className="text-sm font-bold text-red-600 uppercase mb-3 pb-2 border-b border-red-600">
                  MODULE 1 SUBTITLE
                </h3>
                <div className="space-y-6">
                  {sidebarArticles.map((article, index) => (
                    <div
                      key={index}
                      className={`${
                        index < sidebarArticles.length - 1
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
                          <h3 className="text-base font-bold text-black leading-tight mb-2 hover:text-red-600 transition-colors font-serif">
                            {article.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-base font-bold text-black leading-tight mb-2 font-serif">
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

              {/* Module 2 - Second Column */}
              <div>
                <h3 className="text-sm font-bold text-red-600 uppercase mb-3 pb-2 border-b border-red-600">
                  MODULE 2 SUBTITLE
                </h3>
                <div className="space-y-6">
                  {sidebarArticles.map((article, index) => (
                    <div
                      key={index}
                      className={`${
                        index < sidebarArticles.length - 1
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
                          <h3 className="text-base font-bold text-black leading-tight mb-2 hover:text-red-600 transition-colors font-serif">
                            {article.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-base font-bold text-black leading-tight mb-2 font-serif">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

