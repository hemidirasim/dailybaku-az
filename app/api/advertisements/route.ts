import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position');

    if (!position) {
      return NextResponse.json({ error: 'Position is required' }, { status: 400 });
    }

    const advertisement = await prisma.advertisement.findFirst({
      where: {
        position,
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    if (!advertisement) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      type: advertisement.type,
      imageUrl: advertisement.imageUrl,
      htmlCode: advertisement.htmlCode,
      linkUrl: advertisement.linkUrl,
    });
  } catch (error: any) {
    console.error('Error fetching advertisement:', error);
    // Return null instead of error to prevent 404
    return NextResponse.json(null);
  }
}

