import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { generateSlug } from '../lib/utils';

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
  console.log('Mövcud kateqoriyalar silinir...');

  // Bütün mövcud kateqoriyaları sil
  const deletedCategories = await prisma.category.deleteMany({});
  console.log(`✓ ${deletedCategories.count} kateqoriya silindi`);

  console.log('\nYeni kateqoriyalar əlavə edilir...');

  // Yeni kateqoriyalar
  const categories = [
    { az: 'Gündəm', en: 'Agenda' },
    { az: 'Siyasət', en: 'Politics' },
    { az: 'Dünya', en: 'World' },
    { az: 'Biznes', en: 'Business' },
    { az: 'Texnologiya', en: 'Technology' },
    { az: 'Avto', en: 'Auto' },
    { az: 'Cəmiyyət', en: 'Society' },
    { az: 'Təhsil', en: 'Education' },
    { az: 'Səyahət', en: 'Travel' },
    { az: 'İdman', en: 'Sports' },
    { az: 'Multimedia', en: 'Multimedia' },
  ];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const slug = generateSlug(category.az);

    await prisma.category.create({
      data: {
        slug,
        order: i,
        isActive: true,
        translations: {
          create: [
            {
              locale: 'az',
              name: category.az,
              description: null,
            },
            {
              locale: 'en',
              name: category.en,
              description: null,
            },
          ],
        },
      },
    });
    console.log(`✓ Kateqoriya əlavə edildi: ${category.az} (${category.en})`);
  }

  console.log('\n✅ Bütün kateqoriyalar yeniləndi!');
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

