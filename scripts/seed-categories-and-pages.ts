import 'dotenv/config';
import { prisma } from '../lib/prisma';

// Slug oluşturma fonksiyonu
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function main() {
  console.log('Bölmələr və səhifələr əlavə edilir...');

  // Bölmələr
  const categories = [
    { az: 'Gündəm', en: 'Agenda' },
    { az: 'Siyasət', en: 'Politics' },
    { az: 'Dünya', en: 'World' },
    { az: 'Biznes', en: 'Business' },
    { az: 'Texnologiya', en: 'Technology' },
    { az: 'Maqazin', en: 'Magazine' },
    { az: 'İdman', en: 'Sports' },
    { az: 'Oxucu məktubları', en: 'Reader Letters' },
  ];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const slug = generateSlug(category.az);

    // Mövcud bölməni yoxla
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          slug,
          order: i,
          isActive: true,
          translations: {
            create: [
              {
                locale: 'az',
                name: category.az,
                description: null,
              },
              {
                locale: 'en',
                name: category.en,
                description: null,
              },
            ],
          },
        },
      });
      console.log(`✓ Bölmə əlavə edildi: ${category.az}`);
    } else {
      console.log(`⊘ Bölmə artıq mövcuddur: ${category.az}`);
    }
  }

  // Statik səhifələr
  const pages = [
    { az: { title: 'Haqqımızda', content: 'Haqqımızda məzmunu buraya əlavə edin.' }, en: { title: 'About Us', content: 'Add about us content here.' } },
    { az: { title: 'Əlaqə', content: 'Əlaqə məlumatları buraya əlavə edin.' }, en: { title: 'Contact', content: 'Add contact information here.' } },
    { az: { title: 'Qaydalar', content: 'Qaydalar və şərtlər məzmunu buraya əlavə edin.' }, en: { title: 'Terms', content: 'Add terms and conditions content here.' } },
  ];

  for (const page of pages) {
    const slug = generateSlug(page.az.title);

    // Mövcud səhifəni yoxla
    const existing = await prisma.page.findUnique({
      where: { slug },
    });

    if (!existing) {
      await prisma.page.create({
        data: {
          slug,
          isActive: true,
          translations: {
            create: [
              {
                locale: 'az',
                title: page.az.title,
                slug: generateSlug(page.az.title),
                content: page.az.content,
              },
              {
                locale: 'en',
                title: page.en.title,
                slug: generateSlug(page.en.title),
                content: page.en.content,
              },
            ],
          },
        },
      });
      console.log(`✓ Səhifə əlavə edildi: ${page.az.title}`);
    } else {
      console.log(`⊘ Səhifə artıq mövcuddur: ${page.az.title}`);
    }
  }

  console.log('\n✅ Bütün bölmələr və səhifələr əlavə edildi!');
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

