import assert from 'node:assert/strict'
import test from 'node:test'
import { Webhook } from 'svix'
import { ResendError, verifyResendWebhook } from '../server/integrations/resend.js'

test('Resend webhook verification accepts the exact signed raw payload', () => {
  const previous = process.env.RESEND_WEBHOOK_SECRET
  const secret = `whsec_${Buffer.from('test-webhook-secret-at-least-thirty-two-characters').toString('base64')}`
  process.env.RESEND_WEBHOOK_SECRET = secret
  try {
    const payload = JSON.stringify({ type: 'email.received', data: { email_id: 'email-1' } })
    const timestamp = new Date()
    const webhook = new Webhook(secret)
    const headers = {
      'svix-id': 'msg_test_123',
      'svix-timestamp': String(Math.floor(timestamp.getTime() / 1000)),
      'svix-signature': webhook.sign('msg_test_123', timestamp, payload),
    }
    assert.deepEqual(verifyResendWebhook(payload, headers), JSON.parse(payload))
    assert.throws(() => verifyResendWebhook(`${payload} `, headers), ResendError)
  } finally {
    if (previous === undefined) delete process.env.RESEND_WEBHOOK_SECRET
    else process.env.RESEND_WEBHOOK_SECRET = previous
  }
})
