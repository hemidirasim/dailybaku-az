'use client';

import { Menu, Home, Search, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="bg-black text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-bold whitespace-nowrap flex items-center gap-2">
            <span className="bg-white text-black px-2 py-1 text-xs">LATEST</span>
          </span>
          <div className="flex items-center gap-6 text-sm">
            <span className="whitespace-nowrap">His nudged jeepers ded sesulky oite ten around...</span>
            <span className="text-gray-400">|</span>
            <span className="whitespace-nowrap">Timmediately quail was inverse much so remade dimly...</span>
            <span className="text-gray-400">|</span>
            <span className="whitespace-nowrap">Unanimous haltered loud one trod trigly style four</span>
          </div>
        </div>
      </div>

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
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="mt-4 flex items-center justify-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            HOME
          </Link>
          <Link
            href="/category/culture"
            className="hover:text-primary transition-colors"
          >
            CATEGORY LAYOUTS
          </Link>
          <Link href="/tags" className="hover:text-primary transition-colors">
            TAGS LAYOUT
          </Link>
          <Link href="/posts" className="hover:text-primary transition-colors">
            POST STYLES
          </Link>
          <Link href="/module" className="hover:text-primary transition-colors">
            MODULE
          </Link>
          <Link href="/cpt" className="hover:text-primary transition-colors">
            CPT
          </Link>
          <Link href="/404" className="hover:text-primary transition-colors">
            404
          </Link>
        </nav>
      </div>
    </header>
  );
}