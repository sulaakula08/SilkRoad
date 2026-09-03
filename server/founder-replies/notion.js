import {
  bullet,
  callout,
  divider,
  fileBlock,
  heading,
  labeledParagraph,
  paragraph,
  todo,
  toggle,
} from '../integrations/notion-blocks.js'
import { notionRequest, uploadFileToNotion } from '../integrations/notion.js'

const COPY = {
  en: {
    section: 'Founder follow-up',
    requested: 'Requested information',
    requestedNote: 'The founder was asked to reply with the information below.',
    reply: 'Founder reply',
    correction: 'The founder marked this reply as a correction. Previous entries remain unchanged.',
    added: 'Information added',
    unresolved: 'Still missing',
    complete: 'All requested information received.',
    review: 'This reply needs review',
    attachments: 'Attachments',
    skipped: 'Attachment review needed',
    original: 'Original reply',
    noBody: 'No text was included in the email body.',
  },
  ru: {
    section: 'Уточнения от основателя',
    requested: 'Запрошенная информация',
    requestedNote: 'Основателю было предложено ответить и предоставить информацию ниже.',
    reply: 'Ответ основателя',
    correction: 'Основатель отметил этот ответ как исправление. Предыдущие записи сохранены.',
    added: 'Добавленная информация',
    unresolved: 'Еще не предоставлено',
    complete: 'Вся запрошенная информация получена.',
    review: 'Этот ответ требует проверки',
    attachments: 'Вложения',
    skipped: 'Нужно проверить вложение',
    original: 'Исходный ответ',
    noBody: 'В тексте письма нет сообщения.',
  },
}

const copyFor = (lang) => COPY[lang] || COPY.en

function utcTimestamp(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value || '')
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

function blockPlainText(block) {
  const value = block?.[block?.type]
  return Array.isArray(value?.rich_text)
    ? value.rich_text.map((item) => item?.plain_text || item?.text?.content || '').join('')
    : ''
}

function propertyPlainText(property) {
  if (!property || typeof property !== 'object') return ''
  if (property.type === 'email') return String(property.email || '')
  if (property.type === 'select') return String(property.select?.name || '')
  const items = property[property.type]
  return Array.isArray(items)
    ? items.map((item) => item?.plain_text || item?.text?.content || '').join('')
    : ''
}

async function listPageBlocks(pageId) {
  const blocks = []
  let cursor = ''
  do {
    const query = new URLSearchParams({ page_size: '100' })
    if (cursor) query.set('start_cursor', cursor)
    const data = await notionRequest(
      `/blocks/${encodeURIComponent(pageId)}/children?${query.toString()}`,
    )
    blocks.push(...data.results)
    cursor = data.has_more ? String(data.next_cursor || '') : ''
  } while (cursor)
  return blocks
}

function contextError(message) {
  return Object.assign(new Error(message), { retryable: false })
}

export async function loadFounderReplyContext(pageId) {
  const [page, blocks] = await Promise.all([
    notionRequest(`/pages/${encodeURIComponent(pageId)}`),
    listPageBlocks(pageId),
  ])
  const founderEmail = propertyPlainText(page.properties?.Email)
  const company = propertyPlainText(page.properties?.Company)
  const lang = propertyPlainText(page.properties?.Language).toLowerCase() === 'ru' ? 'ru' : 'en'
  const missingItems = blocks
    .filter((block) => block.type === 'to_do')
    .map(blockPlainText)
    .filter(Boolean)

  if (!founderEmail || !company || !missingItems.length) {
    throw contextError('The Notion application is missing founder follow-up context.')
  }

  const pageText = blocks.map(blockPlainText)
  const answeredIndexes = missingItems.flatMap((item, index) =>
    pageText.some((text) => text.startsWith(`${item}: `)) ? [index] : [],
  )

  return {
    pageId,
    pageUrl: page.url,
    founderEmail,
    company,
    lang,
    missingItems,
    answeredIndexes,
  }
}

export function createFounderFollowUpSection(missingItems, lang = 'en') {
  const copy = copyFor(lang)
  return [
    divider(),
    heading(copy.section),
    callout(copy.requestedNote, { emoji: '✉️', color: 'blue_background' }),
    heading(copy.requested, 3),
    ...missingItems.map((item) => todo(item)),
  ]
}

export function createFounderReplyBlocks({
  lang,
  receivedAt,
  answers,
  stillMissing,
  cleanedReply,
  attachments,
  skippedAttachments,
  requiresReview,
  reviewReason,
  isCorrection,
  reference,
}) {
  const copy = copyFor(lang)
  const blocks = [divider(), heading(`${copy.reply} · ${utcTimestamp(receivedAt)}`)]

  if (isCorrection) {
    blocks.push(callout(copy.correction, { emoji: '✏️', color: 'yellow_background' }))
  }

  if (answers.length) {
    blocks.push(heading(copy.added, 3))
    blocks.push(...answers.map(({ request, answer }) => labeledParagraph(request, answer)))
  }

  if (requiresReview) {
    blocks.push(
      callout(`${copy.review}${reviewReason ? `: ${reviewReason}` : '.'}`, {
        emoji: '⚠️',
        color: 'yellow_background',
      }),
    )
  }

  if (stillMissing.length) {
    blocks.push(heading(copy.unresolved, 3), ...stillMissing.map((item) => bullet(item)))
  } else {
    blocks.push(callout(copy.complete, { emoji: '✅', color: 'green_background' }))
  }

  if (attachments.length) {
    blocks.push(heading(copy.attachments, 3))
    blocks.push(...attachments.map(({ uploadId, filename }) => fileBlock(uploadId, filename)))
  }

  if (skippedAttachments.length) {
    const details = skippedAttachments.map(({ filename, reason }) => `${filename}: ${reason}`).join('\n')
    blocks.push(callout(`${copy.skipped}\n${details}`, { emoji: '⚠️', color: 'yellow_background' }))
  }

  blocks.push(
    toggle(`${copy.original} · Ref ${reference}`, [paragraph(cleanedReply || copy.noBody)]),
  )
  return blocks
}

export async function uploadFounderReplyAttachment(attachment) {
  const upload = await uploadFileToNotion(attachment)
  return { uploadId: upload.id, filename: attachment.filename }
}

export async function appendFounderReply(pageId, entry) {
  return notionRequest(`/blocks/${encodeURIComponent(pageId)}/children`, {
    method: 'PATCH',
    body: { children: createFounderReplyBlocks(entry) },
  })
}

export async function hasFounderReplyReference(pageId, reference) {
  const blocks = await listPageBlocks(pageId)
  return blocks.some((block) => blockPlainText(block).includes(`Ref ${reference}`))
}
