# CareLink.AI setup and deployment

## 1. Create / connect Supabase

1. Sign in at https://database.new and create a project in your own account.
2. Open **SQL Editor** and apply migrations in this exact order:
   - `supabase/migrations/0001_carelink_core.sql`
   - `supabase/migrations/0002_sample_doctors.sql`
   - `supabase/migrations/0003_ai_conversation_update_policy.sql`
   - `supabase/migrations/0004_limit_patient_appointment_updates.sql`
   - `supabase/migrations/0005_source_backed_hospital_directory.sql`
   - `supabase/migrations/0006_verified_private_hospitals.sql`
   - `supabase/migrations/0007_import_researched_healthcare_directory.sql`
   - `supabase/migrations/0008_blood_bank_directory.sql`
3. Migration 0007 imports the 112 facility records in the user's 08-Sep-2026 research document, including departments/specialties and the doctor names explicitly listed in that document. The file describes these as a research working set, not a complete official census. Details marked “Not publicly verified” remain unverified.
4. Migration 0007 also adds profile email/phone fields and keeps them synchronized from Supabase Auth metadata. Passwords remain managed by Supabase Auth and are never copied into the profile table.
5. In **Project Settings → API Keys**, copy the Project URL and the publishable key. Put them in local `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
6. In **Authentication → URL Configuration**, set the local and deployed site URLs. Email confirmation may be enabled by default.
7. Deploy the `ai-chat` Edge Function and configure Edge Function secrets: `AI_API_KEY`, optional `AI_MODEL`, optional `AI_API_BASE_URL`, and `APP_ORIGIN`. Supabase supplies the function runtime's `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never put AI keys or service-role keys in Vite variables or browser code.

## 2. Local test

Use Node.js 20+, run `npm install`, copy `.env.example` to `.env.local`, fill in the Supabase values, then run `npm run dev`. Verify sign-up/sign-in, profile row creation, facility directory, hospital details and departments, doctor directory, appointment insert, review insert, and signed-in AI chat.

Without the Supabase project URL and publishable key, the app does not load the research directory or persist user data. Without `AI_API_KEY` and a deployed Edge Function, live AI answers are unavailable.

## 3. Vercel deployment

Import `JeebuRamakanth/CareLink.AI` in Vercel, framework preset Vite, root directory `.`, build command `npm run build`, output directory `dist`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production and Preview, then deploy. Vite environment values are embedded at build time, so trigger a new deployment after changing them.

## 4. Data and images

The research file lists 112 facilities across Machilipatnam, Pedana, Gudivada, Vuyyuru, Pamarru, Kankipadu, Penamaluru and Vijayawada. This is a research working set, not a guaranteed exhaustive list of every facility. Doctor counts and individual rosters are shown only where the source document provides them. Department names are the source's hospital-level categories and should not be interpreted as a promise that every listed service is currently available.

The app uses a clearly labelled illustrative healthcare image where no facility-specific photo URL has been verified. It must not be represented as that hospital's actual building or staff photo. Real Google Maps/Places photos need an authorized Places API integration and required attribution.

## 5. Blood page

The Blood page reads from `public.blood_banks`, seeded by migration 0008 with source-linked public directory records including the Indian Red Cross centres in Machilipatnam and Vijayawada. Phone/address details should be reconfirmed with the centre. This is a directory only: live blood-group stock, donor availability and reservation are not provided by this migration. The UI intentionally does not invent stock counts or donor records.
