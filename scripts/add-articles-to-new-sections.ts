import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { generateSlug } from '../lib/utils';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

// Create Prisma client with connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Xəbər məlumatları
const articlesData = {
  idman: {
    az: [
      {
        title: 'Azərbaycan milli komandası yeni uğur qazandı',
        excerpt: 'Milli komanda beynəlxalq yarışda yüksək nəticə əldə etdi və qızıl medal qazandı.',
        content: '<p>Azərbaycan milli komandası son beynəlxalq yarışda böyük uğur qazandı. Komanda üzvləri yüksək səviyyədə performans göstərdi və qızıl medal qazandı.</p><p>Bu uğur ölkənin idman tarixində mühüm addım hesab olunur. İdmançıların hazırlığı və səyləri nəticəsində bu nəticə əldə edildi.</p>'
      },
      {
        title: 'Yerli idmançılar Olimpiya oyunlarına hazırlaşır',
        excerpt: 'Azərbaycan idmançıları Paris Olimpiya oyunlarına hazırlıq mərhələsindədir.',
        content: '<p>Azərbaycan idmançıları Paris Olimpiya oyunlarına hazırlıq mərhələsindədir. İdmançılar intensiv təlim keçir və yüksək nəticələrə çatmağa çalışırlar.</p><p>Milli komanda üzvləri müxtəlif idman növlərində yarışacaq və ölkəni beynəlxalq arenada təmsil edəcək.</p>'
      },
      {
        title: 'Yeni idman kompleksi açıldı',
        excerpt: 'Bakıda yeni müasir idman kompleksi istifadəyə verildi.',
        content: '<p>Bakıda yeni müasir idman kompleksi istifadəyə verildi. Kompleks müxtəlif idman növləri üçün zəngin infrastruktur təmin edir.</p><p>Bu kompleks idmançıların hazırlığı üçün yaxşı şərait yaradır və idmanın inkişafına kömək edir.</p>'
      },
      {
        title: 'Gənc idmançıların uğurları',
        excerpt: 'Gənc idmançılar beynəlxalq yarışlarda yüksək nəticələr əldə edir.',
        content: '<p>Azərbaycanın gənc idmançıları beynəlxalq yarışlarda yüksək nəticələr əldə edir. Onların uğurları ölkənin idman gələcəyi üçün ümid verir.</p><p>Gənc istedadların dəstəklənməsi və inkişafı idmanın gələcəyi üçün çox vacibdir.</p>'
      },
      {
        title: 'Futbol çempionatında yeni rekord',
        excerpt: 'Yerli futbol çempionatında yeni rekord qeydə alındı.',
        content: '<p>Yerli futbol çempionatında yeni rekord qeydə alındı. Komanda tarixində ən yüksək nəticəni əldə etdi.</p><p>Bu uğur futbolun inkişafına və populyarlığının artmasına kömək edir.</p>'
      },
      {
        title: 'Boks üzrə dünya çempionatı',
        excerpt: 'Azərbaycan boksçuları dünya çempionatında iştirak edəcək.',
        content: '<p>Azərbaycan boksçuları dünya çempionatında iştirak edəcək. İdmançılar yüksək səviyyədə hazırlaşır və uğur qazanmağa çalışırlar.</p><p>Milli komanda üzvləri ölkəni beynəlxalq arenada layiqincə təmsil edəcək.</p>'
      },
      {
        title: 'Gimnastika üzrə Avropa çempionatı',
        excerpt: 'Azərbaycan gimnastları Avropa çempionatında medal qazandı.',
        content: '<p>Azərbaycan gimnastları Avropa çempionatında medal qazandı. Bu uğur ölkənin gimnastika tarixində mühüm addım hesab olunur.</p><p>İdmançıların performansı yüksək səviyyədə qiymətləndirildi.</p>'
      },
      {
        title: 'Üzgüçülük üzrə milli rekord',
        excerpt: 'Azərbaycan üzgüçüsü milli rekord qırdı.',
        content: '<p>Azərbaycan üzgüçüsü milli rekord qırdı. Bu nəticə ölkənin üzgüçülük tarixində ən yaxşı göstəricidir.</p><p>İdmançının uğuru gənc üzgüçülər üçün motivasiya mənbəyidir.</p>'
      },
      {
        title: 'Tennis üzrə beynəlxalq turnir',
        excerpt: 'Bakıda beynəlxalq tennis turniri keçiriləcək.',
        content: '<p>Bakıda beynəlxalq tennis turniri keçiriləcək. Turnirə dünyanın müxtəlif ölkələrindən idmançılar qatılacaq.</p><p>Bu tədbir tennisin inkişafına və ölkənin tanınmasına kömək edir.</p>'
      },
      {
        title: 'Atletika üzrə yeni uğurlar',
        excerpt: 'Azərbaycan atletləri beynəlxalq yarışlarda uğur qazanır.',
        content: '<p>Azərbaycan atletləri beynəlxalq yarışlarda uğur qazanır. Onların nəticələri ölkənin atletika tarixində mühüm addımdır.</p><p>İdmançıların hazırlığı və səyləri nəticəsində bu uğurlar əldə edilir.</p>'
      },
      {
        title: 'Voleybol üzrə milli komanda',
        excerpt: 'Azərbaycan voleybol komandası yeni uğurlar qazanır.',
        content: '<p>Azərbaycan voleybol komandası yeni uğurlar qazanır. Komanda üzvləri yüksək səviyyədə oyun göstərir.</p><p>Bu uğurlar voleybolun inkişafına və populyarlığının artmasına kömək edir.</p>'
      },
      {
        title: 'Cüdo üzrə dünya kuboku',
        excerpt: 'Azərbaycan cüdoçuları dünya kubokunda iştirak edəcək.',
        content: '<p>Azərbaycan cüdoçuları dünya kubokunda iştirak edəcək. İdmançılar yüksək səviyyədə hazırlaşır və medal qazanmağa çalışırlar.</p><p>Milli komanda üzvləri ölkəni beynəlxalq arenada layiqincə təmsil edəcək.</p>'
      }
    ],
    en: [
      {
        title: 'Azerbaijan national team achieves new success',
        excerpt: 'The national team achieved high results in an international competition and won a gold medal.',
        content: '<p>The Azerbaijan national team achieved great success in the recent international competition. Team members showed high-level performance and won a gold medal.</p><p>This success is considered an important step in the country\'s sports history. This result was achieved through the preparation and efforts of the athletes.</p>'
      },
      {
        title: 'Local athletes prepare for Olympic Games',
        excerpt: 'Azerbaijani athletes are in the preparation phase for the Paris Olympic Games.',
        content: '<p>Azerbaijani athletes are in the preparation phase for the Paris Olympic Games. Athletes are undergoing intensive training and striving to achieve high results.</p><p>National team members will compete in various sports and represent the country on the international stage.</p>'
      },
      {
        title: 'New sports complex opened',
        excerpt: 'A new modern sports complex was put into use in Baku.',
        content: '<p>A new modern sports complex was put into use in Baku. The complex provides rich infrastructure for various sports.</p><p>This complex creates good conditions for athletes\' preparation and helps develop sports.</p>'
      },
      {
        title: 'Successes of young athletes',
        excerpt: 'Young athletes achieve high results in international competitions.',
        content: '<p>Young Azerbaijani athletes achieve high results in international competitions. Their successes give hope for the country\'s sports future.</p><p>Supporting and developing young talents is very important for the future of sports.</p>'
      },
      {
        title: 'New record in football championship',
        excerpt: 'A new record was set in the local football championship.',
        content: '<p>A new record was set in the local football championship. The team achieved the highest result in its history.</p><p>This success helps develop football and increase its popularity.</p>'
      },
      {
        title: 'World boxing championship',
        excerpt: 'Azerbaijani boxers will participate in the world championship.',
        content: '<p>Azerbaijani boxers will participate in the world championship. Athletes are preparing at a high level and striving to achieve success.</p><p>National team members will represent the country worthily on the international stage.</p>'
      },
      {
        title: 'European gymnastics championship',
        excerpt: 'Azerbaijani gymnasts won a medal at the European championship.',
        content: '<p>Azerbaijani gymnasts won a medal at the European championship. This success is considered an important step in the country\'s gymnastics history.</p><p>The athletes\' performance was highly appreciated.</p>'
      },
      {
        title: 'National swimming record',
        excerpt: 'Azerbaijani swimmer broke the national record.',
        content: '<p>An Azerbaijani swimmer broke the national record. This result is the best indicator in the country\'s swimming history.</p><p>The athlete\'s success is a source of motivation for young swimmers.</p>'
      },
      {
        title: 'International tennis tournament',
        excerpt: 'An international tennis tournament will be held in Baku.',
        content: '<p>An international tennis tournament will be held in Baku. Athletes from various countries around the world will participate in the tournament.</p><p>This event helps develop tennis and promote the country.</p>'
      },
      {
        title: 'New achievements in athletics',
        excerpt: 'Azerbaijani athletes achieve success in international competitions.',
        content: '<p>Azerbaijani athletes achieve success in international competitions. Their results are an important step in the country\'s athletics history.</p><p>These successes are achieved through the preparation and efforts of the athletes.</p>'
      },
      {
        title: 'National volleyball team',
        excerpt: 'Azerbaijan volleyball team achieves new successes.',
        content: '<p>The Azerbaijan volleyball team achieves new successes. Team members show high-level play.</p><p>These successes help develop volleyball and increase its popularity.</p>'
      },
      {
        title: 'World judo cup',
        excerpt: 'Azerbaijani judokas will participate in the world cup.',
        content: '<p>Azerbaijani judokas will participate in the world cup. Athletes are preparing at a high level and striving to win medals.</p><p>National team members will represent the country worthily on the international stage.</p>'
      }
    ]
  },
  cemiyyet: {
    az: [
      {
        title: 'Sağlam həyat tərzi üçün 5 məsləhət',
        excerpt: 'Sağlam həyat tərzi üçün vacib məsləhətlər və tövsiyələr.',
        content: '<p>Sağlam həyat tərzi üçün vacib məsləhətlər və tövsiyələr. Düzgün qidalanma, idman və istirahət sağlamlıq üçün çox vacibdir.</p><p>Gündəlik həyatda bu prinsipləri tətbiq etməklə daha yaxşı həyat keyfiyyəti əldə edə bilərsiniz.</p>'
      },
      {
        title: 'Moda trendləri 2025',
        excerpt: '2025-ci ilin ən yeni moda trendləri və stil tövsiyələri.',
        content: '<p>2025-ci ilin ən yeni moda trendləri və stil tövsiyələri. Bu il klassik və müasir stillərin birləşməsi gözlənilir.</p><p>Moda dünyası yeni ideyalar və yanaşmalarla zənginləşir.</p>'
      },
      {
        title: 'Ev dekorasiyası üçün ideyalar',
        excerpt: 'Ev dekorasiyası üçün müasir və funksional ideyalar.',
        content: '<p>Ev dekorasiyası üçün müasir və funksional ideyalar. Minimalist və skandinav stilləri populyarlığını qoruyur.</p><p>Düzgün dekorasiya evin rahatlığını və estetik görünüşünü artırır.</p>'
      },
      {
        title: 'Qidalanma və sağlamlıq',
        excerpt: 'Düzgün qidalanma sağlamlıq üçün əsas amildir.',
        content: '<p>Düzgün qidalanma sağlamlıq üçün əsas amildir. Təzə meyvə və tərəvəzlər, tam taxıllar və protein mənbələri vacibdir.</p><p>Balanslı qidalanma həyat keyfiyyətini yaxşılaşdırır.</p>'
      },
      {
        title: 'Fitness və idman',
        excerpt: 'Gündəlik fitness rutini sağlamlıq üçün vacibdir.',
        content: '<p>Gündəlik fitness rutini sağlamlıq üçün vacibdir. Müntəzəm idman fiziki və mənəvi sağlamlığı yaxşılaşdırır.</p><p>Hər kəs öz imkanlarına görə idman seçə bilər.</p>'
      }
    ],
    en: [
      {
        title: '5 tips for a healthy lifestyle',
        excerpt: 'Important tips and recommendations for a healthy lifestyle.',
        content: '<p>Important tips and recommendations for a healthy lifestyle. Proper nutrition, exercise, and rest are very important for health.</p><p>By applying these principles in daily life, you can achieve a better quality of life.</p>'
      },
      {
        title: 'Fashion trends 2025',
        excerpt: 'The latest fashion trends and style recommendations for 2025.',
        content: '<p>The latest fashion trends and style recommendations for 2025. This year, a combination of classic and modern styles is expected.</p><p>The fashion world is enriched with new ideas and approaches.</p>'
      },
      {
        title: 'Ideas for home decoration',
        excerpt: 'Modern and functional ideas for home decoration.',
        content: '<p>Modern and functional ideas for home decoration. Minimalist and Scandinavian styles maintain their popularity.</p><p>Proper decoration increases the comfort and aesthetic appearance of the home.</p>'
      },
      {
        title: 'Nutrition and health',
        excerpt: 'Proper nutrition is a key factor for health.',
        content: '<p>Proper nutrition is a key factor for health. Fresh fruits and vegetables, whole grains, and protein sources are important.</p><p>Balanced nutrition improves quality of life.</p>'
      },
      {
        title: 'Fitness and sports',
        excerpt: 'Daily fitness routine is important for health.',
        content: '<p>Daily fitness routine is important for health. Regular exercise improves physical and mental health.</p><p>Everyone can choose sports according to their capabilities.</p>'
      }
    ]
  },
  seyahet: {
    az: [
      {
        title: 'Bakının ən gözəl yerləri',
        excerpt: 'Bakının ən məşhur turizm yerləri və görməli yerləri.',
        content: '<p>Bakının ən məşhur turizm yerləri və görməli yerləri. Şəhərin zəngin tarixi və mədəni irsi ziyarətçiləri cəlb edir.</p><p>Bakı həm tarixi, həm də müasir gözəlliyi ilə məşhurdur.</p>'
      },
      {
        title: 'Qəbələ - təbiət cənnəti',
        excerpt: 'Qəbələ bölgəsinin təbiət gözəlliyi və turizm imkanları.',
        content: '<p>Qəbələ bölgəsinin təbiət gözəlliyi və turizm imkanları. Dağlar, meşələr və çaylar bu bölgəni unikal edir.</p><p>Qəbələ istirahət və təbiətlə ünsiyyət üçün ideal yerdir.</p>'
      },
      {
        title: 'Şəki - tarixi şəhər',
        excerpt: 'Şəki şəhərinin tarixi abidələri və mədəni irsi.',
        content: '<p>Şəki şəhərinin tarixi abidələri və mədəni irsi. Şəki sarayı və köhnə şəhər hissəsi ziyarətçiləri cəlb edir.</p><p>Bu şəhər öz memarlıq gözəlliyi ilə məşhurdur.</p>'
      },
      {
        title: 'Xınalıq - unikal kənd',
        excerpt: 'Xınalıq kəndinin unikal mədəniyyəti və təbiət gözəlliyi.',
        content: '<p>Xınalıq kəndinin unikal mədəniyyəti və təbiət gözəlliyi. Bu kənd öz ənənəvi memarlığı ilə məşhurdur.</p><p>Xınalıq Azərbaycanın ən yüksək kəndidir və unikal mədəni irsə malikdir.</p>'
      },
      {
        title: 'Lənkəran - sahil şəhəri',
        excerpt: 'Lənkəranın sahil gözəlliyi və subtropik iqlimi.',
        content: '<p>Lənkəranın sahil gözəlliyi və subtropik iqlimi. Bu şəhər istirahət üçün ideal yerdir.</p><p>Lənkəran öz təbiət gözəlliyi və isti iqlimi ilə məşhurdur.</p>'
      },
      {
        title: 'Quba - meşə və dağlar',
        excerpt: 'Quba bölgəsinin təbiət gözəlliyi və turizm potensialı.',
        content: '<p>Quba bölgəsinin təbiət gözəlliyi və turizm potensialı. Meşələr, dağlar və çaylar bu bölgəni cəlbedici edir.</p><p>Quba təbiət sevənlər üçün ideal yerdir.</p>'
      },
      {
        title: 'Naxçıvan - qədim şəhər',
        excerpt: 'Naxçıvanın tarixi abidələri və mədəni irsi.',
        content: '<p>Naxçıvanın tarixi abidələri və mədəni irsi. Bu şəhər öz qədim tarixi ilə məşhurdur.</p><p>Naxçıvan Azərbaycanın ən qədim şəhərlərindən biridir.</p>'
      },
      {
        title: 'Beynəlxalq səyahət məsləhətləri',
        excerpt: 'Beynəlxalq səyahət üçün vacib məsləhətlər və tövsiyələr.',
        content: '<p>Beynəlxalq səyahət üçün vacib məsləhətlər və tövsiyələr. Səyahət planlaşdırması və hazırlığı vacibdir.</p><p>Düzgün planlaşdırma səyahəti daha rahat və təhlükəsiz edir.</p>'
      }
    ],
    en: [
      {
        title: 'The most beautiful places in Baku',
        excerpt: 'The most popular tourist places and attractions in Baku.',
        content: '<p>The most popular tourist places and attractions in Baku. The city\'s rich history and cultural heritage attract visitors.</p><p>Baku is famous for both its historical and modern beauty.</p>'
      },
      {
        title: 'Gabala - nature paradise',
        excerpt: 'The natural beauty and tourism opportunities of the Gabala region.',
        content: '<p>The natural beauty and tourism opportunities of the Gabala region. Mountains, forests, and rivers make this region unique.</p><p>Gabala is an ideal place for rest and communication with nature.</p>'
      },
      {
        title: 'Sheki - historic city',
        excerpt: 'The historical monuments and cultural heritage of Sheki city.',
        content: '<p>The historical monuments and cultural heritage of Sheki city. Sheki Palace and the old city part attract visitors.</p><p>This city is famous for its architectural beauty.</p>'
      },
      {
        title: 'Khinalug - unique village',
        excerpt: 'The unique culture and natural beauty of Khinalug village.',
        content: '<p>The unique culture and natural beauty of Khinalug village. This village is famous for its traditional architecture.</p><p>Khinalug is Azerbaijan\'s highest village and has a unique cultural heritage.</p>'
      },
      {
        title: 'Lankaran - coastal city',
        excerpt: 'The coastal beauty and subtropical climate of Lankaran.',
        content: '<p>The coastal beauty and subtropical climate of Lankaran. This city is an ideal place for rest.</p><p>Lankaran is famous for its natural beauty and warm climate.</p>'
      },
      {
        title: 'Guba - forests and mountains',
        excerpt: 'The natural beauty and tourism potential of the Guba region.',
        content: '<p>The natural beauty and tourism potential of the Guba region. Forests, mountains, and rivers make this region attractive.</p><p>Guba is an ideal place for nature lovers.</p>'
      },
      {
        title: 'Nakhchivan - ancient city',
        excerpt: 'The historical monuments and cultural heritage of Nakhchivan.',
        content: '<p>The historical monuments and cultural heritage of Nakhchivan. This city is famous for its ancient history.</p><p>Nakhchivan is one of Azerbaijan\'s oldest cities.</p>'
      },
      {
        title: 'International travel tips',
        excerpt: 'Important tips and recommendations for international travel.',
        content: '<p>Important tips and recommendations for international travel. Travel planning and preparation are important.</p><p>Proper planning makes travel more comfortable and safe.</p>'
      }
    ]
  }
};

