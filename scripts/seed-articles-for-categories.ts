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

// Xəbər məlumatları
const articlesByCategory: Record<string, { az: { title: string; excerpt: string; content: string }[]; en: { title: string; excerpt: string; content: string }[] }> = {
  'gndm': {
    az: [
      {
        title: 'Bakıda yeni infrastruktur layihələri başlayır',
        excerpt: 'Paytaxtda böyük infrastruktur layihələrinin həyata keçirilməsi planlaşdırılır.',
        content: '<p>Bakı şəhərində yeni infrastruktur layihələri üzrə işlərə başlanılır. Bu layihələr şəhərin inkişafına əhəmiyyətli töhfə verəcək. Layihələr nəqliyyat, kommunal xidmətlər və şəhərsalma sahələrini əhatə edir.</p><p>Layihələrin həyata keçirilməsi üçün müvafiq büdcə ayrılıb və işlər tezliklə başlayacaq. Yerli və beynəlxalq şirkətlər bu layihələrdə iştirak edəcək.</p>'
      },
      {
        title: 'Azərbaycanda təhsil sahəsində yeniliklər',
        excerpt: 'Təhsil sistemində yeni proqramlar və metodlar tətbiq olunur.',
        content: '<p>Azərbaycan Respublikasında təhsil sahəsində əhəmiyyətli yeniliklər həyata keçirilir. Yeni təhsil proqramları və müasir metodlar tətbiq olunur.</p><p>Təhsil Nazirliyi tərəfindən hazırlanan yeni proqramlar tələbələrin bilik və bacarıqlarını artırmaq məqsədi daşıyır. Bu yeniliklər həm ümumtəhsil, həm də ali təhsil səviyyəsində tətbiq olunur.</p>'
      },
      {
        title: 'Səhiyyə sistemində yeni xidmətlər',
        excerpt: 'Səhiyyə müəssisələrində xidmətlərin keyfiyyəti artırılır.',
        content: '<p>Azərbaycanda səhiyyə sistemində yeni xidmətlər təqdim olunur. Xəstəxanalarda müasir avadanlıqlar quraşdırılır və xidmətlərin keyfiyyəti artırılır.</p><p>Yeni səhiyyə mərkəzləri açılır və mövcud müəssisələrdə yenilənmə işləri aparılır. Bu tədbirlər vətəndaşların səhiyyə xidmətlərinə çıxışını asanlaşdırır.</p>'
      },
      {
        title: 'İqtisadi inkişafın yeni mərhələsi',
        excerpt: 'Ölkədə iqtisadi göstəricilər müsbət dinamika göstərir.',
        content: '<p>Azərbaycanın iqtisadi inkişafında yeni mərhələ başlayır. İqtisadi göstəricilər müsbət dinamika göstərir və investisiya mühiti yaxşılaşır.</p><p>Yeni iqtisadi layihələr həyata keçirilir və biznes mühiti daha da yaxşılaşır. Bu, ölkənin iqtisadi potensialının artmasına kömək edir.</p>'
      },
      {
        title: 'Mədəniyyət sahəsində yeni tədbirlər',
        excerpt: 'Mədəni tədbirlər və festivallar keçirilir.',
        content: '<p>Azərbaycanda mədəniyyət sahəsində yeni tədbirlər və festivallar təşkil olunur. Bu tədbirlər ölkənin mədəni irsini təqdim edir və beynəlxalq auditoriyaya çatır.</p><p>Müxtəlif mədəni tədbirlər, konsertlər və sərgilər təşkil olunur. Bu, mədəniyyətin inkişafına və ölkənin imicinin yaxşılaşmasına töhfə verir.</p>'
      }
    ],
    en: [
      {
        title: 'New infrastructure projects begin in Baku',
        excerpt: 'Major infrastructure projects are planned to be implemented in the capital.',
        content: '<p>Work begins on new infrastructure projects in Baku. These projects will make a significant contribution to the development of the city. The projects cover transportation, utilities and urban planning.</p><p>Budget has been allocated for the implementation of the projects and work will begin soon. Local and international companies will participate in these projects.</p>'
      },
      {
        title: 'Innovations in education in Azerbaijan',
        excerpt: 'New programs and methods are being implemented in the education system.',
        content: '<p>Significant innovations are being implemented in the field of education in the Republic of Azerbaijan. New education programs and modern methods are being applied.</p><p>The new programs prepared by the Ministry of Education aim to increase students knowledge and skills. These innovations are applied at both general education and higher education levels.</p>'
      },
      {
        title: 'New services in the healthcare system',
        excerpt: 'The quality of services in healthcare institutions is being improved.',
        content: '<p>New services are being introduced in the healthcare system in Azerbaijan. Modern equipment is being installed in hospitals and the quality of services is being improved.</p><p>New healthcare centers are opening and renovation work is being carried out in existing institutions. These measures facilitate citizens access to healthcare services.</p>'
      },
      {
        title: 'New stage of economic development',
        excerpt: 'Economic indicators show positive dynamics in the country.',
        content: '<p>A new stage begins in Azerbaijan economic development. Economic indicators show positive dynamics and the investment environment is improving.</p><p>New economic projects are being implemented and the business environment is improving further. This helps to increase the country economic potential.</p>'
      },
      {
        title: 'New events in the cultural field',
        excerpt: 'Cultural events and festivals are being held.',
        content: '<p>New events and festivals are being organized in the cultural field in Azerbaijan. These events present the country cultural heritage and reach an international audience.</p><p>Various cultural events, concerts and exhibitions are being organized. This contributes to the development of culture and the improvement of the country image.</p>'
      }
    ]
  },
  'siyast': {
    az: [
      {
        title: 'Prezidentin yeni tədbirləri',
        excerpt: 'Dövlət başçısı yeni inkişaf strategiyası təqdim edir.',
        content: '<p>Azərbaycan Prezidenti yeni inkişaf strategiyası və tədbirləri təqdim edir. Bu strategiya ölkənin uzunmüddətli inkişaf məqsədlərini əhatə edir.</p><p>Yeni tədbirlər iqtisadiyyat, sosial sahə və beynəlxalq əlaqələr sahələrini əhatə edir. Strategiyanın həyata keçirilməsi üçün müvafiq mexanizmlər yaradılır.</p>'
      },
      {
        title: 'Parlamentdə yeni qanunlar',
        excerpt: 'Milli Məclisdə mühüm qanunvericilik aktları müzakirə olunur.',
        content: '<p>Azərbaycan Milli Məclisində yeni qanunvericilik aktları müzakirə olunur. Bu qanunlar müxtəlif sahələri əhatə edir və vətəndaşların həyatına müsbət təsir göstərir.</p><p>Qanunvericilik prosesində ictimai rəy nəzərə alınır və müvafiq dəyişikliklər edilir. Yeni qanunlar ölkənin inkişafına töhfə verir.</p>'
      },
      {
        title: 'Beynəlxalq əlaqələrdə yeni addımlar',
        excerpt: 'Azərbaycan beynəlxalq arenada aktiv fəaliyyət göstərir.',
        content: '<p>Azərbaycan beynəlxalq əlaqələrdə yeni addımlar atır. Ölkə müxtəlif beynəlxalq təşkilatlarda aktiv iştirak edir və yeni tərəfdaşlıqlar yaradır.</p><p>Beynəlxalq əməkdaşlıq sahələri genişlənir və yeni imkanlar yaranır. Bu, ölkənin beynəlxalq mövqeyini gücləndirir.</p>'
      },
      {
        title: 'Regional əməkdaşlıq layihələri',
        excerpt: 'Qonşu ölkələrlə yeni əməkdaşlıq sazişləri imzalanır.',
        content: '<p>Azərbaycan regional əməkdaşlıq layihələrində aktiv iştirak edir. Qonşu ölkələrlə yeni əməkdaşlıq sazişləri imzalanır və birgə layihələr həyata keçirilir.</p><p>Regional əməkdaşlıq iqtisadi, mədəni və sosial sahələri əhatə edir. Bu layihələr regionun inkişafına töhfə verir.</p>'
      }
    ],
    en: [
      {
        title: 'President new initiatives',
        excerpt: 'The head of state presents a new development strategy.',
        content: '<p>The President of Azerbaijan presents a new development strategy and initiatives. This strategy covers the country long-term development goals.</p><p>The new initiatives cover the fields of economy, social sphere and international relations. Appropriate mechanisms are being created for the implementation of the strategy.</p>'
      },
      {
        title: 'New laws in parliament',
        excerpt: 'Important legislative acts are being discussed in the National Assembly.',
        content: '<p>New legislative acts are being discussed in the National Assembly of Azerbaijan. These laws cover various fields and have a positive impact on citizens lives.</p><p>Public opinion is taken into account in the legislative process and appropriate changes are made. New laws contribute to the development of the country.</p>'
      },
      {
        title: 'New steps in international relations',
        excerpt: 'Azerbaijan is actively operating in the international arena.',
        content: '<p>Azerbaijan is taking new steps in international relations. The country actively participates in various international organizations and creates new partnerships.</p><p>Areas of international cooperation are expanding and new opportunities are emerging. This strengthens the country international position.</p>'
      },
      {
        title: 'Regional cooperation projects',
        excerpt: 'New cooperation agreements are signed with neighboring countries.',
        content: '<p>Azerbaijan actively participates in regional cooperation projects. New cooperation agreements are signed with neighboring countries and joint projects are implemented.</p><p>Regional cooperation covers economic, cultural and social fields. These projects contribute to the development of the region.</p>'
      }
    ]
  },
  'dnya': {
    az: [
      {
        title: 'Beynəlxalq təhlükəsizlik məsələləri',
        excerpt: 'Dünya liderləri təhlükəsizlik məsələlərini müzakirə edir.',
        content: '<p>Beynəlxalq təhlükəsizlik məsələləri dünya liderlərinin diqqət mərkəzindədir. Müxtəlif beynəlxalq təşkilatlar bu məsələləri müzakirə edir və həll yolları axtarır.</p><p>Təhlükəsizlik tədbirləri gücləndirilir və yeni mexanizmlər yaradılır. Bu, dünya sülhünə və sabitliyinə töhfə verir.</p>'
      },
      {
        title: 'İqlim dəyişikliyi ilə mübarizə',
        excerpt: 'Dünya ölkələri iqlim dəyişikliyi ilə mübarizə üçün tədbirlər görür.',
        content: '<p>İqlim dəyişikliyi dünya miqyasında ciddi problemdir. Ölkələr bu problemlə mübarizə üçün müxtəlif tədbirlər görür və yeni strategiyalar hazırlayır.</p><p>Yenilənə bilən enerji mənbələrinə investisiyalar artırılır və ekoloji layihələr həyata keçirilir. Bu, gələcək nəsillər üçün daha yaxşı mühit yaratmaq məqsədi daşıyır.</p>'
      },
      {
        title: 'Beynəlxalq ticarət müqavilələri',
        excerpt: 'Yeni ticarət müqavilələri imzalanır və iqtisadi əlaqələr genişlənir.',
        content: '<p>Beynəlxalq ticarət sahəsində yeni müqavilələr imzalanır. Bu müqavilələr ölkələr arasında iqtisadi əlaqələri genişləndirir və yeni imkanlar yaradır.</p><p>Ticarət müqavilələri müxtəlif sahələri əhatə edir və qarşılıqlı fayda prinsipinə əsaslanır. Bu, dünya iqtisadiyyatının inkişafına kömək edir.</p>'
      },
      {
        title: 'Beynəlxalq humanitar yardım',
        excerpt: 'Dünya ölkələri humanitar yardım təşkil edir.',
        content: '<p>Beynəlxalq humanitar yardım təşkilatları və ölkələr müxtəlif regionlarda humanitar yardım təşkil edir. Bu yardım təbii fəlakətlər, münaqişələr və digər problemlərlə üzləşən insanlara çatır.</p><p>Humanitar yardım müxtəlif formalarda təqdim olunur və minlərlə insanın həyatını yaxşılaşdırır. Bu, beynəlxalq həmrəylik və dayanıqlığın nümunəsidir.</p>'
      },
      {
        title: 'Dünya mədəniyyəti və irsi',
        excerpt: 'UNESCO və digər təşkilatlar mədəni irsi qoruyur.',
        content: '<p>Dünya mədəni irsi qorunması üçün müxtəlif tədbirlər görülür. UNESCO və digər beynəlxalq təşkilatlar mədəni abidələrin qorunması üçün işlər aparır.</p><p>Mədəni irsin qorunması gələcək nəsillər üçün vacibdir. Bu, insanlığın ümumi mədəni sərvətini qoruyur və inkişaf etdirir.</p>'
      }
    ],
    en: [
      {
        title: 'International security issues',
        excerpt: 'World leaders discuss security issues.',
        content: '<p>International security issues are at the center of world leaders attention. Various international organizations discuss these issues and seek solutions.</p><p>Security measures are being strengthened and new mechanisms are being created. This contributes to world peace and stability.</p>'
      },
      {
        title: 'Fighting climate change',
        excerpt: 'World countries are taking measures to combat climate change.',
        content: '<p>Climate change is a serious problem on a global scale. Countries are taking various measures to combat this problem and developing new strategies.</p><p>Investments in renewable energy sources are increasing and environmental projects are being implemented. This aims to create a better environment for future generations.</p>'
      },
      {
        title: 'International trade agreements',
        excerpt: 'New trade agreements are signed and economic relations are expanding.',
        content: '<p>New agreements are being signed in the field of international trade. These agreements expand economic relations between countries and create new opportunities.</p><p>Trade agreements cover various fields and are based on the principle of mutual benefit. This helps the development of the world economy.</p>'
      },
      {
        title: 'International humanitarian aid',
        excerpt: 'World countries organize humanitarian aid.',
        content: '<p>International humanitarian aid organizations and countries organize humanitarian aid in various regions. This aid reaches people facing natural disasters, conflicts and other problems.</p><p>Humanitarian aid is provided in various forms and improves the lives of thousands of people. This is an example of international solidarity and resilience.</p>'
      },
      {
        title: 'World culture and heritage',
        excerpt: 'UNESCO and other organizations protect cultural heritage.',
        content: '<p>Various measures are being taken to protect the world cultural heritage. UNESCO and other international organizations are working to protect cultural monuments.</p><p>Protecting cultural heritage is important for future generations. This preserves and develops humanity common cultural wealth.</p>'
      }
    ]
  },
  'biznes': {
    az: [
      {
        title: 'Yeni investisiya layihələri',
        excerpt: 'Ölkədə yeni investisiya layihələri həyata keçirilir.',
        content: '<p>Azərbaycanda yeni investisiya layihələri həyata keçirilir. Bu layihələr müxtəlif sahələri əhatə edir və iqtisadi inkişafa töhfə verir.</p><p>Yerli və xarici investorlar ölkədə yeni imkanlar axtarır və investisiya edir. Bu, iş yerlərinin yaradılmasına və iqtisadi artıma kömək edir.</p>'
      },
      {
        title: 'Startup ekosisteminin inkişafı',
        excerpt: 'Startup şirkətlərinə dəstək artırılır.',
        content: '<p>Azərbaycanda startup ekosisteminin inkişafı üçün tədbirlər görülür. Gənc sahibkarlara dəstək göstərilir və yeni imkanlar yaradılır.</p><p>Startup inkubatorları və akeleratorları fəaliyyət göstərir. Bu, innovasiya və texnologiya sahəsində yeni layihələrin yaranmasına kömək edir.</p>'
      },
      {
        title: 'Bank sektorunda yeniliklər',
        excerpt: 'Banklar yeni xidmətlər təqdim edir.',
        content: '<p>Azərbaycan bank sektorunda yeniliklər baş verir. Banklar müştərilərə yeni xidmətlər təqdim edir və rəqəmsal həllər tətbiq edir.</p><p>Onlayn bankçılıq xidmətləri genişlənir və müştərilərin rahatlığı artırılır. Bu, bank sektorunun modernləşməsinə kömək edir.</p>'
      },
      {
        title: 'Beynəlxalq biznes forumları',
        excerpt: 'Beynəlxalq biznes forumları təşkil olunur.',
        content: '<p>Azərbaycanda beynəlxalq biznes forumları təşkil olunur. Bu forumlar sahibkarlar üçün yeni imkanlar yaradır və əməkdaşlıq imkanlarını artırır.</p><p>Forumlarda müxtəlif sahələrdən nümayəndələr iştirak edir və yeni layihələr üzrə müzakirələr aparılır. Bu, biznes mühitinin inkişafına töhfə verir.</p>'
      },
      {
        title: 'İxrac imkanlarının genişləndirilməsi',
        excerpt: 'Yerli məhsulların ixracı artırılır.',
        content: '<p>Azərbaycan məhsullarının ixracı artırılır və yeni bazarlar açılır. Bu, ölkənin iqtisadi inkişafına və valyuta gəlirlərinin artmasına kömək edir.</p><p>İxracçılara dəstək göstərilir və yeni imkanlar yaradılır. Bu, yerli istehsalın inkişafına və beynəlxalq rəqabət qabiliyyətinin artmasına kömək edir.</p>'
      }
    ],
    en: [
      {
        title: 'New investment projects',
        excerpt: 'New investment projects are being implemented in the country.',
        content: '<p>New investment projects are being implemented in Azerbaijan. These projects cover various fields and contribute to economic development.</p><p>Local and foreign investors are looking for new opportunities and investing in the country. This helps create jobs and economic growth.</p>'
      },
      {
        title: 'Development of startup ecosystem',
        excerpt: 'Support for startup companies is increasing.',
        content: '<p>Measures are being taken to develop the startup ecosystem in Azerbaijan. Support is provided to young entrepreneurs and new opportunities are created.</p><p>Startup incubators and accelerators are operating. This helps create new projects in the field of innovation and technology.</p>'
      },
      {
        title: 'Innovations in banking sector',
        excerpt: 'Banks are introducing new services.',
        content: '<p>Innovations are taking place in the banking sector of Azerbaijan. Banks are introducing new services to customers and implementing digital solutions.</p><p>Online banking services are expanding and customer convenience is increasing. This helps modernize the banking sector.</p>'
      },
      {
        title: 'International business forums',
        excerpt: 'International business forums are being organized.',
        content: '<p>International business forums are being organized in Azerbaijan. These forums create new opportunities for entrepreneurs and increase cooperation opportunities.</p><p>Representatives from various fields participate in the forums and discussions are held on new projects. This contributes to the development of the business environment.</p>'
      },
      {
        title: 'Expansion of export opportunities',
        excerpt: 'Export of local products is increasing.',
        content: '<p>Export of Azerbaijani products is increasing and new markets are opening. This helps the country economic development and increase in foreign exchange earnings.</p><p>Support is provided to exporters and new opportunities are created. This helps develop local production and increase international competitiveness.</p>'
      }
    ]
  },
  'texnologiya': {
    az: [
      {
        title: 'Rəqəmsal transformasiya layihələri',
        excerpt: 'Ölkədə rəqəmsal transformasiya sürətləndirilir.',
        content: '<p>Azərbaycanda rəqəmsal transformasiya layihələri həyata keçirilir. Dövlət orqanları və biznes strukturları rəqəmsal həllər tətbiq edir.</p><p>Rəqəmsal xidmətlər genişlənir və vətəndaşların həyatı asanlaşır. Bu, modernləşmə və inkişaf proseslərinə kömək edir.</p>'
      },
      {
        title: 'Süni intellekt və maşın öyrənməsi',
        excerpt: 'AI texnologiyaları müxtəlif sahələrdə tətbiq olunur.',
        content: '<p>Süni intellekt və maşın öyrənməsi texnologiyaları müxtəlif sahələrdə tətbiq olunur. Bu texnologiyalar səmərəliliyi artırır və yeni imkanlar yaradır.</p><p>AI layihələri səhiyyə, təhsil, biznes və digər sahələrdə tətbiq olunur. Bu, həyatın müxtəlif sahələrində inqilab yaradır.</p>'
      },
      {
        title: '5G şəbəkəsinin yayılması',
        excerpt: '5G texnologiyası ölkədə genişləndirilir.',
        content: '<p>Azərbaycanda 5G şəbəkəsinin yayılması davam edir. Bu texnologiya sürətli internet və yeni xidmətlər təmin edir.</p><p>5G şəbəkəsi müxtəlif şəhərlərdə quraşdırılır və istifadəçilərə yüksək sürətli internet xidməti təqdim olunur. Bu, rəqəmsal inkişafa kömək edir.</p>'
      },
      {
        title: 'Kibertəhlükəsizlik tədbirləri',
        excerpt: 'Kibertəhlükəsizlik sahəsində yeni tədbirlər görülür.',
        content: '<p>Kibertəhlükəsizlik sahəsində yeni tədbirlər görülür. Dövlət və özəl sektorlar kibertəhlükəsizliyi gücləndirmək üçün işlər aparır.</p><p>Yeni texnologiyalar və metodlar tətbiq olunur. Bu, məlumatların qorunmasına və sistemlərin təhlükəsizliyinə kömək edir.</p>'
      },
      {
        title: 'İnnovasiya mərkəzlərinin açılması',
        excerpt: 'Yeni innovasiya mərkəzləri fəaliyyətə başlayır.',
        content: '<p>Azərbaycanda yeni innovasiya mərkəzləri açılır. Bu mərkəzlər texnologiya və innovasiya sahəsində işlər aparır.</p><p>İnnovasiya mərkəzləri gənc mütəxəssislərə dəstək göstərir və yeni layihələrin yaranmasına kömək edir. Bu, texnoloji inkişafa töhfə verir.</p>'
      }
    ],
    en: [
      {
        title: 'Digital transformation projects',
        excerpt: 'Digital transformation is being accelerated in the country.',
        content: '<p>Digital transformation projects are being implemented in Azerbaijan. Government agencies and business structures are implementing digital solutions.</p><p>Digital services are expanding and citizens lives are becoming easier. This helps modernization and development processes.</p>'
      },
      {
        title: 'Artificial intelligence and machine learning',
        excerpt: 'AI technologies are being applied in various fields.',
        content: '<p>Artificial intelligence and machine learning technologies are being applied in various fields. These technologies increase efficiency and create new opportunities.</p><p>AI projects are being applied in healthcare, education, business and other fields. This creates a revolution in various areas of life.</p>'
      },
      {
        title: '5G network expansion',
        excerpt: '5G technology is being expanded in the country.',
        content: '<p>The expansion of 5G network continues in Azerbaijan. This technology provides fast internet and new services.</p><p>5G network is being installed in various cities and high-speed internet service is provided to users. This helps digital development.</p>'
      },
      {
        title: 'Cybersecurity measures',
        excerpt: 'New measures are being taken in the field of cybersecurity.',
        content: '<p>New measures are being taken in the field of cybersecurity. Government and private sectors are working to strengthen cybersecurity.</p><p>New technologies and methods are being applied. This helps protect data and system security.</p>'
      },
      {
        title: 'Opening of innovation centers',
        excerpt: 'New innovation centers are starting to operate.',
        content: '<p>New innovation centers are opening in Azerbaijan. These centers work in the field of technology and innovation.</p><p>Innovation centers support young specialists and help create new projects. This contributes to technological development.</p>'
      }
    ]
  },
  'maqazin': {
    az: [
      {
        title: 'Mədəni həyatda yeni tendensiyalar',
        excerpt: 'Mədəni həyatda yeni tendensiyalar və cərəyanlar yaranır.',
        content: '<p>Mədəni həyatda yeni tendensiyalar və cərəyanlar yaranır. Bu, cəmiyyətin inkişafını və dəyişikliklərini əks etdirir.</p><p>Yeni mədəni hadisələr, tədbirlər və layihələr təşkil olunur. Bu, mədəni həyatın zənginləşməsinə kömək edir.</p>'
      },
      {
        title: 'İncəsənət və ədəbiyyatda yeniliklər',
        excerpt: 'İncəsənət və ədəbiyyat sahəsində yeni əsərlər yaranır.',
        content: '<p>İncəsənət və ədəbiyyat sahəsində yeni əsərlər yaranır. Rəssamlar, yazıçılar və digər mədəniyyət xadimləri yeni layihələr üzərində işləyir.</p><p>Yeni sərgilər, konsertlər və ədəbi tədbirlər təşkil olunur. Bu, mədəni həyatın inkişafına töhfə verir.</p>'
      },
      {
        title: 'Moda və dizayn tendensiyaları',
        excerpt: 'Moda və dizayn sahəsində yeni tendensiyalar müşahidə olunur.',
        content: '<p>Moda və dizayn sahəsində yeni tendensiyalar müşahidə olunur. Dizaynerlər yeni kolleksiyalar hazırlayır və moda dünyasında yeniliklər yaranır.</p><p>Moda həftələri və dizayn tədbirləri təşkil olunur. Bu, moda sənayesinin inkişafına kömək edir.</p>'
      },
      {
        title: 'Kino və televiziya layihələri',
        excerpt: 'Yeni kino və televiziya layihələri hazırlanır.',
        content: '<p>Yeni kino və televiziya layihələri hazırlanır. Rejissorlar, aktyorlar və digər peşəkarlar yeni əsərlər üzərində işləyir.</p><p>Yeni filmlər, seriallar və sənədli filmlər çəkilir. Bu, kino sənayesinin inkişafına və mədəni həyatın zənginləşməsinə kömək edir.</p>'
      }
    ],
    en: [
      {
        title: 'New trends in cultural life',
        excerpt: 'New trends and movements are emerging in cultural life.',
        content: '<p>New trends and movements are emerging in cultural life. This reflects the development and changes in society.</p><p>New cultural events, activities and projects are being organized. This helps enrich cultural life.</p>'
      },
      {
        title: 'Innovations in art and literature',
        excerpt: 'New works are being created in the field of art and literature.',
        content: '<p>New works are being created in the field of art and literature. Artists, writers and other cultural figures are working on new projects.</p><p>New exhibitions, concerts and literary events are being organized. This contributes to the development of cultural life.</p>'
      },
      {
        title: 'Fashion and design trends',
        excerpt: 'New trends are being observed in the field of fashion and design.',
        content: '<p>New trends are being observed in the field of fashion and design. Designers are preparing new collections and innovations are emerging in the fashion world.</p><p>Fashion weeks and design events are being organized. This helps develop the fashion industry.</p>'
      },
      {
        title: 'Cinema and television projects',
        excerpt: 'New cinema and television projects are being prepared.',
        content: '<p>New cinema and television projects are being prepared. Directors, actors and other professionals are working on new works.</p><p>New films, series and documentaries are being shot. This helps develop the film industry and enrich cultural life.</p>'
      }
    ]
  },
  'idman': {
    az: [
      {
        title: 'Milli komandanın uğurları',
        excerpt: 'Azərbaycan idmançıları beynəlxalq yarışlarda uğur qazanır.',
        content: '<p>Azərbaycan idmançıları beynəlxalq yarışlarda uğur qazanır. Milli komanda müxtəlif idman növlərində yüksək nəticələr əldə edir.</p><p>İdmançıların hazırlığı davam edir və yeni yarışlara hazırlaşırlar. Bu, ölkənin idman potensialının artmasına kömək edir.</p>'
      },
      {
        title: 'Yerli çempionatlar',
        excerpt: 'Yerli idman çempionatları keçirilir.',
        content: '<p>Azərbaycanda yerli idman çempionatları keçirilir. Müxtəlif idman növlərində yarışlar təşkil olunur və idmançılar öz bacarıqlarını nümayiş etdirir.</p><p>Çempionatlar idmanın inkişafına və gənc idmançıların yetişdirilməsinə kömək edir. Bu, idman mədəniyyətinin yayılmasına töhfə verir.</p>'
      },
      {
        title: 'İdman infrastrukturu',
        excerpt: 'Yeni idman kompleksləri və mərkəzləri açılır.',
        content: '<p>Azərbaycanda yeni idman kompleksləri və mərkəzləri açılır. Bu, idmançıların hazırlığı üçün yaxşı şərait yaradır.</p><p>İdman infrastrukturu modernləşdirilir və yeni imkanlar yaradılır. Bu, idmanın inkişafına və idmançıların nəticələrinin yaxşılaşmasına kömək edir.</p>'
      },
      {
        title: 'Gənc idmançıların dəstəklənməsi',
        excerpt: 'Gənc idmançılara dəstək proqramları həyata keçirilir.',
        content: '<p>Gənc idmançılara dəstək proqramları həyata keçirilir. Bu proqramlar gənc istedadların aşkar edilməsinə və inkişafına kömək edir.</p><p>Gənc idmançılar üçün xüsusi təlim proqramları təşkil olunur. Bu, gələcək uğurların əsasını qoyur.</p>'
      },
      {
        title: 'Beynəlxalq idman tədbirləri',
        excerpt: 'Azərbaycanda beynəlxalq idman tədbirləri təşkil olunur.',
        content: '<p>Azərbaycanda beynəlxalq idman tədbirləri təşkil olunur. Bu tədbirlər ölkənin idman imicini yaxşılaşdırır və beynəlxalq əlaqələri gücləndirir.</p><p>Müxtəlif idman növlərində beynəlxalq yarışlar keçirilir. Bu, idmanın inkişafına və ölkənin tanınmasına kömək edir.</p>'
      }
    ],
    en: [
      {
        title: 'National team achievements',
        excerpt: 'Azerbaijani athletes achieve success in international competitions.',
        content: '<p>Azerbaijani athletes achieve success in international competitions. The national team achieves high results in various sports.</p><p>Athletes training continues and they prepare for new competitions. This helps increase the country sports potential.</p>'
      },
      {
        title: 'Local championships',
        excerpt: 'Local sports championships are being held.',
        content: '<p>Local sports championships are being held in Azerbaijan. Competitions are organized in various sports and athletes demonstrate their skills.</p><p>Championships help develop sports and train young athletes. This contributes to the spread of sports culture.</p>'
      },
      {
        title: 'Sports infrastructure',
        excerpt: 'New sports complexes and centers are opening.',
        content: '<p>New sports complexes and centers are opening in Azerbaijan. This creates good conditions for athletes training.</p><p>Sports infrastructure is being modernized and new opportunities are being created. This helps develop sports and improve athletes results.</p>'
      },
      {
        title: 'Support for young athletes',
        excerpt: 'Support programs for young athletes are being implemented.',
        content: '<p>Support programs for young athletes are being implemented. These programs help identify and develop young talents.</p><p>Special training programs are organized for young athletes. This lays the foundation for future success.</p>'
      },
      {
        title: 'International sports events',
        excerpt: 'International sports events are being organized in Azerbaijan.',
        content: '<p>International sports events are being organized in Azerbaijan. These events improve the country sports image and strengthen international relations.</p><p>International competitions are held in various sports. This helps develop sports and promote the country.</p>'
      }
    ]
  },
  'oxucu-mktublar': {
    az: [
      {
        title: 'Oxucuların fikirləri və təklifləri',
        excerpt: 'Oxucular öz fikirlərini və təkliflərini bölüşür.',
        content: '<p>Oxucular öz fikirlərini, təkliflərini və təcrübələrini bölüşür. Bu, cəmiyyətdə dialoqun yaranmasına kömək edir.</p><p>Oxucu məktubları müxtəlif mövzuları əhatə edir və cəmiyyətin müxtəlif problemlərinə diqqət çəkir. Bu, sosial problemlərin həllinə kömək edir.</p>'
      },
      {
        title: 'Cəmiyyət problemləri haqqında müzakirələr',
        excerpt: 'Oxucular cəmiyyət problemləri haqqında müzakirə edir.',
        content: '<p>Oxucular cəmiyyətin müxtəlif problemləri haqqında müzakirə edir və həll yolları təklif edir. Bu, cəmiyyətin inkişafına kömək edir.</p><p>Müzakirələr müxtəlif mövzuları əhatə edir və fərqli baxışlar təqdim olunur. Bu, dialoqun və anlaşmanın yaranmasına kömək edir.</p>'
      },
      {
        title: 'Şəhər həyatı və problemləri',
        excerpt: 'Oxucular şəhər həyatı və problemləri haqqında yazır.',
        content: '<p>Oxucular şəhər həyatı, problemləri və inkişaf perspektivləri haqqında öz fikirlərini bölüşür. Bu, şəhərsalma və inkişaf məsələlərinə diqqət çəkir.</p><p>Şəhər problemləri müzakirə olunur və həll yolları təklif edilir. Bu, şəhərin inkişafına kömək edir.</p>'
      },
      {
        title: 'Təhsil və mədəniyyət mövzuları',
        excerpt: 'Oxucular təhsil və mədəniyyət mövzularında fikir bildirir.',
        content: '<p>Oxucular təhsil və mədəniyyət mövzularında öz fikirlərini bölüşür. Bu, bu sahələrdə dialoqun yaranmasına kömək edir.</p><p>Təhsil və mədəniyyət problemləri müzakirə olunur və yeni ideyalar təqdim edilir. Bu, bu sahələrin inkişafına kömək edir.</p>'
      }
    ],
    en: [
      {
        title: 'Readers opinions and suggestions',
        excerpt: 'Readers share their opinions and suggestions.',
        content: '<p>Readers share their opinions, suggestions and experiences. This helps create dialogue in society.</p><p>Reader letters cover various topics and draw attention to various problems in society. This helps solve social problems.</p>'
      },
      {
        title: 'Discussions about social problems',
        excerpt: 'Readers discuss social problems.',
        content: '<p>Readers discuss various problems in society and propose solutions. This helps develop society.</p><p>Discussions cover various topics and different views are presented. This helps create dialogue and understanding.</p>'
      },
      {
        title: 'City life and problems',
        excerpt: 'Readers write about city life and problems.',
        content: '<p>Readers share their thoughts on city life, problems and development perspectives. This draws attention to urban planning and development issues.</p><p>City problems are discussed and solutions are proposed. This helps develop the city.</p>'
      },
      {
        title: 'Education and culture topics',
        excerpt: 'Readers express opinions on education and culture topics.',
        content: '<p>Readers share their thoughts on education and culture topics. This helps create dialogue in these fields.</p><p>Education and culture problems are discussed and new ideas are presented. This helps develop these fields.</p>'
      }
    ]
  }
};

async function main() {
  console.log('Bölmələr üçün xəbərlər əlavə edilir...\n');

  // Bütün bölmələri al
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
  });

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

  for (const category of categories) {
    const categorySlug = category.slug;
    const categoryArticles = articlesByCategory[categorySlug];

    if (!categoryArticles) {
      console.log(`⊘ ${categorySlug} bölməsi üçün xəbər məlumatları tapılmadı`);
      continue;
    }

    console.log(`\n${categorySlug} bölməsi üçün xəbərlər əlavə edilir...`);

    // Hər bölmə üçün 4-5 xəbər əlavə et
    const articlesToCreate = Math.min(categoryArticles.az.length, 5);
    
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
  }

  console.log('\n✅ Bütün xəbərlər əlavə edildi!');
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

