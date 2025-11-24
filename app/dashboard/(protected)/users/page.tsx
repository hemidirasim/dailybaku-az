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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function UsersPage() {
  let users: any[] = [];
  let roles: any[] = [];

  try {
    [users, roles] = await Promise.all([
      prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.role.findMany({
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
      }).catch(() => []), // If roles query fails, use empty array
    ]);
  } catch (error) {
    console.error('Error fetching users/roles:', error);
    // Continue with empty arrays if query fails
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest">
            İdarəetmə Mərkəzi
          </p>
          <h1 className="text-3xl font-bold">İstifadəçilər və Rollar</h1>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">İstifadəçilər</TabsTrigger>
          <TabsTrigger value="roles">Rollar</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">İstifadəçi Siyahısı</h2>
              <p className="text-sm text-muted-foreground">Yeni istifadəçilər əlavə edin, mövcud olanları idarə edin</p>
            </div>
            <Link href="/admin/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni İstifadəçi
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Yaradılma Tarixi</TableHead>
                  <TableHead>Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Heç bir istifadəçi yoxdur
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: typeof users[0]) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin'
                            ? 'Admin'
                            : user.role === 'editor'
                            ? 'Redaktor'
                            : user.role || 'Rol yoxdur'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('az-AZ')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteButton
                            id={user.id}
                            endpoint="/api/admin/users"
                            redirectUrl="/dashboard/users"
                            
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Rollar</h2>
              <p className="text-sm text-muted-foreground">Rolları və icazələri idarə edin</p>
            </div>
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
                  <TableHead>Key</TableHead>
                  <TableHead>İcazələr</TableHead>
                  <TableHead>Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Heç bir rol yoxdur
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role: typeof roles[0]) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name || role.key || '-'}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {role.key || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        {role.rolePermissions?.length || 0} icazə
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/roles/${role.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
