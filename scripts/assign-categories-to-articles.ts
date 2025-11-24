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

// Kateqoriya açar sözləri
const categoryKeywords: Record<string, string[]> = {
  siyaset: [
    'siyasət', 'siyasi', 'prezident', 'baş nazir', 'nazir', 'parlament', 'məclis',
    'seçki', 'partiya', 'hökumət', 'dövlət', 'diplomat', 'səfir', 'beynəlxalq',
    'tramp', 'biden', 'putin', 'ərdоğan', 'ukrayna', 'rusiya', 'nato', 'avropa',
    'müqavilə', 'protokol', 'görüş', 'samit', 'konfrans', 'bəyanat', 'açıqlama',
    'qərar', 'razılaşma', 'müzakirə', 'məlumat', 'xəbər', 'political', 'politics',
    'president', 'minister', 'government', 'parliament', 'election', 'party', 'diplomat',
    'international', 'trump', 'biden', 'putin', 'ukraine', 'russia', 'nato', 'europe',
    'treaty', 'protocol', 'meeting', 'summit', 'conference', 'statement', 'decision',
    'agreement', 'discussion'
  ],
  biznes: [
    'biznes', 'iqtisadi', 'iqtisadiyyat', 'ekonomi', 'ekonomik', 'bazar', 'sahə',
    'investisiya', 'investor', 'şirkət', 'korporasiya', 'bank', 'maliyyə', 'valyuta',
    'dollar', 'euro', 'neft', 'qaz', 'enerji', 'sənaye', 'istehsal', 'ixrac', 'idxal',
    'biznes', 'business', 'economy', 'economic', 'market', 'investment', 'investor',
    'company', 'corporation', 'bank', 'finance', 'currency', 'dollar', 'euro', 'oil',
    'gas', 'energy', 'industry', 'production', 'export', 'import'
  ],
  texno: [
    'texnologiya', 'texno', 'texnik', 'kompüter', 'kompyuter', 'telefon', 'smartfon',
    'internet', 'onlayn', 'digital', 'rəqəmsal', 'ai', 'artificial intelligence',
    'süni intellekt', 'robot', 'avtomatlaşdırma', 'proqram', 'tətbiq', 'app',
    'startap', 'innovasiya', 'texnologiya', 'technology', 'tech', 'computer', 'phone',
    'smartphone', 'internet', 'online', 'digital', 'ai', 'artificial intelligence',
    'robot', 'automation', 'software', 'application', 'app', 'startup', 'innovation'
  ],
  avto: [
    'avtomobil', 'avto', 'maşın', 'nəqliyyat', 'yol', 'sürücü', 'avtomobil',
    'bmw', 'mercedes', 'toyota', 'tesla', 'elektrik', 'elektrikli', 'benzin',
    'dizel', 'motor', 'avtomobil', 'car', 'automobile', 'vehicle', 'transport',
    'road', 'driver', 'bmw', 'mercedes', 'toyota', 'tesla', 'electric', 'petrol',
    'diesel', 'engine'
  ],
  idman: [
    'idman', 'idmançı', 'futbol', 'basketbol', 'voleybol', 'tennis', 'üzgüçülük',
    'atletika', 'cüdo', 'boks', 'gimnastika', 'olimpiya', 'çempionat', 'turnir',
    'komanda', 'oyunçu', 'məşq', 'idman', 'sport', 'sports', 'football', 'basketball',
    'volleyball', 'tennis', 'swimming', 'athletics', 'judo', 'boxing', 'gymnastics',
    'olympic', 'championship', 'tournament', 'team', 'player', 'training'
  ],
  seyahet: [
    'səyahət', 'turizm', 'turist', 'səfər', 'yol', 'otellər', 'uçuş', 'təyyarə',
    'gəmi', 'qatar', 'mehmanxana', 'kurort', 'istirahət', 'gəzinti', 'görüş',
    'məkan', 'şəhər', 'ölkə', 'travel', 'tourism', 'tourist', 'trip', 'journey',
    'flight', 'plane', 'ship', 'train', 'hotel', 'resort', 'vacation', 'sightseeing',
    'place', 'city', 'country'
  ],
  cemiyyet: [
    'cəmiyyət', 'həyat', 'lifestyle', 'life style', 'moda', 'geyim', 'dizayn',
    'dekorasiya', 'ev', 'mətbəx', 'yemək', 'sağlamlıq', 'fitness', 'idman',
    'qidalanma', 'diyet', 'gözəllik', 'kosmetika', 'məclis', 'sosial', 'society',
    'lifestyle', 'life style', 'fashion', 'clothing', 'design', 'decoration',
    'home', 'kitchen', 'food', 'health', 'fitness', 'sport', 'nutrition', 'diet',
    'beauty', 'cosmetics', 'social'
  ],
  tehsil: [
    'təhsil', 'məktəb', 'universitet', 'tələbə', 'müəllim', 'dərs', 'imtahan',
    'tədris', 'təlim', 'təhsil', 'education', 'school', 'university', 'student',
    'teacher', 'lesson', 'exam', 'teaching', 'training', 'education'
  ],
  dunya: [
    'dünya', 'beynəlxalq', 'qlobal', 'xarici', 'xəbər', 'hadisə', 'tədbir',
    'world', 'international', 'global', 'foreign', 'news', 'event', 'incident'
  ]
};

