# Admin User Problemi və Həll Yolu

## Problem

Lokal mühitdən PostgreSQL server-ə (68.183.173.136) connection timeout olur çünki:
- Database server lokal IP-lərə icazə vermir (firewall/IP whitelist)
- Vercel IP-ləri whitelist-dədir, ona görə Vercel-dən connection işləyir

## Həll Yolları

### Metod 1: Vercel API Route (Tövsiyə olunur) ✅

1. **Vercel Dashboard → Settings → Environment Variables:**
   ```
   ADMIN_CREATE_SECRET=my-secret-token-123
   ```

2. **Deploy tamamlandıqdan sonra terminal-də:**
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

3. **Uğurlu cavab:**
   ```json
   {
     "success": true,
     "message": "Admin user created/updated",
     "email": "admin@dailybaku.com"
   }
   ```

### Metod 2: Database Server-də IP Whitelist

Database server-inizdə (68.183.173.136) lokal IP-nizi whitelist-ə əlavə edin:

1. Database provider dashboard-a daxil olun
2. Firewall/Security settings-ə keçin
3. Lokal IP-nizi əlavə edin
4. Sonra lokal mühitdə script-i işlədin:
   ```bash
   npm run create-admin
   ```

### Metod 3: SSH Tunnel (Əgər SSH access varsa)

SSH tunnel ilə database-ə bağlanın:

```bash
# SSH tunnel yaradın
ssh -L 5432:localhost:5432 user@68.183.173.136

# Başqa terminal-də
DATABASE_URL="postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@localhost:5432/dailybaku?schema=public" npm run create-admin
```

## Database Connection String

```
postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public
```

- **Host:** 68.183.173.136
- **Port:** 5432
- **Database:** dailybaku
- **User:** dailybaku_user
- **Password:** RMSKSYcLqNzawhuNhP9Lf65PB

## Qeyd

Script **remote database-ə** sorğu atır, **lokal database-ə yox**. Connection timeout olur çünki database server lokal IP-lərə icazə vermir. Vercel-dən connection işləyir, ona görə Vercel API route ilə admin user yaratmaq ən asan yoldur.

