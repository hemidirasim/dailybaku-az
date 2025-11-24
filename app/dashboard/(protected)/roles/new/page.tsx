import { prisma } from '@/lib/prisma';
import RoleForm from '@/components/admin/RoleForm';

export default async function NewRolePage() {
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Rol</h1>
      <RoleForm permissions={permissions} />
    </div>
  );
}
