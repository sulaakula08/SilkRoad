import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanFounderReply, htmlToPlainText } from '../server/founder-replies/content.js'

test('reply cleaning removes quoted history and signatures', () => {
  const cleaned = cleanFounderReply({
    text: [
      'We have 14 paying customers and $8k MRR.',
      '',
      '-- ',
      'Founder Name',
      '',
      'On Sunday, Silkroad Angels wrote:',
      '> Please share traction.',
    ].join('\n'),
  })
  assert.equal(cleaned, 'We have 14 paying customers and $8k MRR.')
})

test('HTML replies become readable plain text when no text part exists', () => {
  assert.equal(
    htmlToPlainText('<p>Hello &amp; thanks.</p><p>Deck attached.</p>').trim(),
    'Hello & thanks.\nDeck attached.',
  )
})
