import { NOTION_VERSION } from '../notion-schema.js'

const NOTION_API = 'https://api.notion.com/v1'
const REQUEST_TIMEOUT_MS = 20_000
const FILE_TIMEOUT_MS = 45_000

export class NotionError extends Error {
  constructor(message, { statusCode = 502, providerStatus = 0 } = {}) {
    super(message)
    this.name = 'NotionError'
    this.statusCode = statusCode
    this.providerStatus = providerStatus
    this.code = 'NOTION_ERROR'
  }
}

export async function notionRequest(path, { method = 'GET', body } = {}) {
  const token = process.env.NOTION_TOKEN
  if (!token) throw new NotionError('Notion is not configured.', { statusCode: 503 })

  let response
  try {
    response = await fetch(`${NOTION_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new NotionError('Could not reach Notion.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = String(data?.message || '').trim().slice(0, 500)
    throw new NotionError(detail || 'Notion rejected the request.', {
      providerStatus: response.status,
      statusCode: response.status >= 500 || response.status === 429 ? 502 : 500,
    })
  }
  return data
}

export async function uploadFileToNotion({ bytes, filename, contentType }) {
  const upload = await notionRequest('/file_uploads', {
    method: 'POST',
    body: { mode: 'single_part', filename, content_type: contentType },
  })

  const form = new FormData()
  form.append('file', new Blob([bytes], { type: contentType }), filename)

  let response
  try {
    response = await fetch(`${NOTION_API}/file_uploads/${upload.id}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
      },
      body: form,
      signal: AbortSignal.timeout(FILE_TIMEOUT_MS),
    })
  } catch {
    throw new NotionError('Could not upload the file to Notion.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok || data?.status !== 'uploaded') {
    const detail = String(data?.message || '').trim().slice(0, 500)
    throw new NotionError(detail || 'Notion rejected the file.', {
      providerStatus: response.status,
      statusCode: response.status >= 500 || response.status === 429 ? 502 : 500,
    })
  }
  return data
}
