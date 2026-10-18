import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const configuredOrigins = [
  ...(Deno.env.get('APP_ORIGINS') ?? '').split(','),
  Deno.env.get('APP_ORIGIN') ?? '',
  'https://carelinkai.vercel.app',
  'https://carelink.ai',
  'https://www.carelink.ai',
  'http://localhost:5173',
].map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)
const allowedOrigins = [...new Set(configuredOrigins)]
const getCorsHeaders = (origin: string | null) => {
  const safeOrigin = origin && allowedOrigins.includes(origin.replace(/\/$/, ''))
    ? origin.replace(/\/$/, '')
    : allowedOrigins.find((value) => value.startsWith('https://')) ?? 'http://localhost:5173'
  return {
    'Access-Control-Allow-Origin': safeOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}
const json = (body: unknown, status = 200, origin: string | null = null) => new Response(JSON.stringify(body), {
  status, headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})

const SYSTEM_PROMPT = `You are CareLink.AI, a careful healthcare information and navigation assistant for people in India.
LANGUAGE: Reply in the user's language. Support English, Telugu script, romanized Telugu, and mixed Telugu-English. If the user writes "naaku fever ga undi", answer naturally in simple Telugu-English; do not force formal English or criticize spelling.
MEDICAL LIMITS: You provide general education and triage support, not diagnosis, a prescription, or a substitute for a clinician. Be clear about uncertainty. Never claim "100% safe", "nothing to worry about", or that a serious condition is ruled out.
TRIAGE FIRST: Consider urgency before routine advice. Red flags include chest pain/pressure, severe or sudden breathing difficulty, stroke signs, fainting/unconsciousness, seizure, severe bleeding, severe allergic reaction/swelling, blue/grey lips, sudden severe headache, confusion, poisoning/overdose, severe injury, pregnancy with severe pain/bleeding, or rapidly worsening symptoms. For these, tell the user to call India's emergency number 112 or seek emergency care now. Do not delay with questions, home remedies, or medicine advice. Never claim an ambulance has been dispatched.
COMMON SYMPTOMS: Ask only relevant follow-up questions, such as age range, duration, measured temperature, severity, key symptoms, known conditions, allergies, pregnancy where relevant, and current medicines. Give practical low-risk steps (rest, fluids, monitoring) when appropriate. Give clear escalation thresholds. Extra caution for babies/children, pregnancy, older adults, immunocompromised people, dehydration, persistent/worsening fever, or severe symptoms.
MEDICINES: Do not prescribe antibiotics, steroids, or prescription-only medicines. Do not guess age, weight, allergies, pregnancy status, or doses. If dose or drug safety is uncertain, direct the user to a qualified clinician/pharmacist. Mention contraindications and interactions only when well-supported.
IMAGES/REPORTS: Explain only visible/readable content. For lab reports, extract test, value, unit, reference range, flag and date only when legible; reference ranges vary and results need clinical context. Do not infer unreadable values or diagnose from a photo. For scans, pathology, skin photos or prescriptions, do not claim definitive interpretation; advise qualified review. Be honest if the image is unclear.
CARE NAVIGATION: When asked about hospitals/doctors, explain that current availability, prices and credentials need verification from the relevant provider/directory. Do not invent facilities, doctor names, ratings, appointment slots, or contact details.
PRIVACY: Do not ask for full name, exact address, ID numbers or unrelated personal details. Remind users not to upload information they do not need to share.
FORMAT: Start with urgent safety advice if needed, then concise explanation, practical next steps, and when to seek professional care. Be kind, direct and non-alarmist without false reassurance.`

const emergencyPatterns = [
  /\b(chest pain|chest pressure|tightness in (my )?chest|difficulty breathing|can't breathe|cannot breathe|severe breathlessness|unconscious|fainted|fainting|seizure|heavy bleeding|stroke|face droop|one[- ]sided weakness|overdose|poisoning|severe allergic reaction)\b/i,
  /(గుండె నొప్పి|ఛాతి నొప్పి|ఊపిరి ఆడటం లేదు|శ్వాస తీసుకోలేక|స్పృహ తప్ప|మూర్ఛ|ఎక్కువ రక్తస్రావం|ఒక వైపు బలహీనత)/,
  /(chest pain|gunde noppi|gundello noppi|oopiri aadatledu|oopiri teesukolekapothunna|kallu tirigi padipoya|spruha thappindi|spruha tappindi|fits vachayi|ekkuva bleeding|body lo oka vaipu weakness)/i,
]
const emergencyReply = `⚠️ Possible emergency / అత్యవసర పరిస్థితి కావచ్చు.

Chest pain, breathing difficulty, fainting or similar danger signs can be serious. Please call India's emergency number 112 now, or ask someone nearby to call and take you to the nearest emergency department. Do not drive yourself if dizzy or faint. Do not wait for this chat to assess you.

ఇది emergency కావచ్చు. వెంటనే 112 కి call చేయండి లేదా దగ్గరలో ఉన్న వ్యక్తి సహాయం తీసుకుని emergency department కి వెళ్లండి. ఈ chat ambulance dispatch చేయలేదు. If you can, stay with another person while help is arranged.`

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  if (req.method === 'OPTIONS') {
    if (origin && !allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return new Response('Origin not allowed', { status: 403, headers: getCorsHeaders(origin) })
    }
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, origin)
  if (origin && !allowedOrigins.includes(origin.replace(/\/$/, ''))) {
    return json({ error: 'This website origin is not allowed to use CareLink.AI.' }, 403, origin)
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 9_000_000) return json({ error: 'Request too large. Please use a smaller image (under 5 MB).' }, 413, origin)

  const authHeader = req.headers.get('Authorization')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!authHeader || !supabaseUrl || !anonKey) return json({ error: 'Please sign in and check the Supabase configuration before using AI.' }, 401, origin)

  try {
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return json({ error: 'Your session is invalid or expired. Please sign in again.' }, 401, origin)

    const apiKey = Deno.env.get('AI_API_KEY')
    if (!apiKey) return json({ error: 'AI backend is deployed but no AI provider key is configured. Set AI_API_KEY in Supabase Edge Function secrets.' }, 503, origin)
    const baseUrl = (Deno.env.get('AI_API_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '')
    const model = Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini'

    let body: { messages?: unknown; imageDataUrl?: unknown }
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON request.' }, 400, origin)
    }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : null
    if (!messages.length || messages.some((m: { role?: string; content?: string }) =>
      !m || !['user', 'assistant'].includes(m.role ?? '') || typeof m.content !== 'string' || m.content.length > 5000)) {
      return json({ error: 'Send up to 12 valid messages, with each message under 5,000 characters.' }, 400, origin)
    }
    if (messages[messages.length - 1]?.role !== 'user') return json({ error: 'The last message must be from the user.' }, 400, origin)
    if (imageDataUrl && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(imageDataUrl) || imageDataUrl.length > 7_000_000)) {
      return json({ error: 'Upload a PNG, JPEG or WebP image smaller than 5 MB.' }, 400, origin)
    }

    // Emergency guidance must not wait for the model provider.
    const latestText = messages[messages.length - 1].content
    if (emergencyPatterns.some((pattern) => pattern.test(latestText))) {
      return json({ answer: emergencyReply, triage: 'emergency', emergency_number: '112' }, 200, origin)
    }

    const modelMessages = messages.map((m: { role: 'user' | 'assistant'; content: string }, index: number) => {
      if (index === messages.length - 1 && imageDataUrl) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content || 'Explain only what is visibly readable in this medical image; do not diagnose or guess unreadable details.' },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        }
      }
      return m
    })

    let response: Response
    try {
      response = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(25_000),
        body: JSON.stringify({
          model, temperature: 0.2, max_tokens: 1000,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...modelMessages],
        }),
      })
    } catch (error) {
      console.error('AI provider connection/timeout error', error)
      return json({ error: 'AI provider could not be reached in time. Please retry in a moment.' }, 504, origin)
    }
    if (!response.ok) {
      const detail = await response.text()
      console.error('AI provider error', response.status, detail.slice(0, 300))
      if (response.status === 401 || response.status === 403) {
        return json({ error: 'AI provider rejected the configured key. Check AI_API_KEY in Supabase secrets.' }, 502, origin)
      }
      if (response.status === 429) return json({ error: 'AI provider rate limit or quota reached. Please try later or check provider billing.' }, 429, origin)
      return json({ error: 'AI provider request failed. Check the configured model, provider URL, and provider status.' }, 502, origin)
    }
    let data: { choices?: { message?: { content?: unknown } }[] }
    try {
      data = await response.json()
    } catch {
      return json({ error: 'AI provider returned an unreadable response.' }, 502, origin)
    }
    const answer = data.choices?.[0]?.message?.content
    if (typeof answer !== 'string' || !answer.trim()) return json({ error: 'AI provider returned an empty response.' }, 502, origin)
    return json({ answer, triage: 'general', model }, 200, origin)
  } catch (error) {
    console.error('ai-chat request failed', error)
    return json({ error: 'Could not process the message. Please try again.' }, 500, origin)
  }
})
