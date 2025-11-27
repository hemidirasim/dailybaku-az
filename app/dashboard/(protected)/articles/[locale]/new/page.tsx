import { prisma } from '@/lib/prisma';
import ArticleForm from '@/components/admin/ArticleForm';
import { notFound } from 'next/navigation';

export default async function NewArticlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Yalnız 'az' və 'en' dəstəklənir
  if (locale !== 'az' && locale !== 'en') {
    notFound();
  }

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

  // Admin user-i tap
  const adminUser = users.find((user) => user.role === 'admin');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Xəbər</h1>
      <ArticleForm 
        categories={categories} 
        users={users} 
        defaultAuthorId={adminUser?.id || null}
        defaultLocale={locale as 'az' | 'en'}
      />
    </div>
  );
}