async function assignCategoriesToArticles() {
  try {
    console.log('🔍 Kateqoriyası olmayan xəbərləri axtarır...\n');

    // Bütün kateqoriyaları yüklə
    const categories = await prisma.category.findMany({
      include: {
        translations: true,
      },
    });

    console.log(`📋 Tapılan kateqoriyalar: ${categories.length}\n`);

    // Kateqoriyası null olan xəbərləri tap
    const articlesWithoutCategory = await prisma.article.findMany({
      where: {
        categoryId: null,
        deletedAt: null,
      },
      include: {
        translations: true,
      },
    });

    console.log(`📰 Kateqoriyası olmayan xəbər sayı: ${articlesWithoutCategory.length}\n`);

    if (articlesWithoutCategory.length === 0) {
      console.log('✅ Bütün xəbərlərin kateqoriyası var!');
      return;
    }

    let assignedCount = 0;
    let notAssignedCount = 0;

    for (const article of articlesWithoutCategory) {
      const azTranslation = article.translations.find(t => t.locale === 'az');
      const enTranslation = article.translations.find(t => t.locale === 'en');

      const title = (azTranslation?.title || enTranslation?.title || '').toLowerCase();
      const content = (azTranslation?.content || enTranslation?.content || '').toLowerCase();
      const text = `${title} ${content}`;

      // Hər bir kateqoriya üçün uyğunluq yoxla
      let bestMatch: { categoryId: string; score: number; slug: string } | null = null;

      for (const category of categories) {
        const categorySlug = category.slug;
        const keywords = categoryKeywords[categorySlug] || [];

        if (keywords.length === 0) continue;

        let score = 0;
        for (const keyword of keywords) {
          const keywordLower = keyword.toLowerCase();
          if (text.includes(keywordLower)) {
            score++;
            // Başlıqda olarsa daha çox bal ver
            if (title.includes(keywordLower)) {
              score += 2;
            }
          }
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = {
            categoryId: category.id,
            score,
            slug: categorySlug,
          };
        }
      }

      if (bestMatch && bestMatch.score >= 2) {
        // Kateqoriyaya təyin et
        await prisma.article.update({
          where: { id: article.id },
          data: {
            categoryId: bestMatch.categoryId,
          },
        });

        const articleTitle = azTranslation?.title || enTranslation?.title || 'Naməlum';
        console.log(`✅ "${articleTitle.substring(0, 50)}..." → ${bestMatch.slug} (score: ${bestMatch.score})`);
        assignedCount++;
      } else {
        const articleTitle = azTranslation?.title || enTranslation?.title || 'Naməlum';
        console.log(`❌ "${articleTitle.substring(0, 50)}..." → Uyğun kateqoriya tapılmadı`);
        notAssignedCount++;
      }
    }

    console.log(`\n📊 Nəticə:`);
    console.log(`   ✅ Təyin edildi: ${assignedCount}`);
    console.log(`   ❌ Təyin edilmədi: ${notAssignedCount}`);
    console.log(`\n✅ Proses tamamlandı!`);
  } catch (error: any) {
    console.error('❌ Xəta:', error);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

assignCategoriesToArticles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

