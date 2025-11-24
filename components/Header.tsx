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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Search açılanda input-a focus et
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Search funksiyası
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&locale=${locale}`);
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, locale]);

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
              <SelectTrigger className="w-auto min-w-[70px] h-9 rounded-none border-none px-2 gap-1 !justify-start focus:ring-0 focus:ring-offset-0" style={{ border: 'none' }}>
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
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden flex-col gap-3">
          {/* Top row: Logo */}
          <div className="flex justify-center">
            <Link href={`/${locale}`} className="flex justify-center">
              <div
                className="font-bold text-center"
                style={{ fontFamily: 'Chomsky, serif', fontSize: '3rem' }}
              >
                Daily Baku
              </div>
            </Link>
          </div>

          {/* Bottom row: Burger (left), Theme toggle (after burger), Language selector (before search), Search (right) */}
          <div className="flex items-center gap-2 relative">
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
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => setDarkMode(!darkMode)}>
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
                className="absolute right-0 top-0 overflow-hidden z-50"
                style={{
                  animation: 'slideInFromRight 0.3s ease-out',
                  width: '12rem'
                }}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Axtarış..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-gray-200"
                  onBlur={() => {
                    setTimeout(() => {
                      if (searchResults.length === 0) {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }
                    }, 200);
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/${locale}/article/${result.slug}`}
                        className="block p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className="font-medium text-sm">{result.title}</div>
                        {result.excerpt && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{result.excerpt}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dil:</span>
                <Select value={locale} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-auto min-w-[70px] h-9 rounded-none border-none px-2 gap-1 !justify-start focus:ring-0 focus:ring-offset-0" style={{ border: 'none' }}>
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
        <nav className="hidden md:flex items-center justify-center gap-6 text-sm font-medium mt-4 relative">
          <div className="flex items-center gap-6 flex-1 justify-center">
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
          </div>
          <div className="flex items-center gap-2 relative">
            {searchOpen && (
              <div 
                className="absolute right-0 top-0 overflow-hidden z-50"
                style={{
                  animation: 'slideInFromRight 0.3s ease-out',
                  width: '12rem'
                }}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Axtarış..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-gray-200"
                  onBlur={() => {
                    setTimeout(() => {
                      if (searchResults.length === 0) {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }
                    }, 200);
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/${locale}/article/${result.slug}`}
                        className="block p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className="font-medium text-sm">{result.title}</div>
                        {result.excerpt && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{result.excerpt}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
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

    </header>
  );
}
