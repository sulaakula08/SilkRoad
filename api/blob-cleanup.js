import { readJsonBody, sendJson } from '../server/http.js'
import { cleanupDeckBlob } from '../server/notion.js'

export async function blobCleanupHandler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  try {
    const body = await readJsonBody(req, 10_000)
    await cleanupDeckBlob(body.url)
    return sendJson(res, 200, { ok: true })
  } catch {
    return sendJson(res, 400, { error: 'Temporary upload could not be cleaned up.' })
  }
}

export default blobCleanupHandler
