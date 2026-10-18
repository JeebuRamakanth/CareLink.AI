# Original UI Inventory (source-derived)

## Evidence and limits
- Source of truth inspected: GitHub repository `JeebuRamakanth/CareLink.AI`, default branch, files `package.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/lib/supabase.ts`, and `tsconfig.json`.
- Source files are copied into this independent folder without intentionally changing their application markup or styles.
- A browser session/screenshot capture of the production site was not available during this implementation. Therefore pixel-level geometry and production-only behavior are NOT claimed as measured.
- `AGENTS.md` was checked and not found at the repository root.
- The app uses hash navigation, not a router library, according to the inspected source and README.

## Verified global design tokens
- Font families imported: DM Sans and Manrope (Google Fonts CSS import).
- Root foreground: `#172b35`; root background: `#fbfdfd`.
- Brand teal: `#0b766e`; deep: `#123d42`; mint: `#e6f5f1`; muted: `#6c7f86`; line: `#e4edeb`.
- Header: 82px sticky top bar; white translucent background, blur, bottom border.
- Desktop/mobile styling is defined in the copied original stylesheet; exact breakpoints should be confirmed with browser screenshots before declaring parity.

## Source-discovered page states
- Home (`#home`)
- Hospitals directory (`#hospitals`)
- Hospital detail (`#hospital-detail/<hospital-id>`)
- Doctors (`#doctors`)
- Appointments (`#appointments`)
- Blood-bank directory (`#blood`)
- Authentication dialog (login/signup state)
- AI assistant closed/open and conversation states
- Doctor review dialog
- Appointment request form/state
- My appointments panel/state

## Data dependencies found
- Supabase client configured from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Tables referenced by source/README include `hospitals`, `hospital_departments`, `doctors`, `blood_banks`, `appointments`, `doctor_reviews`, `ai_conversations`, and `ai_messages`.
- Exact behavior depends on Supabase schema, RLS policies, and deployed Edge Function configuration. No production credentials are copied.
- The source includes illustrative Unsplash image URLs; these must not be mistaken for hospital-specific photographs.

## Section inventory (source files)
1. Sticky brand/navigation header and account actions.
2. Home hero with heading, copy, CTA buttons, hero image and floating informational cards.
3. Summary/statistics strip.
4. Data-driven hospital discovery content.
5. Doctor discovery content.
6. AI assistant entry point/banner and chat UI.
7. Appointment-related UI.
8. Blood-bank directory UI.
9. Authentication and review overlays/panels.
10. Footer and responsive navigation, as implemented in the source JSX/CSS.

This is a source-derived inventory. Text/geometry and conditional rendering should be confirmed against production screenshots before marking exact visual parity.
