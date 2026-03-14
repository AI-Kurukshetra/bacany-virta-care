# bacancy-vitra-care

Production-ready Next.js App Router application for remote chronic disease care, with Supabase auth/database integration, role-aware dashboards, and seed data for a populated first run.

## Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Recharts for trend visualization

## Local Setup
1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Fill required variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `NEXT_PUBLIC_APP_URL` (defaults to `http://localhost:3000`)
- Keep local development pointed at a non-production Supabase project when possible. This app can write real data through shared credentials.
- Provider demo seeding is disabled by default. Only enable it intentionally with `ENABLE_PROVIDER_DEMO_DATA=true` in local development against disposable data.

4. Apply schema and seed in Supabase SQL Editor:
- Run [`supabase/migrations/202603140001_init.sql`](supabase/migrations/202603140001_init.sql)
- Run [`supabase/seed.sql`](supabase/seed.sql)

5. Start the app:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Auth URL Configuration
To make email verification + magic link work on both local and Vercel:

1. In Supabase dashboard, open `Authentication -> URL Configuration`
2. Set `Site URL` to:
   - `https://bacany-virta-care.vercel.app`
3. Add these `Redirect URLs`:
   - `http://localhost:3000/**`
   - `http://localhost:3005/**`
   - `https://bacany-virta-care.vercel.app/**`
   - Optional for previews: `https://*-<your-vercel-team>.vercel.app/**`

## Demo Accounts (from seed)
- Provider: `provider1@virtacare.app` / `Test@123`
- Provider: `provider2@virtacare.app` / `Test@123`
- Patient: `patient1@virtacare.app` / `Test@123`
- Patient: `patient2@virtacare.app` / `Test@123`
- Patient: `patient3@virtacare.app` / `Test@123`

## App Routes
- Public:
  - `/`
  - `/auth/login`
  - `/auth/signup`
- Protected:
  - `/dashboard`
  - `/onboarding`
  - `/glucose`
  - `/nutrition`
  - `/medications`
  - `/appointments`
  - `/messages`
  - `/provider/patients`
  - `/provider/patients/[id]`

## Quality Checks
```bash
npm run lint
npm run build
```

## Deploy to Vercel
1. Sign in with the Vercel CLI:
```bash
vercel login
```

2. Link the repository to a Vercel project from the repo root:
```bash
vercel link
```

3. Add the required runtime environment variables:
```bash
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

4. Create a preview deployment:
```bash
vercel deploy
```

5. Promote to production when ready:
```bash
vercel --prod
```

Vercel will run `next build` using the existing scripts in `package.json`.
