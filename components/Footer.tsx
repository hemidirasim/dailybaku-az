'use client';

import Link from 'next/link';
import { Advertisement } from '@/components/Advertisement';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Page {
  slug: string;
  title: string;
}

interface HotNews {
  id: string;
  title: string;
  slug: string;
  author: string;
}

interface MenuItem {
  id: string;
  title: string;
  url: string;
  children?: MenuItem[];
}

async function getPages(locale: string): Promise<Page[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/pages?locale=${locale}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

async function getHotNews(locale: string): Promise<HotNews[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/articles/recent?locale=${locale}&limit=3`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const articles = await response.json();
    return articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      author: article.author || 'Admin',
    }));
  } catch (error) {
    console.error('Error fetching hot news:', error);
    return [];
  }
}

async function getTags(locale: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tags?locale=${locale}&limit=15`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const tags = await response.json();
    return tags.map((tag: any) => tag.name);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

interface FooterProps {
  menus?: MenuItem[];
  locale?: string;
}

export default function Footer({ menus = [], locale: propLocale }: FooterProps) {
  const pathname = usePathname();
  const locale = propLocale || pathname.split('/')[1] === 'en' ? 'en' : 'az';
  const [pages, setPages] = useState<Page[]>([]);
  const [hotNews, setHotNews] = useState<HotNews[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getPages(locale).then(setPages);
    getHotNews(locale).then(setHotNews);
    getTags(locale).then(setTags);
  }, [locale]);

  const aboutUsPage = pages.find(p => p.slug === 'haqqimizda' || p.slug === 'about-us');
  const contactPage = pages.find(p => p.slug === 'elaqe' || p.slug === 'contact');
  const termsPage = pages.find(p => p.slug === 'qaydalar' || p.slug === 'terms');

  return (
    <footer className="bg-black text-white mt-12">
      <Advertisement position="footer" locale={locale} />
      {/* Upper Section */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Us */}
            <div>
              <h3 className="text-lg font-bold mb-4">{locale === 'az' ? 'Haqqımızda' : 'About Us'}</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {locale === 'az' 
                  ? 'Daily Baku - Azərbaycanın ən etibarlı xəbər mənbəsi. Gündəlik xəbərlər, analitik materiallar və aktuallıqla sizə çatırıq.'
                  : 'Daily Baku - Azerbaijan most reliable news source. We bring you daily news, analytical materials and current events.'}
              </p>
              <div className="flex flex-col gap-2 mt-4">
                {aboutUsPage && (
                  <Link
                    href={`/${locale}/page/${aboutUsPage.slug}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {locale === 'az' ? '→ Haqqımızda' : '→ About Us'}
                  </Link>
                )}
                {contactPage && (
                  <Link
                    href={`/${locale}/page/${contactPage.slug}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {locale === 'az' ? '→ Əlaqə' : '→ Contact'}
                  </Link>
                )}
                {termsPage && (
                  <Link
                    href={`/${locale}/page/${termsPage.slug}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {locale === 'az' ? '→ Qaydalar' : '→ Terms'}
                  </Link>
                )}
              </div>
            </div>

            {/* Tag Cloud */}
            <div>
              <h3 className="text-lg font-bold mb-4">{locale === 'az' ? 'Teqlər' : 'Tags'}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 border border-white text-white text-xs hover:bg-white hover:text-black transition-colors"
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">{locale === 'az' ? 'Teqlər yoxdur' : 'No tags'}</p>
                )}
              </div>
            </div>

            {/* Hot News */}
            <div>
              <h3 className="text-lg font-bold mb-4">{locale === 'az' ? 'Son Xəbərlər' : 'Hot News'}</h3>
              <div className="space-y-4">
                {hotNews.length > 0 ? (
                  hotNews.map((news, index) => (
                    <div
                      key={news.id}
                      className={`${
                        index < hotNews.length - 1 ? 'border-b border-white/20 pb-4' : ''
                      }`}
                    >
                      <p className="text-xs text-gray-400 mb-2">
                        {locale === 'az' ? 'Müəllif:' : 'Written by:'} {news.author}
                      </p>
                      <Link
                        href={`/${locale}/article/${news.slug}`}
                        className="text-sm hover:text-red-600 transition-colors block"
                      >
                        {news.title}
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">{locale === 'az' ? 'Xəbər yoxdur' : 'No news'}</p>
                )}
              </div>
            </div>

            {/* Quick Links / Footer Menu */}
            <div>
              <h3 className="text-lg font-bold mb-4">{locale === 'az' ? 'Sürətli Keçidlər' : 'Quick Links'}</h3>
              <ul className="space-y-2">
                {menus.length > 0 ? (
                  menus.map((menu) => (
                    <li key={menu.id}>
                      <Link
                        href={menu.url}
                        className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <span>»</span>
                        {menu.title}
                      </Link>
                      {menu.children && menu.children.length > 0 && (
                        <ul className="ml-4 mt-2 space-y-1">
                          {menu.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.url}
                                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                              >
                                <span>•</span>
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <>
                    {aboutUsPage && (
                      <li>
                        <Link
                          href={`/${locale}/page/${aboutUsPage.slug}`}
                          className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <span>»</span>
                          {aboutUsPage.title}
                        </Link>
                      </li>
                    )}
                    {contactPage && (
                      <li>
                        <Link
                          href={`/${locale}/page/${contactPage.slug}`}
                          className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <span>»</span>
                          {contactPage.title}
                        </Link>
                      </li>
                    )}
                    {termsPage && (
                      <li>
                        <Link
                          href={`/${locale}/page/${termsPage.slug}`}
                          className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <span>»</span>
                          {termsPage.title}
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-300">
            Daily Baku
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              © {new Date().getFullYear()} - Daily Baku. {locale === 'az' ? 'Bütün hüquqlar qorunur' : 'All Rights Reserved'}
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 border border-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              aria-label="Scroll to top"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

