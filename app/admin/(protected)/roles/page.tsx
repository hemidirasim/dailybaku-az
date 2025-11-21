import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import DeleteButton from '@/components/admin/DeleteButton';

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Rollar</h1>
        <Link href="/admin/roles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Rol
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Açıqlama</TableHead>
              <TableHead>İcazələr</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Heç bir rol yoxdur
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{role.name}</span>
                      <span className="text-xs text-gray-400">({role.key})</span>
                    </div>
                  </TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.rolePermissions.length > 0 ? (
                        role.rolePermissions.slice(0, 3).map((rp) => (
                          <Badge key={rp.id} variant="secondary" className="text-xs">
                            {rp.permission.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">İcazə yoxdur</span>
                      )}
                      {role.rolePermissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.rolePermissions.length - 3} daha
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="default">Sistem</Badge>
                    ) : (
                      <Badge variant="outline">Fərdi</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/roles/${role.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {!role.isSystem && (
                        <DeleteButton
                          id={role.id}
                          endpoint={`/api/admin/roles/${role.id}`}
                          redirectUrl="/admin/roles"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

