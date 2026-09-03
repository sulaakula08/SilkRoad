import { Webhook, WebhookVerificationError } from 'svix'

const RESEND_API = 'https://api.resend.com'
const REQUEST_TIMEOUT_MS = 10_000
const ATTACHMENT_TIMEOUT_MS = 30_000

export class ResendError extends Error {
  constructor(message, { statusCode = 502, providerStatus = 0, retryable = true } = {}) {
    super(message)
    this.name = 'ResendError'
    this.statusCode = statusCode
    this.providerStatus = providerStatus
    this.retryable = retryable
  }
}

async function resendRequest(path, { method = 'GET', body, timeout = REQUEST_TIMEOUT_MS } = {}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new ResendError('Resend is not configured.', { statusCode: 503 })

  let response
  try {
    response = await fetch(`${RESEND_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        'User-Agent': 'silkroad-angels/1.0',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(timeout),
    })
  } catch (error) {
    const message = error?.name === 'TimeoutError' ? 'Resend timed out.' : 'Could not reach Resend.'
    throw new ResendError(message)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ResendError(String(data?.message || `Resend rejected the request (${response.status}).`).slice(0, 500), {
      providerStatus: response.status,
      retryable: response.status === 408 || response.status === 429 || response.status >= 500,
    })
  }
  return data
}

export function verifyResendWebhook(rawBody, headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) throw new ResendError('Resend webhook verification is not configured.', { statusCode: 503 })

  try {
    return new Webhook(secret).verify(rawBody, {
      'svix-id': String(headers['svix-id'] || ''),
      'svix-timestamp': String(headers['svix-timestamp'] || ''),
      'svix-signature': String(headers['svix-signature'] || ''),
    })
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      throw new ResendError('Invalid Resend webhook signature.', {
        statusCode: 400,
        retryable: false,
      })
    }
    throw error
  }
}

export async function sendEmail({ to, subject, text, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.APPLICATION_EMAIL_FROM
  if (!apiKey && !from) return false
  if (!apiKey || !from) {
    throw new ResendError('Email notifications require RESEND_API_KEY and APPLICATION_EMAIL_FROM.', {
      statusCode: 503,
    })
  }

  return resendRequest('/emails', {
    method: 'POST',
    body: {
      from,
      to: [to],
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    },
  })
}

export function retrieveReceivedEmail(emailId) {
  return resendRequest(`/emails/receiving/${encodeURIComponent(emailId)}`)
}

function validateAttachmentDownloadUrl(value) {
  const url = new URL(String(value || ''))
  const trustedHost = url.hostname.endsWith('.resend.com') || url.hostname.endsWith('.cloudfront.net')
  if (url.protocol !== 'https:' || !trustedHost) {
    throw new ResendError('Resend returned an invalid attachment URL.', { retryable: false })
  }
  return url.toString()
}

export async function downloadReceivedAttachment(emailId, attachmentId, maxBytes) {
  const metadata = await resendRequest(
    `/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,
  )
  const size = Number(metadata?.size) || 0
  if (size > maxBytes) return { ...metadata, tooLarge: true, bytes: null }

  const downloadUrl = validateAttachmentDownloadUrl(metadata?.download_url)
  let response
  try {
    response = await fetch(downloadUrl, { signal: AbortSignal.timeout(ATTACHMENT_TIMEOUT_MS) })
  } catch (error) {
    const message = error?.name === 'TimeoutError'
      ? 'The attachment download timed out.'
      : 'Could not download the attachment.'
    throw new ResendError(message)
  }
  if (!response.ok) throw new ResendError(`Attachment download failed (${response.status}).`)

  const bytes = await response.arrayBuffer()
  if (bytes.byteLength > maxBytes) return { ...metadata, tooLarge: true, bytes: null }
  return { ...metadata, size: bytes.byteLength, tooLarge: false, bytes }
}
