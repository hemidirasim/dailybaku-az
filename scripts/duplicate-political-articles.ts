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

// Başlıq variantları
const titleVariations = [
  'Yeni',
  'Son',
  'Əsas',
  'Mühüm',
  'Aktual',
  'Güncel',
  'Vacib',
  'Əhəmiyyətli',
  'Maraqlı',
  'Xüsusi',
  'Ətraflı',
  'Detallı',
  'Geniş',
  'Tam',
  'Əsaslı',
];

const titleSuffixes = [
  'xəbər',
  'məlumat',
  'açıqlama',
  'bəyanat',
  'qərar',
  'görüş',
  'müzakirə',
  'razılaşma',
  'müqavilə',
  'protokol',
];

async function main() {
  console.log('Siyasi xəbərlər çoxaldılır...');

  // Siyasət kateqoriyasını tap
  const politicsCategory = await prisma.category.findFirst({
    where: {
      slug: 'siyaset',
    },
  });

  if (!politicsCategory) {
    console.error('Siyasət kateqoriyası tapılmadı!');
    return;
  }

  // Mövcud siyasi xəbərləri götür
  const existingArticles = await prisma.article.findMany({
    where: {
      categoryId: politicsCategory.id,
      status: 'published',
      deletedAt: null,
    },
    include: {
      translations: true,
      images: true,
    },
    take: 5, // İlk 5 xəbəri götür
    orderBy: {
      publishedAt: 'desc',
    },
  });

  if (existingArticles.length === 0) {
    console.log('Mövcud siyasi xəbər tapılmadı!');
    return;
  }

  console.log(`${existingArticles.length} mövcud xəbər tapıldı`);

  // Hər xəbəri 5-6 dəfə duplicate et (cəmi 10-15 xəbər üçün)
  const articlesToCreate = [];
  let variationIndex = 0;

  for (const article of existingArticles) {
    // Hər xəbərdən 5-6 nüsxə yarat
    for (let i = 0; i < 6; i++) {
      const variation = titleVariations[variationIndex % titleVariations.length];
      const suffix = titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)];
      variationIndex++;

      // Yeni başlıq yarat
      const newTitleAZ = `${variation} ${suffix}: ${article.translations.find(t => t.locale === 'az')?.title || 'Siyasi xəbər'}`;
      const newTitleEN = `New ${suffix}: ${article.translations.find(t => t.locale === 'en')?.title || 'Political news'}`;

      // Slug yarat
      const slugAZ = newTitleAZ
        .toLowerCase()
        .replace(/[əüöğşçı]/g, (m) => {
          const map: { [key: string]: string } = {
            'ə': 'e', 'ü': 'u', 'ö': 'o', 'ğ': 'g', 'ş': 's', 'ç': 'c', 'ı': 'i'
          };
          return map[m] || m;
        })
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      const slugEN = newTitleEN
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      articlesToCreate.push({
        article,
        titleAZ: newTitleAZ,
        titleEN: newTitleEN,
        slugAZ,
        slugEN,
      });
    }
  }

  console.log(`${articlesToCreate.length} yeni xəbər yaradılacaq`);

  // Yeni xəbərləri yarat
  let createdCount = 0;
  for (const item of articlesToCreate) {
    try {
      // Yeni article yarat
      const newArticle = await prisma.article.create({
        data: {
          categoryId: politicsCategory.id,
          status: 'published',
          publishedAt: new Date(),
          views: 0,
          translations: {
            create: [
              {
                locale: 'az',
                title: item.titleAZ,
                slug: `${item.slugAZ}-${Date.now()}-${createdCount}`,
                excerpt: item.article.translations.find(t => t.locale === 'az')?.excerpt || '',
                content: item.article.translations.find(t => t.locale === 'az')?.content || '',
              },
              {
                locale: 'en',
                title: item.titleEN,
                slug: `${item.slugEN}-${Date.now()}-${createdCount}`,
                excerpt: item.article.translations.find(t => t.locale === 'en')?.excerpt || '',
                content: item.article.translations.find(t => t.locale === 'en')?.content || '',
              },
            ],
          },
          images: {
            create: item.article.images.map((img: any) => ({
              url: img.url,
              isPrimary: img.isPrimary,
            })),
          },
        },
      });

      createdCount++;
      if (createdCount % 5 === 0) {
        console.log(`${createdCount} xəbər yaradıldı...`);
      }
    } catch (error: any) {
      console.error(`Xəbər yaradılarkən xəta: ${error.message}`);
    }
  }

  console.log(`✓ Cəmi ${createdCount} yeni siyasi xəbər yaradıldı!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

