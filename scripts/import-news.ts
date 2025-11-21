import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
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

interface NewsItem {
  title: string;
  url: string;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  publishedAt?: Date;
  category?: string;
}

async function fetchNewsFromQafqazinfo(): Promise<NewsItem[]> {
  const newsItems: NewsItem[] = [];
  
  try {
    // Ana səhifəni fetch et
    const response = await axios.get('https://qafqazinfo.az/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Xəbər linklərini tap
    const newsLinks: Set<string> = new Set();
    
    // Xəbər başlıqları və linkləri tap
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      
      if (href && text && text.length > 10) {
        let fullUrl = '';
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('/')) {
          fullUrl = `https://qafqazinfo.az${href}`;
        }
        
        if (fullUrl && 
            fullUrl.includes('qafqazinfo.az') && 
            !fullUrl.includes('#') && 
            !fullUrl.includes('javascript:') &&
            !fullUrl.includes('/category/') &&
            !fullUrl.includes('/tag/') &&
            !fullUrl.includes('/author/') &&
            !fullUrl.includes('/page/') &&
            !fullUrl.includes('mailto:') &&
            !fullUrl.includes('tel:')) {
          newsLinks.add(fullUrl);
        }
      }
    });

    console.log(`Found ${newsLinks.size} potential news links`);

    // Hər bir xəbər səhifəsini fetch et
    const linksArray = Array.from(newsLinks);
    for (let i = 0; i < Math.min(linksArray.length, 30); i++) { // İlk 30 xəbəri götür
      const link = linksArray[i];
      try {
        console.log(`Fetching: ${link}`);
        
        const articleResponse = await axios.get(link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const $article = cheerio.load(articleResponse.data);
        
        // Başlıq - müxtəlif selector-lərlə
        let title = $article('h1').first().text().trim();
        if (!title || title.length < 10) {
          title = $article('.article-title, .post-title, .entry-title').first().text().trim();
        }
        if (!title || title.length < 10) {
          title = $article('title').text().trim().replace(' - Qafqazinfo.az', '').trim();
        }
        
        if (!title || title.length < 10) {
          console.log(`Skipping: No valid title found for ${link}`);
          continue;
        }

        // Məzmun - müxtəlif selector-lərlə
        let content = '';
        
        // Əvvəlcə article və ya content bölmələrini yoxla
        $article('article p, .article-content p, .content p, .post-content p, .entry-content p').each((_, el) => {
          const text = $article(el).text().trim();
          if (text.length > 30 && !text.includes('©') && !text.includes('Qafqazinfo')) {
            content += `<p>${text}</p>\n`;
          }
        });

        // Əgər məzmun tapılmadısa, bütün p tag-lərini yoxla
        if (content.length < 100) {
          $article('p').each((_, el) => {
            const text = $article(el).text().trim();
            if (text.length > 50 && 
                !text.includes('©') && 
                !text.includes('Qafqazinfo') &&
                !text.includes('Facebook') &&
                !text.includes('Twitter') &&
                !text.includes('Telegram')) {
              content += `<p>${text}</p>\n`;
            }
          });
        }

        // Əgər hələ də məzmun yoxdursa, başlığı məzmun kimi istifadə et
        if (content.length < 50) {
          content = `<p>${title}</p>`;
        }

        // Qısa məzmun (ilk 200 simvol)
        const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const excerpt = cleanContent.substring(0, 200).trim() + (cleanContent.length > 200 ? '...' : '');

        // Şəkil - müxtəlif yerlərdən
        let imageUrl = $article('article img, .article-image img, .post-image img, .entry-image img').first().attr('src') ||
                      $article('img').first().attr('src') ||
                      null;

        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = imageUrl.startsWith('/') ? `https://qafqazinfo.az${imageUrl}` : `https://qafqazinfo.az/${imageUrl}`;
        }

        // Tarix
        let publishedAt = new Date();
        const dateText = $article('.date, .published-date, time, .post-date').first().text().trim() ||
                        $article('[datetime]').first().attr('datetime');
        
        if (dateText) {
          const parsedDate = new Date(dateText);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate;
          }
        }

        if (title && content) {
          newsItems.push({
            title,
            url: link,
            excerpt,
            content: content || title,
            imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://qafqazinfo.az${imageUrl}`) : undefined,
            publishedAt,
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Error fetching ${link}:`, error.message);
        continue;
      }
    }
  } catch (error: any) {
    console.error('Error fetching news:', error.message);
  }

  return newsItems;
}

async function importNews() {
  try {
    console.log('Starting news import from qafqazinfo.az...');
    
    const newsItems = await fetchNewsFromQafqazinfo();
    console.log(`Found ${newsItems.length} news items`);

    // Default category yarat və ya tap
    let defaultCategory = await prisma.category.findFirst({
      where: {
        slug: 'xeberler'
      }
    });

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          slug: 'xeberler',
          order: 0,
          isActive: true,
          translations: {
            create: [
              { locale: 'az', name: 'Xəbərlər', description: 'Son xəbərlər' },
              { locale: 'en', name: 'News', description: 'Latest news' }
            ]
          }
        }
      });
    }

    let imported = 0;
    let skipped = 0;

    for (const item of newsItems) {
      try {
        // Slug yarat
        const slug = generateSlug(item.title);
        
        // Artıq mövcud olub olmadığını yoxla
        const existing = await prisma.articleTranslation.findFirst({
          where: {
            locale: 'az',
            slug: slug
          }
        });

        if (existing) {
          console.log(`Skipping duplicate: ${item.title}`);
          skipped++;
          continue;
        }

        // Xəbəri yarat
        const article = await prisma.article.create({
          data: {
            categoryId: defaultCategory.id,
            status: 'published',
            featured: false,
            publishedAt: item.publishedAt || new Date(),
            translations: {
              create: [
                {
                  locale: 'az',
                  title: item.title,
                  slug: slug,
                  excerpt: item.excerpt || null,
                  content: item.content || item.title,
                },
                {
                  locale: 'en',
                  title: item.title, // EN üçün eyni başlıq (tərcümə edilə bilər)
                  slug: `${slug}-en`,
                  excerpt: item.excerpt || null,
                  content: item.content || item.title,
                }
              ]
            },
            images: item.imageUrl ? {
              create: [{
                url: item.imageUrl,
                alt: item.title,
                caption: null,
                order: 0,
                isPrimary: true
              }]
            } : []
          }
        });

        console.log(`Imported: ${item.title}`);
        imported++;
      } catch (error: any) {
        console.error(`Error importing ${item.title}:`, error.message);
        skipped++;
      }
    }

    console.log(`\nImport completed!`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error: any) {
    console.error('Import error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importNews();

