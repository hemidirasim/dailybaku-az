import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Slug generation function with Azerbaijani character mapping
export function generateSlug(text: string): string {
  // Azerbaijani character mappings
  const charMap: { [key: string]: string } = {
    'ə': 'e',
    'ü': 'u',
    'ı': 'i',
    'ğ': 'g',
    'ş': 's',
    'ç': 'c',
    'ö': 'o',
    'Ə': 'E',
    'Ü': 'U',
    'I': 'I',
    'İ': 'I',
    'Ğ': 'G',
    'Ş': 'S',
    'Ç': 'C',
    'Ö': 'O',
  };

  return text
    .split('')
    .map((char) => charMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
