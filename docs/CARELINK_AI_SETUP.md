# CareLink.AI assistant setup and safety notes

## What the AI implementation includes

- English, Telugu script, romanized Telugu, and mixed Telugu-English response guidance.
- Emergency-first keyword guard for a limited set of red flags with immediate India 112 guidance; this is not clinically validated and can miss emergencies or flag non-emergencies.
- Image input for PNG/JPEG/WebP through a vision-capable chat-completions model. Images are sent to the configured provider; never upload real patient records until privacy, consent, access controls, and provider retention terms have been reviewed.
- Request validation, image/body size limits, origin allowlisting, provider timeout handling, and clearer provider quota/key error responses.
- Direct `tel:112` UI action and Google Maps emergency-hospital search/directions. This app does not dispatch ambulances or automatically contact emergency services.

## Required one-time backend deployment

These steps require access to the Supabase project and a valid AI provider API key. Never commit keys to GitHub or put them in `VITE_*` browser variables.

1. Open a terminal in the repository root and authenticate:
   ```bash
   npx supabase login
   ```
2. Set secrets (PowerShell works; replace the placeholder locally, do not send the key in chat):
   ```bash
   npx supabase secrets set --project-ref drpbukyjdkzhczabisxx AI_API_KEY=YOUR_PRIVATE_PROVIDER_KEY APP_ORIGINS=https://carelinkai.vercel.app,https://carelink.ai
   ```
   Optional provider configuration:
   ```bash
   npx supabase secrets set --project-ref drpbukyjdkzhczabisxx AI_MODEL=gpt-4o-mini
   ```
   If using a compatible non-OpenAI provider, also set its base URL:
   ```bash
   npx supabase secrets set --project-ref drpbukyjdkzhczabisxx AI_API_BASE_URL=https://YOUR-COMPATIBLE-PROVIDER/v1
   ```
3. Deploy the function:
   ```bash
   npx supabase functions deploy ai-chat --project-ref drpbukyjdkzhczabisxx
   ```
4. In Supabase Dashboard → Edge Functions → `ai-chat` → Logs, inspect deployment and runtime errors. Check that the secret exists without exposing its value.
5. Sign in to the deployed app and test:
   - `naaku fever ga undi`
   - `నాకు జ్వరం ఉంది`
   - `I have chest pain and difficulty breathing` (should immediately advise calling 112)
   - a non-sensitive sample image/report, asking only for legible values
   - hospital directions and image upload on desktop and mobile.

## Safety and production limitations

- AI chat is informational, not diagnosis, prescription, or a replacement for a clinician. The emergency keyword check is incomplete and not clinically validated; it must not be presented as a reliable triage system.
- Never claim a symptom is definitely harmless. Do not infer a patient's age, weight, allergies, pregnancy status, or medication dose.
- The SOS control opens the device dialer only when supported; the user must confirm the call. No ambulance is automatically called or dispatched.
- Image content is sent to the configured AI provider. Review that provider's privacy and retention terms before sending patient data.
- Backend source changes alone do not deploy the Supabase Edge Function or configure a paid provider key. A valid key, deployment, quota, production testing, monitoring, and clinical review are still required before describing this as production-ready.
