const TELEGRAM_API = 'https://api.telegram.org'
const REQUEST_TIMEOUT_MS = 5_000

export async function sendTelegramMessage({ text, action }) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token && !chatId) return false
  if (!token || !chatId) throw new Error('Telegram notifications require both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.')

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      link_preview_options: { is_disabled: true },
      reply_markup: {
        inline_keyboard: [[{ text: action.label, url: action.url }]],
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`Telegram rejected the notification (${response.status}).`)
  return true
}
