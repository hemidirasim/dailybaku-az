import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

// Create Prisma client with connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Mövcud kateqoriya menuları silinir...');

  // Köhnə kateqoriya menularını sil
  const deletedMenus = await prisma.menu.deleteMany({
    where: {
      type: 'category',
    },
  });
  console.log(`✓ ${deletedMenus.count} kateqoriya menu silindi`);

  console.log('\nYeni kateqoriyalardan menular yaradılır...');

  // Bütün aktiv kateqoriyaları götür
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  let menuOrder = 0;

  // Hər kateqoriya üçün menu yarat
  for (const category of categories) {
    const azTranslation = category.translations.find((t) => t.locale === 'az');
    const enTranslation = category.translations.find((t) => t.locale === 'en');

    if (!azTranslation || !enTranslation) {
      console.log(`⊘ Kateqoriya tərcüməsi yoxdur: ${category.slug}`);
      continue;
    }

    await prisma.menu.create({
      data: {
        type: 'category',
        targetId: category.id,
        order: menuOrder++,
        isActive: true,
        showInHeader: true,
        showInFooter: false,
        translations: {
          create: [
            {
              locale: 'az',
              title: azTranslation.name,
              url: `/az/category/${category.slug}`,
            },
            {
              locale: 'en',
              title: enTranslation.name,
              url: `/en/category/${category.slug}`,
            },
          ],
        },
      },
    });
    console.log(`✓ Menu yaradıldı: ${azTranslation.name} (${enTranslation.name})`);
  }

  console.log('\n✅ Bütün menular yeniləndi!');
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });




