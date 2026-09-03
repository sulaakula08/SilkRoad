const MAX_REPLY_CHARS = 20_000

const HTML_ENTITIES = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

function decodeHtmlEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const named = HTML_ENTITIES[entity.toLowerCase()]
    if (named) return named
    if (!entity.startsWith('#')) return match
    const hex = entity[1]?.toLowerCase() === 'x'
    const codePoint = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
  })
}

export function htmlToPlainText(html) {
  return decodeHtmlEntities(
    String(html || '')
      .replace(/<\s*(script|style|head)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
}

function isQuotedHistoryStart(line) {
  return (
    /^On .+wrote:\s*$/i.test(line) ||
    /^.+писал(?:а)?:\s*$/i.test(line) ||
    /^-{2,}\s*(Original Message|Пересылаемое сообщение|Исходное сообщение)\s*-{2,}$/i.test(line) ||
    /^(From|От):\s+.+<[^<>@]+@[^<>]+>\s*$/i.test(line)
  )
}

function isSignatureStart(line) {
  return /^--\s*$/.test(line) || /^(Sent from my|Отправлено с)\b/i.test(line)
}

export function cleanFounderReply({ text, html }) {
  const source = String(text || '').trim() || htmlToPlainText(html)
  const kept = []
  for (const rawLine of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trimEnd()
    if (isQuotedHistoryStart(line.trim()) || isSignatureStart(line.trim())) break
    if (/^\s*>/.test(line)) continue
    kept.push(line)
  }
  return kept
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_REPLY_CHARS)
}
