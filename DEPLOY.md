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

`Compressed Video(s)/` is not in Git (large files). After clone/deploy, run locally:

```powershell
npm run optimize:series-media   # optional
npm run build                   # copies mp4/webp into dist/series-media
```

Then redeploy, or host `series-media` on a CDN and link from the app later.

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
