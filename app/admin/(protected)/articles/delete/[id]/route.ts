import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Əgər id 'az' və ya 'en' dirsə, 404 qaytar
    if (id === 'az' || id === 'en') {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 404 });
    }
    
    await prisma.article.delete({
      where: { id },
    });

    // Referer header-dan locale-i tap
    const referer = req.headers.get('referer') || '';
    const localeMatch = referer.match(/\/admin\/articles\/(az|en)/);
    const locale = localeMatch ? localeMatch[1] : 'az';
    return NextResponse.redirect(new URL(`/admin/articles/${locale}`, req.url));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

