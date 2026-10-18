# CareLink.AI assistant setup and safety notes

## What this implementation adds

- The `ai-chat` Supabase Edge Function instructs the configured model to understand English, Telugu script, romanized Telugu, and mixed Telugu-English.
- The function checks a limited list of high-risk emergency phrases before calling the model and returns immediate advice to contact India's emergency number **112**. This is a basic keyword guard, not a clinically validated triage engine; it can miss emergencies and can flag non-emergencies.
- The chat UI accepts PNG, JPEG, and WebP images up to 5 MB and sends the image to the configured vision-capable chat-completions model. Users should upload only images they are comfortable sending to the configured AI provider. Image interpretation may be wrong and must not be treated as a diagnosis.
- The chat has a direct `tel:112` call link and a location-permission-based Google Maps search for emergency hospitals. It does **not** notify an ambulance service, transmit location to emergency dispatch, or guarantee an ambulance pickup.
- Hospital directory links now open Google Maps directions to the selected facility. Google Maps may ask the user to confirm or enable their location.

## Required deployment steps

These steps require access to the Supabase project and a valid AI provider API key. Do not commit API keys to GitHub or put them in any `VITE_*` browser variable.

1. In the repository root, install/use the Supabase CLI and sign in:
   ```bash
   npx supabase login
   ```
2. Set the Edge Function secrets. Run this in PowerShell or a terminal, replacing the placeholder with your real key locally. Do not paste the key into chat or commit it:
   ```bash
   npx supabase secrets set --project-ref drpbukyjdkzhczabisxx AI_API_KEY=YOUR_PRIVATE_PROVIDER_KEY APP_ORIGIN=https://carelinkai.vercel.app
   ```
   Optionally set a compatible model:
   ```bash
   npx supabase secrets set --project-ref drpbukyjdkzhczabisxx AI_MODEL=gpt-4o-mini
   ```
3. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy ai-chat --project-ref drpbukyjdkzhczabisxx
   ```
4. In Supabase Dashboard → Edge Functions → `ai-chat` → Logs, check for deployment and provider errors. Confirm the `AI_API_KEY` secret exists without exposing its value.
5. In the deployed app, sign in and test:
   - English: `I have a fever`
   - Romanized Telugu: `naaku fever ga undi`
   - Telugu script: `నాకు జ్వరం ఉంది`
   - Emergency test: `I have chest pain and difficulty breathing` — should immediately advise calling 112.
   - Image test: upload a non-sensitive sample report/image and ask for readable values only.
   - Hospital directions and location permission.

## Safety and limitations

- No model can guarantee that a symptom is harmless or diagnose every disease from chat or an image. Do not show “100% safe” or “no danger” claims.
- The current emergency phrase check is deliberately conservative but incomplete. It is not a substitute for clinician-designed triage rules, local clinical validation, monitoring, or red-team testing.
- Medication recommendations must not be treated as prescriptions. The assistant is instructed not to guess a patient's age, weight, allergies, pregnancy status, or dose.
- The SOS control calls the phone's dialer for 112 only if the device/browser supports it. The user must place/confirm the call. The app does not auto-call hospitals or dispatch an ambulance.
- Image content is sent to the configured provider's API. Review that provider's data retention/privacy terms before using real patient records.
- Deployment, secret configuration, provider billing/quota, production browser testing, and clinical validation must be completed before claiming the feature is live or production-safe.
