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
  console.log('Kateqoriya adları yenilənir...');

  // Texno kateqoriyasını tap (slug: texnologiya)
  const techCategory = await prisma.category.findFirst({
    where: {
      slug: 'texnologiya',
    },
    include: {
      translations: true,
    },
  });

  if (techCategory) {
    // AZ-də Texno
    await prisma.categoryTranslation.updateMany({
      where: {
        categoryId: techCategory.id,
        locale: 'az',
      },
      data: {
        name: 'Texno',
      },
    });
    
    // EN-də də Texno
    await prisma.categoryTranslation.updateMany({
      where: {
        categoryId: techCategory.id,
        locale: 'en',
      },
      data: {
        name: 'Texno',
      },
    });
    console.log('✓ Texnologiya → Texno (AZ və EN)');
  } else {
    console.log('⊘ Texnologiya kateqoriyası tapılmadı');
  }

  // Cəmiyyət → Life Style (slug: cemiyyet)
  const societyCategory = await prisma.category.findFirst({
    where: {
      slug: 'cemiyyet',
    },
    include: {
      translations: true,
    },
  });

  if (societyCategory) {
    await prisma.categoryTranslation.updateMany({
      where: {
        categoryId: societyCategory.id,
        locale: 'az',
      },
      data: {
        name: 'Life Style',
      },
    });
    
    // İngilis dilində də Life Style
    await prisma.categoryTranslation.updateMany({
      where: {
        categoryId: societyCategory.id,
        locale: 'en',
      },
      data: {
        name: 'Life Style',
      },
    });
    console.log('✓ Cəmiyyət → Life Style');
  } else {
    console.log('⊘ Cəmiyyət kateqoriyası tapılmadı');
  }

  console.log('Tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

