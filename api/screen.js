/**
 * AI screening for startup applications.
 *
 * Takes a founder submission and asks Gemini to return a STRUCTURED verdict:
 * auto-tagged sectors, normalized stage, an investability score, strengths,
 * risks/flags, matched investor theses, and a recommended track. Uses Gemini's
 * JSON mode (responseSchema) so the shape is guaranteed — no fragile parsing.
 *
 * Same deployment story as api/chat.js: the API key lives here, server-side,
 * never in the browser. Node (req,res) handler → Vite middleware in dev, Vercel
 * function in prod.
 */

const MODEL = process.env.GEMINI_SCREEN_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const SECTORS = [
  'AI & infrastructure',
  'Fintech',
  'B2B software',
  'Health & bio',
  'Climate & energy',
  'Consumer',
  'Deep tech',
  'Logistics & trade',
  'Other',
]
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A']
const VERDICTS = ['strong', 'promising', 'early', 'weak']
const TRACKS = ['Fast track', 'Standard review', 'Corridor review', 'Too early']
const THESES = [
  'AI-native products',
  'B2B SaaS with revenue',
  'Deep tech / frontier',
  'Fintech & financial infrastructure',
  'Healthcare & bio',
  'Climate & energy',
  'Consumer & marketplaces',
]

const SCHEMA = {
  type: 'object',
  properties: {
    sectors: { type: 'array', items: { type: 'string', enum: SECTORS }, description: '1–3 best-fit sectors' },
    stage: { type: 'string', enum: STAGES },
    score: { type: 'integer', description: '0–100 investability for an early-stage SV angel club' },
    verdict: { type: 'string', enum: VERDICTS },
    summary: { type: 'string', description: 'One neutral sentence, in the requested language' },
    strengths: { type: 'array', items: { type: 'string' }, description: '2–3 short points, requested language' },
    flags: { type: 'array', items: { type: 'string' }, description: '1–3 risks or things to verify, requested language' },
    matchedTheses: { type: 'array', items: { type: 'string', enum: THESES }, description: 'Investor theses this fits' },
    recommendation: { type: 'string', enum: TRACKS },
    rationale: { type: 'string', description: 'One sentence on the recommendation, requested language' },
  },
  required: ['sectors', 'stage', 'score', 'verdict', 'summary', 'strengths', 'flags', 'matchedTheses', 'recommendation', 'rationale'],
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 100_000) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('bad json'))
      }
    })
    req.on('error', reject)
  })
}

const clean = (s, n = 4000) => String(s ?? '').slice(0, n)

export async function screenHandler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Screening is not configured (GEMINI_API_KEY missing).' }))
  }

  let body
  try {
    body = await readBody(req)
  } catch {
    res.statusCode = 400
    return res.end(JSON.stringify({ error: 'Bad request.' }))
  }

  const s = body.submission || {}
  const lang = body.lang === 'ru' ? 'Russian' : 'English'

  // Build a compact application brief for the model.
  const brief = [
    `Company: ${clean(s.company, 200)}`,
    `One-liner / description: ${clean(s.description, 3000)}`,
    `Self-reported stage: ${clean(s.stage, 60)}`,
    `Raising: ${clean(s.raising, 60)}`,
    `Website: ${clean(s.website, 300)}`,
    `Pitch deck: ${clean(s.deck, 300)}`,
  ]
    .filter((l) => !l.endsWith(': '))
    .join('\n')

  if (!clean(s.description).trim() && !clean(s.company).trim()) {
    res.statusCode = 400
    return res.end(JSON.stringify({ error: 'Not enough information to screen.' }))
  }

  const system = `
You are the screening analyst for the Silkroad Angels Club — a private angel
club investing in early-stage Silicon Valley startups (min $10k per deal),
connected to founders across Central Eurasia. Screen the application below.

Be sharp, fair and concrete. Base everything ONLY on what the founder wrote —
never invent metrics or facts. If information is thin, say so in the flags and
keep the score modest; do not reward vagueness.

Scoring (0–100) reflects fit + potential for an early-stage SV angel:
  80–100 strong · 60–79 promising · 40–59 early · 0–39 weak.

Recommendation guide:
  "Too early"        — idea stage, no product.
  "Corridor review"  — real product/traction but clearly non-US / regional-only setup.
  "Fast track"       — seed/Series A with a product and a real signal.
  "Standard review"  — everything else worth a look.

Write summary, strengths, flags and rationale in ${lang}. Keep every string
tight (strengths/flags: max ~12 words each). Return ONLY the JSON object.
`.trim()

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: `APPLICATION\n${brief}` }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 900,
      responseMimeType: 'application/json',
      responseSchema: SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
  let up
  try {
    up = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload),
    })
  } catch {
    res.statusCode = 502
    return res.end(JSON.stringify({ error: 'Could not reach the model.' }))
  }

  const data = await up.json().catch(() => null)
  if (!up.ok) {
    const detail = data?.error?.message || ''
    let msg = 'The screening model returned an error.'
    if (up.status === 400 && /API key not valid/i.test(detail)) msg = 'The Gemini API key is not valid.'
    else if (up.status === 401 || up.status === 403) msg = 'The Gemini key was rejected (unauthorized).'
    else if (up.status === 404) msg = `Model "${MODEL}" is unavailable. Set GEMINI_MODEL.`
    else if (up.status === 429) msg = 'Rate limited — try again in a moment.'
    res.statusCode = up.status === 429 ? 429 : 502
    return res.end(JSON.stringify({ error: msg }))
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
  let result
  try {
    result = JSON.parse(text)
  } catch {
    res.statusCode = 502
    return res.end(JSON.stringify({ error: 'The screening result could not be read.' }))
  }

  // Clamp / sanitise before returning.
  result.score = Math.max(0, Math.min(100, Number(result.score) || 0))
  result.sectors = (result.sectors || []).filter((x) => SECTORS.includes(x)).slice(0, 3)
  if (!STAGES.includes(result.stage)) result.stage = 'Pre-seed'
  if (!VERDICTS.includes(result.verdict)) result.verdict = 'early'
  if (!TRACKS.includes(result.recommendation)) result.recommendation = 'Standard review'
  result.matchedTheses = (result.matchedTheses || []).filter((x) => THESES.includes(x)).slice(0, 4)
  result.strengths = (result.strengths || []).slice(0, 3)
  result.flags = (result.flags || []).slice(0, 3)

  res.statusCode = 200
  res.end(JSON.stringify({ result }))
}

export default screenHandler
