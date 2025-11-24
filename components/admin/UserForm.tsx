'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface UserFormProps {
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar: string | null;
    bioAz: string | null;
    bioEn: string | null;
  };
}

export default function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'editor');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bioAz, setBioAz] = useState(user?.bioAz || '');
  const [bioEn, setBioEn] = useState(user?.bioEn || '');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setAvatar(data.url);
      toast.success('Avatar yükləndi');
    } catch (error) {
      toast.error('Avatar yüklənə bilmədi');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const method = user ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          role,
          avatar,
          bioAz,
          bioEn,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Xəta baş verdi');
      }

      toast.success(user ? 'İstifadəçi yeniləndi' : 'İstifadəçi yaradıldı');
      router.push('/dashboard/users');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol sütun */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Şifrə {user && '(Boş buraxın, dəyişməmək üçün)'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrə"
              required={!user}
            />
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sağ sütun - Avatar */}
        <div className="space-y-4">
          <div>
            <Label>Avatar</Label>
            <div className="space-y-2">
              {avatar && (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={avatar}
                    alt={name || 'Avatar'}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {avatar ? 'Avatar dəyişdir' : 'Avatar yüklə'}
                    </p>
                  </div>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio - Tabs */}
      <div>
        <Label>Haqqında</Label>
        <Tabs defaultValue="az" className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="az">Azərbaycan</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="az" className="mt-4">
            <Textarea
              value={bioAz}
              onChange={(e) => setBioAz(e.target.value)}
              placeholder="İstifadəçi haqqında məlumat (AZ)"
              rows={4}
            />
          </TabsContent>
          <TabsContent value="en" className="mt-4">
            <Textarea
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              placeholder="İstifadəçi haqqında məlumat (EN)"
              rows={4}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saxlanılır...' : user ? 'Yenilə' : 'Yarat'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Ləğv et
        </Button>
      </div>
    </form>
  );
}
