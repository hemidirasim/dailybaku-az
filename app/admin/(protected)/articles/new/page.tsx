import { prisma } from '@/lib/prisma';
import ArticleForm from '@/components/admin/ArticleForm';

export default async function NewArticlePage() {
  const [categories, users] = await Promise.all([
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Xəbər</h1>
      <ArticleForm categories={categories} users={users} />
    </div>
  );
}

