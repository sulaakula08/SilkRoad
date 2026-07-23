/**
 * Server-side Gemini proxy.
 *
 * Why this exists: the site is a static bundle. Any API key placed in client
 * code ships to every visitor. So the browser talks to THIS endpoint, and only
 * this endpoint — running on the server — holds the key (from an env var, never
 * committed). It streams the model's reply back as Server-Sent Events.
 *
 * One Node (req, res) handler, used in two places:
 *   • local dev  — mounted as Vite middleware (see vite.config.ts)
 *   • production — dropped in as a Vercel Node serverless function at /api/chat
 *
 * The system prompt lives in the client source (src/chat/knowledge.ts) and is
 * sent with each request. That's fine: it isn't secret. The KEY is the secret,
 * and it stays here.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

// Guard the public endpoint against obvious abuse. The key is server-side, but
// the URL is not — anyone can POST to it, so cap what we forward upstream.
const MAX_MESSAGES = 24
const MAX_CHARS = 6000
const MAX_OUTPUT_TOKENS = 800

function readBody(req) {
  // Vercel's Node runtime may pre-parse JSON; the Vite dev middleware does not.
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => {
      raw += c
      if (raw.length > 200_000) req.destroy() // ~200KB hard stop
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

/** Coerce the client's messages into Gemini's `contents` shape, safely. */
function toContents(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content ?? '').slice(0, MAX_CHARS) }],
    }))
    .filter((c) => c.parts[0].text.trim().length > 0)
}

export async function chatHandler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(
      JSON.stringify({
        error:
          'The assistant is not configured. Set GEMINI_API_KEY in .env.local (dev) or your host’s environment (prod).',
      }),
    )
  }

  let body
  try {
    body = await readBody(req)
  } catch {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Bad request body.' }))
  }

  const contents = toContents(body.messages)
  const system = typeof body.system === 'string' ? body.system : undefined
  if (contents.length === 0) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'No message to answer.' }))
  }

  // Both the classic AI Studio key ("AIza…") and the newer format ("AQ.…")
  // authenticate as API keys via this header. (Bearer is only for OAuth access
  // tokens, which these are not.)
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': key }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`

  const payload = {
    contents,
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      // Gemini 2.5+ flash models "think" before answering, which for a FAQ bot
      // just burns latency and the token budget (leaving replies empty). Turn it
      // off for fast, direct answers. Supported on 2.5-flash; some models ignore
      // or reject it — override GEMINI_MODEL and this together if you change it.
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: [
      'HARM_CATEGORY_HARASSMENT',
      'HARM_CATEGORY_HATE_SPEECH',
      'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      'HARM_CATEGORY_DANGEROUS_CONTENT',
    ].map((category) => ({ category, threshold: 'BLOCK_ONLY_HIGH' })),
  }

  let upstream
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  } catch {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Could not reach the model.' }))
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    res.statusCode = upstream.status === 429 ? 429 : 502
    res.setHeader('Content-Type', 'application/json')
    // Surface a useful hint for the two most common misconfigurations.
    let msg = 'The model returned an error.'
    if (upstream.status === 400 && /API key not valid/i.test(detail))
      msg = 'The Gemini API key is not valid. Check GEMINI_API_KEY.'
    else if (upstream.status === 401 || upstream.status === 403)
      msg = 'The Gemini key was rejected (unauthorized). Check the key and its permissions.'
    else if (upstream.status === 404 && /no longer available|not found/i.test(detail))
      msg = `Model "${MODEL}" isn’t available. Set GEMINI_MODEL to a current one (e.g. gemini-flash-latest).`
    else if (upstream.status === 429)
      msg = 'The assistant is over its rate limit right now. Try again in a moment.'
    return res.end(JSON.stringify({ error: msg }))
  }

  // Stream: relay text deltas to the client as our own SSE.
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`)

  try {
    const decoder = new TextDecoder()
    let buffer = ''
    for await (const chunk of upstream.body) {
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? '' // keep the trailing partial line
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const json = trimmed.slice(5).trim()
        if (!json || json === '[DONE]') continue
        try {
          const parsed = JSON.parse(json)
          const parts = parsed?.candidates?.[0]?.content?.parts
          if (Array.isArray(parts)) {
            const text = parts.map((p) => p.text || '').join('')
            if (text) send({ text })
          }
        } catch {
          // partial / unparseable chunk — ignore; the next flush completes it
        }
      }
    }
  } catch {
    send({ error: 'The reply was interrupted.' })
  }

  res.write('data: [DONE]\n\n')
  res.end()
}

export default chatHandler
