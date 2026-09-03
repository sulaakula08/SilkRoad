import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createFounderFollowUpSection,
  createFounderReplyBlocks,
} from '../server/founder-replies/notion.js'

test('initial follow-up section records every requested item as page content', () => {
  const blocks = createFounderFollowUpSection(['Share traction.', 'Describe the team.'], 'en')
  assert.equal(blocks.filter((block) => block.type === 'to_do').length, 2)
  assert.equal(blocks.some((block) => block.type === 'heading_2'), true)
})

test('reply entry preserves organized answers, source, attachments, and unresolved items', () => {
  const blocks = createFounderReplyBlocks({
    lang: 'en',
    receivedAt: '2026-08-24T10:30:00.000Z',
    answers: [{ request: 'Share traction.', answer: '14 paying customers.' }],
    stillMissing: ['Describe the team.'],
    cleanedReply: 'We have 14 paying customers.',
    attachments: [{ uploadId: 'upload-1', filename: 'deck.pdf' }],
    skippedAttachments: [],
    requiresReview: false,
    reviewReason: '',
    isCorrection: false,
    reference: '1234567890abcdef',
  })

  assert.equal(blocks.some((block) => block.type === 'file'), true)
  assert.equal(
    blocks.some((block) =>
      block.type === 'toggle' && block.toggle.rich_text[0].text.content.includes('Ref 1234567890abcdef')),
    true,
  )
})
