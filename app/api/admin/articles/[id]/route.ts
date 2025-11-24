import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { authorId, categoryId, featured, agenda, status, publishedAt, az, en, images, tagIds } = body;
    const { id } = await params;

    // Əvvəlcə mövcud article-i tap
    const existing = await prisma.article.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Delete existing translations, images, and tags
    await Promise.all([
      prisma.articleTranslation.deleteMany({
        where: { articleId: id },
      }),
      prisma.articleImage.deleteMany({
        where: { articleId: id },
      }),
      prisma.articleTag.deleteMany({
        where: { articleId: id },
      }),
    ]);

    // Update article and create new translations, images, and tags
    const article = await prisma.article.update({
      where: { id },
      data: {
        authorId: authorId ?? undefined,
        categoryId: categoryId || null,
        featured: featured !== undefined ? featured : existing.featured,
        agenda: agenda !== undefined ? agenda : (existing.agenda || false),
        status: status || 'draft',
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        translations: {
          create: [
            {
              locale: 'az',
              title: az.title || '',
              slug: az.slug || '',
              excerpt: az.excerpt || null,
              content: az.content || '',
            },
            {
              locale: 'en',
              title: en.title || '',
              slug: en.slug || '',
              excerpt: en.excerpt || null,
              content: en.content || '',
            },
          ],
        },
        images: {
          create: images?.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || null,
            caption: img.caption || null,
            order: img.order !== undefined ? img.order : index,
            isPrimary: img.isPrimary || false,
          })) || [],
        },
        tags: {
          create: tagIds?.map((tagId: string) => ({
            tagId,
          })) || [],
        },
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    
    // Soft delete - deletedAt tarixini və deletedById-ni təyin et
    await prisma.article.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
        images: true,
        tags: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}
