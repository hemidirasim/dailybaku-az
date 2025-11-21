'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Düzgün email daxil edin'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır').optional(),
  role: z.enum(['admin', 'editor']),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Redaktor' },
];

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          name: user.name || '',
          email: user.email,
          password: '',
          role: user.role as 'admin' | 'editor',
        }
      : {
          name: '',
          email: '',
          password: '',
          role: 'editor',
        },
  });

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      const url = user
        ? `/api/admin/users/${user.id}`
        : '/api/admin/users';
      const method = user ? 'PUT' : 'POST';

      // Şifrə yalnız yeni istifadəçi üçün və ya dəyişdirilərsə göndərilir
      const requestData: any = {
        name: data.name || null,
        email: data.email,
        role: data.role,
      };

      if (!user || data.password) {
        requestData.password = data.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Xəta baş verdi');
      }

      toast.success(user ? 'İstifadəçi yeniləndi' : 'İstifadəçi yaradıldı');
      router.push('/admin/users');
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
          <CardTitle>İstifadəçi Məlumatları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Ad</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="İstifadəçi adı"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              Şifrə {user ? '(Yalnız dəyişdirmək istəyirsinizsə)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password', { required: !user })}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Rol *</Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value as 'admin' | 'editor')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : user ? 'Yenilə' : 'Yarat'}
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

