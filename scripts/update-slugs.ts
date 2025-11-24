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
  console.log('Kateqoriyaların slug-ları yenilənir...');

  // Bütün kateqoriyaları götür
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
  });

  for (const category of categories) {
    const azTranslation = category.translations.find((t) => t.locale === 'az');
    if (!azTranslation) continue;

    const newSlug = generateSlug(azTranslation.name);
    
    if (newSlug !== category.slug) {
      // Yeni slug-un mövcud olub-olmadığını yoxla
      const existing = await prisma.category.findUnique({
        where: { slug: newSlug },
      });

      if (existing && existing.id !== category.id) {
        console.log(`⚠️  Slug artıq mövcuddur: ${newSlug} (${azTranslation.name})`);
        continue;
      }

      await prisma.category.update({
        where: { id: category.id },
        data: { slug: newSlug },
      });
      console.log(`✓ ${azTranslation.name}: ${category.slug} → ${newSlug}`);
    }
  }

  console.log('\nMəqalələrin slug-ları yenilənir...');

  // Bütün məqalələri götür
  const articles = await prisma.article.findMany({
    include: {
      translations: true,
    },
    take: 1000, // İlk 1000 məqaləni yenilə
  });

  let updatedCount = 0;
  for (const article of articles) {
    const azTranslation = article.translations.find((t) => t.locale === 'az');
    if (!azTranslation) continue;

    const newSlug = generateSlug(azTranslation.title);
    
    if (newSlug !== azTranslation.slug) {
      // Yeni slug-un mövcud olub-olmadığını yoxla
      const existing = await prisma.articleTranslation.findFirst({
        where: {
          locale: 'az',
          slug: newSlug,
          articleId: { not: article.id },
        },
      });

      if (existing) {
        console.log(`⚠️  Slug artıq mövcuddur: ${newSlug} (${azTranslation.title})`);
        continue;
      }

      await prisma.articleTranslation.update({
        where: { id: azTranslation.id },
        data: { slug: newSlug },
      });
      updatedCount++;
      if (updatedCount <= 10) {
        console.log(`✓ ${azTranslation.title.substring(0, 50)}...: ${azTranslation.slug} → ${newSlug}`);
      }
    }
  }

  console.log(`\n✓ ${updatedCount} məqalə slug-u yeniləndi`);

  console.log('\n✅ Bütün slug-lar yeniləndi!');
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

