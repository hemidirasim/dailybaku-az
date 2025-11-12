import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  category_id: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  views: number;
  categories?: Category;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};