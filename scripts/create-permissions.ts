import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const permissions = [
  // Dashboard
  { key: 'dashboard.view', name: 'Dashboard Görüntüləmə', category: 'Dashboard' },
  
  // Articles
  { key: 'articles.view', name: 'Xəbərləri Görüntüləmə', category: 'Xəbərlər' },
  { key: 'articles.create', name: 'Xəbər Yaratma', category: 'Xəbərlər' },
  { key: 'articles.edit', name: 'Xəbər Redaktə Etmə', category: 'Xəbərlər' },
  { key: 'articles.delete', name: 'Xəbər Silmə', category: 'Xəbərlər' },
  
  // Categories
  { key: 'categories.view', name: 'Bölmələri Görüntüləmə', category: 'Bölmələr' },
  { key: 'categories.create', name: 'Bölmə Yaratma', category: 'Bölmələr' },
  { key: 'categories.edit', name: 'Bölmə Redaktə Etmə', category: 'Bölmələr' },
  { key: 'categories.delete', name: 'Bölmə Silmə', category: 'Bölmələr' },
  
  // Tags
  { key: 'tags.view', name: 'Tagları Görüntüləmə', category: 'Taglar' },
  { key: 'tags.create', name: 'Tag Yaratma', category: 'Taglar' },
  { key: 'tags.edit', name: 'Tag Redaktə Etmə', category: 'Taglar' },
  { key: 'tags.delete', name: 'Tag Silmə', category: 'Taglar' },
  
  // Menus
  { key: 'menus.view', name: 'Menuları Görüntüləmə', category: 'Menular' },
  { key: 'menus.create', name: 'Menu Yaratma', category: 'Menular' },
  { key: 'menus.edit', name: 'Menu Redaktə Etmə', category: 'Menular' },
  { key: 'menus.delete', name: 'Menu Silmə', category: 'Menular' },
  
  // Pages
  { key: 'pages.view', name: 'Statik Səhifələri Görüntüləmə', category: 'Statik Səhifələr' },
  { key: 'pages.create', name: 'Statik Səhifə Yaratma', category: 'Statik Səhifələr' },
  { key: 'pages.edit', name: 'Statik Səhifə Redaktə Etmə', category: 'Statik Səhifələr' },
  { key: 'pages.delete', name: 'Statik Səhifə Silmə', category: 'Statik Səhifələr' },
  
  // Advertisements
  { key: 'advertisements.view', name: 'Reklamları Görüntüləmə', category: 'Reklamlar' },
  { key: 'advertisements.create', name: 'Reklam Yaratma', category: 'Reklamlar' },
  { key: 'advertisements.edit', name: 'Reklam Redaktə Etmə', category: 'Reklamlar' },
  { key: 'advertisements.delete', name: 'Reklam Silmə', category: 'Reklamlar' },
  
  // Users
  { key: 'users.view', name: 'İstifadəçiləri Görüntüləmə', category: 'İstifadəçilər' },
  { key: 'users.create', name: 'İstifadəçi Yaratma', category: 'İstifadəçilər' },
  { key: 'users.edit', name: 'İstifadəçi Redaktə Etmə', category: 'İstifadəçilər' },
  { key: 'users.delete', name: 'İstifadəçi Silmə', category: 'İstifadəçilər' },
  
  // Roles
  { key: 'roles.view', name: 'Rolları Görüntüləmə', category: 'Rollar' },
  { key: 'roles.create', name: 'Rol Yaratma', category: 'Rollar' },
  { key: 'roles.edit', name: 'Rol Redaktə Etmə', category: 'Rollar' },
  { key: 'roles.delete', name: 'Rol Silmə', category: 'Rollar' },
  
  // Media
  { key: 'media.view', name: 'Media Görüntüləmə', category: 'Media' },
  { key: 'media.upload', name: 'Media Yükləmə', category: 'Media' },
  { key: 'media.delete', name: 'Media Silmə', category: 'Media' },
  
  // Settings
  { key: 'settings.view', name: 'Parametrləri Görüntüləmə', category: 'Parametrlər' },
  { key: 'settings.edit', name: 'Parametrləri Redaktə Etmə', category: 'Parametrlər' },
];

async function main() {
  console.log('Creating permissions...');
  
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: {
        name: perm.name,
        category: perm.category,
      },
      create: {
        key: perm.key,
        name: perm.name,
        category: perm.category,
      },
    });
    console.log(`✅ ${perm.key} - ${perm.name}`);
  }
  
  console.log('All permissions created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
