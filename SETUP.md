# Xəbər Saytı - Quraşdırma Təlimatları

Bu layihə Next.js və PostgreSQL (Prisma ORM) ilə hazırlanmış müasir bir xəbər portalıdır.

## Tələblər

- Node.js 18+
- PostgreSQL verilənlər bazası

## Quraşdırma Addımları

### 1. Asılılıqları Quraşdırın

```bash
npm install
```

### 2. Database Konfiqurasiyası

PostgreSQL verilənlər bazası connection string-ini əlavə edin. `.env.local` faylında:

```
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
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
- 🔐 Prisma ORM ilə təhlükəsiz məlumat idarəetməsi

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
└── prisma.ts               # Prisma client

```

## İstifadə

### Yeni Xəbər Əlavə Etmək

Admin panelindən:
1. `/dashboard` səhifəsinə daxil olun
2. "Yeni Xəbər" düyməsini klikləyin
3. Məlumatları doldurun və qeyd edin

### Kateqoriya Əlavə Etmək

`categories` cədvəlinə yeni sətir əlavə edin:
- name: Kateqoriya adı
- slug: URL-də istifadə olunacaq ad (kiçik hərflərlə)

## Texnologiyalar

- **Next.js 13+** - React framework
- **PostgreSQL** - Verilənlər bazası
- **Prisma** - ORM (Object-Relational Mapping)
- **TypeScript** - Tip təhlükəsizliyi
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI komponentləri
- **Lucide React** - İkonlar
- **date-fns** - Tarix formatlaşdırması