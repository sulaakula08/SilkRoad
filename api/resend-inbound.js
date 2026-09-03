import { processFounderReply, FounderReplyProcessingError } from '../server/founder-replies/workflow.js'
import { readRawBody, sendJson } from '../server/http.js'
import { ResendError, verifyResendWebhook } from '../server/integrations/resend.js'

const MAX_WEBHOOK_BYTES = 1_000_000

function validateReceivedEvent(event) {
  const data = event?.data
  if (
    event?.type !== 'email.received' ||
    !data ||
    typeof data.email_id !== 'string' ||
    typeof data.from !== 'string' ||
    !Array.isArray(data.to)
  ) {
    throw new ResendError('Invalid email.received event.', {
      statusCode: 400,
      retryable: false,
    })
  }
  return data
}

export async function resendInboundHandler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  let event
  try {
    const rawBody = await readRawBody(req, MAX_WEBHOOK_BYTES)
    event = verifyResendWebhook(rawBody, req.headers)
  } catch (error) {
    const statusCode = error?.statusCode || 400
    return sendJson(res, statusCode, { error: statusCode === 413 ? 'Payload too large.' : 'Invalid webhook.' })
  }

  if (event?.type !== 'email.received') return sendJson(res, 200, { ok: true, ignored: true })

  try {
    const result = await processFounderReply(validateReceivedEvent(event))
    return sendJson(res, 200, { ok: true, status: result.status })
  } catch (error) {
    console.error('Founder reply processing failed:', error?.message || error)
    const retryable = error instanceof FounderReplyProcessingError
    return sendJson(res, retryable ? error.statusCode : 500, {
      error: 'Founder reply processing failed.',
      retryable,
    })
  }
}

export const config = { api: { bodyParser: false } }
export default resendInboundHandler
