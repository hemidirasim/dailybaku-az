import 'dotenv/config';
import { prisma } from '../lib/prisma';

const permissions = [
  // Articles
  { key: 'articles.view', name: 'Xəbərləri Görüntülə', category: 'articles', description: 'Xəbərləri görüntüləmək icazəsi' },
  { key: 'articles.create', name: 'Xəbər Yarat', category: 'articles', description: 'Yeni xəbər yaratmaq icazəsi' },
  { key: 'articles.edit', name: 'Xəbər Redaktə Et', category: 'articles', description: 'Xəbərləri redaktə etmək icazəsi' },
  { key: 'articles.delete', name: 'Xəbər Sil', category: 'articles', description: 'Xəbərləri silmək icazəsi' },
  { key: 'articles.publish', name: 'Xəbər Paylaş', category: 'articles', description: 'Xəbərləri paylaşmaq icazəsi' },

  // Categories
  { key: 'categories.view', name: 'Kateqoriyaları Görüntülə', category: 'categories', description: 'Kateqoriyaları görüntüləmək icazəsi' },
  { key: 'categories.create', name: 'Kateqoriya Yarat', category: 'categories', description: 'Yeni kateqoriya yaratmaq icazəsi' },
  { key: 'categories.edit', name: 'Kateqoriya Redaktə Et', category: 'categories', description: 'Kateqoriyaları redaktə etmək icazəsi' },
  { key: 'categories.delete', name: 'Kateqoriya Sil', category: 'categories', description: 'Kateqoriyaları silmək icazəsi' },

  // Tags
  { key: 'tags.view', name: 'Tagları Görüntülə', category: 'tags', description: 'Tagları görüntüləmək icazəsi' },
  { key: 'tags.create', name: 'Tag Yarat', category: 'tags', description: 'Yeni tag yaratmaq icazəsi' },
  { key: 'tags.edit', name: 'Tag Redaktə Et', category: 'tags', description: 'Tagları redaktə etmək icazəsi' },
  { key: 'tags.delete', name: 'Tag Sil', category: 'tags', description: 'Tagları silmək icazəsi' },

  // Menus
  { key: 'menus.view', name: 'Menuları Görüntülə', category: 'menus', description: 'Menuları görüntüləmək icazəsi' },
  { key: 'menus.create', name: 'Menu Yarat', category: 'menus', description: 'Yeni menu yaratmaq icazəsi' },
  { key: 'menus.edit', name: 'Menu Redaktə Et', category: 'menus', description: 'Menuları redaktə etmək icazəsi' },
  { key: 'menus.delete', name: 'Menu Sil', category: 'menus', description: 'Menuları silmək icazəsi' },

  // Users
  { key: 'users.view', name: 'İstifadəçiləri Görüntülə', category: 'users', description: 'İstifadəçiləri görüntüləmək icazəsi' },
  { key: 'users.create', name: 'İstifadəçi Yarat', category: 'users', description: 'Yeni istifadəçi yaratmaq icazəsi' },
  { key: 'users.edit', name: 'İstifadəçi Redaktə Et', category: 'users', description: 'İstifadəçiləri redaktə etmək icazəsi' },
  { key: 'users.delete', name: 'İstifadəçi Sil', category: 'users', description: 'İstifadəçiləri silmək icazəsi' },

  // Roles
  { key: 'roles.view', name: 'Rolları Görüntülə', category: 'roles', description: 'Rolları görüntüləmək icazəsi' },
  { key: 'roles.create', name: 'Rol Yarat', category: 'roles', description: 'Yeni rol yaratmaq icazəsi' },
  { key: 'roles.edit', name: 'Rol Redaktə Et', category: 'roles', description: 'Rolları redaktə etmək icazəsi' },
  { key: 'roles.delete', name: 'Rol Sil', category: 'roles', description: 'Rolları silmək icazəsi' },

  // Advertisements
  { key: 'advertisements.view', name: 'Reklamları Görüntülə', category: 'advertisements', description: 'Reklamları görüntüləmək icazəsi' },
  { key: 'advertisements.create', name: 'Reklam Yarat', category: 'advertisements', description: 'Yeni reklam yaratmaq icazəsi' },
  { key: 'advertisements.edit', name: 'Reklam Redaktə Et', category: 'advertisements', description: 'Reklamları redaktə etmək icazəsi' },
  { key: 'advertisements.delete', name: 'Reklam Sil', category: 'advertisements', description: 'Reklamları silmək icazəsi' },

  // Media
  { key: 'media.view', name: 'Medianı Görüntülə', category: 'media', description: 'Medianı görüntüləmək icazəsi' },
  { key: 'media.upload', name: 'Media Yüklə', category: 'media', description: 'Media faylları yükləmək icazəsi' },
  { key: 'media.delete', name: 'Media Sil', category: 'media', description: 'Media fayllarını silmək icazəsi' },

  // Settings
  { key: 'settings.view', name: 'Parametrləri Görüntülə', category: 'settings', description: 'Parametrləri görüntüləmək icazəsi' },
  { key: 'settings.edit', name: 'Parametrləri Redaktə Et', category: 'settings', description: 'Parametrləri redaktə etmək icazəsi' },
];

async function seedPermissions() {
  try {
    console.log('İcazələr yaradılır...');

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { key: perm.key },
        update: {},
        create: perm,
      });
    }

    console.log('İcazələr uğurla yaradıldı!');

    // Default rolları yarat
    console.log('Default rollar yaradılır...');

    const adminRole = await prisma.role.upsert({
      where: { key: 'admin' },
      update: {},
      create: {
        key: 'admin',
        name: 'Admin',
        description: 'Tam icazələrə malik administrator',
        isSystem: true,
      },
    });

    const editorRole = await prisma.role.upsert({
      where: { key: 'editor' },
      update: {},
      create: {
        key: 'editor',
        name: 'Redaktor',
        description: 'Xəbərləri yarada və redaktə edə bilən redaktor',
        isSystem: true,
      },
    });

    // Admin rolünə bütün icazələri ver
    const allPermissions = await prisma.permission.findMany();
    await prisma.rolePermission.deleteMany({
      where: { roleId: adminRole.id },
    });
    await prisma.rolePermission.createMany({
      data: allPermissions.map((p) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
    });

    // Editor rolünə məhdud icazələr ver
    const editorPermissions = await prisma.permission.findMany({
      where: {
        key: {
          in: [
            'articles.view',
            'articles.create',
            'articles.edit',
            'articles.publish',
            'categories.view',
            'tags.view',
            'tags.create',
            'media.view',
            'media.upload',
          ],
        },
      },
    });
    await prisma.rolePermission.deleteMany({
      where: { roleId: editorRole.id },
    });
    await prisma.rolePermission.createMany({
      data: editorPermissions.map((p) => ({
        roleId: editorRole.id,
        permissionId: p.id,
      })),
    });

    console.log('Default rollar uğurla yaradıldı!');
  } catch (error) {
    console.error('Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions();

