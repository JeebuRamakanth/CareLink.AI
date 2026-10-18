# Route and Interaction Map

The original source uses URL hashes and a `Page` union rather than a dedicated routing package.

| Route/hash | View | Source state | Known interactions | Dependencies/status |
|---|---|---|---|---|
| `#home` | Home | page=home | hero CTA, navigation, assistant launcher | Source copied; screenshot comparison pending |
| `#hospitals` | Hospitals | page=hospitals | search, city/specialty/verified filters, sort, reset, card actions | Supabase hospitals/departments |
| `#hospital-detail/<id>` | Hospital profile | active hospital + page | departments, doctors, contact/directions | Supabase record required |
| `#doctors` | Doctors | page=doctors | doctor search, review/appointment entry points | Supabase doctors/reviews |
| `#appointments` | Appointment area | page=appointments | submit request, view requests | signed-in user + Supabase |
| `#blood` | Blood-bank directory | page=blood | browse/search as provided in source | Supabase blood_banks |
| Overlay | Login/signup | authOpen/authMode | open, close, submit, switch mode | Supabase Auth |
| Overlay/panel | AI assistant | chatOpen/messages/chatBusy | open/close, type/send, show conversation | Edge Function + optional history tables |
| Overlay | Doctor review | reviewDoctor/rating/reviewText | rate, submit, close | auth + review table/RLS |
| Panel | My appointments | myAppointmentsOpen/appointments | open/view/close | signed-in user + RLS |

## Interaction notes
- URL hashes encode page and hospital ID; verify refresh and Back/Forward in a browser before claiming full route parity.
- Actions dependent on backend configuration cannot be confirmed from static source inspection alone.
- Phone and directions actions should only be shown when usable contact/address data exists.
- The source's Supabase client reads only public frontend configuration. Never copy service-role keys or AI provider keys into this replica.
