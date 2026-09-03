import { createHmac, timingSafeEqual } from 'node:crypto'

const EMAIL = /^[^\s@]+@[^\s@]+$/
const TOKEN = /^p\.([a-f0-9]{32})\.([a-f0-9]{16})$/

export class CorrelationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CorrelationError'
  }
}

export function normalizeEmailAddress(value) {
  const text = String(value || '').trim()
  const bracketed = text.match(/<([^<>]+)>$/)?.[1]
  return String(bracketed || text).trim().toLowerCase()
}

function signingSecret(value = process.env.FOUNDER_REPLY_SIGNING_SECRET) {
  const secret = String(value || '')
  if (secret.length < 32) {
    throw new CorrelationError('FOUNDER_REPLY_SIGNING_SECRET must contain at least 32 characters.')
  }
  return secret
}

function signature(payload, secret) {
  return createHmac('sha256', signingSecret(secret))
    .update(`p.${payload}`)
    .digest('hex')
    .slice(0, 16)
}

function replyMailbox(value = process.env.FOUNDER_REPLY_EMAIL) {
  const email = normalizeEmailAddress(value)
  if (!EMAIL.test(email)) throw new CorrelationError('FOUNDER_REPLY_EMAIL must be a valid email address.')
  const [local, domain] = email.split('@')
  if (local.includes('+')) throw new CorrelationError('FOUNDER_REPLY_EMAIL cannot contain plus addressing.')
  return { local, domain }
}

export function createReplyToken(pageId, secret) {
  const normalizedPageId = String(pageId || '').replaceAll('-', '').toLowerCase()
  if (!/^[a-f0-9]{32}$/.test(normalizedPageId)) {
    throw new CorrelationError('Invalid Notion page ID.')
  }
  return `p.${normalizedPageId}.${signature(normalizedPageId, secret)}`
}

export function createReplyAddress(pageId, { email, secret } = {}) {
  const mailbox = replyMailbox(email)
  const local = `${mailbox.local}+${createReplyToken(pageId, secret)}`
  if (local.length > 64) throw new CorrelationError('FOUNDER_REPLY_EMAIL local part is too long for signed replies.')
  return `${local}@${mailbox.domain}`
}

export function resolveReplyPageId(recipients, { email, secret } = {}) {
  const mailbox = replyMailbox(email)
  const addresses = Array.isArray(recipients) ? recipients.map(normalizeEmailAddress) : []
  const prefix = `${mailbox.local}+`
  const suffix = `@${mailbox.domain}`
  const address = addresses.find((item) => item.startsWith(prefix) && item.endsWith(suffix))
  if (!address) throw new CorrelationError('The reply address is not linked to an application.')

  const token = address.slice(prefix.length, -suffix.length)
  const match = token.match(TOKEN)
  if (!match) throw new CorrelationError('The reply token is malformed.')
  const [, payload, providedSignature] = match
  const expectedSignature = signature(payload, secret)
  const actual = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new CorrelationError('The reply token is invalid.')
  }
  return payload
}
