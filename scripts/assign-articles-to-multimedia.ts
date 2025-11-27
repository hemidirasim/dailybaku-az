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

// Multimedia açar sözləri
const multimediaKeywords = [
  'multimedia', 'video', 'foto', 'şəkil', 'qalereya', 'qalereya', 'kamera',
  'fotoqrafiya', 'videoqrafiya', 'kino', 'televiziya', 'radio', 'podcast',
  'youtube', 'instagram', 'tiktok', 'social media', 'sosial media',
  'media', 'mətbuat', 'jurnalistika', 'reportaj', 'sənədli film',
  'multimedia', 'video', 'photo', 'image', 'gallery', 'camera',
  'photography', 'videography', 'cinema', 'television', 'radio', 'podcast',
  'youtube', 'instagram', 'tiktok', 'social media', 'media', 'press',
  'journalism', 'report', 'documentary'
];

async function assignArticlesToMultimedia() {
  try {
    console.log('🔍 Multimedia kateqoriyasını tapır...\n');

    // Multimedia kateqoriyasını tap
    const multimediaCategory = await prisma.category.findFirst({
      where: {
        slug: 'multimedia',
      },
    });

    if (!multimediaCategory) {
      console.log('❌ Multimedia kateqoriyası tapılmadı!');
      return;
    }

    console.log(`✅ Multimedia kateqoriyası tapıldı: ${multimediaCategory.id}\n`);

    // Bütün xəbərləri götür
    const allArticles = await prisma.article.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        translations: true,
      },
    });

    console.log(`📰 Ümumi xəbər sayı: ${allArticles.length}\n`);
    console.log('🔍 Multimedia-ya uyğun xəbərləri axtarır...\n');

    let assignedCount = 0;

    for (const article of allArticles) {
      const azTranslation = article.translations.find(t => t.locale === 'az');
      const enTranslation = article.translations.find(t => t.locale === 'en');

      const title = (azTranslation?.title || enTranslation?.title || '').toLowerCase();
      const content = (azTranslation?.content || enTranslation?.content || '').toLowerCase();
      const excerpt = (azTranslation?.excerpt || enTranslation?.excerpt || '').toLowerCase();
      const text = `${title} ${excerpt} ${content}`;

      // Açar sözləri yoxla
      let score = 0;
      for (const keyword of multimediaKeywords) {
        const keywordLower = keyword.toLowerCase();
        if (text.includes(keywordLower)) {
          score++;
          // Başlıqda olarsa daha çox bal ver
          if (title.includes(keywordLower)) {
            score += 2;
          }
        }
      }

      // Əgər score 2-dən çoxdursa və ya kateqoriyası yoxdursa, təyin et
      if (score >= 2 || (!article.categoryId && score >= 1)) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            categoryId: multimediaCategory.id,
          },
        });

        const articleTitle = azTranslation?.title || enTranslation?.title || 'Naməlum';
        console.log(`✅ "${articleTitle.substring(0, 60)}..." → Multimedia (score: ${score})`);
        assignedCount++;
      }
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

assignArticlesToMultimedia()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });




