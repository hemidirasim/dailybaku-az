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
  const [users, roles] = await Promise.all([
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
    }),
  ]);

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
                        {new Date(user.createdAt).toLocaleDateString('az-AZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteButton
                            id={user.id}
                            endpoint={`/api/admin/users/${user.id}`}
                            redirectUrl="/admin/users"
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
              <h2 className="text-xl font-semibold">Rol və İcazələr</h2>
              <p className="text-sm text-muted-foreground">
                Rolları yaradın, icazələri təyin edin və sistemlər üzrə paylayın
              </p>
            </div>
            <Link href="/admin/roles/new">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Rol
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
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
                  roles.map((role: typeof roles[0]) => (
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
                            role.rolePermissions.slice(0, 3).map((rp: typeof role.rolePermissions[0]) => (
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
                              redirectUrl="/admin/users"
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

