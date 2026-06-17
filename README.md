# Bolão Copa 2026

Site de bolão para a Copa do Mundo 2026. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com) and run the SQL in `supabase/schema.sql` via the SQL Editor.

### 2. Environment Variables

Copy `.env.local` and fill in your real values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
API_FOOTBALL_KEY=...       # from api-football.com (RapidAPI)
CRON_SECRET=...            # any random secret string
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Select your name and submit guesses for the next 24h |
| `/painel` | All guesses per match with result badges |
| `/placar` | Rankings by total points |
| `/admin` | Register matches and insert results |

## Scoring Rules

- Exact score → **2 points**
- Correct winner only → **1 point**
- Draw: only exact score counts (0 for guessing draw without exact score)

## Cron Job (Vercel)

`/api/sync-results` runs daily at 11:00 UTC via `vercel.json`. It fetches finished matches (status `FT`) from API-Football and recalculates points idempotently.

To manually trigger:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain/api/sync-results
```

## Participants

Fixed list (no auth): Matheus, Laressa, Igor, Beatriz, Guilherme, Gabriel
