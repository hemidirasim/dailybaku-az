'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { az, enUS } from 'date-fns/locale';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string | null;
  category: string;
  published_at: string | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

export default function SearchModal({ isOpen, onClose, locale = 'az' }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal açılanda input-a focus et
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESC düyməsi ilə bağla
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Real-time axtarış (debounce)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}&limit=10`);
        if (!response.ok) {
          throw new Error('Axtarış xətası');
        }
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, locale]);

  if (!isOpen) return null;

  const dateLocale = locale === 'az' ? az : enUS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl mt-20 mx-4 bg-white rounded-lg shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={locale === 'az' ? 'Axtarış...' : 'Search...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="text-center py-8 text-gray-500">
              {locale === 'az' ? 'Axtarış üçün ən azı 2 simvol yazın' : 'Type at least 2 characters to search'}
            </div>
          )}

          {!loading && hasSearched && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {locale === 'az' ? 'Nəticə tapılmadı' : 'No results found'}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/${locale}/article/${result.slug}`}
                  onClick={onClose}
                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex gap-3">
                    {result.image_url && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={result.image_url}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-red-600 uppercase">
                          {result.category}
                        </span>
                        {result.published_at && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(result.published_at), {
                              addSuffix: true,
                              locale: dateLocale,
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-black group-hover:text-red-600 transition-colors line-clamp-2">
                        {result.title}
                      </h3>
                      {result.excerpt && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {result.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
