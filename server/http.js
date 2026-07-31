export function readJsonBody(req, maxBytes = 100_000) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)

  return new Promise((resolve, reject) => {
    let raw = ''
    let bytes = 0

    req.on('data', (chunk) => {
      bytes += Buffer.byteLength(chunk)
      if (bytes > maxBytes) {
        reject(Object.assign(new Error('payload too large'), { statusCode: 413 }))
        req.destroy()
        return
      }
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(Object.assign(new Error('bad json'), { statusCode: 400 }))
      }
    })
    req.on('error', reject)
  })
}

export function sendJson(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(body))
}
