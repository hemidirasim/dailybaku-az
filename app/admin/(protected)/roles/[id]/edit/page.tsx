import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RoleForm from '@/components/admin/RoleForm';

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    }),
    prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    }),
  ]);

  if (!role) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Rol Redaktəsi</h1>
      <RoleForm
        role={{
          ...role,
          rolePermissions: role.rolePermissions.map((rp) => ({
            permissionId: rp.permissionId,
            permission: rp.permission,
          })),
        }}
        permissions={permissions}
      />
    </div>
  );
}

