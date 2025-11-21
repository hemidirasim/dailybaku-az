# Vercel Environment Variables

Vercel-də aşağıdakı environment variable-ları təyin edin:

## Database (Neon PostgreSQL)

```
DATABASE_URL=postgresql://neondb_owner:npg_zlq7FAJ8hoGg@ep-cool-tooth-ahdsbzhq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&schema=public
```

**Qeyd:** Neon database istifadə edirik. Pooler URL-i istifadə edin (sonunda `-pooler` var).

## NextAuth

```
NEXTAUTH_SECRET=<your-secret-key-here-min-32-chars>
NEXTAUTH_URL=https://your-domain.vercel.app
```

**NEXTAUTH_SECRET üçün təsadüfi string yaradın:**
```bash
openssl rand -base64 32
```

## Site URL

```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## Supabase (Optional - əgər istifadə edirsinizsə)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Vercel-də Təyin Etmə Addımları

1. Vercel Dashboard-a daxil olun
2. Layihənizi seçin
3. **Settings** → **Environment Variables** bölməsinə keçin
4. Hər bir variable üçün:
   - **Name**: Variable adı (məsələn: `DATABASE_URL`)
   - **Value**: Variable dəyəri
   - **Environment**: Hamısı üçün seçin (Production, Preview, Development)
   - **Add** düyməsini klikləyin

5. Dəyişikliklərdən sonra layihəni yenidən deploy edin

---

## Tam Environment Variables Siyahısı

```env
# Database (Vacib) - Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_zlq7FAJ8hoGg@ep-cool-tooth-ahdsbzhq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&schema=public

# NextAuth (Vacib)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.vercel.app

# Site URL (Vacib)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Qeyd

- `DATABASE_URL` - Database connection string (vacib)
- `NEXTAUTH_SECRET` - NextAuth üçün secret key (vacib, minimum 32 simvol)
- `NEXTAUTH_URL` - Production URL-niz (vacib)
- `NEXT_PUBLIC_SITE_URL` - Site URL-i (API calls və RSS feeds üçün)

---

## Database Connection Timeout Problemi

Əgər "Connection terminated due to connection timeout" xətası alırsınızsa:

### 1. Database Server IP Whitelist

Database server-inizdə (PostgreSQL) Vercel IP-lərinə icazə verin. Vercel IP ranges:
- `76.76.21.0/24`
- `76.223.126.0/24`
- və ya `0.0.0.0/0` (hamıya icazə - təhlükəsizlik üçün tövsiyə olunmur)

### 2. Database Firewall Settings

Database provider-inizdə (məsələn, DigitalOcean, AWS RDS, və s.) firewall rules-da Vercel IP-lərini əlavə edin.

### 3. Connection String Parametrləri

`DATABASE_URL`-ə connection timeout parametrləri əlavə edə bilərsiniz:

```
DATABASE_URL=postgresql://user:password@host:5432/db?connect_timeout=10&statement_timeout=30000
```

### 4. Database Server Status

Database server-inizin işlədiyini və 5432 portunun açıq olduğunu yoxlayın.

---

## Connection Timeout Fix

Kodda connection timeout 10 saniyəyə artırılıb. Əgər problem davam edərsə:
1. Database server-in firewall settings-ini yoxlayın
2. Database provider-in support-a müraciət edin
3. Vercel IP ranges-ini database whitelist-ə əlavə edin

---

## Admin User Yaradılması

Vercel-də deploy etdikdən sonra admin user yaratmaq üçün:

### Metod 1: API Route ilə (Tövsiyə olunur)

1. Vercel-də `ADMIN_CREATE_SECRET` environment variable-ı əlavə edin:
   ```
   ADMIN_CREATE_SECRET=your-secret-token-here
   ```

2. Terminal-də aşağıdakı komandanı işlədin:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/admin/create-user \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-secret-token-here" \
     -d '{
       "email": "admin@dailybaku.com",
       "password": "admin123",
       "name": "Admin"
     }'
   ```

3. Uğurlu cavab alırsınızsa, admin paneldə giriş edə bilərsiniz:
   - URL: `https://your-domain.vercel.app/admin/login`
   - Email: `admin@dailybaku.com`
   - Şifrə: `admin123`

### Metod 2: Database-ə birbaşa bağlanma

Database-ə birbaşa bağlanıb `scripts/create-admin.ts` script-ini işlədin:

```bash
# Local mühitdə
DATABASE_URL="your-database-url" npm run create-admin
```

---

## 401 Unauthorized Xətası Həll Yolları

Əgər admin paneldə giriş edərkən 401 xətası alırsınızsa:

1. **NEXTAUTH_SECRET yoxlayın**: Vercel-də düzgün təyin edildiyini yoxlayın
2. **NEXTAUTH_URL yoxlayın**: Production URL-nizin düzgün olduğunu yoxlayın
3. **Database-də user yoxlayın**: Admin user-in database-də mövcud olduğunu yoxlayın
4. **Vercel Logs yoxlayın**: Vercel Dashboard → Logs bölməsində xəta məlumatlarını yoxlayın
5. **Admin user yaradın**: Yuxarıdakı metodlardan birini istifadə edərək admin user yaradın

