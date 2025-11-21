'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const roleSchema = z.object({
  key: z.string().min(1, 'Rol açarı tələb olunur'),
  name: z.string().min(1, 'Rol adı tələb olunur'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    rolePermissions: Array<{
      permissionId: string;
      permission: {
        id: string;
        key: string;
        name: string;
        category: string;
      };
    }>;
  };
  permissions?: Array<{
    id: string;
    key: string;
    name: string;
    description: string | null;
    category: string;
  }>;
}

export default function RoleForm({ role, permissions = [] }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState(permissions);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.rolePermissions.map((rp) => rp.permissionId) || []
  );

  useEffect(() => {
    if (permissions.length === 0) {
      fetch('/api/admin/permissions')
        .then((res) => res.json())
        .then((data) => setAvailablePermissions(data || []))
        .catch((error) => {
          console.error('Error fetching permissions:', error);
          setAvailablePermissions([]);
        });
    }
  }, [permissions]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: role
      ? {
          key: role.key,
          name: role.name,
          description: role.description || '',
          permissionIds: role.rolePermissions.map((rp) => rp.permissionId),
        }
      : {
          key: '',
          name: '',
          description: '',
          permissionIds: [],
        },
  });

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  const togglePermission = (permissionId: string) => {
    const newSelected = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];
    setSelectedPermissions(newSelected);
    setValue('permissionIds', newSelected);
  };

  const onSubmit = async (data: RoleFormData) => {
    setLoading(true);
    try {
      const url = role ? `/api/admin/roles/${role.id}` : '/api/admin/roles';
      const method = role ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          permissionIds: selectedPermissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Xəta baş verdi');
      }

      toast.success(role ? 'Rol yeniləndi' : 'Rol yaradıldı');
      router.push('/admin/roles');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rol Məlumatları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="key">Rol Açarı *</Label>
            <Input
              id="key"
              {...register('key')}
              placeholder="admin, editor, etc."
              disabled={!!role}
            />
            {errors.key && (
              <p className="text-sm text-red-500 mt-1">{errors.key.message}</p>
            )}
            {role && (
              <p className="text-xs text-gray-500 mt-1">Rol açarı dəyişdirilə bilməz</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Rol Adı *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Admin, Redaktor, etc."
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Açıqlama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Rol haqqında qısa məlumat"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İcazələr</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(permissionsByCategory).length === 0 ? (
            <p className="text-sm text-gray-500">İcazə yoxdur</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category}>
                  <h4 className="font-semibold mb-3 capitalize">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {perms.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => togglePermission(permission.id)}
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <div className="flex-1">
                          <Label className="font-medium cursor-pointer">
                            {permission.name}
                          </Label>
                          {permission.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : role ? 'Yenilə' : 'Yarat'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Ləğv et
        </Button>
      </div>
    </form>
  );
}

