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

async function deleteArticles() {
  try {
    const titlesToDelete = [
      'Beynəlxalq səyahət məsləhətləri',
      'Naxçıvan - qədim şəhər',
      'Quba - meşə və dağlar',
      'Lənkəran - sahil şəhəri',
      'Xınalıq - unikal kənd',
      'Şəki - tarixi şəhər',
      'Qəbələ - təbiət cənnəti',
      'Bakının ən gözəl yerləri',
      'Fitness və idman',
      'Qidalanma və sağlamlıq',
      'Ev dekorasiyası üçün ideyalar',
      'Moda trendləri 2025',
      'Sağlam həyat tərzi üçün 5 məsləhət',
      'Cüdo üzrə dünya kuboku',
      'Voleybol üzrə milli komanda',
      'Atletika üzrə yeni uğurlar',
      'Tennis üzrə beynəlxalq turnir',
      'Üzgüçülük üzrə milli rekord',
      'Gimnastika üzrə Avropa çempionatı',
      'Boks üzrə dünya çempionatı',
      'Futbol çempionatında yeni rekord',
      'Gənc idmançıların uğurları',
      'Yeni idman kompleksi açıldı',
      'Yerli idmançılar Olimpiya oyunlarına hazırlaşır',
    ];

    console.log(`Searching for ${titlesToDelete.length} articles to delete...\n`);

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const title of titlesToDelete) {
      // Find articles with this title in Azerbaijani translations
      const articles = await prisma.article.findMany({
        where: {
          translations: {
            some: {
              title: {
                contains: title,
                mode: 'insensitive',
              },
              locale: 'az',
            },
          },
          deletedAt: null,
        },
        include: {
          translations: true,
        },
      });

      if (articles.length > 0) {
        for (const article of articles) {
          const azTranslation = article.translations.find((t) => t.locale === 'az');
          if (azTranslation && azTranslation.title.includes(title)) {
            // Soft delete - set deletedAt
            await prisma.article.update({
              where: { id: article.id },
              data: {
                deletedAt: new Date(),
              },
            });
            console.log(`✅ Deleted: ${azTranslation.title}`);
            deletedCount++;
          }
        }
      } else {
        console.log(`❌ Not found: ${title}`);
        notFoundCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Deleted: ${deletedCount} articles`);
    console.log(`   ❌ Not found: ${notFoundCount} articles`);
    console.log(`\n✅ Process completed!`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

deleteArticles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });

