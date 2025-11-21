import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Bölmələr və səhifələrdən menular yaradılır...');

  // Bütün bölmələri götür
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Bütün səhifələri götür
  const pages = await prisma.page.findMany({
    include: {
      translations: true,
    },
  });

  // Mövcud menuları yoxla
  const existingMenus = await prisma.menu.findMany({
    include: {
      translations: true,
    },
  });

  let menuOrder = 0;

  // Bölmələr üçün menular yarat
  for (const category of categories) {
    const azTranslation = category.translations.find((t) => t.locale === 'az');
    const enTranslation = category.translations.find((t) => t.locale === 'en');

    if (!azTranslation || !enTranslation) continue;

    // Bu bölmə üçün menu artıq mövcuddurmu?
    const existingMenu = existingMenus.find(
      (m) => m.type === 'category' && m.targetId === category.id
    );

    if (!existingMenu) {
      await prisma.menu.create({
        data: {
          type: 'category',
          targetId: category.id,
          order: menuOrder++,
          isActive: true,
          translations: {
            create: [
              {
                locale: 'az',
                title: azTranslation.name,
                url: `/az/category/${category.slug}`,
              },
              {
                locale: 'en',
                title: enTranslation.name,
                url: `/en/category/${category.slug}`,
              },
            ],
          },
        },
      });
      console.log(`✓ Menu yaradıldı (Bölmə): ${azTranslation.name}`);
    } else {
      console.log(`⊘ Menu artıq mövcuddur (Bölmə): ${azTranslation.name}`);
    }
  }

  // Səhifələr üçün menular yarat
  for (const page of pages) {
    const azTranslation = page.translations.find((t) => t.locale === 'az');
    const enTranslation = page.translations.find((t) => t.locale === 'en');

    if (!azTranslation || !enTranslation) continue;

    // Bu səhifə üçün menu artıq mövcuddurmu?
    const existingMenu = existingMenus.find(
      (m) => m.type === 'page' && m.targetId === page.id
    );

    if (!existingMenu) {
      await prisma.menu.create({
        data: {
          type: 'page',
          targetId: page.id,
          order: menuOrder++,
          isActive: true,
          translations: {
            create: [
              {
                locale: 'az',
                title: azTranslation.title,
                url: `/az/page/${azTranslation.slug}`,
              },
              {
                locale: 'en',
                title: enTranslation.title,
                url: `/en/page/${enTranslation.slug}`,
              },
            ],
          },
        },
      });
      console.log(`✓ Menu yaradıldı (Səhifə): ${azTranslation.title}`);
    } else {
      console.log(`⊘ Menu artıq mövcuddur (Səhifə): ${azTranslation.title}`);
    }
  }

  console.log('\n✅ Bütün menular yaradıldı!');
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

