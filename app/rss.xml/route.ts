import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// XML escape funksiyası
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    // Published və silinməmiş xəbərləri götür
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        publishedAt: {
          not: null,
        },
      },
      include: {
        translations: true,
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 50, // Son 50 xəbər
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const siteName = 'Daily Baku';
    const siteDescription = 'Azərbaycanda və dünyada baş verən son xəbərlər';

    // RSS XML yarat
    const rssItems = articles.map((article: typeof articles[0]) => {
      const azTranslation = article.translations.find((t: { locale: string }) => t.locale === 'az');
      const enTranslation = article.translations.find((t: { locale: string }) => t.locale === 'en');
      const title = azTranslation?.title || enTranslation?.title || 'Xəbər';
      const description = azTranslation?.excerpt || enTranslation?.excerpt || '';
      const content = azTranslation?.content || enTranslation?.content || '';
      const slug = azTranslation?.slug || enTranslation?.slug || '';
      const imageUrl = article.images[0]?.url 
        ? `${baseUrl}${article.images[0].url}` 
        : '';

      const pubDate = article.publishedAt 
        ? new Date(article.publishedAt).toUTCString()
        : new Date().toUTCString();

      const escapedTitle = escapeXml(title);
      const escapedDescription = escapeXml(description);
      const escapedContent = escapeXml(content);
      const escapedImageUrl = escapeXml(imageUrl);

      return `
    <item>
      <title><![CDATA[${escapedTitle}]]></title>
      <link>${baseUrl}/az/article/${slug}</link>
      <guid>${baseUrl}/az/article/${slug}</guid>
      <description><![CDATA[${escapedDescription}]]></description>
      <content:encoded><![CDATA[${escapedContent}]]></content:encoded>
      ${imageUrl ? `<enclosure url="${escapedImageUrl}" type="image/jpeg" />` : ''}
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>az</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('RSS generation error:', error);
    return new NextResponse('RSS feed generation failed', { status: 500 });
  }
}

