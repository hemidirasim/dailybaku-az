'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface ArticleSearchProps {
  locale: 'az' | 'en';
  categories: Array<{ id: string; name: string; slug: string }>;
}

export default function ArticleSearch({ locale, categories }: ArticleSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setCategoryId(searchParams.get('category') || 'all');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (categoryId && categoryId !== 'all') {
      params.set('category', categoryId);
    }
    router.push(`/dashboard/articles/${locale}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setCategoryId('all');
    router.push(`/dashboard/articles/${locale}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={locale === 'az' ? 'Başlığa görə axtar...' : 'Search by title...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder={locale === 'az' ? 'Bütün kateqoriyalar' : 'All categories'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{locale === 'az' ? 'Bütün kateqoriyalar' : 'All categories'}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-shrink-0">
            <Search className="h-4 w-4 mr-2" />
            {locale === 'az' ? 'Axtar' : 'Search'}
          </Button>
          {(searchQuery || (categoryId && categoryId !== 'all')) && (
            <Button variant="outline" onClick={handleClear} className="flex-shrink-0">
              <X className="h-4 w-4 mr-2" />
              {locale === 'az' ? 'Təmizlə' : 'Clear'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

