/**
 * Client-side pitch-deck text extraction.
 *
 * Founders can attach a deck as PDF or PPTX. Rather than upload the binary, we
 * pull the text out here in the browser and send only that to /api/screen — the
 * screener is text-only, and this keeps the endpoint simple and the file private
 * to the user's machine.
 */
import JSZip from 'jszip'
import * as pdfjs from 'pdfjs-dist'
// Vite bundles the worker and gives us a URL for it.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export const MAX_DECK_BYTES = 15 * 1024 * 1024 // 15 MB
/** Cap the text we ship to the model — screen.js clamps again server-side. */
const MAX_CHARS = 12_000

export const DECK_ACCEPT =
  '.pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation'

export type DeckKind = 'pdf' | 'pptx'

export function deckKind(file: File): DeckKind | null {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    name.endsWith('.pptx')
  )
    return 'pptx'
  return null
}

const tidy = (s: string) =>
  s
    .replace(/\s+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .trim()
    .slice(0, MAX_CHARS)

async function fromPdf(buf: ArrayBuffer): Promise<string> {
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const out: string[] = []
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const text = content.items.map((it) => ('str' in it ? it.str : '')).join(' ')
      if (text.trim()) out.push(text)
      if (out.join(' ').length > MAX_CHARS) break
    }
  } finally {
    await doc.destroy()
  }
  return out.join('\n')
}

async function fromPptx(buf: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buf)
  // Slides are ppt/slides/slide1.xml, slide2.xml, … — keep them in order.
  const files = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = Number(a.match(/(\d+)\.xml$/)?.[1] ?? 0)
      const nb = Number(b.match(/(\d+)\.xml$/)?.[1] ?? 0)
      return na - nb
    })
  const out: string[] = []
  for (const name of files) {
    const xml = await zip.files[name].async('string')
    // <a:t>…</a:t> holds the visible text runs.
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) =>
      m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
    )
    if (runs.length) out.push(runs.join(' '))
    if (out.join(' ').length > MAX_CHARS) break
  }
  return out.join('\n')
}

/**
 * Extract deck text. Throws `'unsupported'`, `'too-big'`, or `'empty'` so the
 * caller can show a localised message.
 */
export async function extractDeckText(file: File): Promise<string> {
  const kind = deckKind(file)
  if (!kind) throw new Error('unsupported')
  if (file.size > MAX_DECK_BYTES) throw new Error('too-big')

  const buf = await file.arrayBuffer()
  const text = tidy(kind === 'pdf' ? await fromPdf(buf) : await fromPptx(buf))
  if (!text) throw new Error('empty')
  return text
}
