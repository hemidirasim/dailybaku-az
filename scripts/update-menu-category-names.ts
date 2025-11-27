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
  console.log('Menu kateqoriya adları yenilənir...');

  // Texno kateqoriyasını tap
  const techCategory = await prisma.category.findFirst({
    where: {
      slug: 'texnologiya',
    },
    include: {
      translations: true,
    },
  });

  if (techCategory) {
    // Bu kateqoriyaya aid menuları tap
    const menus = await prisma.menu.findMany({
      where: {
        type: 'category',
        targetId: techCategory.id,
      },
      include: {
        translations: true,
      },
    });

    for (const menu of menus) {
      // AZ translation-u yenilə
      const azTranslation = menu.translations.find(t => t.locale === 'az');
      if (azTranslation) {
        await prisma.menuTranslation.update({
          where: {
            id: azTranslation.id,
          },
          data: {
            title: 'Texno',
          },
        });
      } else {
        // Əgər yoxdursa yarat
        await prisma.menuTranslation.create({
          data: {
            menuId: menu.id,
            locale: 'az',
            title: 'Texno',
          },
        });
      }

      // EN translation-u yenilə
      const enTranslation = menu.translations.find(t => t.locale === 'en');
      if (enTranslation) {
        await prisma.menuTranslation.update({
          where: {
            id: enTranslation.id,
          },
          data: {
            title: 'Texno',
          },
        });
      } else {
        // Əgər yoxdursa yarat
        await prisma.menuTranslation.create({
          data: {
            menuId: menu.id,
            locale: 'en',
            title: 'Texno',
          },
        });
      }
    }
    console.log(`✓ ${menus.length} Texno menu yeniləndi`);
  } else {
    console.log('⊘ Texnologiya kateqoriyası tapılmadı');
  }

  // Life Style kateqoriyasını tap
  const societyCategory = await prisma.category.findFirst({
    where: {
      slug: 'cemiyyet',
    },
    include: {
      translations: true,
    },
  });

  if (societyCategory) {
    // Bu kateqoriyaya aid menuları tap
    const menus = await prisma.menu.findMany({
      where: {
        type: 'category',
        targetId: societyCategory.id,
      },
      include: {
        translations: true,
      },
    });

    for (const menu of menus) {
      // AZ translation-u yenilə
      const azTranslation = menu.translations.find(t => t.locale === 'az');
      if (azTranslation) {
        await prisma.menuTranslation.update({
          where: {
            id: azTranslation.id,
          },
          data: {
            title: 'Life Style',
          },
        });
      } else {
        // Əgər yoxdursa yarat
        await prisma.menuTranslation.create({
          data: {
            menuId: menu.id,
            locale: 'az',
            title: 'Life Style',
          },
        });
      }

      // EN translation-u yenilə
      const enTranslation = menu.translations.find(t => t.locale === 'en');
      if (enTranslation) {
        await prisma.menuTranslation.update({
          where: {
            id: enTranslation.id,
          },
          data: {
            title: 'Life Style',
          },
        });
      } else {
        // Əgər yoxdursa yarat
        await prisma.menuTranslation.create({
          data: {
            menuId: menu.id,
            locale: 'en',
            title: 'Life Style',
          },
        });
      }
    }
    console.log(`✓ ${menus.length} Life Style menu yeniləndi`);
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




