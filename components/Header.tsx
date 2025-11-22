'use client';

import { Search, Moon, Sun, X, Menu, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
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
import SearchModal from '@/components/SearchModal';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  children?: MenuItem[];
}

export default function Header({
  headerNews,
  menus = [],
  locale: propLocale = 'en',
}: {
  headerNews: React.ReactNode;
  menus?: MenuItem[];
  locale?: string;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Pathname-dən locale-i təyin et
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale =
    segments[0] === 'az' || segments[0] === 'en' ? segments[0] : propLocale;
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
    <header className="bg-background border-b">
      {headerNews}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <Link href={`/${locale}`} className="flex-shrink-0">
            <div
              className="font-bold text-center"
              style={{ fontFamily: 'Chomsky, serif', fontSize: '3.67rem' }}
            >
              Daily Baku
            </div>
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
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSearchModalOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex-shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          <Link href={`/${locale}`} className="flex-1 flex justify-center">
            <div
              className="font-bold text-center"
              style={{ fontFamily: 'Chomsky, serif', fontSize: '2rem' }}
            >
              Daily Baku
            </div>
          </Link>

          <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setSearchModalOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dil:</span>
                <Select value={locale} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[100px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="az">AZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tema:</span>
                <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm font-medium">Sosial şəbəkələr:</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                    <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                    <Link href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                    <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                    <Link href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Link href={`/${locale}`} className="text-sm font-medium hover:text-primary transition-colors">
                Ana Səhifə
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center gap-6 text-sm font-medium mt-4">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <Link
                key={menu.id}
                href={menu.url}
                className="hover:text-primary transition-colors uppercase whitespace-nowrap"
              >
                {menu.title}
              </Link>
            ))
          ) : (
            <>
              <Link
                href={`/${locale}`}
                className="hover:text-primary transition-colors uppercase whitespace-nowrap"
              >
                Ana Səhifə
              </Link>
              <Link
                href={`/${locale}/category/gundem`}
                className="hover:text-primary transition-colors uppercase whitespace-nowrap"
              >
                Gündəm
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col gap-3 mt-4 pb-4 border-t pt-4">
            {menus.length > 0 ? (
              menus.map((menu) => (
                <Link
                  key={menu.id}
                  href={menu.url}
                  className="hover:text-primary transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menu.title}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href={`/${locale}`}
                  className="hover:text-primary transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ana Səhifə
                </Link>
                <Link
                  href={`/${locale}/category/gundem`}
                  className="hover:text-primary transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Gündəm
                </Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} locale={locale} />
    </header>
  );
}
