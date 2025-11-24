import FeaturedWithNewsList from '@/components/FeaturedWithNewsList';
import ArticleDetailSection from '@/components/ArticleDetailSection';
import WorldReportSection from '@/components/WorldReportSection';
import WorldMainSection from '@/components/WorldMainSection';
import BusinessTechAudioSection from '@/components/BusinessTechAudioSection';
import SportsSection from '@/components/SportsSection';
import LifeStyleSection from '@/components/LifeStyleSection';
import TravelSection from '@/components/TravelSection';
import { Advertisement } from '@/components/Advertisement';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az';
  const homeUrl = `${baseUrl}/${locale}`;

  const title = locale === 'az' 
    ? 'Daily Baku - Azərbaycan Xəbər Portalı' 
    : 'Daily Baku - Azerbaijan News Portal';
  const description = locale === 'az'
    ? 'Azərbaycanda və dünyada baş verən son xəbərlər, analitik materiallar və aktuallıqla sizə çatırıq. Gündəlik xəbərlər, siyasət, iqtisadiyyat, idman, texnologiya və daha çox.'
    : 'Latest news from Azerbaijan and around the world. Daily news, politics, economics, sports, technology and more.';

  return {
    title,
    description,
    keywords: locale === 'az'
      ? ['xəbər', 'Azərbaycan', 'gündəlik xəbərlər', 'siyasət', 'iqtisadiyyat', 'idman', 'texnologiya']
      : ['news', 'Azerbaijan', 'daily news', 'politics', 'economics', 'sports', 'technology'],
    openGraph: {
      title,
      description,
      url: homeUrl,
      siteName: 'Daily Baku',
      locale: locale === 'az' ? 'az_AZ' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Daily Baku',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: homeUrl,
      languages: {
        'az-AZ': `${baseUrl}/az`,
        'en-US': `${baseUrl}/en`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      {/* Featured Article with News List Section (includes Gündəm) */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Advertisement position="content-top" locale={locale} />
        <FeaturedWithNewsList />
      </div>

      {/* Article Detail Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <ArticleDetailSection />
      </div>

      {/* World Report Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <WorldReportSection />
      </div>

      {/* World Main Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <WorldMainSection />
      </div>

      {/* Business & Tech Audio Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <BusinessTechAudioSection />
      </div>

      {/* Sports Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <SportsSection />
      </div>

      {/* Life Style Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <LifeStyleSection />
      </div>

      {/* Travel Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <TravelSection />
        <Advertisement position="content-bottom" locale={locale} />
      </div>
    </div>
  );
}
