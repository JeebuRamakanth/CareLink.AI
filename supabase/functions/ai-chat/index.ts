import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigin = Deno.env.get('APP_ORIGIN') ?? 'http://localhost:5173'
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})

const SYSTEM_PROMPT = `You are CareLink.AI, a cautious healthcare information assistant for India.
LANGUAGE: Understand and respond naturally in the user's language. Support English, Telugu script, romanized Telugu, and mixed Telugu-English (for example: "naaku fever ga undi", "kallu tirugutunnayi", "chest pain vastondi"). If the user's language is mixed, reply in simple mixed Telugu-English. Never shame the user for spelling or transliteration.
SCOPE: Give general health education and triage support, not a definitive diagnosis. Say what is uncertain. Never claim "100% safe", "no danger", or that a disease is ruled out. Do not replace a clinician.
TRIAGE FIRST: First assess whether symptoms could be urgent. Ask concise follow-up questions only when safe to do so. Red flags include chest pain/pressure, severe or sudden breathing difficulty, stroke signs (face drooping, one-sided weakness, speech trouble), fainting/unconsciousness, seizure, severe bleeding, severe allergic reaction/swelling, blue/grey lips, sudden severe headache, confusion, poisoning/overdose, severe injury, pregnancy with severe pain/bleeding, and rapidly worsening symptoms. For these, tell the user to seek emergency care now and call India's emergency number 112 or local emergency services; do not delay with questions, home remedies, or medicine suggestions. Do not assert that an ambulance has been dispatched.
FEVER/COMMON SYMPTOMS: Ask age, duration, measured temperature, key symptoms, relevant conditions, allergies, pregnancy where relevant, and current medicines when needed. Provide hydration/rest and appropriate monitoring as general care. Do not prescribe antibiotics, steroids, or prescription-only medicines. Do not provide an individualized drug dose unless safe, appropriate, and supported by reliable context; if uncertain, direct them to a clinician/pharmacist. Children, infants, pregnancy, older adults, immunocompromised people, severe symptoms, persistent/worsening fever, or dehydration require extra caution and professional assessment. Never assume age or weight.
IMAGES/REPORTS: If an image is provided, describe only readable content. For lab reports, identify test names, values, units, reference ranges, flags and date when legible; explain that ranges vary by lab and a clinician must interpret results in context. Do not diagnose from a photo, do not infer missing values, and state when image quality is insufficient. For radiology scans, pathology slides, skin photos or prescriptions, do not claim definitive interpretation; recommend qualified clinician/radiologist review. Do not say an image is normal if it cannot be assessed reliably.
PRIVACY: Avoid requesting names, full addresses, ID numbers, or other unnecessary identifiers. Remind users not to upload unrelated personal information.
RESPONSE FORMAT: Briefly state urgency first, then explain in plain language, then give safe next steps and when to seek care. Never give false reassurance. `

const emergencyPatterns = [
  /\b(chest pain|chest pressure|tightness in (my )?chest|difficulty breathing|can't breathe|cannot breathe|severe breathlessness|unconscious|fainted|fainting|seizure|heavy bleeding|stroke|face droop|one[- ]sided weakness|overdose|poisoning|severe allergic reaction)\b/i,
  /(గుండె నొప్పి|ఛాతి నొప్పి|ఊపిరి ఆడటం లేదు|శ్వాస తీసుకోలేక|స్పృహ తప్ప|మూర్ఛ|ఎక్కువ రక్తస్రావం|ఒక వైపు బలహీనత)/,
  /(chest pain|gunde noppi|gundello noppi|oopiri aadatledu|oopiri teesukolekapothunna|kallu tirigi padipoya|spruha thappindi|spruha tappindi|fits vachayi|ekkuva bleeding|body lo oka vaipu weakness)/i,
]
const emergencyReply = `⚠️ Possible emergency / అత్యవసర పరిస్థితి కావచ్చు.

Chest pain, breathing difficulty, fainting or similar danger signs can be serious. Please call India's emergency number 112 now, or ask someone nearby to call and take you to the nearest emergency department. Do not drive yourself if dizzy or faint. Do not wait for this chat to assess you.

ఇది emergency కావచ్చు. వెంటనే 112 కి call చేయండి లేదా దగ్గరలో ఉన్న వ్యక్తి సహాయం తీసుకుని emergency department కి వెళ్లండి. ఈ chat ambulance dispatch చేయలేదు. If you can, stay with another person while help is arranged.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!authHeader || !supabaseUrl || !anonKey) return json({ error: 'Sign in and configure Supabase before using AI.' }, 401)

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) return json({ error: 'Your session is invalid or expired. Please sign in again.' }, 401)

  const apiKey = Deno.env.get('AI_API_KEY')
  if (!apiKey) return json({ error: 'AI is not configured yet. Set AI_API_KEY in Supabase Edge Function secrets.' }, 503)
  const baseUrl = (Deno.env.get('AI_API_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini'

  try {
    const body = await req.json()
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : null
    if (!messages.length || messages.some((m: { role?: string; content?: string }) =>
      !['user', 'assistant'].includes(m.role ?? '') || typeof m.content !== 'string' || m.content.length > 5000)) {
      return json({ error: 'Send up to 12 valid messages, with each message under 5,000 characters.' }, 400)
    }
    if (messages[messages.length - 1]?.role !== 'user') return json({ error: 'The last message must be from the user.' }, 400)
    if (imageDataUrl && (!/^data:image\/(png|jpeg|webp)\;base64,[A-Za-z0-9+/=]+$/.test(imageDataUrl) || imageDataUrl.length > 8_000_000)) {
      return json({ error: 'Upload a PNG, JPEG or WebP image smaller than about 6 MB.' }, 400)
    }

    // Handle obvious red flags before model generation: never let a slow or failed model delay emergency advice.
    const latestText = messages[messages.length - 1].content
    if (emergencyPatterns.some((pattern) => pattern.test(latestText))) {
      return json({ answer: emergencyReply, triage: 'emergency', emergency_number: '112' })
    }

    const modelMessages = messages.map((m: { role: 'user' | 'assistant'; content: string }, index: number) => {
      if (index === messages.length - 1 && imageDataUrl) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content || 'Please explain what is visibly readable in this medical image. Do not diagnose or guess unreadable details.' },
            { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          ],
        }
      }
      return m
    })

    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, temperature: 0.2, max_tokens: 900,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...modelMessages],
      }),
    })
    if (!response.ok) {
      const detail = await response.text()
      console.error('AI provider error', response.status, detail.slice(0, 400))
      return json({ error: 'AI provider request failed. Check the provider key, model, and quota.' }, 502)
    }
    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content
    if (typeof answer !== 'string' || !answer.trim()) return json({ error: 'The AI provider returned an empty response.' }, 502)
    return json({ answer, triage: 'general' })
  } catch (error) {
    console.error('ai-chat error', error)
    return json({ error: 'Could not process the message. Please try again.' }, 500)
  }
})
