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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!authHeader || !supabaseUrl || !anonKey) return json({ error: 'Sign in and configure Supabase before using AI.' }, 401)

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false, autoRefreshToken: false } })
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) return json({ error: 'Your session is invalid or expired. Please sign in again.' }, 401)

  const apiKey = Deno.env.get('AI_API_KEY')
  if (!apiKey) return json({ error: 'AI is not configured yet. Set AI_API_KEY in Supabase Edge Function secrets.' }, 503)
  const baseUrl = (Deno.env.get('AI_API_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini'

  try {
    const body = await req.json()
    const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : []
    if (!messages.length || messages.some((m: { role?: string; content?: string }) => !['user', 'assistant'].includes(m.role ?? '') || typeof m.content !== 'string' || m.content.length > 5000)) {
      return json({ error: 'Send up to 12 valid messages, with each message under 5,000 characters.' }, 400)
    }
    if (messages[messages.length - 1]?.role !== 'user') return json({ error: 'The last message must be from the user.' }, 400)

    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, temperature: 0.3, max_tokens: 700,
        messages: [
          { role: 'system', content: 'You are CareLink.AI, a cautious healthcare information assistant. Provide general educational information, not a diagnosis or prescription. Encourage a licensed clinician for personal medical decisions. If symptoms suggest an emergency (chest pain, severe breathing difficulty, stroke signs, heavy bleeding, unconsciousness), tell the user to contact local emergency services immediately. Do not claim to have checked live hospital availability or medical records unless explicitly supplied. Do not ask users to share unnecessary sensitive personal data.' },
          ...messages,
        ],
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
    return json({ answer })
  } catch (error) {
    console.error('ai-chat error', error)
    return json({ error: 'Could not process the message. Please try again.' }, 500)
  }
})
