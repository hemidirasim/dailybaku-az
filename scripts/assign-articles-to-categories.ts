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
  console.log('Kateqoriyalar tapılır...');

  // Kateqoriyaları tap
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: ['siyast', 'biznes', 'texnologiya', 'avto'],
      },
    },
    include: {
      translations: true,
    },
  });

  console.log(`✓ ${categories.length} kateqoriya tapıldı`);

  // Mövcud xəbərləri götür
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      deletedAt: null,
    },
    include: {
      translations: true,
      category: {
        include: {
          translations: true,
        },
      },
    },
    take: 20, // İlk 20 xəbəri götür
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`✓ ${articles.length} xəbər tapıldı`);

  if (articles.length === 0) {
    console.log('⚠️ Xəbər tapılmadı. Əvvəlcə xəbərlər əlavə edin.');
    return;
  }

  // Hər kateqoriya üçün 1-2 xəbər təyin et
  let articleIndex = 0;
  for (const category of categories) {
    const categoryName = category.translations.find((t) => t.locale === 'az')?.name || category.slug;
    console.log(`\n${categoryName} kateqoriyasına xəbərlər təyin edilir...`);

    // Hər kateqoriya üçün 2 xəbər təyin et (əgər varsa)
    const articlesToAssign = articles.slice(articleIndex, articleIndex + 2);
    
    for (const article of articlesToAssign) {
      const articleTitle = article.translations.find((t) => t.locale === 'az')?.title || 'Naməlum';
      
      await prisma.article.update({
        where: { id: article.id },
        data: {
          categoryId: category.id,
        },
      });
      
      console.log(`  ✓ "${articleTitle}" → ${categoryName}`);
    }

    articleIndex += 2;
    
    // Əgər xəbərlər bitibsə, dayan
    if (articleIndex >= articles.length) {
      break;
    }
  }

  console.log('\n✅ Bütün xəbərlər kateqoriyalara təyin edildi!');
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

