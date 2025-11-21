import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import GalleryTemplateForm from '@/components/admin/GalleryTemplateForm';

export default async function EditGalleryTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await prisma.galleryTemplate.findUnique({
    where: { id },
    include: {
      translations: true,
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Qalereya Şablonu Redaktəsi</h1>
      <GalleryTemplateForm template={template} />
    </div>
  );
}

