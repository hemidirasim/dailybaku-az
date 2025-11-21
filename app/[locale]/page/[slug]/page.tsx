import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getPage(slug: string, locale: string) {
  // Əvvəlcə page translation-da slug-ı yoxla
  const pageTranslation = await prisma.pageTranslation.findFirst({
    where: {
      slug,
      locale,
    },
    include: {
      page: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (pageTranslation && pageTranslation.page.isActive) {
    const translation = pageTranslation.page.translations.find((t: { locale: string }) => t.locale === locale);
    return {
      ...pageTranslation.page,
      title: translation?.title || '',
      content: translation?.content || '',
    };
  }

  // Əgər translation-da tapılmadısa, ana page slug-ına görə yoxla
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!page || !page.isActive) return null;

  const translation = page.translations.find((t: { locale: string }) => t.locale === locale);
  return {
    ...page,
    title: translation?.title || '',
    content: translation?.content || '',
  };
}

export default async function StaticPagePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const page = await getPage(slug, locale);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}

