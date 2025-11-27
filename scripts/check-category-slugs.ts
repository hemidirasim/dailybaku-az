import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Kateqoriya slug-larını yoxlayırıq...\n');

  const categories = await prisma.category.findMany({
    include: {
      translations: true,
      articles: {
        where: {
          status: 'published',
          deletedAt: null,
        },
        take: 1,
      },
    },
  });

  console.log(`Toplam ${categories.length} kateqoriya tapıldı:\n`);

  for (const category of categories) {
    const azTranslation = category.translations.find((t) => t.locale === 'az');
    const articleCount = category.articles.length;
    
    console.log(`Slug: ${category.slug}`);
    console.log(`  Adı (AZ): ${azTranslation?.name || 'N/A'}`);
    console.log(`  Xəbər sayı: ${articleCount}`);
    console.log(`  Aktiv: ${category.isActive}`);
    console.log('');
  }

  // TopArticles üçün istifadə olunan slug-ları yoxla
  const topArticleSlugs = ['siyaset', 'biznes', 'texno', 'avto'];
  console.log('\nTopArticles üçün istifadə olunan slug-lar:');
  for (const slug of topArticleSlugs) {
    const category = categories.find((c) => c.slug === slug);
    if (category) {
      const azTranslation = category.translations.find((t) => t.locale === 'az');
      console.log(`  ✓ ${slug} → ${azTranslation?.name || 'N/A'}`);
    } else {
      console.log(`  ✗ ${slug} → TAPILMADI`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

