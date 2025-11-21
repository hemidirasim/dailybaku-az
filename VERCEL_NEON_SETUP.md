# Vercel-də Neon Database Setup

## Environment Variables

Vercel Dashboard → Settings → Environment Variables bölməsində aşağıdakı variable-ları əlavə edin:

### 1. DATABASE_URL (Vacib)

```
DATABASE_URL=postgresql://neondb_owner:npg_zlq7FAJ8hoGg@ep-cool-tooth-ahdsbzhq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&schema=public
```

### 2. NEXTAUTH_SECRET (Vacib)

```
NEXTAUTH_SECRET=5xkH8GphWSLhTW9KJ6XvdTACWV+A8HFwA9Zx8HFx0SU=
```

### 3. NEXTAUTH_URL (Vacib)

```
NEXTAUTH_URL=https://dailybaku-az.vercel.app
```

### 4. NEXT_PUBLIC_SITE_URL (Vacib)

```
NEXT_PUBLIC_SITE_URL=https://dailybaku-az.vercel.app
```

### 5. ADMIN_CREATE_SECRET (Admin user yaratmaq üçün)

```
ADMIN_CREATE_SECRET=my-secret-token-123
```

---

## Admin User Yaradılması

### Metod 1: API Route (Tövsiyə olunur)

1. `ADMIN_CREATE_SECRET` environment variable-ını təyin edin (yuxarıda)
2. Deploy tamamlandıqdan sonra:

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

### Metod 2: Neon Console-dan

Neon Dashboard → SQL Editor-də:

```sql
-- Bcrypt hash yaradın (Node.js-də):
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"

-- Hash-i alıb insert edin:
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@dailybaku.com',
  '$2a$10$YOUR_HASH_HERE', -- bcrypt hash
  'Admin',
  'admin',
  NOW(),
  NOW()
);
```

---

## Admin Panel Giriş

- **URL:** `https://dailybaku-az.vercel.app/admin/login`
- **Email:** `admin@dailybaku.com`
- **Şifrə:** `admin123`

---

## Qeyd

- Neon database connection SSL ilə işləyir (`sslmode=require`)
- Pooler URL istifadə edin (connection pooling üçün)
- Admin user lokal mühitdə yaradılıb, amma Vercel-də də yoxlamaq lazımdır

