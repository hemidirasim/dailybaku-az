# Vercel Deploy Command Fix

## Problem

Build uğurla tamamlanır, amma deploy zamanı aşağıdakı xəta alınır:

```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
Failed: error occurred while running deploy command
```

## Həll

Bu xəta Vercel dashboard-da təyin olunmuş "Deploy Command"-dən gəlir. Next.js layihələri üçün wrangler lazım deyil.

### Addımlar:

1. Vercel Dashboard-a daxil olun
2. Layihənizi seçin
3. **Settings** → **General** bölməsinə keçin
4. "Build & Development Settings" bölməsində **"Deploy Command"**-i tapın
5. `npx wrangler deploy` command-ini **silin** (boş buraxın)
6. Və ya yalnız `npm run build` istifadə edin
7. Dəyişiklikləri saxlayın

### Qeyd

Next.js layihələri üçün Vercel avtomatik olaraq build və deploy edir. Əlavə deploy command lazım deyil.

---

**Alternativ:** Əgər deploy command-i silmək mümkün deyilsə, `vercel.json` faylında `buildCommand` təyin edin:

```json
{
  "buildCommand": "npm run build"
}
```

Bu fayl artıq mövcuddur və düzgün konfiqurasiya edilmişdir.

