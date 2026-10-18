# CareLink.AI setup and deployment

## 1. Create Supabase
1. Sign in at https://database.new and create a new project in your own account.
2. Open SQL Editor and run migrations in order: `supabase/migrations/0001_carelink_core.sql`, then `0002_sample_doctors.sql`.
3. In Project Settings → API Keys, copy the Project URL and the publishable key.
4. Put them in local `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Configure Auth → URL Configuration with the local and deployed site URLs. Email confirmation may be enabled by default.
6. Deploy the `ai-chat` Edge Function from the CLI or Dashboard and configure Edge Function secrets: `AI_API_KEY`, optional `AI_MODEL`, optional `AI_API_BASE_URL`, and `APP_ORIGIN`. The Supabase platform provides `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the function runtime. Never place AI secrets in Vite variables.

## 2. Local test
Use Node.js 20+, run `npm install`, copy `.env.example` to `.env.local`, fill in the Supabase values, then run `npm run dev`. Verify sign-up/sign-in, hospital/doctor directory, appointment insert, review insert, and signed-in AI chat.

Without the Supabase project URL and publishable key, the app runs in sample preview mode and persistence is unavailable. Without `AI_API_KEY` and a deployed Edge Function, live AI answers are unavailable.

## 3. Vercel deployment
Import `JeebuRamakanth/CareLink.AI` in Vercel, framework preset Vite, root directory `.`, build command `npm run build`, output directory `dist`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production and Preview, then deploy. Vite environment values are embedded at build time, so trigger a new deployment after changing them.

## 4. Sample-data warning
Sample hospital and doctor records are explicitly marked sample. Do not treat their names, images, addresses, or specialties as verified real-world provider information.
