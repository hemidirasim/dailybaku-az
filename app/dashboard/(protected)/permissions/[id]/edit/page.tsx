import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PermissionForm from '@/components/admin/PermissionForm';

export default async function EditPermissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const permission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!permission) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">İcazə Redaktəsi</h1>
      <PermissionForm permission={permission} />
    </div>
  );
}
