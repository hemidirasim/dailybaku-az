import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: true,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bölmə Redaktəsi</h1>
      <CategoryForm category={category} />
    </div>
  );
}

