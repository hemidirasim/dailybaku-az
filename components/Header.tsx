'use client';

import { Menu, Home, Search, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  children?: MenuItem[];
}

export default function Header({ 
  headerNews, 
  menus = [],
  locale: propLocale = 'en'
}: { 
  headerNews: React.ReactNode;
  menus?: MenuItem[];
  locale?: string;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Pathname-dən locale-i təyin et
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0] === 'az' || segments[0] === 'en' ? segments[0] : propLocale;
  const locale = currentLocale || 'en';

  const handleLanguageChange = (newLocale: string) => {
    // Cari path-dən locale-i çıxar və yeni locale ilə əvəz et
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'az' || pathSegments[0] === 'en') {
      pathSegments[0] = newLocale;
    } else {
      pathSegments.unshift(newLocale);
    }
    const newPath = '/' + pathSegments.join('/');
    router.push(newPath);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      {headerNews}

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <div className="text-2xl font-serif font-bold">XƏBƏR</div>
          </Link>

          <div className="flex items-center gap-2">
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="az">AZ</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="mt-4 flex items-center justify-center gap-6 text-sm font-medium">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <Link
                key={menu.id}
                href={menu.url}
                className="hover:text-primary transition-colors uppercase"
              >
                {menu.title}
              </Link>
            ))
          ) : (
            <>
              <Link href={`/${locale}`} className="hover:text-primary transition-colors uppercase">
                Ana Səhifə
              </Link>
              <Link href={`/${locale}/category/gundem`} className="hover:text-primary transition-colors uppercase">
                Gündəm
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}