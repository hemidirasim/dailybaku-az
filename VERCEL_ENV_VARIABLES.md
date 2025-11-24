# Vercel Environment Variables

Bu sənəddə Vercel-də təyin edilməli olan bütün environment variable-lar siyahıya alınıb.

## Vercel Dashboard-da Təyin Etmə

1. Vercel Dashboard-a daxil olun
2. Layihənizi seçin
3. **Settings** → **Environment Variables** bölməsinə keçin
4. Aşağıdakı variable-ları əlavə edin

---

## Vacib (Required) Environment Variables

### 1. DATABASE_URL
**Təsvir:** PostgreSQL verilənlər bazası connection string  
**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]`

**Ümumi format:**
```
postgresql://username:password@host:5432/database?schema=public
```

**Neon.tech üçün nümunə:**
```
postgresql://neondb_owner:your_password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Supabase üçün nümunə:**
```
postgresql://postgres:your_password@db.abcdefghijklmnop.supabase.co:5432/postgres?schema=public
```

**Vercel Postgres üçün nümunə:**
```
postgres://default:your_password@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

**Qeyd:** 
- `schema=public` parametri vacibdir (Prisma üçün)
- `sslmode=require` production üçün tövsiyə olunur
- Password-də xüsusi simvollar varsa, URL encode edilməlidir

**Vacibdir:** ✅ Bəli  
**Production:** ✅ Təyin edilməlidir  
**Preview:** ✅ Təyin edilməlidir  
**Development:** ✅ Təyin edilməlidir

---

### 2. NEXTAUTH_SECRET
**Təsvir:** NextAuth.js üçün secret key (authentication üçün)  
**Nümunə:**
```
DesT0nQ9OLveb92mBSb25j4nyadhfzJT
```

**Yaratmaq üçün:**
```bash
openssl rand -base64 32
```

**Vacibdir:** ✅ Bəli  
**Production:** ✅ Təyin edilməlidir  
**Preview:** ✅ Təyin edilməlidir  
**Development:** ✅ Təyin edilməlidir

---

### 3. NEXTAUTH_URL
**Təsvir:** NextAuth.js üçün base URL  
**Nümunə:**
```
https://dailybaku.az
```

**Production üçün:**
```
https://dailybaku.az
```

**Preview üçün:**
```
https://dailybaku-az-xxx.vercel.app
```

**Vacibdir:** ✅ Bəli  
**Production:** ✅ Təyin edilməlidir  
**Preview:** ✅ Təyin edilməlidir  
**Development:** ⚠️ Opsional (localhost:3000)

---

### 4. NEXT_PUBLIC_SITE_URL
**Təsvir:** Saytın əsas URL-i (SEO, sitemap, robots.txt üçün)  
**Nümunə:**
```
https://dailybaku.az
```

**Production üçün:**
```
https://dailybaku.az
```

**Preview üçün:**
```
https://dailybaku-az-xxx.vercel.app
```

**Vacibdir:** ✅ Bəli  
**Production:** ✅ Təyin edilməlidir  
**Preview:** ✅ Təyin edilməlidir  
**Development:** ⚠️ Opsional (http://localhost:3008)

---

## Opsional (İstəyə görə) Environment Variables

### 5. NEXT_PUBLIC_BASE_URL
**Təsvir:** Bəzi komponentlərdə istifadə olunur (Footer və s.)  
**Nümunə:**
```
https://dailybaku.az
```

**Qeyd:** Əgər təyin edilməsə, `NEXT_PUBLIC_SITE_URL` istifadə olunur.

**Vacibdir:** ❌ Xeyr  
**Production:** ⚠️ Tövsiyə olunur  
**Preview:** ⚠️ Tövsiyə olunur  
**Development:** ❌ Lazım deyil

---

## Environment Variable-ların Siyahısı

| Variable Name | Vacib | Production | Preview | Development | Təsvir |
|--------------|-------|------------|---------|-------------|--------|
| `DATABASE_URL` | ✅ | ✅ | ✅ | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | ✅ | ✅ | ✅ | NextAuth secret key |
| `NEXTAUTH_URL` | ✅ | ✅ | ✅ | ⚠️ | NextAuth base URL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | ✅ | ⚠️ | Site base URL |
| `NEXT_PUBLIC_BASE_URL` | ❌ | ⚠️ | ⚠️ | ❌ | Alternative base URL |

---

## Vercel-də Təyin Etmə Addımları

### Production Environment üçün:

1. **Settings** → **Environment Variables**
2. **Add New** düyməsini klikləyin
3. Aşağıdakı variable-ları əlavə edin:

```
DATABASE_URL = postgresql://username:password@host:5432/database?schema=public&sslmode=require
NEXTAUTH_SECRET = your-secret-key-here
NEXTAUTH_URL = https://dailybaku.az
NEXT_PUBLIC_SITE_URL = https://dailybaku.az
NEXT_PUBLIC_BASE_URL = https://dailybaku.az
```

**Qeyd:** `DATABASE_URL`-də:
- `username` - database istifadəçi adı
- `password` - database şifrəsi (xüsusi simvollar varsa URL encode edin)
- `host` - database server ünvanı
- `5432` - PostgreSQL port (default)
- `database` - database adı
- `schema=public` - Prisma üçün vacib
- `sslmode=require` - SSL üçün (production üçün tövsiyə olunur)

4. **Environment** seçimində **Production** seçin
5. **Save** düyməsini klikləyin

### Preview Environment üçün:

Eyni addımları təkrarlayın, amma:
- **Environment** seçimində **Preview** seçin
- `NEXTAUTH_URL` və `NEXT_PUBLIC_SITE_URL` üçün preview URL istifadə edin (məsələn: `https://dailybaku-az-xxx.vercel.app`)

