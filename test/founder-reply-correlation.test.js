import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CorrelationError,
  createReplyAddress,
  normalizeEmailAddress,
  resolveReplyPageId,
} from '../server/founder-replies/correlation.js'

const SECRET = 'test-secret-with-at-least-thirty-two-characters'
const PAGE_ID = '0123456789abcdef0123456789abcdef'
const REPLY_EMAIL = 'replies@inbound.example.com'

test('signed reply address resolves to the original Notion page', () => {
  const address = createReplyAddress(PAGE_ID, { email: REPLY_EMAIL, secret: SECRET })
  assert.equal(resolveReplyPageId([address], { email: REPLY_EMAIL, secret: SECRET }), PAGE_ID)
})

test('tampered reply tokens are rejected', () => {
  const address = createReplyAddress(PAGE_ID, { email: REPLY_EMAIL, secret: SECRET })
  const [local, domain] = address.split('@')
  const last = local.at(-1)
  const tampered = `${local.slice(0, -1)}${last === 'a' ? 'b' : 'a'}@${domain}`
  assert.throws(
    () => resolveReplyPageId([tampered], { email: REPLY_EMAIL, secret: SECRET }),
    CorrelationError,
  )
})

test('display-name email addresses normalize before authorization', () => {
  assert.equal(normalizeEmailAddress('Founder <Founder@Example.com>'), 'founder@example.com')
})
