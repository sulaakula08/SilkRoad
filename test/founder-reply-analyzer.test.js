import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeReplyAnalysis } from '../server/founder-replies/analyzer.js'

const missingItems = ['Share traction.', 'Describe the founding team.']

test('analysis accepts one answer per requested item and detects later corrections', () => {
  const result = normalizeReplyAnalysis(
    {
      answers: [{ requestIndex: 0, answer: '14 paying customers and $8k MRR.' }],
      requiresReview: false,
      reviewReason: '',
      isCorrection: false,
    },
    missingItems,
    [0],
  )

  assert.deepEqual(result.answers, [
    { requestIndex: 0, request: 'Share traction.', answer: '14 paying customers and $8k MRR.' },
  ])
  assert.equal(result.isCorrection, true)
  assert.equal(result.requiresReview, false)
})

test('invalid request mappings are dropped and require review', () => {
  const result = normalizeReplyAnalysis(
    {
      answers: [{ requestIndex: 9, answer: 'Unmapped answer' }],
      requiresReview: false,
      reviewReason: '',
      isCorrection: false,
    },
    missingItems,
  )
  assert.deepEqual(result.answers, [])
  assert.equal(result.requiresReview, true)
})
