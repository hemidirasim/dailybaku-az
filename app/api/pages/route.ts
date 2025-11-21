import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'az';

    const pages = await prisma.page.findMany({
      where: {
        isActive: true,
      },
      include: {
        translations: true,
      },
    });

    const result = pages
      .map((page: typeof pages[0]) => {
        const translation = page.translations.find((t: { locale: string }) => t.locale === locale);
        if (!translation) return null;
        return {
          slug: translation.slug,
          title: translation.title,
        };
      })
      .filter((page: any) => page !== null);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching pages:', error);
    // Return empty array instead of error to prevent 404
    return NextResponse.json([]);
  }
}

