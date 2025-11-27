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
  console.log('Mövcud kateqoriyalar:');
  
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
  });

  categories.forEach((cat) => {
    const azTranslation = cat.translations.find(t => t.locale === 'az');
    const enTranslation = cat.translations.find(t => t.locale === 'en');
    console.log(`- ${azTranslation?.name || 'N/A'} (AZ) / ${enTranslation?.name || 'N/A'} (EN) - Slug: ${cat.slug}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




