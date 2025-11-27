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

// Şəkil URL-i
const defaultImageUrl = 'https://operativmedia.az/uploads/GettyImages-658252284_1763980428589_i8uf5kvu.jpg';

// Xəbər məlumatları - hər kateqoriya üçün 10 xəbər
const articlesByCategory: Record<string, { az: Array<{ title: string; excerpt: string; content: string }>, en: Array<{ title: string; excerpt: string; content: string }> }> = {
  gundem: {
    az: [
      { title: 'Gündəm xəbəri: Yeni inkişaf', excerpt: 'Gündəm xəbəri haqqında ətraflı məlumat.', content: '<p>Gündəm xəbəri haqqında ətraflı məlumat və təhlil.</p>' },
      { title: 'Aktual mövzu: Cəmiyyət problemləri', excerpt: 'Cəmiyyətdəki aktual problemlər və həll yolları.', content: '<p>Cəmiyyətdəki aktual problemlər və onların həll yolları haqqında məlumat.</p>' },
      { title: 'Gündəm: İqtisadi inkişaf', excerpt: 'İqtisadi inkişafın yeni mərhələləri.', content: '<p>İqtisadi inkişafın yeni mərhələləri və perspektivlər.</p>' },
      { title: 'Aktual: Sosial layihələr', excerpt: 'Yeni sosial layihələrin təqdimatı.', content: '<p>Yeni sosial layihələrin təqdimatı və tətbiqi.</p>' },
      { title: 'Gündəm: Təhsil sahəsində yeniliklər', excerpt: 'Təhsil sahəsində yeni yeniliklər və dəyişikliklər.', content: '<p>Təhsil sahəsində yeni yeniliklər və dəyişikliklər haqqında məlumat.</p>' },
      { title: 'Aktual: Səhiyyə sistemində dəyişikliklər', excerpt: 'Səhiyyə sistemində yeni dəyişikliklər.', content: '<p>Səhiyyə sistemində yeni dəyişikliklər və təkmilləşdirmələr.</p>' },
      { title: 'Gündəm: İnfrastruktur layihələri', excerpt: 'Yeni infrastruktur layihələrinin başlanğıcı.', content: '<p>Yeni infrastruktur layihələrinin başlanğıcı və planlaşdırılması.</p>' },
      { title: 'Aktual: Ətraf mühit məsələləri', excerpt: 'Ətraf mühit məsələləri və həll yolları.', content: '<p>Ətraf mühit məsələləri və onların həll yolları haqqında məlumat.</p>' },
      { title: 'Gündəm: Mədəniyyət tədbirləri', excerpt: 'Yaxınlaşan mədəniyyət tədbirləri.', content: '<p>Yaxınlaşan mədəniyyət tədbirləri və proqramlar.</p>' },
      { title: 'Aktual: Texnologiya yenilikləri', excerpt: 'Texnologiya sahəsində son yeniliklər.', content: '<p>Texnologiya sahəsində son yeniliklər və innovasiyalar.</p>' },
    ],
    en: [
      { title: 'Agenda news: New development', excerpt: 'Detailed information about agenda news.', content: '<p>Detailed information and analysis about agenda news.</p>' },
      { title: 'Current topic: Social issues', excerpt: 'Current social issues and solutions.', content: '<p>Information about current social issues and their solutions.</p>' },
      { title: 'Agenda: Economic development', excerpt: 'New stages of economic development.', content: '<p>New stages and prospects of economic development.</p>' },
      { title: 'Current: Social projects', excerpt: 'Presentation of new social projects.', content: '<p>Presentation and implementation of new social projects.</p>' },
      { title: 'Agenda: Education innovations', excerpt: 'New innovations and changes in education.', content: '<p>Information about new innovations and changes in education.</p>' },
      { title: 'Current: Healthcare system changes', excerpt: 'New changes in healthcare system.', content: '<p>New changes and improvements in healthcare system.</p>' },
      { title: 'Agenda: Infrastructure projects', excerpt: 'Start of new infrastructure projects.', content: '<p>Start and planning of new infrastructure projects.</p>' },
      { title: 'Current: Environmental issues', excerpt: 'Environmental issues and solutions.', content: '<p>Information about environmental issues and their solutions.</p>' },
      { title: 'Agenda: Cultural events', excerpt: 'Upcoming cultural events.', content: '<p>Upcoming cultural events and programs.</p>' },
      { title: 'Current: Technology innovations', excerpt: 'Latest innovations in technology.', content: '<p>Latest innovations and technologies in the field.</p>' },
    ],
  },
  siyaset: {
    az: [
      { title: 'Siyasət: Yeni qərarlar', excerpt: 'Siyasi qərarlar və təsirləri.', content: '<p>Siyasi qərarlar və onların təsirləri haqqında məlumat.</p>' },
      { title: 'Siyasət: Beynəlxalq əlaqələr', excerpt: 'Beynəlxalq əlaqələrdə yeni inkişaflar.', content: '<p>Beynəlxalq əlaqələrdə yeni inkişaflar və perspektivlər.</p>' },
      { title: 'Siyasət: Daxili siyasət', excerpt: 'Daxili siyasətdə yeni addımlar.', content: '<p>Daxili siyasətdə yeni addımlar və dəyişikliklər.</p>' },
      { title: 'Siyasət: Regional əməkdaşlıq', excerpt: 'Regional əməkdaşlıq layihələri.', content: '<p>Regional əməkdaşlıq layihələri və nəticələri.</p>' },
      { title: 'Siyasət: Diplomatik fəaliyyət', excerpt: 'Diplomatik fəaliyyətdə yeni uğurlar.', content: '<p>Diplomatik fəaliyyətdə yeni uğurlar və nailiyyətlər.</p>' },
      { title: 'Siyasət: Siyasi partiyalar', excerpt: 'Siyasi partiyaların fəaliyyəti.', content: '<p>Siyasi partiyaların fəaliyyəti və proqramları.</p>' },
      { title: 'Siyasət: Seçki prosesləri', excerpt: 'Seçki prosesləri və nəticələri.', content: '<p>Seçki prosesləri və nəticələri haqqında məlumat.</p>' },
      { title: 'Siyasət: Konstitusiya dəyişiklikləri', excerpt: 'Konstitusiya dəyişiklikləri və təsirləri.', content: '<p>Konstitusiya dəyişiklikləri və onların təsirləri.</p>' },
      { title: 'Siyasət: Qanunvericilik', excerpt: 'Yeni qanunvericilik təklifləri.', content: '<p>Yeni qanunvericilik təklifləri və müzakirələri.</p>' },
      { title: 'Siyasət: Siyasi islahatlar', excerpt: 'Siyasi islahatların həyata keçirilməsi.', content: '<p>Siyasi islahatların həyata keçirilməsi və nəticələri.</p>' },
    ],
    en: [
      { title: 'Politics: New decisions', excerpt: 'Political decisions and their impacts.', content: '<p>Information about political decisions and their impacts.</p>' },
      { title: 'Politics: International relations', excerpt: 'New developments in international relations.', content: '<p>New developments and prospects in international relations.</p>' },
      { title: 'Politics: Domestic policy', excerpt: 'New steps in domestic policy.', content: '<p>New steps and changes in domestic policy.</p>' },
      { title: 'Politics: Regional cooperation', excerpt: 'Regional cooperation projects.', content: '<p>Regional cooperation projects and their results.</p>' },
      { title: 'Politics: Diplomatic activity', excerpt: 'New achievements in diplomatic activity.', content: '<p>New achievements and successes in diplomatic activity.</p>' },
      { title: 'Politics: Political parties', excerpt: 'Activities of political parties.', content: '<p>Activities and programs of political parties.</p>' },
      { title: 'Politics: Election processes', excerpt: 'Election processes and results.', content: '<p>Information about election processes and results.</p>' },
      { title: 'Politics: Constitutional changes', excerpt: 'Constitutional changes and their impacts.', content: '<p>Constitutional changes and their impacts.</p>' },
      { title: 'Politics: Legislation', excerpt: 'New legislative proposals.', content: '<p>New legislative proposals and discussions.</p>' },
      { title: 'Politics: Political reforms', excerpt: 'Implementation of political reforms.', content: '<p>Implementation and results of political reforms.</p>' },
    ],
  },
  dunya: {
    az: [
      { title: 'Dünya: Beynəlxalq xəbərlər', excerpt: 'Dünyada baş verən əsas hadisələr.', content: '<p>Dünyada baş verən əsas hadisələr və təhlillər.</p>' },
      { title: 'Dünya: Global iqtisadiyyat', excerpt: 'Global iqtisadiyyatda yeni trendlər.', content: '<p>Global iqtisadiyyatda yeni trendlər və perspektivlər.</p>' },
      { title: 'Dünya: Beynəlxalq təhlükəsizlik', excerpt: 'Beynəlxalq təhlükəsizlik məsələləri.', content: '<p>Beynəlxalq təhlükəsizlik məsələləri və həll yolları.</p>' },
      { title: 'Dünya: İqlim dəyişikliyi', excerpt: 'İqlim dəyişikliyi və təsirləri.', content: '<p>İqlim dəyişikliyi və onun təsirləri haqqında məlumat.</p>' },
      { title: 'Dünya: Humanitar yardım', excerpt: 'Beynəlxalq humanitar yardım tədbirləri.', content: '<p>Beynəlxalq humanitar yardım tədbirləri və proqramları.</p>' },
      { title: 'Dünya: Mədəniyyət irsi', excerpt: 'Dünya mədəniyyət irsinin qorunması.', content: '<p>Dünya mədəniyyət irsinin qorunması və mühafizəsi.</p>' },
      { title: 'Dünya: Migrasiya problemləri', excerpt: 'Dünyada migrasiya problemləri.', content: '<p>Dünyada migrasiya problemləri və həll yolları.</p>' },
      { title: 'Dünya: Enerji təhlükəsizliyi', excerpt: 'Global enerji təhlükəsizliyi məsələləri.', content: '<p>Global enerji təhlükəsizliyi məsələləri və perspektivlər.</p>' },
      { title: 'Dünya: Səhiyyə təhlükəsizliyi', excerpt: 'Global səhiyyə təhlükəsizliyi.', content: '<p>Global səhiyyə təhlükəsizliyi və tədbirləri.</p>' },
      { title: 'Dünya: Təhsil sistemləri', excerpt: 'Dünyada təhsil sistemlərinin inkişafı.', content: '<p>Dünyada təhsil sistemlərinin inkişafı və yenilikləri.</p>' },
    ],
    en: [
      { title: 'World: International news', excerpt: 'Major events happening in the world.', content: '<p>Major events and analyses happening in the world.</p>' },
      { title: 'World: Global economy', excerpt: 'New trends in global economy.', content: '<p>New trends and prospects in global economy.</p>' },
      { title: 'World: International security', excerpt: 'International security issues.', content: '<p>International security issues and solutions.</p>' },
      { title: 'World: Climate change', excerpt: 'Climate change and its impacts.', content: '<p>Information about climate change and its impacts.</p>' },
      { title: 'World: Humanitarian aid', excerpt: 'International humanitarian aid initiatives.', content: '<p>International humanitarian aid initiatives and programs.</p>' },
      { title: 'World: Cultural heritage', excerpt: 'Protection of world cultural heritage.', content: '<p>Protection and preservation of world cultural heritage.</p>' },
      { title: 'World: Migration issues', excerpt: 'Migration issues in the world.', content: '<p>Migration issues and solutions in the world.</p>' },
      { title: 'World: Energy security', excerpt: 'Global energy security issues.', content: '<p>Global energy security issues and prospects.</p>' },
      { title: 'World: Health security', excerpt: 'Global health security.', content: '<p>Global health security and measures.</p>' },
      { title: 'World: Education systems', excerpt: 'Development of education systems in the world.', content: '<p>Development and innovations in education systems worldwide.</p>' },
    ],
  },
  biznes: {
    az: [
      { title: 'Biznes: İqtisadi inkişaf', excerpt: 'İqtisadi inkişafın yeni mərhələləri.', content: '<p>İqtisadi inkişafın yeni mərhələləri və perspektivlər.</p>' },
      { title: 'Biznes: İnvestisiya layihələri', excerpt: 'Yeni investisiya layihələri və imkanları.', content: '<p>Yeni investisiya layihələri və imkanları haqqında məlumat.</p>' },
      { title: 'Biznes: Sahibkarlıq', excerpt: 'Sahibkarlığın inkişafı və dəstəklənməsi.', content: '<p>Sahibkarlığın inkişafı və dəstəklənməsi proqramları.</p>' },
      { title: 'Biznes: Bank sektoru', excerpt: 'Bank sektorunda yeni inkişaflar.', content: '<p>Bank sektorunda yeni inkişaflar və yeniliklər.</p>' },
      { title: 'Biznes: İxrac-idxal', excerpt: 'İxrac-idxal əməliyyatlarında artım.', content: '<p>İxrac-idxal əməliyyatlarında artım və perspektivlər.</p>' },
      { title: 'Biznes: Turizm sektoru', excerpt: 'Turizm sektorunun inkişafı.', content: '<p>Turizm sektorunun inkişafı və potensialı.</p>' },
      { title: 'Biznes: Kənd təsərrüfatı', excerpt: 'Kənd təsərrüfatında yeni layihələr.', content: '<p>Kənd təsərrüfatında yeni layihələr və investisiyalar.</p>' },
      { title: 'Biznes: Neft-qaz sektoru', excerpt: 'Neft-qaz sektorunda yeni uğurlar.', content: '<p>Neft-qaz sektorunda yeni uğurlar və layihələr.</p>' },
      { title: 'Biznes: Texnologiya şirkətləri', excerpt: 'Texnologiya şirkətlərinin inkişafı.', content: '<p>Texnologiya şirkətlərinin inkişafı və innovasiyaları.</p>' },
      { title: 'Biznes: İstehsal sektoru', excerpt: 'İstehsal sektorunda yeni imkanlar.', content: '<p>İstehsal sektorunda yeni imkanlar və perspektivlər.</p>' },
    ],
    en: [
      { title: 'Business: Economic development', excerpt: 'New stages of economic development.', content: '<p>New stages and prospects of economic development.</p>' },
      { title: 'Business: Investment projects', excerpt: 'New investment projects and opportunities.', content: '<p>Information about new investment projects and opportunities.</p>' },
      { title: 'Business: Entrepreneurship', excerpt: 'Development and support of entrepreneurship.', content: '<p>Entrepreneurship development and support programs.</p>' },
      { title: 'Business: Banking sector', excerpt: 'New developments in banking sector.', content: '<p>New developments and innovations in banking sector.</p>' },
      { title: 'Business: Export-import', excerpt: 'Growth in export-import operations.', content: '<p>Growth and prospects in export-import operations.</p>' },
      { title: 'Business: Tourism sector', excerpt: 'Development of tourism sector.', content: '<p>Development and potential of tourism sector.</p>' },
      { title: 'Business: Agriculture', excerpt: 'New projects in agriculture.', content: '<p>New projects and investments in agriculture.</p>' },
      { title: 'Business: Oil and gas sector', excerpt: 'New achievements in oil and gas sector.', content: '<p>New achievements and projects in oil and gas sector.</p>' },
      { title: 'Business: Technology companies', excerpt: 'Development of technology companies.', content: '<p>Development and innovations of technology companies.</p>' },
      { title: 'Business: Manufacturing sector', excerpt: 'New opportunities in manufacturing sector.', content: '<p>New opportunities and prospects in manufacturing sector.</p>' },
    ],
  },
  texnologiya: {
    az: [
      { title: 'Texno: Süni intellekt', excerpt: 'Süni intellekt texnologiyalarında yeniliklər.', content: '<p>Süni intellekt texnologiyalarında yeniliklər və tətbiqləri.</p>' },
      { title: 'Texno: Kibertəhlükəsizlik', excerpt: 'Kibertəhlükəsizlik məsələləri və həll yolları.', content: '<p>Kibertəhlükəsizlik məsələləri və həll yolları haqqında məlumat.</p>' },
      { title: 'Texno: Bulud texnologiyaları', excerpt: 'Bulud texnologiyalarının inkişafı.', content: '<p>Bulud texnologiyalarının inkişafı və perspektivlər.</p>' },
      { title: 'Texno: Mobil tətbiqlər', excerpt: 'Yeni mobil tətbiqlər və imkanları.', content: '<p>Yeni mobil tətbiqlər və imkanları haqqında məlumat.</p>' },
      { title: 'Texno: İnternet şeyləri', excerpt: 'İnternet şeyləri texnologiyaları.', content: '<p>İnternet şeyləri texnologiyaları və tətbiqləri.</p>' },
      { title: 'Texno: Blockchain texnologiyası', excerpt: 'Blockchain texnologiyasının tətbiqi.', content: '<p>Blockchain texnologiyasının tətbiqi və perspektivlər.</p>' },
      { title: 'Texno: Virtual reallıq', excerpt: 'Virtual reallıq texnologiyaları.', content: '<p>Virtual reallıq texnologiyaları və innovasiyaları.</p>' },
      { title: 'Texno: Robototexnika', excerpt: 'Robototexnika sahəsində yeniliklər.', content: '<p>Robototexnika sahəsində yeniliklər və tətbiqləri.</p>' },
      { title: 'Texno: 5G şəbəkələri', excerpt: '5G şəbəkələrinin yayılması.', content: '<p>5G şəbəkələrinin yayılması və imkanları.</p>' },
      { title: 'Texno: Kvant hesablamalar', excerpt: 'Kvant hesablamalar texnologiyaları.', content: '<p>Kvant hesablamalar texnologiyaları və perspektivlər.</p>' },
    ],
    en: [
      { title: 'Tech: Artificial intelligence', excerpt: 'Innovations in AI technologies.', content: '<p>Innovations and applications in AI technologies.</p>' },
      { title: 'Tech: Cybersecurity', excerpt: 'Cybersecurity issues and solutions.', content: '<p>Information about cybersecurity issues and solutions.</p>' },
      { title: 'Tech: Cloud technologies', excerpt: 'Development of cloud technologies.', content: '<p>Development and prospects of cloud technologies.</p>' },
      { title: 'Tech: Mobile applications', excerpt: 'New mobile applications and opportunities.', content: '<p>Information about new mobile applications and opportunities.</p>' },
      { title: 'Tech: Internet of Things', excerpt: 'IoT technologies.', content: '<p>IoT technologies and their applications.</p>' },
      { title: 'Tech: Blockchain technology', excerpt: 'Application of blockchain technology.', content: '<p>Application and prospects of blockchain technology.</p>' },
      { title: 'Tech: Virtual reality', excerpt: 'Virtual reality technologies.', content: '<p>Virtual reality technologies and innovations.</p>' },
      { title: 'Tech: Robotics', excerpt: 'Innovations in robotics.', content: '<p>Innovations and applications in robotics.</p>' },
      { title: 'Tech: 5G networks', excerpt: 'Expansion of 5G networks.', content: '<p>Expansion and opportunities of 5G networks.</p>' },
      { title: 'Tech: Quantum computing', excerpt: 'Quantum computing technologies.', content: '<p>Quantum computing technologies and prospects.</p>' },
    ],
  },
  avto: {
    az: [
      { title: 'Avto: Yeni avtomobil modelləri', excerpt: 'Avtomobil bazarında yeni modellər.', content: '<p>Avtomobil bazarında yeni modellər və xüsusiyyətləri.</p>' },
      { title: 'Avto: Elektrik avtomobilləri', excerpt: 'Elektrik avtomobillərinin inkişafı.', content: '<p>Elektrik avtomobillərinin inkişafı və perspektivlər.</p>' },
      { title: 'Avto: Avtomobil təhlükəsizliyi', excerpt: 'Avtomobil təhlükəsizliyi texnologiyaları.', content: '<p>Avtomobil təhlükəsizliyi texnologiyaları və yenilikləri.</p>' },
      { title: 'Avto: Avtonom avtomobillər', excerpt: 'Avtonom avtomobillərin tətbiqi.', content: '<p>Avtonom avtomobillərin tətbiqi və perspektivlər.</p>' },
      { title: 'Avto: Avtomobil sənayesi', excerpt: 'Avtomobil sənayesində yeniliklər.', content: '<p>Avtomobil sənayesində yeniliklər və inkişaf.</p>' },
      { title: 'Avto: Yol infrastrukturu', excerpt: 'Yol infrastrukturunun təkmilləşdirilməsi.', content: '<p>Yol infrastrukturunun təkmilləşdirilməsi və layihələri.</p>' },
      { title: 'Avto: Avtomobil təmiri', excerpt: 'Avtomobil təmirində yeni üsullar.', content: '<p>Avtomobil təmirində yeni üsullar və texnologiyalar.</p>' },
      { title: 'Avto: Avtomobil aksesuarları', excerpt: 'Yeni avtomobil aksesuarları.', content: '<p>Yeni avtomobil aksesuarları və imkanları.</p>' },
      { title: 'Avto: Avtomobil yarışları', excerpt: 'Avtomobil yarışlarında yeni rekordlar.', content: '<p>Avtomobil yarışlarında yeni rekordlar və nailiyyətlər.</p>' },
      { title: 'Avto: Avtomobil ekologiyası', excerpt: 'Avtomobillərin ekoloji təsiri.', content: '<p>Avtomobillərin ekoloji təsiri və azaldılması.</p>' },
    ],
    en: [
      { title: 'Auto: New car models', excerpt: 'New models in the car market.', content: '<p>New models and features in the car market.</p>' },
      { title: 'Auto: Electric vehicles', excerpt: 'Development of electric vehicles.', content: '<p>Development and prospects of electric vehicles.</p>' },
      { title: 'Auto: Car safety', excerpt: 'Car safety technologies.', content: '<p>Car safety technologies and innovations.</p>' },
      { title: 'Auto: Autonomous vehicles', excerpt: 'Application of autonomous vehicles.', content: '<p>Application and prospects of autonomous vehicles.</p>' },
      { title: 'Auto: Automotive industry', excerpt: 'Innovations in automotive industry.', content: '<p>Innovations and development in automotive industry.</p>' },
      { title: 'Auto: Road infrastructure', excerpt: 'Improvement of road infrastructure.', content: '<p>Improvement and projects of road infrastructure.</p>' },
      { title: 'Auto: Car repair', excerpt: 'New methods in car repair.', content: '<p>New methods and technologies in car repair.</p>' },
      { title: 'Auto: Car accessories', excerpt: 'New car accessories.', content: '<p>New car accessories and opportunities.</p>' },
      { title: 'Auto: Car racing', excerpt: 'New records in car racing.', content: '<p>New records and achievements in car racing.</p>' },
      { title: 'Auto: Car ecology', excerpt: 'Environmental impact of cars.', content: '<p>Environmental impact of cars and its reduction.</p>' },
    ],
  },
  cemiyyet: {
    az: [
      { title: 'Life Style: Moda trendləri', excerpt: 'Yeni moda trendləri və stilləri.', content: '<p>Yeni moda trendləri və stilləri haqqında məlumat.</p>' },
      { title: 'Life Style: Sağlam həyat tərzi', excerpt: 'Sağlam həyat tərzi üçün tövsiyələr.', content: '<p>Sağlam həyat tərzi üçün tövsiyələr və məsləhətlər.</p>' },
      { title: 'Life Style: Ev dekorasiyası', excerpt: 'Ev dekorasiyası üçün ideyalar.', content: '<p>Ev dekorasiyası üçün ideyalar və dizayn həlləri.</p>' },
      { title: 'Life Style: Qidalanma', excerpt: 'Düzgün qidalanma və sağlamlıq.', content: '<p>Düzgün qidalanma və sağlamlıq haqqında məlumat.</p>' },
      { title: 'Life Style: Fitness', excerpt: 'Fitness və idman üçün məsləhətlər.', content: '<p>Fitness və idman üçün məsləhətlər və proqramlar.</p>' },
      { title: 'Life Style: Gözəllik və sağlamlıq', excerpt: 'Gözəllik və sağlamlıq üçün tövsiyələr.', content: '<p>Gözəllik və sağlamlıq üçün tövsiyələr və məsləhətlər.</p>' },
      { title: 'Life Style: Məşğuliyyət və hobbilər', excerpt: 'Məşğuliyyət və hobbilər üçün ideyalar.', content: '<p>Məşğuliyyət və hobbilər üçün ideyalar və təkliflər.</p>' },
      { title: 'Life Style: Səyahət və istirahət', excerpt: 'Səyahət və istirahət üçün məsləhətlər.', content: '<p>Səyahət və istirahət üçün məsləhətlər və tövsiyələr.</p>' },
      { title: 'Life Style: Mədəni tədbirlər', excerpt: 'Mədəni tədbirlər və konsertlər.', content: '<p>Mədəni tədbirlər və konsertlər haqqında məlumat.</p>' },
      { title: 'Life Style: Şəxsi inkişaf', excerpt: 'Şəxsi inkişaf üçün məsləhətlər.', content: '<p>Şəxsi inkişaf üçün məsləhətlər və tövsiyələr.</p>' },
    ],
    en: [
      { title: 'Life Style: Fashion trends', excerpt: 'New fashion trends and styles.', content: '<p>Information about new fashion trends and styles.</p>' },
      { title: 'Life Style: Healthy lifestyle', excerpt: 'Tips for healthy lifestyle.', content: '<p>Tips and advice for healthy lifestyle.</p>' },
      { title: 'Life Style: Home decoration', excerpt: 'Ideas for home decoration.', content: '<p>Ideas and design solutions for home decoration.</p>' },
      { title: 'Life Style: Nutrition', excerpt: 'Proper nutrition and health.', content: '<p>Information about proper nutrition and health.</p>' },
      { title: 'Life Style: Fitness', excerpt: 'Tips for fitness and sports.', content: '<p>Tips and programs for fitness and sports.</p>' },
      { title: 'Life Style: Beauty and health', excerpt: 'Tips for beauty and health.', content: '<p>Tips and advice for beauty and health.</p>' },
      { title: 'Life Style: Hobbies and interests', excerpt: 'Ideas for hobbies and interests.', content: '<p>Ideas and suggestions for hobbies and interests.</p>' },
      { title: 'Life Style: Travel and leisure', excerpt: 'Tips for travel and leisure.', content: '<p>Tips and recommendations for travel and leisure.</p>' },
      { title: 'Life Style: Cultural events', excerpt: 'Cultural events and concerts.', content: '<p>Information about cultural events and concerts.</p>' },
      { title: 'Life Style: Personal development', excerpt: 'Tips for personal development.', content: '<p>Tips and recommendations for personal development.</p>' },
    ],
  },
  tehsil: {
    az: [
      { title: 'Təhsil: Təhsil sistemində yeniliklər', excerpt: 'Təhsil sistemində yeni yeniliklər.', content: '<p>Təhsil sistemində yeni yeniliklər və dəyişikliklər.</p>' },
      { title: 'Təhsil: Universitet təhsili', excerpt: 'Universitet təhsilində yeni imkanlar.', content: '<p>Universitet təhsilində yeni imkanlar və proqramlar.</p>' },
      { title: 'Təhsil: Məktəb təhsili', excerpt: 'Məktəb təhsilində yeni metodlar.', content: '<p>Məktəb təhsilində yeni metodlar və yanaşmalar.</p>' },
      { title: 'Təhsil: Peşə təhsili', excerpt: 'Peşə təhsilinin inkişafı.', content: '<p>Peşə təhsilinin inkişafı və perspektivlər.</p>' },
      { title: 'Təhsil: Onlayn təhsil', excerpt: 'Onlayn təhsil platformaları.', content: '<p>Onlayn təhsil platformaları və imkanları.</p>' },
      { title: 'Təhsil: Təhsil texnologiyaları', excerpt: 'Təhsil texnologiyalarında yeniliklər.', content: '<p>Təhsil texnologiyalarında yeniliklər və tətbiqləri.</p>' },
      { title: 'Təhsil: Tələbə hüquqları', excerpt: 'Tələbə hüquqları və imtiyazları.', content: '<p>Tələbə hüquqları və imtiyazları haqqında məlumat.</p>' },
      { title: 'Təhsil: Təhsil tədbirləri', excerpt: 'Təhsil tədbirləri və konfranslar.', content: '<p>Təhsil tədbirləri və konfranslar haqqında məlumat.</p>' },
      { title: 'Təhsil: Təhsil layihələri', excerpt: 'Yeni təhsil layihələri.', content: '<p>Yeni təhsil layihələri və proqramları.</p>' },
      { title: 'Təhsil: Təhsil mükafatları', excerpt: 'Təhsil mükafatları və təltifləri.', content: '<p>Təhsil mükafatları və təltifləri haqqında məlumat.</p>' },
    ],
    en: [
      { title: 'Education: Education system innovations', excerpt: 'New innovations in education system.', content: '<p>New innovations and changes in education system.</p>' },
      { title: 'Education: University education', excerpt: 'New opportunities in university education.', content: '<p>New opportunities and programs in university education.</p>' },
      { title: 'Education: School education', excerpt: 'New methods in school education.', content: '<p>New methods and approaches in school education.</p>' },
      { title: 'Education: Vocational education', excerpt: 'Development of vocational education.', content: '<p>Development and prospects of vocational education.</p>' },
      { title: 'Education: Online education', excerpt: 'Online education platforms.', content: '<p>Online education platforms and opportunities.</p>' },
      { title: 'Education: Education technologies', excerpt: 'Innovations in education technologies.', content: '<p>Innovations and applications in education technologies.</p>' },
      { title: 'Education: Student rights', excerpt: 'Student rights and privileges.', content: '<p>Information about student rights and privileges.</p>' },
      { title: 'Education: Education events', excerpt: 'Education events and conferences.', content: '<p>Information about education events and conferences.</p>' },
      { title: 'Education: Education projects', excerpt: 'New education projects.', content: '<p>New education projects and programs.</p>' },
      { title: 'Education: Education awards', excerpt: 'Education awards and honors.', content: '<p>Information about education awards and honors.</p>' },
    ],
  },
  seyahet: {
    az: [
      { title: 'Səyahət: Turizm destinasiyaları', excerpt: 'Yeni turizm destinasiyaları və görməli yerlər.', content: '<p>Yeni turizm destinasiyaları və görməli yerlər haqqında məlumat.</p>' },
      { title: 'Səyahət: Səyahət məsləhətləri', excerpt: 'Səyahət üçün faydalı məsləhətlər.', content: '<p>Səyahət üçün faydalı məsləhətlər və tövsiyələr.</p>' },
      { title: 'Səyahət: Otel və yaşayış', excerpt: 'Otel və yaşayış seçimləri.', content: '<p>Otel və yaşayış seçimləri haqqında məlumat.</p>' },
      { title: 'Səyahət: Avia biletlər', excerpt: 'Avia biletlər və səyahət planlaşdırması.', content: '<p>Avia biletlər və səyahət planlaşdırması haqqında məlumat.</p>' },
      { title: 'Səyahət: Mədəni turizm', excerpt: 'Mədəni turizm və tarixi yerlər.', content: '<p>Mədəni turizm və tarixi yerlər haqqında məlumat.</p>' },
      { title: 'Səyahət: Təbiət turizmi', excerpt: 'Təbiət turizmi və gözəl mənzərələr.', content: '<p>Təbiət turizmi və gözəl mənzərələr haqqında məlumat.</p>' },
      { title: 'Səyahət: Səyahət sənədləri', excerpt: 'Səyahət sənədləri və viza məsələləri.', content: '<p>Səyahət sənədləri və viza məsələləri haqqında məlumat.</p>' },
      { title: 'Səyahət: Səyahət sığortası', excerpt: 'Səyahət sığortası və təhlükəsizlik.', content: '<p>Səyahət sığortası və təhlükəsizlik haqqında məlumat.</p>' },
      { title: 'Səyahət: Səyahət büdcəsi', excerpt: 'Səyahət büdcəsi planlaşdırması.', content: '<p>Səyahət büdcəsi planlaşdırması və tövsiyələri.</p>' },
      { title: 'Səyahət: Səyahət təcrübələri', excerpt: 'Səyahət təcrübələri və hekayələri.', content: '<p>Səyahət təcrübələri və hekayələri haqqında məlumat.</p>' },
    ],
    en: [
      { title: 'Travel: Tourism destinations', excerpt: 'New tourism destinations and attractions.', content: '<p>Information about new tourism destinations and attractions.</p>' },
      { title: 'Travel: Travel tips', excerpt: 'Useful tips for travel.', content: '<p>Useful tips and recommendations for travel.</p>' },
      { title: 'Travel: Hotels and accommodation', excerpt: 'Hotel and accommodation options.', content: '<p>Information about hotel and accommodation options.</p>' },
      { title: 'Travel: Air tickets', excerpt: 'Air tickets and travel planning.', content: '<p>Information about air tickets and travel planning.</p>' },
      { title: 'Travel: Cultural tourism', excerpt: 'Cultural tourism and historical places.', content: '<p>Information about cultural tourism and historical places.</p>' },
      { title: 'Travel: Nature tourism', excerpt: 'Nature tourism and beautiful landscapes.', content: '<p>Information about nature tourism and beautiful landscapes.</p>' },
      { title: 'Travel: Travel documents', excerpt: 'Travel documents and visa issues.', content: '<p>Information about travel documents and visa issues.</p>' },
      { title: 'Travel: Travel insurance', excerpt: 'Travel insurance and safety.', content: '<p>Information about travel insurance and safety.</p>' },
      { title: 'Travel: Travel budget', excerpt: 'Travel budget planning.', content: '<p>Travel budget planning and recommendations.</p>' },
      { title: 'Travel: Travel experiences', excerpt: 'Travel experiences and stories.', content: '<p>Information about travel experiences and stories.</p>' },
    ],
  },
  idman: {
    az: [
      { title: 'İdman: Futbol xəbərləri', excerpt: 'Futbol dünyasında son xəbərlər.', content: '<p>Futbol dünyasında son xəbərlər və hadisələr.</p>' },
      { title: 'İdman: Olimpiya oyunları', excerpt: 'Olimpiya oyunlarına hazırlıq.', content: '<p>Olimpiya oyunlarına hazırlıq və proqramlar.</p>' },
      { title: 'İdman: Basketbol çempionatı', excerpt: 'Basketbol çempionatında yeni uğurlar.', content: '<p>Basketbol çempionatında yeni uğurlar və nəticələr.</p>' },
      { title: 'İdman: Tennis turnirləri', excerpt: 'Tennis turnirlərində yeni rekordlar.', content: '<p>Tennis turnirlərində yeni rekordlar və nailiyyətlər.</p>' },
      { title: 'İdman: Üzgüçülük yarışları', excerpt: 'Üzgüçülük yarışlarında yeni uğurlar.', content: '<p>Üzgüçülük yarışlarında yeni uğurlar və rekordlar.</p>' },
      { title: 'İdman: Atletika yarışları', excerpt: 'Atletika yarışlarında yeni nəticələr.', content: '<p>Atletika yarışlarında yeni nəticələr və uğurlar.</p>' },
      { title: 'İdman: Boks çempionatı', excerpt: 'Boks çempionatında yeni qaliblər.', content: '<p>Boks çempionatında yeni qaliblər və hadisələr.</p>' },
      { title: 'İdman: Cüdo yarışları', excerpt: 'Cüdo yarışlarında yeni uğurlar.', content: '<p>Cüdo yarışlarında yeni uğurlar və nailiyyətlər.</p>' },
      { title: 'İdman: Gimnastika yarışları', excerpt: 'Gimnastika yarışlarında yeni rekordlar.', content: '<p>Gimnastika yarışlarında yeni rekordlar və uğurlar.</p>' },
      { title: 'İdman: Voleybol komandaları', excerpt: 'Voleybol komandalarının uğurları.', content: '<p>Voleybol komandalarının uğurları və nəticələri.</p>' },
    ],
    en: [
      { title: 'Sports: Football news', excerpt: 'Latest news in football world.', content: '<p>Latest news and events in football world.</p>' },
      { title: 'Sports: Olympic Games', excerpt: 'Preparation for Olympic Games.', content: '<p>Preparation and programs for Olympic Games.</p>' },
      { title: 'Sports: Basketball championship', excerpt: 'New achievements in basketball championship.', content: '<p>New achievements and results in basketball championship.</p>' },
      { title: 'Sports: Tennis tournaments', excerpt: 'New records in tennis tournaments.', content: '<p>New records and achievements in tennis tournaments.</p>' },
      { title: 'Sports: Swimming competitions', excerpt: 'New achievements in swimming competitions.', content: '<p>New achievements and records in swimming competitions.</p>' },
      { title: 'Sports: Athletics competitions', excerpt: 'New results in athletics competitions.', content: '<p>New results and achievements in athletics competitions.</p>' },
      { title: 'Sports: Boxing championship', excerpt: 'New winners in boxing championship.', content: '<p>New winners and events in boxing championship.</p>' },
      { title: 'Sports: Judo competitions', excerpt: 'New achievements in judo competitions.', content: '<p>New achievements and successes in judo competitions.</p>' },
      { title: 'Sports: Gymnastics competitions', excerpt: 'New records in gymnastics competitions.', content: '<p>New records and achievements in gymnastics competitions.</p>' },
      { title: 'Sports: Volleyball teams', excerpt: 'Achievements of volleyball teams.', content: '<p>Achievements and results of volleyball teams.</p>' },
    ],
  },
  multimedia: {
    az: [
      { title: 'Multimedia: Film xəbərləri', excerpt: 'Kino dünyasında son xəbərlər.', content: '<p>Kino dünyasında son xəbərlər və hadisələr.</p>' },
      { title: 'Multimedia: Musiqi konsertləri', excerpt: 'Yaxınlaşan musiqi konsertləri.', content: '<p>Yaxınlaşan musiqi konsertləri və tədbirlər.</p>' },
      { title: 'Multimedia: Teatr tamaşaları', excerpt: 'Yeni teatr tamaşaları və proqramlar.', content: '<p>Yeni teatr tamaşaları və proqramlar haqqında məlumat.</p>' },
      { title: 'Multimedia: Sənət sərgiləri', excerpt: 'Sənət sərgiləri və ekspozisiyalar.', content: '<p>Sənət sərgiləri və ekspozisiyalar haqqında məlumat.</p>' },
      { title: 'Multimedia: Fotoqrafiya', excerpt: 'Fotoqrafiya sənətində yeniliklər.', content: '<p>Fotoqrafiya sənətində yeniliklər və təcrübələr.</p>' },
      { title: 'Multimedia: Video istehsalı', excerpt: 'Video istehsalında yeni texnologiyalar.', content: '<p>Video istehsalında yeni texnologiyalar və üsullar.</p>' },
      { title: 'Multimedia: Animasiya', excerpt: 'Animasiya sənətində yeniliklər.', content: '<p>Animasiya sənətində yeniliklər və təcrübələr.</p>' },
      { title: 'Multimedia: Rəqəmsal sənət', excerpt: 'Rəqəmsal sənətdə yeni trendlər.', content: '<p>Rəqəmsal sənətdə yeni trendlər və innovasiyalar.</p>' },
      { title: 'Multimedia: Media texnologiyaları', excerpt: 'Media texnologiyalarında yeniliklər.', content: '<p>Media texnologiyalarında yeniliklər və tətbiqləri.</p>' },
      { title: 'Multimedia: Streaming platformaları', excerpt: 'Streaming platformalarında yeni məzmun.', content: '<p>Streaming platformalarında yeni məzmun və proqramlar.</p>' },
    ],
    en: [
      { title: 'Multimedia: Film news', excerpt: 'Latest news in cinema world.', content: '<p>Latest news and events in cinema world.</p>' },
      { title: 'Multimedia: Music concerts', excerpt: 'Upcoming music concerts.', content: '<p>Upcoming music concerts and events.</p>' },
      { title: 'Multimedia: Theater performances', excerpt: 'New theater performances and programs.', content: '<p>Information about new theater performances and programs.</p>' },
      { title: 'Multimedia: Art exhibitions', excerpt: 'Art exhibitions and expositions.', content: '<p>Information about art exhibitions and expositions.</p>' },
      { title: 'Multimedia: Photography', excerpt: 'Innovations in photography art.', content: '<p>Innovations and experiences in photography art.</p>' },
      { title: 'Multimedia: Video production', excerpt: 'New technologies in video production.', content: '<p>New technologies and methods in video production.</p>' },
      { title: 'Multimedia: Animation', excerpt: 'Innovations in animation art.', content: '<p>Innovations and experiences in animation art.</p>' },
      { title: 'Multimedia: Digital art', excerpt: 'New trends in digital art.', content: '<p>New trends and innovations in digital art.</p>' },
      { title: 'Multimedia: Media technologies', excerpt: 'Innovations in media technologies.', content: '<p>Innovations and applications in media technologies.</p>' },
      { title: 'Multimedia: Streaming platforms', excerpt: 'New content on streaming platforms.', content: '<p>New content and programs on streaming platforms.</p>' },
    ],
  },
};

async function main() {
  console.log('Bütün kateqoriyalara xəbərlər əlavə edilir...\n');

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

  // Bütün kateqoriyaları tap
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  console.log(`✓ ${categories.length} kateqoriya tapıldı\n`);

  for (const category of categories) {
    const categorySlug = category.slug;
    const categoryArticles = articlesByCategory[categorySlug as keyof typeof articlesByCategory];

    if (!categoryArticles) {
      console.log(`⊘ ${categorySlug} bölməsi üçün xəbər məlumatları tapılmadı`);
      continue;
    }

    const categoryName = category.translations.find((t) => t.locale === 'az')?.name || categorySlug;
    console.log(`${categoryName} bölməsi üçün xəbərlər əlavə edilir...`);

    const articlesToCreate = Math.min(categoryArticles.az.length, 10);

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
          images: {
            create: [
              {
                url: defaultImageUrl,
                alt: azArticle.title,
                caption: null,
                order: 0,
                isPrimary: true,
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




