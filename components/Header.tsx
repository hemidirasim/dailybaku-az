'use client';

import { Search, Moon, Sun, X, Menu, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  // Dark mode-u HTML elementinə tətbiq et
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // LocalStorage-dan dark mode-u yüklə
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Sistem preferansını yoxla
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Dark mode dəyişdikdə localStorage-a yadda saxla
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  // Life Style kateqoriyası üçün "LİFE" sözündəki "İ" hərfini "I" ilə əvəz et
  const formatMenuTitle = (title: string) => {
    // Life Style kateqoriyasını müəyyən et (hər hansı bir variantda)
    // "LİFE" və ya "LIFE" sözünü axtar
    const hasLife = /LİFE|LIFE/i.test(title);
    
    if (hasLife) {
      // Yalnız "LİFE" sözündəki "İ" hərfini "I" ilə əvəz et, digər "İ" hərfləri qalsın
      // Regex ilə "LİFE" sözünü tap və "LIFE" ilə əvəz et (case-insensitive)
      return title.replace(/LİFE/gi, 'LIFE');
    }
    return title;
  };

  // Search açılanda input-a focus et
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Enter basıldıqda search səhifəsinə keçid
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      e.preventDefault();
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
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
              className="font-bold text-center dark:font-normal"
              style={{ fontFamily: 'Chomsky, serif', fontSize: '3.67rem' }}
            >
              The Daily Baku
              {locale === 'en' && (
                <div className="text-sm font-normal uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  INTERNATIONAL
                </div>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-auto min-w-[70px] h-9 rounded-none border-none px-2 gap-1 !justify-start focus:ring-0 focus:ring-offset-0" style={{ border: 'none' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="az">AZ</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden flex-col gap-3">
          {/* Top row: Logo */}
          <div className="flex justify-center">
            <Link href={`/${locale}`} className="flex justify-center">
              <div
                className="font-bold text-center dark:font-normal"
                style={{ fontFamily: 'Chomsky, serif', fontSize: '3rem' }}
              >
                The Daily Baku
                {locale === 'en' && (
                  <div className="text-sm font-normal uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    INTERNATIONAL
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
      </header>

      {/* Mobile Sticky Controls - Outside header */}
      <div className="md:hidden sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          {/* Bottom row: Burger (left), Theme toggle (after burger), Language selector (before search), Search (right) */}
          <div className="flex items-center gap-2 relative py-2">
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
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1"></div>
            {!searchOpen && (
              <Select value={locale} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-auto min-w-[60px] h-8 text-xs flex-shrink-0 rounded-none border-none px-1 gap-1 !justify-start focus:ring-0 focus:ring-offset-0" style={{ border: 'none' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="az">AZ</SelectItem>
                </SelectContent>
              </Select>
            )}
            {searchOpen ? (
              <div 
                className="absolute right-0 top-0 overflow-hidden z-50 md:hidden"
                style={{
                  animation: 'slideInFromRight 0.3s ease-out',
                  width: '8rem'
                }}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={locale === 'az' ? 'Axtarış...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="bg-muted border-border"
                  onBlur={() => {
                    setTimeout(() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }, 200);
                  }}
                />
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              <Link href={`/${locale}`} className="text-sm font-medium hover:text-primary transition-colors">
                {locale === 'az' ? 'Ana Səhifə' : 'Home'}
              </Link>
            </div>
            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-3 mt-4 pt-4 border-t border-border" lang={locale}>
            {menus.length > 0 ? (
              menus.map((menu) => (
                <Link
                  key={menu.id}
                  href={menu.url}
                  className="hover:text-primary transition-colors capitalize text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {formatMenuTitle(menu.title)}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href={`/${locale}`}
                  className="hover:text-primary transition-colors capitalize text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {locale === 'az' ? 'Ana Səhifə' : 'Home'}
                </Link>
                <Link
                  href={`/${locale}/category/gundem`}
                  className="hover:text-primary transition-colors capitalize text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {locale === 'az' ? 'Gündəm' : 'Agenda'}
                </Link>
              </>
            )}
          </nav>
          </div>
        </div>
      )}

      {/* Desktop Navigation - Sticky */}
      <nav
        className="hidden md:flex items-center justify-center gap-6 text-base font-medium sticky top-0 z-50 bg-background border-b border-border py-2"
        lang={locale}
      >
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1 justify-center">
            {menus.length > 0 ? (
              menus.map((menu) => (
                <Link
                  key={menu.id}
                  href={menu.url}
                  className="hover:text-primary transition-colors capitalize whitespace-nowrap"
                >
                  {formatMenuTitle(menu.title)}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href={`/${locale}`}
                  className="hover:text-primary transition-colors capitalize whitespace-nowrap"
                >
                  {locale === 'az' ? 'Ana Səhifə' : 'Home'}
                </Link>
                <Link
                  href={`/${locale}/category/gundem`}
                  className="hover:text-primary transition-colors capitalize whitespace-nowrap"
                >
                  {locale === 'az' ? 'Gündəm' : 'Agenda'}
                </Link>
              </>
            )}
          </div>
          <div className="relative flex items-center w-9 h-9 flex-shrink-0">
            {searchOpen ? (
              <div 
                className="absolute right-0 top-0 z-50"
                style={{
                  animation: 'slideInFromLeft 0.3s ease-out',
                  width: '12rem'
                }}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={locale === 'az' ? 'Axtarış...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="bg-muted border-border h-9"
                  onBlur={() => {
                    setTimeout(() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }, 200);
                  }}
                />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 flex-shrink-0" 
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
