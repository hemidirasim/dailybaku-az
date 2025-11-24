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
  console.log('Mövcud menular:');
  
  const menus = await prisma.menu.findMany({
    where: {
      type: 'category',
      isActive: true,
    },
    include: {
      translations: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  for (const menu of menus) {
    const azTranslation = menu.translations.find(t => t.locale === 'az');
    const enTranslation = menu.translations.find(t => t.locale === 'en');
    
    if (menu.targetId) {
      const category = await prisma.category.findUnique({
        where: { id: menu.targetId },
        include: {
          translations: true,
        },
      });
      
      const categoryAz = category?.translations.find(t => t.locale === 'az');
      const categoryEn = category?.translations.find(t => t.locale === 'en');
      console.log(`- Menu: ${azTranslation?.title || 'N/A'} (AZ) / ${enTranslation?.title || 'N/A'} (EN)`);
      console.log(`  Category: ${categoryAz?.name || 'N/A'} (AZ) / ${categoryEn?.name || 'N/A'} (EN)`);
    } else {
      console.log(`- Menu: ${azTranslation?.title || 'N/A'} (AZ) / ${enTranslation?.title || 'N/A'} (EN) - No category`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

