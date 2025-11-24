import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AdvertisementForm from '@/components/admin/AdvertisementForm';

export default async function EditAdvertisementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const advertisement = await prisma.advertisement.findUnique({
    where: { id },
  });

  if (!advertisement) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reklam Redaktəsi</h1>
      <AdvertisementForm advertisement={advertisement} />
    </div>
  );
}

