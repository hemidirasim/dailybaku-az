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

async function assignArticlesToWorld() {
  try {
    console.log('🔍 Dünya kateqoriyasını tapır...\n');

    // Dünya kateqoriyasını tap
    const worldCategory = await prisma.category.findFirst({
      where: {
        slug: 'dunya',
      },
    });

    if (!worldCategory) {
      console.log('❌ Dünya kateqoriyası tapılmadı!');
      return;
    }

    console.log(`✅ Dünya kateqoriyası tapıldı: ${worldCategory.id}\n`);

    // Bütün xəbərləri götür (kateqoriyası olmayan və ya başqa kateqoriyada olan)
    const allArticles = await prisma.article.findMany({
      where: {
        deletedAt: null,
        status: 'published',
      },
      include: {
        translations: true,
        category: true,
      },
      take: 50, // İlk 50 xəbəri götür
    });

    console.log(`📰 Ümumi xəbər sayı: ${allArticles.length}\n`);
    console.log('🔍 Dünya kateqoriyasına təyin ediləcək xəbərləri seçir...\n');

    // Dünya kateqoriyasına təyin ediləcək xəbərləri seç
    // Əvvəlcə kateqoriyası olmayan xəbərləri, sonra digər kateqoriyalardan xəbərləri götür
    const articlesToAssign = allArticles
      .filter(article => {
        // Kateqoriyası yoxdursa və ya başqa kateqoriyadadırsa
        return !article.categoryId || article.categoryId !== worldCategory.id;
      })
      .slice(0, 10); // 10 xəbər seç

    if (articlesToAssign.length === 0) {
      console.log('❌ Təyin ediləcək xəbər tapılmadı!');
      return;
    }

    let assignedCount = 0;

    for (const article of articlesToAssign) {
      await prisma.article.update({
        where: { id: article.id },
        data: {
          categoryId: worldCategory.id,
        },
      });

      const azTranslation = article.translations.find(t => t.locale === 'az');
      const enTranslation = article.translations.find(t => t.locale === 'en');
      const articleTitle = azTranslation?.title || enTranslation?.title || 'Naməlum';
      
      console.log(`✅ "${articleTitle.substring(0, 60)}..." → Dünya`);
      assignedCount++;
    }

    console.log(`\n📊 Nəticə:`);
    console.log(`   ✅ Təyin edildi: ${assignedCount} xəbər`);
    console.log(`\n✅ Proses tamamlandı!`);
  } catch (error: any) {
    console.error('❌ Xəta:', error);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

assignArticlesToWorld()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });




