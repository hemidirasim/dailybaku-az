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

async function checkMultimediaCategory() {
  try {
    console.log('🔍 Multimedia kateqoriyasını yoxlayır...\n');

    // Multimedia kateqoriyasını tap
    const multimediaCategory = await prisma.category.findFirst({
      where: {
        slug: 'multimedia',
      },
      include: {
        translations: true,
      },
    });

    if (multimediaCategory) {
      console.log('✅ Multimedia kateqoriyası mövcuddur:');
      console.log(`   ID: ${multimediaCategory.id}`);
      console.log(`   Slug: ${multimediaCategory.slug}`);
      multimediaCategory.translations.forEach((t) => {
        console.log(`   ${t.locale.toUpperCase()}: ${t.name}`);
      });

      // Bu kateqoriyada neçə xəbər var?
      const articleCount = await prisma.article.count({
        where: {
          categoryId: multimediaCategory.id,
          deletedAt: null,
        },
      });

      console.log(`\n📰 Bu kateqoriyada xəbər sayı: ${articleCount}`);
    } else {
      console.log('❌ Multimedia kateqoriyası tapılmadı!');
      console.log('\n📝 Yaratmaq istəyirsiniz? (y/n)');
    }
  } catch (error: any) {
    console.error('❌ Xəta:', error);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

checkMultimediaCategory()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });




