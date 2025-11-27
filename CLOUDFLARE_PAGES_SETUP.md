# Cloudflare Pages Deploy Təlimatları

## Tələblər

- Cloudflare hesabı
- GitHub repository (Cloudflare Pages ilə inteqrasiya üçün)
- PostgreSQL database (remote)

## Cloudflare Pages-də Deploy Addımları

### 1. Cloudflare Dashboard-a Daxil Olun

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) açın
2. Sol menyudan **Pages** seçin
3. **Create a project** düyməsini klikləyin

### 2. GitHub Repository-ni Bağlayın

1. **Connect to Git** seçin
2. GitHub hesabınızı bağlayın (əgər bağlanmayıbsa)
3. Repository-nizi seçin: `hemidirasim/dailybaku-az`
4. **Begin setup** düyməsini klikləyin

### 3. Build Settings

Aşağıdakı parametrləri təyin edin:

- **Project name**: `dailybaku-az` (və ya istədiyiniz ad)
- **Production branch**: `main`
- **Framework preset**: `Next.js`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (boş buraxın)
- **Node.js version**: `22.12.0` (və ya `22`)

### 4. Environment Variables

**Variables** bölməsində aşağıdakı environment variable-ları əlavə edin:

#### Production Variables:

```env
DATABASE_URL=postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public
NEXTAUTH_SECRET=<your-secret-key-here-min-32-chars>
NEXTAUTH_URL=https://dailybaku-az.pages.dev
NEXT_PUBLIC_SITE_URL=https://dailybaku-az.pages.dev
NEXT_PUBLIC_BASE_URL=https://dailybaku-az.pages.dev
```

#### Preview Variables (eyni dəyərlər):

```env
DATABASE_URL=postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public
NEXTAUTH_SECRET=<your-secret-key-here-min-32-chars>
NEXTAUTH_URL=https://dailybaku-az.pages.dev
NEXT_PUBLIC_SITE_URL=https://dailybaku-az.pages.dev
NEXT_PUBLIC_BASE_URL=https://dailybaku-az.pages.dev
```

**Qeyd:** 
- `NEXTAUTH_SECRET` üçün təsadüfi string yaradın:
  ```bash
  openssl rand -base64 32
  ```
- `NEXTAUTH_URL` və `NEXT_PUBLIC_SITE_URL` Cloudflare Pages tərəfindən verilən URL ilə əvəz edilməlidir (məsələn: `https://dailybaku-az.pages.dev`)

### 5. Custom Domain (Opsional)

1. **Custom domains** bölməsinə keçin
2. **Set up a custom domain** düyməsini klikləyin
3. `dailybaku.az` domain-ini əlavə edin
4. Cloudflare-də DNS qeydlərini təyin edin:
   - **Type**: `CNAME`
   - **Name**: `@` (və ya `www`)
   - **Target**: `dailybaku-az.pages.dev`

### 6. Deploy

1. **Save and Deploy** düyməsini klikləyin
2. İlk build başlayacaq (5-10 dəqiqə çəkə bilər)
3. Build tamamlandıqdan sonra site hazır olacaq

## Build Sonrası

### Admin User Yaradılması

Deploy tamamlandıqdan sonra admin user yaratmaq üçün:

1. Terminal-də aşağıdakı komandanı işlədin:
   ```bash
   curl -X POST https://dailybaku-az.pages.dev/api/admin/create-user \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-secret-token-here" \
     -d '{
       "email": "admin@dailybaku.com",
       "password": "admin123",
       "name": "Admin"
     }'
   ```

2. Admin paneldə giriş edin:
   - URL: `https://dailybaku-az.pages.dev/dashboard/login`
   - Email: `admin@dailybaku.com`
   - Şifrə: `admin123`

## Qeydlər

### Next.js 13 App Router

Cloudflare Pages Next.js 13 App Router-i dəstəkləyir, amma bəzi məhdudiyyətlər var:

- **Server Components**: Tam dəstəklənir
- **API Routes**: Tam dəstəklənir
- **Middleware**: Tam dəstəklənir
- **Static Generation**: Tam dəstəklənir
- **Dynamic Routes**: Tam dəstəklənir

### Database Connection

PostgreSQL database Cloudflare Pages-dən bağlanmalıdır. Database server-iniz Cloudflare IP-lərinə icazə verməlidir.

### Environment Variables

Cloudflare Pages-də environment variable-lar:
- **Production**: Production deploy-lar üçün
- **Preview**: Preview deploy-lar üçün (pull request-lər)
- **Branch-specific**: Xüsusi branch-lər üçün

Hər bir environment üçün variable-ları ayrıca təyin edin.

## Troubleshooting

### Build Xətaları

Əgər build xətası alırsınızsa:

1. **Build logs**-u yoxlayın
2. **Environment variables**-ın düzgün təyin edildiyini yoxlayın
3. **Node.js version**-ın düzgün olduğunu yoxlayın (22.12.0)
4. **Database connection**-ın işlədiyini yoxlayın

### Database Connection Xətaları

Əgər database connection xətası alırsınızsa:

1. Database server-iniz Cloudflare IP-lərinə icazə verir
2. `DATABASE_URL` düzgün formatdadır
3. Database server 5432 portunda işləyir
4. Firewall rules düzgün konfiqurasiya edilmişdir

### NextAuth Xətaları

Əgər NextAuth xətası alırsınızsa:

1. `NEXTAUTH_SECRET` təyin edilmişdir (minimum 32 simvol)
2. `NEXTAUTH_URL` düzgün URL-dir (Cloudflare Pages URL-i)
3. `NEXT_PUBLIC_SITE_URL` düzgün URL-dir

## Əlavə Məlumat

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Environment Variables](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)