async function main() {
  console.log('Yeni bölmələr üçün xəbərlər əlavə edilir...\n');

  // Admin istifadəçisini tap
  const adminUser = await prisma.user.findFirst({
    where: {
      role: 'admin',
    },
  });

  if (!adminUser) {
    console.error('Admin istifadəçisi tapılmadı!');
    process.exit(1);
  }

  // Kateqoriyaları tap
  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: ['idman', 'cemiyyet', 'seyahet'],
      },
    },
    include: {
      translations: true,
    },
  });

  console.log(`✓ ${categories.length} kateqoriya tapıldı\n`);

  for (const category of categories) {
    const categorySlug = category.slug;
    const categoryArticles = articlesData[categorySlug as keyof typeof articlesData];

    if (!categoryArticles) {
      console.log(`⊘ ${categorySlug} bölməsi üçün xəbər məlumatları tapılmadı`);
      continue;
    }

    const categoryName = category.translations.find((t) => t.locale === 'az')?.name || categorySlug;
    console.log(`${categoryName} bölməsi üçün xəbərlər əlavə edilir...`);

    const articlesToCreate = categoryArticles.az.length;

    for (let i = 0; i < articlesToCreate; i++) {
      const azArticle = categoryArticles.az[i];
      const enArticle = categoryArticles.en[i];

      if (!azArticle || !enArticle) continue;

      // Slug yarat
      const azSlug = generateSlug(azArticle.title);
      const enSlug = generateSlug(enArticle.title);

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
        console.log(`  ⊘ Xəbər artıq mövcuddur: ${azArticle.title}`);
        continue;
      }

      // Xəbəri yarat
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - i); // Hər xəbər üçün fərqli tarix

      const article = await prisma.article.create({
        data: {
          categoryId: category.id,
          authorId: adminUser.id,
          status: 'published',
          publishedAt: publishedDate,
          featured: i === 0, // İlk xəbəri featured et
          translations: {
            create: [
              {
                locale: 'az',
                title: azArticle.title,
                slug: azSlug,
                excerpt: azArticle.excerpt,
                content: azArticle.content,
              },
              {
                locale: 'en',
                title: enArticle.title,
                slug: enSlug,
                excerpt: enArticle.excerpt,
                content: enArticle.content,
              },
            ],
          },
        },
      });

      console.log(`  ✓ Xəbər əlavə edildi: ${azArticle.title}`);
    }

    console.log('');
  }

  console.log('✅ Bütün xəbərlər əlavə edildi!');
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

