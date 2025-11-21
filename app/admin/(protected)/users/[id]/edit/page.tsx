import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import UserForm from '@/components/admin/UserForm';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">İstifadəçi Redaktəsi</h1>
      <UserForm user={user} />
    </div>
  );
}

