import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

config({ path: resolve(__dirname, '../.env.local') });

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
  log: ['error'],
});

// Siyasət xəbərləri məlumatları
const politicalArticles = [
  {
    az: {
      title: 'Prezident İlham Əliyev yeni iqtisadi tədbirlər haqqında çıxış etdi',
      excerpt: 'Prezident ölkənin iqtisadi inkişafı üçün yeni strategiyalar açıqladı.',
      content: 'Prezident İlham Əliyev bugün keçirilən iclasda ölkənin iqtisadi inkişafı üçün yeni strategiyalar açıqladı. Tədbirlər əsasən investisiya cəlb etmə, infrastruktur layihələri və innovasiya sahələrinə yönəldilmişdir.'
    },
    en: {
      title: 'President Ilham Aliyev speaks about new economic measures',
      excerpt: 'The President announced new strategies for the country\'s economic development.',
      content: 'President Ilham Aliyev today announced new strategies for the country\'s economic development at a meeting. The measures are mainly focused on attracting investment, infrastructure projects and innovation sectors.'
    }
  },
  {
    az: {
      title: 'Beynəlxalq diplomatik görüşlər başladı',
      excerpt: 'Region ölkələrinin nümayəndələri diplomatik məsələləri müzakirə edir.',
      content: 'Region ölkələrinin nümayəndələri bu gün diplomatik məsələləri müzakirə etmək üçün bir araya gəldilər. Görüşdə regional təhlükəsizlik, iqtisadi əməkdaşlıq və mədəni mübadilə məsələləri müzakirə olunur.'
    },
    en: {
      title: 'International diplomatic meetings begin',
      excerpt: 'Representatives of regional countries are discussing diplomatic issues.',
      content: 'Representatives of regional countries gathered today to discuss diplomatic issues. The meeting discusses regional security, economic cooperation and cultural exchange.'
    }
  },
  {
    az: {
      title: 'Parlament yeni qanun layihəsini müzakirə edir',
      excerpt: 'Məclisdə sosial təminat və sağlamlıq sistemləri ilə bağlı qanun layihəsi təqdim olundu.',
      content: 'Parlamentdə bugün sosial təminat və sağlamlıq sistemləri ilə bağlı yeni qanun layihəsi müzakirəyə qoyuldu. Layihə vətəndaşların sosial müdafiəsini gücləndirməyi nəzərdə tutur.'
    },
    en: {
      title: 'Parliament discusses new draft law',
      excerpt: 'A draft law on social security and health systems was presented in the assembly.',
      content: 'A new draft law on social security and health systems was discussed in parliament today. The draft aims to strengthen the social protection of citizens.'
    }
  },
  {
    az: {
      title: 'NATO ilə əməkdaşlıq müqaviləsi imzalandı',
      excerpt: 'Azərbaycan və NATO arasında yeni əməkdaşlıq müqaviləsi imzalandı.',
      content: 'Azərbaycan və NATO arasında yeni əməkdaşlıq müqaviləsi bugün imzalandı. Müqavilə təhlükəsizlik, müdafiə və hərbi əməkdaşlıq sahələrini əhatə edir.'
    },
    en: {
      title: 'Cooperation agreement with NATO signed',
      excerpt: 'A new cooperation agreement was signed between Azerbaijan and NATO.',
      content: 'A new cooperation agreement between Azerbaijan and NATO was signed today. The agreement covers security, defense and military cooperation.'
    }
  },
  {
    az: {
      title: 'Regional təhlükəsizlik sammiti keçirildi',
      excerpt: 'Region ölkələrinin liderləri təhlükəsizlik məsələlərini müzakirə etdilər.',
      content: 'Region ölkələrinin liderləri bugün təhlükəsizlik məsələlərini müzakirə etmək üçün sammitdə bir araya gəldilər. Sammitdə terrorizm, kibertəhlükəsizlik və enerji təhlükəsizliyi məsələləri müzakirə olundu.'
    },
    en: {
      title: 'Regional security summit held',
      excerpt: 'Leaders of regional countries discussed security issues.',
      content: 'Leaders of regional countries gathered at a summit today to discuss security issues. The summit discussed terrorism, cybersecurity and energy security.'
    }
  }
];

function generateSlug(text: string): string {
  const transliteration: { [key: string]: string } = {
    'ə': 'e', 'ü': 'u', 'ı': 'i', 'ğ': 'g', 'ş': 's', 'ç': 'c', 'ö': 'o',
    'Ə': 'E', 'Ü': 'U', 'I': 'I', 'Ğ': 'G', 'Ş': 'S', 'Ç': 'C', 'Ö': 'O',
    'İ': 'I'
  };
  
  return text
    .toLowerCase()
    .split('')
    .map(char => transliteration[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function addPoliticalArticles() {
  try {
    console.log('🔍 Siyasət kateqoriyası tapılır...');
    
    const category = await prisma.category.findUnique({
      where: { slug: 'siyaset' },
    });

    if (!category) {
      console.log('❌ Siyasət kateqoriyası tapılmadı!');
      return;
    }

    console.log(`✅ Siyasət kateqoriyası tapıldı: ${category.id}`);

    // Admin user tap
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      console.log('❌ Admin user tapılmadı!');
      return;
    }

    console.log(`✅ Admin user tapıldı: ${adminUser.email}`);

    let added = 0;
    let skipped = 0;

    for (const articleData of politicalArticles) {
      const azSlug = generateSlug(articleData.az.title);
      const enSlug = generateSlug(articleData.en.title);

      // Mövcud xəbəri yoxla
      const existingArticle = await prisma.article.findFirst({
        where: {
          translations: {
            some: {
              slug: azSlug,
              locale: 'az',
            },
          },
        },
      });

      if (existingArticle) {
        console.log(`  ⊘ Xəbər artıq mövcuddur: ${articleData.az.title}`);
        skipped++;
        continue;
      }

      // Xəbəri yarat
      const publishedDate = new Date();
      publishedDate.setHours(publishedDate.getHours() - added); // Hər xəbər üçün fərqli tarix

      const article = await prisma.article.create({
        data: {
          categoryId: category.id,
          authorId: adminUser.id,
          status: 'published',
          publishedAt: publishedDate,
          featured: false,
          agenda: false,
          views: Math.floor(Math.random() * 1000), // Təsadüfi baxış sayı
          translations: {
            create: [
              {
                locale: 'az',
                title: articleData.az.title,
                slug: azSlug,
                excerpt: articleData.az.excerpt,
                content: articleData.az.content,
              },
              {
                locale: 'en',
                title: articleData.en.title,
                slug: enSlug,
                excerpt: articleData.en.excerpt,
                content: articleData.en.content,
              },
            ],
          },
          images: {
            create: [
              {
                url: 'https://operativmedia.az/uploads/GettyImages-658252284_1763980428589_i8uf5kvu.jpg',
                alt: articleData.az.title,
                order: 0,
                isPrimary: true,
              },
            ],
          },
        },
      });

      console.log(`  ✓ Xəbər əlavə edildi: ${articleData.az.title}`);
      added++;
    }

    console.log(`\n📊 Nəticə:`);
    console.log(`   ✅ Əlavə edildi: ${added}`);
    console.log(`   ⊘ Atlandı: ${skipped}`);
    console.log(`\n✅ Proses tamamlandı!`);
  } catch (error: any) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

addPoliticalArticles();




