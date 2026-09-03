import { sendTelegramMessage } from './telegram.js'

const compact = (value, max = 300) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)

const notionAction = (pageUrl) => pageUrl
  ? { label: 'Open in Notion', url: pageUrl }
  : undefined

export function createFounderReplyUpdatedNotification({ company, pageUrl }) {
  return {
    text: `${compact(company, 200)}: Notion updated`,
    action: notionAction(pageUrl),
  }
}

export function createFounderReplyReviewNotification({ company, sender, subject, pageUrl, reason }) {
  const name = compact(company, 200) || 'Unmatched founder reply'
  return {
    text: [
      `${name}: reply needs review`,
      sender ? `From: ${compact(sender, 320)}` : '',
      subject ? `Subject: ${compact(subject, 300)}` : '',
      reason ? `Reason: ${compact(reason, 500)}` : '',
    ].filter(Boolean).join('\n'),
    action: notionAction(pageUrl),
  }
}

export function createFounderReplyFailedNotification({ company, pageUrl, reason }) {
  return {
    text: [
      `${compact(company, 200) || 'Founder reply'}: Notion update failed`,
      reason ? `Reason: ${compact(reason, 500)}` : '',
    ].filter(Boolean).join('\n'),
    action: notionAction(pageUrl),
  }
}

export const notifyFounderReplyUpdated = (input) =>
  sendTelegramMessage(createFounderReplyUpdatedNotification(input))

export const notifyFounderReplyReview = (input) =>
  sendTelegramMessage(createFounderReplyReviewNotification(input))

export const notifyFounderReplyFailed = (input) =>
  sendTelegramMessage(createFounderReplyFailedNotification(input))
