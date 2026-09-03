/**
 * AI screening for startup applications.
 *
 * Takes a founder submission and asks Claude to return a STRUCTURED verdict:
 * auto-tagged sectors, normalized stage, an investability score, a readiness
 * verdict, strengths, concrete improvement advice, and matched investor theses.
 * Uses Claude's structured outputs (json_schema) so the shape is guaranteed —
 * no fragile parsing.
 *
 * Same deployment story as api/chat.js: the API key lives here, server-side,
 * never in the browser. Node (req,res) handler → Vite middleware in dev, Vercel
 * function in prod.
 */

import { AnthropicError, requestStructuredOutput } from '../server/integrations/anthropic.js'

const MODEL = process.env.ANTHROPIC_SCREEN_MODEL || process.env.ANTHROPIC_MODEL || 'claude-opus-5'

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
    flags: {
      type: 'array',
      items: { type: 'string' },
      description: '1–3 concrete, actionable things the founder should improve, requested language',
    },
    matchedTheses: { type: 'array', items: { type: 'string', enum: THESES }, description: 'Investor theses this fits' },
    needsFollowUp: {
      type: 'boolean',
      description: 'Whether material information is missing for an informed investment review',
    },
    missingItems: {
      type: 'array',
      items: { type: 'string' },
      description: 'Up to 5 concise requests for material missing information, requested language',
    },
  },
  required: [
    'sectors',
    'stage',
    'score',
    'verdict',
    'summary',
    'strengths',
    'flags',
    'matchedTheses',
    'needsFollowUp',
    'missingItems',
  ],
  additionalProperties: false,
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

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Screening is not configured (ANTHROPIC_API_KEY missing).' }))
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

  // Text extracted from an uploaded PDF/PPTX deck, if the founder attached one.
  const deckText = clean(s.deckText, 12_000).trim()
  const application = deckText ? `${brief}\n\nDECK CONTENTS (extracted):\n${deckText}` : brief

  if (!clean(s.description).trim() && !clean(s.company).trim()) {
    res.statusCode = 400
    return res.end(JSON.stringify({ error: 'Not enough information to screen.' }))
  }

  const system = `
You are the screening analyst for the Silkroad Angels Club — a private angel
club investing in early-stage Silicon Valley startups (min $10k per deal),
connected to founders across Central Eurasia. Screen the application below.

Be sharp, fair and concrete. Base everything ONLY on what the founder wrote —
never invent metrics or facts. If information is thin, say so and keep the
score modest; do not reward vagueness.

Scoring (0–100) reflects fit + potential for an early-stage SV angel:
  80–100 strong · 60–79 promising · 40–59 early · 0–39 weak.
The "verdict" is the readiness call: strong = ready to raise, promising =
almost there, early = too early, weak = not ready. Pick it honestly from the
evidence — it, plus "summary", is the founder's "are we ready or not" answer.

"summary" is ONE sentence that states plainly whether the startup is
investable-ready yet and why (e.g. "Ready — clear traction and a focused team"
or "Not yet — an idea without validation or a team").

"flags" is the improvement advice shown under the heading "What you should
improve". Each item must be actionable and specific — name the thing to fix,
add or prove (e.g. "Show traction: users, revenue or pilots"), never a bare
verdict like "too early" or "not enough information".

Separately, decide whether the team needs material follow-up information before
it can make an informed investment review. Check the available application
against this fixed rubric:
  - company purpose, customer problem and target customer
  - product / solution and current product status
  - market opportunity and why now
  - business model
  - traction, or stage-appropriate validation for an idea-stage company
  - founding team and relevant experience / advantage
  - competitors / alternatives and differentiation
  - funding ask, use of funds and next milestones

Be stage-aware: do not ask an idea-stage company for revenue it cannot yet have;
ask for validation evidence or planned milestones instead. Set needsFollowUp to
true only when decision-relevant information from that rubric is absent or too
vague. missingItems must then contain 1–5 concise, specific requests in
${lang}. Do not repeat information already supplied, request a deck/file, or
comment on whether a deck URL or file could be accessed. If the information is
sufficient, set needsFollowUp to false and missingItems to [].

Write summary, strengths and flags in ${lang}. Keep every string tight
(strengths/flags: max ~12 words each). Return ONLY the JSON object.
`.trim()

  let result
  try {
    result = await requestStructuredOutput({
      apiKey: key,
      model: MODEL,
      schema: SCHEMA,
      system,
      user: `APPLICATION\n${application}`,
      maxTokens: 1200,
    })
  } catch (error) {
    const status = error instanceof AnthropicError ? error.providerStatus : 0
    const detail = error instanceof AnthropicError ? error.detail : ''
    let msg = 'The screening model returned an error.'
    if (status === 401 || status === 403) msg = 'The Anthropic API key was rejected.'
    else if (status === 404) msg = `Model "${MODEL}" is unavailable. Set ANTHROPIC_MODEL.`
    else if (status === 400 && /credit|billing/i.test(detail)) msg = 'The Anthropic account has no available credit.'
    else if (status === 429) msg = 'Rate limited — try again in a moment.'
    else if (error instanceof AnthropicError && !status) msg = error.message
    res.statusCode = status === 429 ? 429 : 502
    return res.end(JSON.stringify({ error: msg }))
  }

  // Clamp / sanitise before returning.
  result.score = Math.max(0, Math.min(100, Number(result.score) || 0))
  result.sectors = (result.sectors || []).filter((x) => SECTORS.includes(x)).slice(0, 3)
  if (!STAGES.includes(result.stage)) result.stage = 'Pre-seed'
  if (!VERDICTS.includes(result.verdict)) result.verdict = 'early'
  result.matchedTheses = (result.matchedTheses || []).filter((x) => THESES.includes(x)).slice(0, 4)
  result.strengths = (result.strengths || []).slice(0, 3)
  result.flags = (result.flags || []).slice(0, 3)
  result.missingItems = (result.missingItems || [])
    .map((item) => clean(item, 500).trim())
    .filter(Boolean)
    .slice(0, 5)
  result.needsFollowUp = Boolean(result.needsFollowUp && result.missingItems.length)

  res.statusCode = 200
  res.end(JSON.stringify({ result }))
}

export default screenHandler
