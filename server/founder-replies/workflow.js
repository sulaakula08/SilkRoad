import { createHash } from 'node:crypto'
import { analyzeFounderReply } from './analyzer.js'
import { prepareFounderAttachments } from './attachments.js'
import { cleanFounderReply } from './content.js'
import { CorrelationError, normalizeEmailAddress, resolveReplyPageId } from './correlation.js'
import {
  appendFounderReply,
  hasFounderReplyReference,
  loadFounderReplyContext,
  uploadFounderReplyAttachment,
} from './notion.js'
import { retrieveReceivedEmail } from '../integrations/resend.js'
import {
  notifyFounderReplyFailed,
  notifyFounderReplyReview,
  notifyFounderReplyUpdated,
} from '../notifications/founder-reply.js'

export class FounderReplyProcessingError extends Error {
  constructor(message, { statusCode = 503 } = {}) {
    super(message)
    this.name = 'FounderReplyProcessingError'
    this.statusCode = statusCode
  }
}

export const replyReference = (emailId) =>
  createHash('sha256').update(String(emailId || '')).digest('hex').slice(0, 16)

const defaultDependencies = {
  resolveReplyPageId,
  loadFounderReplyContext,
  retrieveReceivedEmail,
  prepareFounderAttachments,
  analyzeFounderReply,
  uploadFounderReplyAttachment,
  hasFounderReplyReference,
  appendFounderReply,
  notifyFounderReplyUpdated,
  notifyFounderReplyReview,
  notifyFounderReplyFailed,
}

function isRetryable(error) {
  if (typeof error?.retryable === 'boolean') return error.retryable
  return error?.statusCode !== 400 && error?.statusCode !== 500
}

function fileReviewReason(skipped, lang) {
  if (!skipped.length) return ''
  return lang === 'ru'
    ? 'Одно или несколько вложений требуют ручной проверки.'
    : 'One or more attachments need manual review.'
}

function combinedReviewReason(analysis, skipped, lang) {
  return [analysis.reviewReason, fileReviewReason(skipped, lang)].filter(Boolean).join(' ')
}

export function createFounderReplyProcessor(overrides = {}) {
  const dependencies = { ...defaultDependencies, ...overrides }

  return async function processFounderReply(event) {
    const emailId = String(event?.email_id || '')
    const sender = normalizeEmailAddress(event?.from)
    const subject = String(event?.subject || '').trim().slice(0, 500)
    const receivedAt = String(event?.created_at || new Date().toISOString())
    let pageId

    try {
      pageId = dependencies.resolveReplyPageId(event?.to)
    } catch (error) {
      if (!(error instanceof CorrelationError)) throw error
      await dependencies.notifyFounderReplyReview({ sender, subject, reason: error.message })
      return { status: 'review', reason: 'uncorrelated' }
    }

    let context
    try {
      context = await dependencies.loadFounderReplyContext(pageId)

      if (sender !== normalizeEmailAddress(context.founderEmail)) {
        await dependencies.notifyFounderReplyReview({
          company: context.company,
          sender,
          subject,
          pageUrl: context.pageUrl,
          reason: 'Sender does not match the founder email recorded for this application.',
        })
        return { status: 'review', reason: 'unauthorized-sender' }
      }

      const reference = replyReference(emailId)
      if (await dependencies.hasFounderReplyReference(pageId, reference)) {
        return { status: 'duplicate' }
      }

      const received = await dependencies.retrieveReceivedEmail(emailId)
      if (normalizeEmailAddress(received?.from) !== sender) {
        throw Object.assign(new Error('Resend returned a different sender for this email.'), {
          retryable: false,
        })
      }

      const cleanedReply = cleanFounderReply({ text: received?.text, html: received?.html })
      const prepared = await dependencies.prepareFounderAttachments(
        emailId,
        received?.attachments,
        context.lang,
      )
      const analysis = await dependencies.analyzeFounderReply({
        missingItems: context.missingItems,
        answeredIndexes: context.answeredIndexes,
        cleanedReply,
        attachments: prepared.files,
        lang: context.lang,
      })

      const answered = new Set(context.answeredIndexes)
      analysis.answers.forEach(({ requestIndex }) => answered.add(requestIndex))
      const stillMissing = context.missingItems.filter((_, index) => !answered.has(index))
      const requiresReview = Boolean(analysis.requiresReview || prepared.skipped.length)
      const reviewReason = combinedReviewReason(analysis, prepared.skipped, context.lang)
      const attachments = []
      for (const file of prepared.files) {
        attachments.push(await dependencies.uploadFounderReplyAttachment(file))
      }

      await dependencies.appendFounderReply(pageId, {
        lang: context.lang,
        receivedAt,
        answers: analysis.answers,
        stillMissing,
        cleanedReply,
        attachments,
        skippedAttachments: prepared.skipped,
        requiresReview,
        reviewReason,
        isCorrection: analysis.isCorrection,
        reference,
      })

      const notification = {
        company: context.company,
        pageUrl: context.pageUrl,
        sender,
        subject,
      }
      if (requiresReview) {
        await dependencies.notifyFounderReplyReview({
          ...notification,
          reason: 'The source was added to Notion, but the reply needs manual review.',
        })
      } else {
        await dependencies.notifyFounderReplyUpdated(notification)
      }
      return { status: requiresReview ? 'review' : 'updated' }
    } catch (error) {
      if (!isRetryable(error)) {
        if (context) {
          await dependencies.notifyFounderReplyFailed({
            company: context.company,
            pageUrl: context.pageUrl,
            reason: error?.message || 'Unknown processing error.',
          })
          return { status: 'failed' }
        }
        await dependencies.notifyFounderReplyReview({ sender, subject, reason: error.message })
        return { status: 'review', reason: 'invalid-context' }
      }
      throw new FounderReplyProcessingError(error?.message || 'Founder reply processing failed.')
    }
  }
}

export const processFounderReply = createFounderReplyProcessor()
