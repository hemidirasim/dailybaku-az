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

// Tərcümələr
const translations = {
  az: {
    aboutUs: 'Haqqımızda',
    aboutUsText: 'The Daily Baku - Azərbaycanın ən etibarlı xəbər mənbəsi. Gündəlik xəbərlər, analitik materiallar və aktuallıqla sizə çatırıq.',
    aboutUsLink: '→ Haqqımızda',
    contact: 'Əlaqə',
    contactLink: '→ Əlaqə',
    terms: 'Qaydalar',
    termsLink: '→ Qaydalar',
    tags: 'Teqlər',
    noTags: 'Teqlər yoxdur',
    hotNews: 'Son Xəbərlər',
    author: 'Müəllif:',
    noNews: 'Xəbər yoxdur',
    quickLinks: 'Sürətli Keçidlər',
    allRightsReserved: 'Bütün hüquqlar qorunur',
  },
  en: {
    aboutUs: 'About Us',
    aboutUsText: 'The Daily Baku - Azerbaijan most reliable news source. We bring you daily news, analytical materials and current events.',
    aboutUsLink: '→ About Us',
    contact: 'Contact',
    contactLink: '→ Contact',
    terms: 'Terms',
    termsLink: '→ Terms',
    tags: 'Tags',
    noTags: 'No tags',
    hotNews: 'Hot News',
    author: 'Written by:',
    noNews: 'No news',
    quickLinks: 'Quick Links',
    allRightsReserved: 'All Rights Reserved',
  },
};

async function getPages(locale: string): Promise<Page[]> {
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/pages?locale=${locale}`,
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
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/articles/recent?locale=${locale}&limit=3`,
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
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'https://dailybaku.az');
    const response = await fetch(
      `${baseUrl}/api/tags?locale=${locale}&limit=15`,
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
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0] === 'az' || segments[0] === 'en' ? segments[0] : propLocale || 'az';
  const locale = currentLocale === 'en' ? 'en' : 'az';
  const t = translations[locale];
  
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
            {/* Logo */}
            <div>
              <h3 className="text-lg font-bold mb-4">The Daily Baku</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {t.aboutUsText}
              </p>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-lg font-bold mb-4">{t.aboutUs}</h3>
              <div className="flex flex-col gap-2">
                {aboutUsPage && (
                  <Link
                    href={`/${locale}/page/${aboutUsPage.slug}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {t.aboutUsLink}
                  </Link>
                )}
                {contactPage && (
                  <Link
                    href={`/${locale}/page/${contactPage.slug}`}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {t.contactLink}
                  </Link>
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">{t.contact}</h3>
              {contactPage && (
                <Link
                  href={`/${locale}/page/${contactPage.slug}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors block mb-2"
                >
                  {t.contactLink}
                </Link>
              )}
            </div>

            {/* Privacy Policy */}
            <div>
              <h3 className="text-lg font-bold mb-4">{locale === 'az' ? 'Məxfilik Siyasəti' : 'Privacy Policy'}</h3>
              {termsPage && (
                <Link
                  href={`/${locale}/page/${termsPage.slug}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors block"
                >
                  {t.termsLink}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-300">
            The Daily Baku
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              © {new Date().getFullYear()} - The Daily Baku. {t.allRightsReserved}
            </span>
            <span className="text-sm text-gray-300">
              {locale === 'az' ? 'Hazırladı' : 'Created by'}{' '}
              <a 
                href="https://midiya.az" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline"
              >
                Midiya.az
              </a>
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-8 h-8 border border-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              aria-label={locale === 'az' ? 'Yuxarı qayıt' : 'Scroll to top'}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
