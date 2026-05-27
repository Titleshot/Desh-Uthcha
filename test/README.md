# Nepal Public Commitments Tracker

Independent civic reference for Nepal’s Cabinet 100-point agenda (beta).

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Output is written to `dist/`.

## Environment (submissions)

Copy `.env.example` to `.env` and set at least one submission path (Supabase, Formspree, Web3Forms, or mailto). See comments inside `.env.example`. Restart the dev server after changes.

## Backup

Keep this repo, your `.env` (never commit secrets), and any Supabase project exports in a place you control.
