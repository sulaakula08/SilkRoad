import assert from 'node:assert/strict'
import test from 'node:test'
import { prepareFounderAttachments } from '../server/founder-replies/attachments.js'

test('inline assets are ignored and unsupported files are routed for review', async () => {
  let downloads = 0
  const prepared = await prepareFounderAttachments(
    'email-1',
    [
      {
        id: 'inline-1',
        filename: 'signature.png',
        content_type: 'image/png',
        content_disposition: 'inline',
      },
      {
        id: 'file-1',
        filename: 'notes.docx',
        content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        content_disposition: 'attachment',
      },
    ],
    'en',
    async () => {
      downloads += 1
      return null
    },
  )
  assert.equal(downloads, 0)
  assert.deepEqual(prepared.files, [])
  assert.equal(prepared.skipped.length, 1)
  assert.equal(prepared.skipped[0].filename, 'notes.docx')
})
