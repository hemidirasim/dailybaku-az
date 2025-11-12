# Xəbər Saytı - Quraşdırma Təlimatları

Bu layihə Next.js və Supabase ilə hazırlanmış müasir bir xəbər portalıdır.

## Tələblər

- Node.js 18+
- Supabase hesabı

## Quraşdırma Addımları

### 1. Asılılıqları Quraşdırın

```bash
npm install
```

### 2. Supabase Konfiqurasiyası

Supabase layihə məlumatlarınızı əlavə edin. `.env.local` faylında:

```
NEXT_PUBLIC_SUPABASE_URL=https://sizin-layihe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sizin-anon-key
```

### 3. Məlumat Bazası Strukturu

Məlumat bazası strukturu artıq yaradılıb və aşağıdakı cədvəlləri ehtiva edir:

- **categories**: Xəbər kateqoriyaları (Culture, Europe, Politic, Sport)
- **articles**: Xəbər məqalələri

### 4. Layihəni İşə Salın

Development rejimi:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Xüsusiyyətlər

- 📰 Müasir xəbər saytı dizaynı
- 🎨 Responsive dizayn (mobil, tablet, desktop)
- 🗂️ Kateqoriya əsaslı struktur
- 🔍 Axtarış funksiyası
- 📊 Görüntüləmə statistikası
- 🌙 Tünd/İşıqlı mövzu dəstəyi
- ⚡ Server-side rendering (SSR)
- 🔐 Supabase ilə təhlükəsiz məlumat idarəetməsi

## Struktur

```
app/
├── page.tsx                 # Ana səhifə
├── article/[slug]/page.tsx  # Xəbər detalları
├── category/[slug]/page.tsx # Kateqoriya səhifəsi
└── layout.tsx               # Layout komponenti

components/
├── Header.tsx               # Başlıq komponenti
├── ArticleCard.tsx          # Xəbər kartı
└── Sidebar.tsx             # Yan panel

lib/
└── supabase.ts             # Supabase client

```

## İstifadə

### Yeni Xəbər Əlavə Etmək

Supabase Dashboard-dan:
1. `articles` cədvəlinə daxil olun
2. "Insert row" düyməsini klikləyin
3. Məlumatları doldurun və qeyd edin

### Kateqoriya Əlavə Etmək

`categories` cədvəlinə yeni sətir əlavə edin:
- name: Kateqoriya adı
- slug: URL-də istifadə olunacaq ad (kiçik hərflərlə)

## Texnologiyalar

- **Next.js 13+** - React framework
- **Supabase** - Backend və məlumat bazası
- **TypeScript** - Tip təhlükəsizliyi
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI komponentləri
- **Lucide React** - İkonlar
- **date-fns** - Tarix formatlaşdırması