---

## Yoxlama

Variable-ları təyin etdikdən sonra:

1. **Deployments** bölməsinə keçin
2. Yeni bir deployment başladın
3. Build log-larını yoxlayın
4. Əgər xəta varsa, variable-ların düzgün təyin olunduğunu yoxlayın

---

## Təhlükəsizlik Qeydləri

⚠️ **Vacib:** 
- `NEXTAUTH_SECRET` və `DATABASE_URL` kimi həssas məlumatları **heç vaxt** GitHub-a commit etməyin
- Bu variable-ları yalnız Vercel Dashboard-da təyin edin
- Production və Preview üçün fərqli secret key-lər istifadə edin (tövsiyə olunur)

---

## Nümunə Konfiqurasiya

### Production:
```env
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public&sslmode=require
NEXTAUTH_SECRET=production-secret-key-here
NEXTAUTH_URL=https://dailybaku.az
NEXT_PUBLIC_SITE_URL=https://dailybaku.az
NEXT_PUBLIC_BASE_URL=https://dailybaku.az
```

**Nümunə (Neon.tech):**
```env
DATABASE_URL=postgresql://neondb_owner:AbC123XyZ@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Nümunə (Supabase):**
```env
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?schema=public&sslmode=require
```

### Preview:
```env
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public&sslmode=require
NEXTAUTH_SECRET=preview-secret-key-here
NEXTAUTH_URL=https://dailybaku-az-git-main-team.vercel.app
NEXT_PUBLIC_SITE_URL=https://dailybaku-az-git-main-team.vercel.app
NEXT_PUBLIC_BASE_URL=https://dailybaku-az-git-main-team.vercel.app
```

## Database Connection String Formatı

### Ümumi Struktur:
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[PARAMETERS]
```

### Parametrlər:
- `schema=public` - **Vacib** - Prisma üçün schema adı
- `sslmode=require` - **Tövsiyə olunur** - SSL connection üçün
- `connection_limit=10` - Connection pool limit (opsional)
- `pool_timeout=10` - Connection timeout (opsional)

### Password-də Xüsusi Simvollar:
Əgər password-də xüsusi simvollar varsa (@, #, $, %, &, +, = və s.), onları URL encode etməlisiniz:

**Nümunə:**
- Orijinal password: `MyP@ss#123`
- Encoded: `MyP%40ss%23123`

**URL Encoding:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `/` → `%2F`
- `?` → `%3F`
- ` ` (space) → `%20`

---

## Kömək

Əgər problem yaşayırsınızsa:
1. Vercel Dashboard-da **Settings** → **Environment Variables** bölməsində variable-ların təyin olunduğunu yoxlayın
2. **Deployments** bölməsində build log-larını yoxlayın
3. Variable adlarının düzgün yazıldığını yoxlayın (böyük/kiçik hərf həssasdır)

