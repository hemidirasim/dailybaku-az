# Admin Panel Quraşdırma Təlimatları

## Tələblər

- Node.js 18+
- PostgreSQL veritabanı

## Quraşdırma Addımları

### 1. Environment Dəyişənləri

`.env` faylı yaradın və aşağıdakı dəyişənləri əlavə edin:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dailybaku?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

```

`NEXTAUTH_SECRET` üçün təsadüfi bir string istifadə edin:
```bash
openssl rand -base64 32
```

### 2. Veritabanı Migration

`.env` faylında `DATABASE_URL` təyin edildikdən sonra:

```bash
npm run db:migrate
```

Və ya manual olaraq migration faylını işlədin:
```bash
# PostgreSQL-də migration faylını işlədin
psql -d your_database -f prisma/migrations/0_init/migration.sql
```

Bu komanda:
- Prisma şemasını veritabanına tətbiq edir
- Bütün cədvəlləri yaradır

### 3. Admin İstifadəçi Yaradın

```bash
npm run create-admin
```

Və ya xüsusi email/şifrə ilə:
```bash
npm run create-admin admin@example.com mypassword "Admin Name"
```

Default:
- Email: `admin@dailybaku.com`
- Şifrə: `admin123`

### 4. Admin Paneline Giriş

1. Proyekti işə salın: `npm run dev`
2. Admin paneline daxil olun: `http://localhost:3000/admin/login`
3. Yuxarıdakı email və şifrə ilə giriş edin

## Admin Panel Xüsusiyyətləri

### ✅ Tamamlanan Xüsusiyyətlər

1. **Güclü Login Sistemi**
   - NextAuth.js ilə JWT-based authentication
   - Bcrypt ilə şifrə hash-ləmə
   - Role-based access control (admin)

2. **Kategoriler Yönetimi**
   - CRUD əməliyyatları
   - Çok dilli dəstək (AZ-EN)
   - Tab formatında dil keçidləri
   - Sıra və aktiv/passiv status

3. **Menüler Yönetimi**
   - CRUD əməliyyatları
   - Çok dilli dəstək (AZ-EN)
   - Hierarchical menu strukturu (ana menu/alt menu)
   - Tab formatında dil keçidləri

4. **Haberler Yönetimi**
   - CRUD əməliyyatları
   - Çok dilli dəstək (AZ-EN)
   - **Şəkil Qalereyası**: Çoxlu şəkil yükləmə
   - Primary şəkil seçimi
   - Şəkil sıralaması
   - Alt text əlavə etmə
   - Featured və published status
   - Kateqoriya əlaqələndirmə

5. **Resim Upload Sistemi**
   - Local file upload
   - `/public/uploads/` qovluğuna yüklənir
   - Unique filename generation

6. **Sol Sidebar Menü**
   - Dashboard
   - Xəbərlər
   - Kateqoriyalar
   - Menular
   - Media
   - Parametrlər

## Veritabanı Strukturu

### Cədvəllər

- **users**: Admin istifadəçilər
- **categories**: Xəbər kateqoriyaları
- **category_translations**: Kateqoriya çeviriləri (AZ/EN)
- **menus**: Menü strukturu
- **menu_translations**: Menü çeviriləri (AZ/EN)
- **articles**: Xəbər məqalələri
- **article_translations**: Xəbər çeviriləri (AZ/EN)
- **article_images**: Xəbər şəkilləri (gallery)

## İstifadə

### Yeni Xəbər Əlavə Etmək

1. `/admin/articles` səhifəsinə daxil olun
2. "Yeni Xəbər" düyməsini klikləyin
3. AZ və EN tab-larında məlumatları doldurun
4. Şəkillər bölməsində şəkillər yükləyin
5. Primary şəkil seçin
6. Kateqoriya və status seçin
7. "Yarat" düyməsini klikləyin

### Kateqoriya Əlavə Etmək

1. `/admin/categories` səhifəsinə daxil olun
2. "Yeni Kateqoriya" düyməsini klikləyin
3. Slug daxil edin
4. AZ və EN tab-larında ad və təsvir doldurun
5. Sıra və status təyin edin
6. "Yarat" düyməsini klikləyin

### Menu Əlavə Etmək

1. `/admin/menus` səhifəsinə daxil olun
2. "Yeni Menu" düyməsini klikləyin
3. Ana menu seçin (istəyə görə)
4. AZ və EN tab-larında başlıq və URL doldurun
5. Sıra və status təyin edin
6. "Yarat" düyməsini klikləyin

## Təhlükəsizlik

- Bütün admin route-ları middleware ilə qorunur
- Yalnız `role: 'admin'` olan istifadəçilər giriş edə bilər
- Şifrələr bcrypt ilə hash-lənir
- JWT-based session idarəetməsi

## Növbəti Addımlar (İstəyə görə)

- [ ] Media library (şəkil idarəetməsi)
- [ ] Settings səhifəsi
- [ ] User management
- [ ] Analytics dashboard
- [x] Şəkil upload funksiyası (API route ilə)

