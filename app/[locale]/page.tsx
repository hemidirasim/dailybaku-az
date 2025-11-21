import FeaturedWithNewsList from '@/components/FeaturedWithNewsList';
import GundemSection from '@/components/GundemSection';
import ArticleDetailSection from '@/components/ArticleDetailSection';
import RegionalNewsSection from '@/components/RegionalNewsSection';
import WorldReportSection from '@/components/WorldReportSection';
import { Advertisement } from '@/components/Advertisement';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      {/* Featured Article with News List Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Advertisement position="content-top" locale={locale} />
        <FeaturedWithNewsList />
      </div>

      {/* Gündəm Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <GundemSection />
      </div>

      {/* Article Detail Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <ArticleDetailSection />
      </div>

      {/* Regional News Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <RegionalNewsSection />
      </div>

      {/* World Report Section */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <WorldReportSection />
        <Advertisement position="content-bottom" locale={locale} />
      </div>
    </div>
  );
}