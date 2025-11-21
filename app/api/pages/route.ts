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
      .map((page) => {
        const translation = page.translations.find((t) => t.locale === locale);
        if (!translation) return null;
        return {
          slug: translation.slug,
          title: translation.title,
        };
      })
      .filter((page) => page !== null);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

