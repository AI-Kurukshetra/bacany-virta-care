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

4. Apply schema and seed in Supabase SQL Editor:
- Run [`supabase/migrations/202603140001_init.sql`](supabase/migrations/202603140001_init.sql)
- Run [`supabase/seed.sql`](supabase/seed.sql)

5. Start the app:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts (from seed)
- Provider: `provider1@virtacare.app` / `Test@123`
- Provider: `provider2@virtacare.app` / `Test@123`
- Patient: `patient1@virtacare.app` / `Test@123`
- Patient: `patient2@virtacare.app` / `Test@123`

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
1. Import the project into Vercel.
2. Set the same environment variables from `.env.local` in Vercel Project Settings.
3. Deploy.

Vercel will automatically run `next build` with the existing scripts in `package.json`.
