import { handleUpload } from '@vercel/blob/client'
import { readJsonBody, sendJson } from '../server/http.js'

const MAX_DECK_BYTES = 15 * 1024 * 1024
const DECK_PREFIX = 'applications/decks/'
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

export async function deckUploadHandler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return sendJson(res, 503, { error: 'Deck uploads are not configured.' })
  }

  let body
  try {
    body = await readJsonBody(req, 50_000)
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const lower = pathname.toLowerCase()
        if (!pathname.startsWith(DECK_PREFIX) || (!lower.endsWith('.pdf') && !lower.endsWith('.pptx'))) {
          throw new Error('Only application pitch decks can be uploaded.')
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_DECK_BYTES,
          validUntil: Date.now() + 10 * 60 * 1_000,
          addRandomSuffix: true,
          allowOverwrite: false,
          cacheControlMaxAge: 60,
        }
      },
      onUploadCompleted: async () => {},
    })
    return sendJson(res, 200, result)
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: 'Deck upload could not be authorized.' })
  }
}

export default deckUploadHandler
