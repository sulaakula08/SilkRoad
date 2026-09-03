const API_URL = 'https://api.anthropic.com/v1/messages'
const REQUEST_TIMEOUT_MS = 30_000

export class AnthropicError extends Error {
  constructor(message, { statusCode = 502, providerStatus = 0, detail = '' } = {}) {
    super(message)
    this.name = 'AnthropicError'
    this.statusCode = statusCode
    this.providerStatus = providerStatus
    this.detail = detail
  }
}

export async function requestStructuredOutput({
  model,
  schema,
  system,
  user,
  maxTokens,
  apiKey = process.env.ANTHROPIC_API_KEY,
}) {
  if (!apiKey) throw new AnthropicError('Anthropic is not configured.', { statusCode: 503 })

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        thinking: { type: 'disabled' },
        output_config: { format: { type: 'json_schema', schema } },
        system,
        messages: [{ role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const message = error?.name === 'TimeoutError' ? 'Anthropic timed out.' : 'Could not reach Anthropic.'
    throw new AnthropicError(message)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AnthropicError('Anthropic rejected the request.', {
      providerStatus: response.status,
      detail: String(data?.error?.message || '').slice(0, 500),
    })
  }

  const text = Array.isArray(data?.content)
    ? data.content.find((block) => block?.type === 'text')?.text
    : ''
  try {
    return JSON.parse(text || '')
  } catch {
    throw new AnthropicError('Anthropic returned unreadable structured output.')
  }
}
