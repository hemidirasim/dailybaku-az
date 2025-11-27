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

async function checkArticles() {
  try {
    const politicalCategory = await prisma.category.findFirst({
      where: {
        slug: 'siyaset',
      },
    });

    if (!politicalCategory) {
      console.log('❌ Political category not found');
      return;
    }

    const articles = await prisma.article.findMany({
      where: {
        categoryId: politicalCategory.id,
        deletedAt: null,
      },
      include: {
        translations: true,
      },
      take: 50,
    });

    console.log(`Found ${articles.length} political articles:\n`);
    
    for (const article of articles) {
      const azTranslation = article.translations.find((t) => t.locale === 'az');
      const enTranslation = article.translations.find((t) => t.locale === 'en');
      
      if (azTranslation) {
        console.log(`AZ: ${azTranslation.title}`);
      }
      if (enTranslation) {
        console.log(`EN: ${enTranslation.title}`);
      }
      console.log('---');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

checkArticles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });




