import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PageForm from '@/components/admin/PageForm';

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      translations: true,
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Səhifə Redaktəsi</h1>
      <PageForm page={page} />
    </div>
  );
}

