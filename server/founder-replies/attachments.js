import JSZip from 'jszip'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { downloadReceivedAttachment } from '../integrations/resend.js'

export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024
const MAX_ATTACHMENT_TEXT_CHARS = 12_000
const PDF = 'application/pdf'
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

const cleanText = (value) =>
  String(value || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .trim()
    .slice(0, MAX_ATTACHMENT_TEXT_CHARS)

function safeFilename(value, kind) {
  const fallback = kind === 'pdf' ? 'founder-document.pdf' : 'founder-deck.pptx'
  const name = String(value || fallback)
    .split(/[\\/]/)
    .pop()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^\p{L}\p{N}._ ()-]+/gu, '-')
    .slice(0, 180)
  return name || fallback
}

function attachmentKind(attachment) {
  const filename = String(attachment?.filename || '').toLowerCase()
  const contentType = String(attachment?.content_type || '').toLowerCase()
  const mimeKind = contentType === PDF ? 'pdf' : contentType === PPTX ? 'pptx' : null
  const extensionKind = filename.endsWith('.pdf') ? 'pdf' : filename.endsWith('.pptx') ? 'pptx' : null
  if (mimeKind && extensionKind && mimeKind !== extensionKind) return null
  return mimeKind || extensionKind
}

async function extractPdf(bytes) {
  const data = new Uint8Array(bytes)
  if (new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-') throw new Error('invalid-pdf')
  const document = await pdfjs.getDocument({ data }).promise
  const output = []
  try {
    for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 100); pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      if (text.trim()) output.push(text)
      if (output.join(' ').length >= MAX_ATTACHMENT_TEXT_CHARS) break
    }
  } finally {
    await document.destroy()
  }
  return cleanText(output.join('\n'))
}

async function extractPptx(bytes) {
  const zip = await JSZip.loadAsync(bytes)
  if (!zip.files['[Content_Types].xml']) throw new Error('invalid-pptx')
  const slides = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/(\d+)\.xml$/)?.[1] || 0)
      const rightNumber = Number(right.match(/(\d+)\.xml$/)?.[1] || 0)
      return leftNumber - rightNumber
    })
    .slice(0, 100)
  const output = []
  for (const name of slides) {
    const xml = await zip.files[name].async('string')
    const runs = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) =>
      match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"'),
    )
    if (runs.length) output.push(runs.join(' '))
    if (output.join(' ').length >= MAX_ATTACHMENT_TEXT_CHARS) break
  }
  return cleanText(output.join('\n'))
}

const reason = (lang, key) => {
  const copy = {
    en: {
      unsupported: 'Unsupported file type. Only PDF and PPTX are accepted.',
      tooLarge: 'File exceeds the 15 MB limit.',
      unreadable: 'The file was attached, but its text could not be read safely.',
    },
    ru: {
      unsupported: 'Тип файла не поддерживается. Допускаются только PDF и PPTX.',
      tooLarge: 'Размер файла превышает 15 МБ.',
      unreadable: 'Файл прикреплен, но его текст не удалось безопасно прочитать.',
    },
  }
  return (copy[lang] || copy.en)[key]
}

export async function prepareFounderAttachments(emailId, metadata, lang, download = downloadReceivedAttachment) {
  const files = []
  const skipped = []

  for (const attachment of Array.isArray(metadata) ? metadata : []) {
    if (String(attachment?.content_disposition || '').toLowerCase() === 'inline') continue
    const kind = attachmentKind(attachment)
    const filename = safeFilename(attachment?.filename, kind || 'pdf')
    if (!kind) {
      skipped.push({ filename, reason: reason(lang, 'unsupported') })
      continue
    }

    const downloaded = await download(emailId, attachment.id, MAX_ATTACHMENT_BYTES)
    if (downloaded.tooLarge || !downloaded.bytes) {
      skipped.push({ filename, reason: reason(lang, 'tooLarge') })
      continue
    }

    let text = ''
    let readError = ''
    try {
      text = kind === 'pdf' ? await extractPdf(downloaded.bytes) : await extractPptx(downloaded.bytes)
      if (!text) throw new Error('empty')
    } catch {
      readError = reason(lang, 'unreadable')
      skipped.push({ filename, reason: readError })
    }

    files.push({
      bytes: downloaded.bytes,
      filename,
      contentType: kind === 'pdf' ? PDF : PPTX,
      text,
      readError,
    })
  }
  return { files, skipped }
}
