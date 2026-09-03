import { createReplyAddress } from '../founder-replies/correlation.js'
import { sendEmail } from '../integrations/resend.js'

const COPY = {
  en: {
    subject: (company) => `A quick follow-up on your ${company} application`,
    greeting: (name) => `Hi ${name},`,
    intro: (company) =>
      `Thank you for applying to Silkroad Angels. To help our team review ${company}, please reply to this email with:`,
    reply: 'You do not need to submit another application. Just reply here with the details.',
    signoff: 'Best,\nSilkroad Angels',
  },
  ru: {
    subject: (company) => `Уточнения по заявке ${company}`,
    greeting: (name) => `Здравствуйте, ${name}!`,
    intro: (company) =>
      `Спасибо за заявку в Silkroad Angels. Чтобы наша команда могла полнее рассмотреть ${company}, ответьте на это письмо и уточните:`,
    reply: 'Повторно отправлять заявку не нужно. Просто ответьте на это письмо.',
    signoff: 'С уважением,\nSilkroad Angels',
  },
}

const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }
const escapeHtml = (value) =>
  String(value).replace(/[&<>'"]/g, (character) => HTML_ENTITIES[character])

export function createFounderFollowUpEmail({ lang, name, company, email, missingItems }) {
  const copy = COPY[lang]
  const bullets = missingItems.map((item) => `- ${item}`).join('\n')
  const text = [
    copy.greeting(name),
    '',
    copy.intro(company),
    '',
    bullets,
    '',
    copy.reply,
    '',
    copy.signoff,
  ].join('\n')
  const list = missingItems
    .map(
      (item) =>
        `<li style="margin:0 0 10px;padding-left:4px;color:#24384c;line-height:1.55">${escapeHtml(item)}</li>`,
    )
    .join('')

  const html = `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;background:#f4f7f2;font-family:Arial,sans-serif;color:#00203f">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(copy.subject(company))}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f2">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe6e1;border-radius:16px">
            <tr><td style="height:6px;background:#08ccc3;border-radius:16px 16px 0 0"></td></tr>
            <tr>
              <td style="padding:36px 40px">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.55">${escapeHtml(copy.greeting(name))}</p>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.55;color:#24384c">${escapeHtml(copy.intro(company))}</p>
                <ul style="margin:0 0 24px;padding-left:22px">${list}</ul>
                <p style="margin:0 0 28px;font-size:15px;line-height:1.55;color:#526273">${escapeHtml(copy.reply)}</p>
                <p style="margin:0;font-size:15px;line-height:1.55;white-space:pre-line">${escapeHtml(copy.signoff)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { to: email, subject: copy.subject(company), text, html }
}

export async function notifyFounderFollowUp(application, { pageId }) {
  const screening = application.type === 'founder' ? application.screening : null
  if (!screening?.needsFollowUp || !screening.missingItems.length) return false

  try {
    let replyTo
    try {
      replyTo = createReplyAddress(pageId)
    } catch (error) {
      console.warn(
        'Founder reply automation is unavailable; sending follow-up email without reply tracking:',
        error?.message || error,
      )
    }

    return await sendEmail({
      ...createFounderFollowUpEmail({
        lang: application.lang,
        name: application.name,
        company: application.company,
        email: application.email,
        missingItems: screening.missingItems,
      }),
      ...(replyTo ? { replyTo } : {}),
    })
  } catch (error) {
    console.warn('Could not send founder follow-up email:', error?.message || error)
    return false
  }
}
