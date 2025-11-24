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

// Demo xəbərlərin başlıqları (pattern-lər)
const demoTitlePatterns = [
  'Gündəm xəbəri:',
  'Aktual mövzu:',
  'Gündəm:',
  'Aktual:',
  'Siyasət:',
  'Dünya:',
  'Biznes:',
  'Texno:',
  'Avto:',
  'Life Style:',
  'Təhsil:',
  'Səyahət:',
  'İdman:',
  'Multimedia:',
  // İngilis versiyaları
  'Agenda news:',
  'Current topic:',
  'Agenda:',
  'Current:',
  'Politics:',
  'World:',
  'Business:',
  'Tech:',
  'Auto:',
  'Education:',
  'Travel:',
  'Sports:',
];

async function main() {
  console.log('Demo xəbərləri silinir...\n');

  // Bütün xəbərləri gətir
  const allArticles = await prisma.article.findMany({
    include: {
      translations: true,
    },
  });

  console.log(`✓ Cəmi ${allArticles.length} xəbər tapıldı\n`);

  let deletedCount = 0;

  for (const article of allArticles) {
    // Xəbərin bütün translation-larını yoxla
    const hasDemoTitle = article.translations.some((translation) => {
      return demoTitlePatterns.some((pattern) => {
        return translation.title?.startsWith(pattern);
      });
    });

    if (hasDemoTitle) {
      // Xəbəri sil (cascade ilə bütün əlaqəli məlumatlar silinəcək)
      await prisma.article.delete({
        where: { id: article.id },
      });

      const title = article.translations.find((t) => t.title)?.title || 'No title';
      console.log(`  ✓ Silindi: ${title}`);
      deletedCount++;
    }
  }

  console.log(`\n✅ Cəmi ${deletedCount} demo xəbər silindi!`);
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

