# Admin User Yaradılması

## Problem

401 Unauthorized xətası alırsınızsa, çox güman ki, database-də admin user yoxdur.

## Həll Yolları

### Metod 1: Lokal mühitdə (Tövsiyə olunur)

1. `.env` faylı yaradın və database məlumatlarını əlavə edin:

```env
DATABASE_URL=postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public
```

2. Terminal-də script-i işlədin:

```bash
npm run create-admin
```

Və ya xüsusi email/şifrə ilə:

```bash
npm run create-admin admin@dailybaku.com admin123 "Admin"
```

### Metod 2: API Route ilə (Vercel-də)

1. Vercel Dashboard → Settings → Environment Variables:
   - `ADMIN_CREATE_SECRET` əlavə edin (məsələn: `my-secret-token-123`)

2. Terminal-də:

```bash
curl -X POST https://dailybaku-az.vercel.app/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-token-123" \
  -d '{
    "email": "admin@dailybaku.com",
    "password": "admin123",
    "name": "Admin"
  }'
```

### Metod 3: Database-ə birbaşa bağlanma

PostgreSQL client ilə birbaşa database-ə bağlanın:

```sql
-- Bcrypt hash üçün Node.js-də hash edin, sonra SQL-də insert edin
-- Və ya aşağıdakı script-i işlədin
```

Lokal mühitdə:

```bash
# .env faylında DATABASE_URL təyin edin
DATABASE_URL="postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public" npm run create-admin
```

## Default Admin Credentials

- **Email:** `admin@dailybaku.com`
- **Şifrə:** `admin123`
- **URL:** `https://dailybaku-az.vercel.app/admin/login`

## Database Connection String

```
postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public
```

## Qeyd

- Şifrələr bcrypt ilə hash-lənir
- Database-də `users` cədvəli olmalıdır
- User-in `role` field-i `admin` olmalıdır

