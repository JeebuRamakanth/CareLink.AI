# Component Catalog

This catalog records source-level components/states identified in `src/App.tsx`. The original app is a single main React component with inline page/state composition rather than a separate component file per page. IDs below are stable audit labels for this replica, not original source identifiers.

| ID | Source area | Parent | Data/state | Expected action | Status |
|---|---|---|---|---|---|
| NAV-001 | Sticky header / brand | App | current hash page | navigate home | Source copied; browser verification pending |
| NAV-002 | Main navigation | Header | page, mobileNav | change hash page / close mobile nav | Source copied; browser verification pending |
| AUTH-001 | Login/signup dialog | App overlay | authMode, email, password, fullName, phone, authBusy | authenticate via Supabase | Requires configured Supabase |
| HOME-001 | Hero section | Home | static copy/assets | CTA navigation | Source copied |
| HOME-002 | Hero visual/floating cards | Home | source image URLs | informational visual | Source copied; images are illustrative |
| HOME-003 | Statistics strip | Home | source-defined content | informational | Source copied; inspect data semantics |
| HOSP-001 | Hospital search/filter directory | Hospitals | hospitals, query, cityFilter, specialtyFilter, verifiedOnly, sortBy | filter/sort/navigate | Source copied |
| HOSP-002 | Hospital result card | HOSP-001 | HospitalRow | open details/call/directions where data exists | Source copied |
| HOSP-003 | Hospital detail | App page state | active hospital, departments/doctors | navigate to associated care | Source copied |
| DOC-001 | Doctor directory/cards | Doctors | doctors, doctorQuery, reviews | search/review/appointment | Source copied; data requires backend |
| APPT-001 | Appointment request UI | App | bookingDoctor, appointmentDate, patientName, bookingNotes, bookingBusy | submit request | Requires backend and auth |
| BLOOD-001 | Blood-bank directory | Blood page | bloodBanks | browse source-attributed listings | Source copied; no live stock assumption |
| AI-001 | Floating assistant launcher | App | chatOpen | open/close assistant | Source copied |
| AI-002 | Assistant conversation panel | AI-001 | messages, chatInput, chatBusy, conversationId | send/retry/continue conversation | Requires configured Edge Function for live responses |
| REVIEW-001 | Doctor review dialog | App | reviewDoctor, rating, reviewText, reviewBusy | submit review | Requires auth/backend policies |
| APPT-002 | My appointments panel | App | appointments, myAppointmentsOpen | view signed-in user's requests | Requires auth/backend policies |
| FOOT-001 | Footer | App | static links | navigate/contact | Source copied; destination audit pending |

## Audit rule
A source copy is not proof of visual or behavioral parity. Mark MATCHED only after a comparable original/replica browser test; current status is PARTIAL pending that evidence.
