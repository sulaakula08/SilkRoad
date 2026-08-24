const RESEND_API = 'https://api.resend.com/emails'
const REQUEST_TIMEOUT_MS = 5_000

export async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.APPLICATION_EMAIL_FROM
  if (!apiKey && !from) return false
  if (!apiKey || !from) {
    throw new Error('Email notifications require both RESEND_API_KEY and APPLICATION_EMAIL_FROM.')
  }

  const response = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'silkroad-angels/1.0',
    },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`Resend rejected the email (${response.status}).`)
  return true
}
