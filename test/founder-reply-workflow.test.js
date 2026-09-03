import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createFounderReplyProcessor,
  FounderReplyProcessingError,
} from '../server/founder-replies/workflow.js'

function fixture(overrides = {}) {
  const calls = { append: [], updated: [], review: [], failed: [], retrieve: 0 }
  const references = new Set()
  const context = {
    pageId: '0123456789abcdef0123456789abcdef',
    pageUrl: 'https://notion.so/page-1',
    founderEmail: 'founder@example.com',
    company: 'Acme',
    lang: 'en',
    missingItems: ['Share traction.', 'Describe the team.'],
    answeredIndexes: [],
  }
  const processor = createFounderReplyProcessor({
    resolveReplyPageId: () => context.pageId,
    loadFounderReplyContext: async () => context,
    retrieveReceivedEmail: async () => {
      calls.retrieve += 1
      return {
        from: 'founder@example.com',
        text: 'We have 14 paying customers.',
        attachments: [],
      }
    },
    prepareFounderAttachments: async () => ({ files: [], skipped: [] }),
    analyzeFounderReply: async () => ({
      answers: [{ requestIndex: 0, request: 'Share traction.', answer: '14 paying customers.' }],
      requiresReview: false,
      reviewReason: '',
      isCorrection: false,
    }),
    hasFounderReplyReference: async (_pageId, reference) => references.has(reference),
    uploadFounderReplyAttachment: async (file) => file,
    appendFounderReply: async (_pageId, entry) => {
      calls.append.push(entry)
      references.add(entry.reference)
    },
    notifyFounderReplyUpdated: async (notification) => calls.updated.push(notification),
    notifyFounderReplyReview: async (notification) => calls.review.push(notification),
    notifyFounderReplyFailed: async (notification) => calls.failed.push(notification),
    ...overrides,
  })
  return { processor, calls, context, references }
}

const event = {
  email_id: 'email-1',
  from: 'founder@example.com',
  to: ['reply@example.com'],
  subject: 'Re: application',
  created_at: '2026-08-24T10:30:00.000Z',
}

test('safe reply appends once and sends success', async () => {
  const { processor, calls } = fixture()
  assert.deepEqual(await processor(event), { status: 'updated' })
  assert.deepEqual(calls.append[0].stillMissing, ['Describe the team.'])
  assert.equal(calls.updated[0].company, 'Acme')

  assert.deepEqual(await processor(event), { status: 'duplicate' })
  assert.equal(calls.append.length, 1)
  assert.equal(calls.updated.length, 1)
  assert.equal(calls.retrieve, 1)
})

test('unauthorized sender never retrieves content or changes Notion', async () => {
  const { processor, calls } = fixture()
  const result = await processor({ ...event, from: 'assistant@example.com' })
  assert.deepEqual(result, { status: 'review', reason: 'unauthorized-sender' })
  assert.equal(calls.retrieve, 0)
  assert.equal(calls.append.length, 0)
  assert.equal(calls.review.length, 1)
})

test('attachment or AI uncertainty appends source but sends review instead of success', async () => {
  const { processor, calls } = fixture({
    prepareFounderAttachments: async () => ({
      files: [],
      skipped: [{ filename: 'deck.docx', reason: 'Unsupported file type.' }],
    }),
  })
  assert.deepEqual(await processor(event), { status: 'review' })
  assert.equal(calls.append.length, 1)
  assert.equal(calls.review.length, 1)
  assert.equal(calls.updated.length, 0)
})

test('a source reference prevents duplicate Notion content', async () => {
  let uploads = 0
  const { processor, calls } = fixture({
    hasFounderReplyReference: async () => true,
    uploadFounderReplyAttachment: async () => {
      uploads += 1
    },
  })
  assert.deepEqual(await processor(event), { status: 'duplicate' })
  assert.equal(calls.append.length, 0)
  assert.equal(uploads, 0)
  assert.equal(calls.updated.length, 0)
})

test('transient failures are returned to Resend for retry', async () => {
  const { processor, calls } = fixture({
    retrieveReceivedEmail: async () => {
      throw new Error('Temporary provider failure')
    },
  })
  await assert.rejects(() => processor(event), FounderReplyProcessingError)
  assert.equal(calls.failed.length, 0)
})

test('permanent failures send one Telegram alert', async () => {
  const { processor, calls } = fixture({
    retrieveReceivedEmail: async () => {
      throw Object.assign(new Error('Invalid provider response'), { retryable: false })
    },
  })
  assert.deepEqual(await processor(event), { status: 'failed' })
  assert.equal(calls.failed.length, 1)
})
