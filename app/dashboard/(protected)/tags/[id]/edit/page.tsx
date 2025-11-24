import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TagForm from '@/components/admin/TagForm';

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      translations: true,
    },
  });

  if (!tag) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tag Redaktəsi</h1>
      <TagForm tag={tag} />
    </div>
  );
}

