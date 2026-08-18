/**
 * Server-side Claude (Anthropic) proxy.
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

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5'
const API_URL = 'https://api.anthropic.com/v1/messages'

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

/** Coerce the client's messages into Anthropic's `messages` shape, safely. */
function toMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? '').slice(0, MAX_CHARS),
    }))
    .filter((m) => m.content.trim().length > 0)
}

export async function chatHandler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(
      JSON.stringify({
        error:
          'The assistant is not configured. Set ANTHROPIC_API_KEY in .env.local (dev) or your host’s environment (prod).',
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

  const messages = toMessages(body.messages)
  const system = typeof body.system === 'string' ? body.system : undefined
  if (messages.length === 0) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'No message to answer.' }))
  }

  const payload = {
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    // A FAQ bot wants fast, direct answers, not a chain of thought — disabling
    // thinking keeps latency and the token budget down.
    thinking: { type: 'disabled' },
    stream: true,
    ...(system ? { system } : {}),
    messages,
  }

  let upstream
  try {
    upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
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
    let msg = 'The model returned an error.'
    if (upstream.status === 401 || upstream.status === 403)
      msg = 'The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.'
    else if (upstream.status === 404)
      msg = `Model "${MODEL}" isn’t available. Set ANTHROPIC_MODEL to a current one (e.g. claude-opus-5).`
    else if (upstream.status === 400 && /credit|billing/i.test(detail))
      msg = 'The Anthropic account has no available credit.'
    else if (upstream.status === 429)
      msg = 'The assistant is over its rate limit right now. Try again in a moment.'
    return res.end(JSON.stringify({ error: msg }))
  }

  // Stream: relay Claude's text deltas to the client as our own SSE, so the
  // existing client (src/chat/useChat.ts) stays unchanged.
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
          const evt = JSON.parse(json)
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            if (evt.delta.text) send({ text: evt.delta.text })
          } else if (evt.type === 'message_delta' && evt.delta?.stop_reason === 'refusal') {
            send({ text: '\n\n(The assistant declined to continue that reply.)' })
          } else if (evt.type === 'error') {
            send({ error: 'The reply was interrupted.' })
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
