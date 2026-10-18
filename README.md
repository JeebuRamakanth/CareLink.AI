# CareLink.AI

CareLink.AI is a React + TypeScript + Vite healthcare directory and care-planning interface. The application uses Supabase for authentication, directory data, appointment requests, doctor reviews, and AI conversation history when the corresponding tables, policies, Edge Function, and environment variables are configured.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
npm run preview
```

## Environment configuration

Create a local `.env.local` file (do not commit secrets):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Vite only exposes variables prefixed with `VITE_` to browser code. Never put a Supabase service-role key, database password, or AI provider secret in a `VITE_` variable.

For the AI assistant, configure the Edge Function secrets in Supabase (not in client-side environment variables): `AI_API_KEY`, optionally `AI_MODEL`, `AI_API_BASE_URL`, and `APP_ORIGIN`. Deploy `supabase/functions/ai-chat` using the Supabase CLI and verify the function's provider configuration before describing the assistant as live.

## Supabase data requirements

The UI reads the following tables:

- `hospitals`
- `hospital_departments`
- `doctors` (records marked `verification_status = 'verified'` are shown)
- `blood_banks`
- `appointments` (scoped to the signed-in user's `owner_id`)
- `doctor_reviews`
- `ai_conversations` and `ai_messages`

Apply the project's migrations in order in an isolated development project first. Review the existing schema before applying migrations; do not blindly rerun schema changes against production. The UI does not generate fake doctor names, credentials, availability, or live blood stock. Images without a verified facility/doctor-specific source are illustrative and labeled as such.

## Main UI journeys

- Home `#home`
- Hospitals `#hospitals`
- Hospital detail `#hospital-detail/<hospital-id>`
- Doctors `#doctors`
- Appointments `#appointments`
- Blood-bank directory `#blood`

This app currently uses hash-based navigation; links and refresh behavior should be checked against these routes.

## Data and safety notes

- Appointment submissions are requests, not confirmed bookings.
- Blood-bank listings do not represent real-time blood-group inventory.
- The AI assistant provides general information and is not a diagnosis or emergency service.
- Only use verified sources for clinician identities, qualifications, facility contacts, and ratings.
- Do not claim a successful operation until the backend confirms it.

## QA status

The repository's available scripts are `npm run lint` (TypeScript check) and `npm run build` (TypeScript project build followed by Vite production build). These commands must be executed in a Node-enabled environment before claiming a passing build. GitHub changes and a Vercel check do not by themselves prove that the deployed site is functioning correctly.
