# Vercel-də Deploy Command-i Silmək

## Problem

Build uğurla tamamlanır, amma deploy zamanı aşağıdakı xəta alınır:

```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
Failed: error occurred while running deploy command
```

Bu xəta Vercel dashboard-da təyin olunmuş "Deploy Command"-dən gəlir.

## Həll

### Addım 1: Vercel Dashboard-a Daxil Olun

1. [Vercel Dashboard](https://vercel.com/dashboard) açın
2. Layihənizi seçin

### Addım 2: Settings-ə Keçin

1. **Settings** tab-ına klikləyin
2. Sol menyudan **General** seçin

### Addım 3: Deploy Command-i Silin

1. Aşağı scroll edin və **"Build & Development Settings"** bölməsini tapın
2. **"Deploy Command"** field-ini tapın
3. `npx wrangler deploy` command-ini **tamamilə silin** (boş buraxın)
4. **Save** düyməsini klikləyin

### Addım 4: Yoxlayın

1. **Deployments** tab-ına keçin
2. Yeni bir deploy başladın (və ya push edin)
3. Build uğurla tamamlanmalıdır və deploy command xətası olmamalıdır

## Qeyd

Next.js layihələri üçün Vercel avtomatik olaraq build və deploy edir. Əlavə deploy command lazım deyil.

Əgər Cloudflare Pages-də deploy etmək istəyirsinizsə, Vercel-də deploy command-i silmək lazım deyil - sadəcə Cloudflare Pages-də yeni bir project yaradın.

