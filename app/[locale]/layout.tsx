import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import HeaderNews from '@/components/HeaderNews';
import TopArticles from '@/components/TopArticles';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';

const locales = ['az', 'en'];

async function getMenus(locale: string, location: 'header' | 'footer' = 'header') {
  const whereClause: any = {
    isActive: true,
    parentId: null, // Yalnız ana menular
  };

  if (location === 'header') {
    whereClause.showInHeader = true;
  } else {
    whereClause.showInFooter = true;
  }

  const childrenWhereClause: any = {
    isActive: true,
  };

  if (location === 'header') {
    childrenWhereClause.showInHeader = true;
  } else {
    childrenWhereClause.showInFooter = true;
  }

  const menus = await prisma.menu.findMany({
    where: whereClause,
    include: {
      translations: true,
      children: {
        where: childrenWhereClause,
        include: {
          translations: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Fetch categories and pages for URL generation
  const [categories, pages] = await Promise.all([
    prisma.category.findMany({
      include: { translations: true },
    }),
    prisma.page.findMany({
      include: { translations: true },
    }),
  ]);

  return menus.map((menu: typeof menus[0]) => {
    const translation = menu.translations.find((t: { locale: string }) => t.locale === locale);
    
    // Generate URL based on menu type
    let menuUrl = translation?.url || '#';
    if (menu.type === 'category' && menu.targetId) {
      const category = categories.find((c: { id: string }) => c.id === menu.targetId);
      if (category) {
        menuUrl = `/${locale}/category/${category.slug}`;
      }
    } else if (menu.type === 'page' && menu.targetId) {
      const page = pages.find((p: { id: string }) => p.id === menu.targetId);
      if (page) {
        const pageTranslation = page.translations.find((t: { locale: string }) => t.locale === locale);
        if (pageTranslation) {
          menuUrl = `/${locale}/page/${pageTranslation.slug}`;
        }
      }
    }

    const children = menu.children.map((child: typeof menu.children[0]) => {
      const childTranslation = child.translations.find((t: { locale: string }) => t.locale === locale);
      
      // Generate URL for child menu
      let childUrl = childTranslation?.url || '#';
      if (child.type === 'category' && child.targetId) {
        const category = categories.find((c: { id: string }) => c.id === child.targetId);
        if (category) {
          childUrl = `/${locale}/category/${category.slug}`;
        }
      } else if (child.type === 'page' && child.targetId) {
        const page = pages.find((p: { id: string }) => p.id === menu.targetId);
        if (page) {
          const pageTranslation = page.translations.find((t: { locale: string }) => t.locale === locale);
          if (pageTranslation) {
            childUrl = `/${locale}/page/${pageTranslation.slug}`;
          }
        }
      }
      
      return {
        id: child.id,
        title: childTranslation?.title || '',
        url: childUrl,
      };
    });

    return {
      id: menu.id,
      title: translation?.title || '',
      url: menuUrl,
      children: children.length > 0 ? children : undefined,
    };
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  const [headerMenus, footerMenus] = await Promise.all([
    getMenus(locale, 'header'),
    getMenus(locale, 'footer'),
  ]);

  return (
    <>
      <Header 
        headerNews={<HeaderNews />} 
        menus={headerMenus}
        locale={locale}
      />
      <TopArticles />
      {children}
      <Footer menus={footerMenus} locale={locale} />
    </>
  );
}
