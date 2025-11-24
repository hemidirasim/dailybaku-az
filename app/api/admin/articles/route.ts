import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { authorId, categoryId, featured, status, publishedAt, az, en, images, tagIds } = body;

    // AuthorId yoxdursa, admin roluna malik istifadəçini tap
    let finalAuthorId = authorId;
    if (!finalAuthorId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' },
      });
      finalAuthorId = adminUser?.id || (session.user as any).id;
    }

    const article = await prisma.article.create({
      data: {
        authorId: finalAuthorId,
        categoryId: categoryId || null,
        featured: featured || false,
        agenda: body.agenda || false,
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await prisma.article.findMany({
      where: {
        deletedAt: null, // Yalnız silinməmiş xəbərləri göstər
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(articles);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

