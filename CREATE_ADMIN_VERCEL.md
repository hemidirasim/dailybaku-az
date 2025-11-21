# Vercel-də Admin User Yaradılması

## Addımlar

### 1. Vercel-də Environment Variable Əlavə Edin

Vercel Dashboard → Settings → Environment Variables:

**Name:** `ADMIN_CREATE_SECRET`  
**Value:** `my-secret-token-123` (və ya istədiyiniz secret)  
**Environment:** Production, Preview, Development

### 2. Deploy Tamamlandıqdan Sonra Terminal-də:

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

### 3. Uğurlu Cavab:

```json
{
  "success": true,
  "message": "Admin user created/updated",
  "email": "admin@dailybaku.com"
}
```

### 4. Admin Paneldə Giriş Edin:

- **URL:** `https://dailybaku-az.vercel.app/admin/login`
- **Email:** `admin@dailybaku.com`
- **Şifrə:** `admin123`

---

## Alternativ: Database-ə Birbaşa Bağlanma

Əgər lokal mühitdən database-ə bağlana bilirsinizsə:

```bash
# PostgreSQL client ilə
psql -h 68.183.173.136 -p 5432 -U dailybaku_user -d dailybaku

# Sonra bcrypt hash yaradın (Node.js-də):
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(h => console.log(h))"

# Hash-i alıb SQL-də insert edin:
INSERT INTO users (id, email, password, name, role, created_at)
VALUES (
  gen_random_uuid(),
  'admin@dailybaku.com',
  '$2a$10$YOUR_HASH_HERE',
  'Admin',
  'admin',
  NOW()
);
```

---

## Qeyd

- `ADMIN_CREATE_SECRET` təhlükəsizlik üçün vacibdir
- API route yalnız bu secret ilə işləyir
- Admin user yaradıldıqdan sonra secret-i silə bilərsiniz (və ya saxlayın, lazım ola bilər)

