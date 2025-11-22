import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultPermissions = [
  // Articles
  { key: 'articles.view', name: 'Xəbərləri görüntülə', category: 'articles', description: 'Xəbərləri görüntüləmə icazəsi' },
  { key: 'articles.create', name: 'Xəbər yarat', category: 'articles', description: 'Yeni xəbər yaratma icazəsi' },
  { key: 'articles.edit', name: 'Xəbər redaktə et', category: 'articles', description: 'Xəbər redaktə etmə icazəsi' },
  { key: 'articles.delete', name: 'Xəbər sil', category: 'articles', description: 'Xəbər silmə icazəsi' },
  
  // Categories
  { key: 'categories.view', name: 'Kateqoriyaları görüntülə', category: 'categories', description: 'Kateqoriyaları görüntüləmə icazəsi' },
  { key: 'categories.create', name: 'Kateqoriya yarat', category: 'categories', description: 'Yeni kateqoriya yaratma icazəsi' },
  { key: 'categories.edit', name: 'Kateqoriya redaktə et', category: 'categories', description: 'Kateqoriya redaktə etmə icazəsi' },
  { key: 'categories.delete', name: 'Kateqoriya sil', category: 'categories', description: 'Kateqoriya silmə icazəsi' },
  
  // Menus
  { key: 'menus.view', name: 'Menü görüntülə', category: 'menus', description: 'Menü görüntüləmə icazəsi' },
  { key: 'menus.create', name: 'Menü yarat', category: 'menus', description: 'Yeni menü yaratma icazəsi' },
  { key: 'menus.edit', name: 'Menü redaktə et', category: 'menus', description: 'Menü redaktə etmə icazəsi' },
  { key: 'menus.delete', name: 'Menü sil', category: 'menus', description: 'Menü silmə icazəsi' },
  
  // Pages
  { key: 'pages.view', name: 'Səhifələri görüntülə', category: 'pages', description: 'Səhifələri görüntüləmə icazəsi' },
  { key: 'pages.create', name: 'Səhifə yarat', category: 'pages', description: 'Yeni səhifə yaratma icazəsi' },
  { key: 'pages.edit', name: 'Səhifə redaktə et', category: 'pages', description: 'Səhifə redaktə etmə icazəsi' },
  { key: 'pages.delete', name: 'Səhifə sil', category: 'pages', description: 'Səhifə silmə icazəsi' },
  
  // Users
  { key: 'users.view', name: 'İstifadəçiləri görüntülə', category: 'users', description: 'İstifadəçiləri görüntüləmə icazəsi' },
  { key: 'users.create', name: 'İstifadəçi yarat', category: 'users', description: 'Yeni istifadəçi yaratma icazəsi' },
  { key: 'users.edit', name: 'İstifadəçi redaktə et', category: 'users', description: 'İstifadəçi redaktə etmə icazəsi' },
  { key: 'users.delete', name: 'İstifadəçi sil', category: 'users', description: 'İstifadəçi silmə icazəsi' },
  
  // Roles
  { key: 'roles.view', name: 'Rolları görüntülə', category: 'roles', description: 'Rolları görüntüləmə icazəsi' },
  { key: 'roles.create', name: 'Rol yarat', category: 'roles', description: 'Yeni rol yaratma icazəsi' },
  { key: 'roles.edit', name: 'Rol redaktə et', category: 'roles', description: 'Rol redaktə etmə icazəsi' },
  { key: 'roles.delete', name: 'Rol sil', category: 'roles', description: 'Rol silmə icazəsi' },
  
  // Permissions
  { key: 'permissions.view', name: 'İcazələri görüntülə', category: 'permissions', description: 'İcazələri görüntüləmə icazəsi' },
  { key: 'permissions.create', name: 'İcazə yarat', category: 'permissions', description: 'Yeni icazə yaratma icazəsi' },
  { key: 'permissions.edit', name: 'İcazə redaktə et', category: 'permissions', description: 'İcazə redaktə etmə icazəsi' },
  { key: 'permissions.delete', name: 'İcazə sil', category: 'permissions', description: 'İcazə silmə icazəsi' },
  
  // Media
  { key: 'media.view', name: 'Media görüntülə', category: 'media', description: 'Media fayllarını görüntüləmə icazəsi' },
  { key: 'media.upload', name: 'Media yüklə', category: 'media', description: 'Media faylı yükləmə icazəsi' },
  { key: 'media.delete', name: 'Media sil', category: 'media', description: 'Media faylı silmə icazəsi' },
];

async function main() {
  console.log('Default icazələr yaradılır...');
  
  for (const permission of defaultPermissions) {
    try {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          name: permission.name,
          category: permission.category,
          description: permission.description,
        },
        create: permission,
      });
      console.log(`✅ ${permission.key} - ${permission.name}`);
    } catch (error) {
      console.error(`❌ ${permission.key} xətası:`, error);
    }
  }
  
  console.log('\n✅ Bütün icazələr yaradıldı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
