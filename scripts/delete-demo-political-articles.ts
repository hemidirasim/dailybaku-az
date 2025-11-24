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

async function deleteDemoArticles() {
  try {
    console.log('Searching for demo articles to delete...\n');

    // Find all articles
    const allArticles = await prisma.article.findMany({
      where: {
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
    });

    let deletedCount = 0;
    const deletedIds = new Set<string>();

    // Delete articles with "New" in English title and "Political news" at the end
    for (const article of allArticles) {
      const enTranslation = article.translations.find((t) => t.locale === 'en');
      const azTranslation = article.translations.find((t) => t.locale === 'az');
      
      if (enTranslation && enTranslation.title.includes('New') && enTranslation.title.includes('Political news')) {
        if (!deletedIds.has(article.id)) {
          await prisma.article.update({
            where: { id: article.id },
            data: {
              deletedAt: new Date(),
            },
          });
          console.log(`✅ Deleted: ${enTranslation.title}`);
          if (azTranslation) {
            console.log(`   (AZ: ${azTranslation.title})`);
          }
          deletedCount++;
          deletedIds.add(article.id);
        }
      }
      
      // Also delete "Azerbaijan national team achieves new success" or Sports articles with similar pattern
      if (enTranslation && (
        enTranslation.title.includes('Azerbaijan national team achieves new success') ||
        (enTranslation.title.includes('national team') && enTranslation.title.includes('success'))
      )) {
        if (!deletedIds.has(article.id)) {
          await prisma.article.update({
            where: { id: article.id },
            data: {
              deletedAt: new Date(),
            },
          });
          console.log(`✅ Deleted: ${enTranslation.title}`);
          if (azTranslation) {
            console.log(`   (AZ: ${azTranslation.title})`);
          }
          deletedCount++;
          deletedIds.add(article.id);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Deleted: ${deletedCount} articles`);
    console.log(`\n✅ Process completed!`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

deleteDemoArticles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });
