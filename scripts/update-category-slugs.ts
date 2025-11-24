import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

// Initialize Prisma Client
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Kateqoriya slug-ları yenilənir...');

  // Life Style kateqoriyasını tap (slug: cemiyyet)
  const lifeStyleCategory = await prisma.category.findFirst({
    where: {
      slug: 'cemiyyet',
    },
  });

  if (lifeStyleCategory) {
    await prisma.category.update({
      where: { id: lifeStyleCategory.id },
      data: {
        slug: 'life-style',
      },
    });
    console.log('✓ Life Style kateqoriyasının slug-u "life-style" olaraq yeniləndi');
  } else {
    console.log('⊘ Life Style kateqoriyası tapılmadı (slug: cemiyyet)');
  }

  // Texnologiya kateqoriyasını tap (slug: texnologiya)
  const techCategory = await prisma.category.findFirst({
    where: {
      slug: 'texnologiya',
    },
  });

  if (techCategory) {
    await prisma.category.update({
      where: { id: techCategory.id },
      data: {
        slug: 'texno',
      },
    });
    console.log('✓ Texnologiya kateqoriyasının slug-u "texno" olaraq yeniləndi');
  } else {
    console.log('⊘ Texnologiya kateqoriyası tapılmadı (slug: texnologiya)');
  }

  // Yoxlamaq üçün kateqoriyaları göstər
  console.log('\n📋 Yenilənmiş kateqoriyalar:');
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: ['life-style', 'texno'],
      },
    },
    include: {
      translations: true,
    },
  });

  categories.forEach((cat) => {
    const azTrans = cat.translations.find((t) => t.locale === 'az');
    const enTrans = cat.translations.find((t) => t.locale === 'en');
    console.log(`  - Slug: ${cat.slug} | AZ: ${azTrans?.name} | EN: ${enTrans?.name}`);
  });

  console.log('\nTamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
