import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories, users] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        translations: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
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
    }),
    prisma.category.findMany({
      include: {
        translations: true,
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  if (!article) {
    notFound();
  }

  // Agenda property-sini təmin et (əgər yoxdursa)
  const articleWithAgenda = {
    ...article,
    agenda: (article as any).agenda !== undefined ? (article as any).agenda : false,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Xəbər Redaktəsi</h1>
      <ArticleForm article={articleWithAgenda as any} categories={categories} users={users} />
    </div>
  );
}
