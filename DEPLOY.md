# Deploying Desh Uthcha

Production hosting is configured for **[Vercel](https://vercel.com)** (best fit for this Vite + static sub-sites setup).

## One-click from GitHub

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project** → import **Titleshot/Desh-Uthcha**.
3. Vercel reads `vercel.json` automatically (`build:production` → output `dist`).
4. Optional: add environment variables for the commitments tracker (build time):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`  
   (see `Public Commitments Tracker/.env.example`)
5. Deploy.

## What gets deployed

| Path | Content |
|------|---------|
| `/` | Main hub (React) |
| `/final/` | Final Desh Uthcha cinematic site |
| `/commitments/` | 100-point public commitments tracker |
| `/vision/` | Vision static site |
| `/transparency`, `/series` | React routes |

## Bhimsen series media

Episode videos live in **`public/series-media/`** (committed, deployed with the site).

After replacing files in `Compressed Videos/` locally:

```powershell
npm run sync:series-media
git add public/series-media
git commit -m "Update Bhimsen series media"
git push
```

## Local production preview

```powershell
npm run install:deps
npm run build:production
npm run preview
```

## CLI deploy

```powershell
npx vercel login
npx vercel --prod
```
