# Docker Deployment Guide

Bu sənəd Docker istifadə edərək Daily Baku layihəsini deploy etmək üçün təlimatları ehtiva edir.

## Tələblər

- Docker 20.10+
- Docker Compose 2.0+

## Quraşdırma

### 1. Environment Dəyişənlərini Təyin Edin

`.env` faylı yaradın (və ya `.env.example`-dan kopyalayın):

```bash
cp .env.example .env
```

`.env` faylını redaktə edin və lazımi dəyərləri təyin edin:

```env
DATABASE_URL="postgresql://dailybaku:dailybaku_password@postgres:5432/dailybaku?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Vacib:** `NEXTAUTH_SECRET` üçün təsadüfi bir string yaradın:

```bash
openssl rand -base64 32
```

### 2. Docker Image-ni Build Edin

```bash
docker-compose build
```

### 3. Container-ləri İşə Salın

```bash
docker-compose up -d
```

Bu komanda:
- PostgreSQL container-ni işə salır
- Database migration-ları avtomatik işlədir
- Next.js tətbiqini işə salır

**Vacib:** İlk dəfə işə saldıqdan sonra admin istifadəçisini yaratmalısınız:
```bash
docker-compose exec app npm run create-admin
```

### 4. Log-ları İzləyin

```bash
docker-compose logs -f app
```

### 5. Admin İstifadəçisini Yaradın

```bash
docker-compose exec app npm run create-admin
```

Default dəyərlər:
- Email: `admin@dailybaku.com`
- Şifrə: `admin123`

Və ya xüsusi email/şifrə ilə:
```bash
docker-compose exec app npm run create-admin admin@example.com mypassword "Admin Name"
```

### 6. Tətbiqə Daxil Olun

- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/login

## Əməliyyatlar

### Container-ləri Dayandırmaq

```bash
docker-compose down
```

### Container-ləri Dayandırmaq və Volume-ları Silmək

```bash
docker-compose down -v
```

**Diqqət:** Bu komanda bütün database məlumatlarını silir!

### Container-ləri Yenidən Build Etmək

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Database Migration-ları Manual İşlətmək

```bash
docker-compose exec app npx prisma migrate deploy
```

### Prisma Studio İşə Salmaq

```bash
docker-compose exec app npx prisma studio
```

### Container İçində Shell Açmaq

```bash
docker-compose exec app sh
```

## Production Deployment

### Environment Dəyişənləri

Production üçün `.env` faylında aşağıdakı dəyərləri dəyişdirin:

```env
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXTAUTH_SECRET="strong-random-secret-here"
```

### Docker Compose Production Konfiqurasiyası

Production üçün `docker-compose.prod.yml` faylı yarada bilərsiniz:

```yaml
version: '3.8'

services:
  postgres:
    # ... existing config ...
    volumes:
      - /var/lib/postgresql/data:/var/lib/postgresql/data  # Persistent volume

  app:
    # ... existing config ...
    restart: always
    environment:
      NODE_ENV: production
```

İşə salmaq:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Database Connection Xətası

Əgər database-ə qoşula bilmirsinizsə:

1. PostgreSQL container-inin işlədiyini yoxlayın:
   ```bash
   docker-compose ps
   ```

2. Database log-larını yoxlayın:
   ```bash
   docker-compose logs postgres
   ```

### Migration Xətası

Əgər migration-lar işləmirsə:

```bash
docker-compose exec app npx prisma migrate reset
docker-compose exec app npx prisma migrate deploy
```

### Port Already in Use

Əgər 3000 portu artıq istifadə olunursa, `docker-compose.yml`-də portu dəyişdirin:

```yaml
ports:
  - "3001:3000"  # 3001 portundan 3000-ə map et
```

## Volume-lar

- `postgres_data`: PostgreSQL məlumatları
- `./public/uploads`: Upload edilmiş fayllar (şəkillər)

## Network

Bütün container-lər `dailybaku-network` network-ündədir və bir-biri ilə kommunikasiya edə bilirlər.

## İstifadə

Docker istifadə edərək, bütün asılılıqlar (PostgreSQL, Node.js) avtomatik quraşdırılır və konfiqurasiya edilir. Yalnız `.env` faylını təyin etmək və `docker-compose up` işlətmək kifayətdir.

