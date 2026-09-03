const RICH_TEXT_CHUNK = 1_900

export function textChunks(value, size = RICH_TEXT_CHUNK) {
  const text = String(value ?? '')
  const result = []
  for (let index = 0; index < text.length; index += size) result.push(text.slice(index, index + size))
  return result
}

export function notionText(value, annotations, link) {
  return textChunks(value).map((content) => ({
    type: 'text',
    text: { content, ...(link ? { link: { url: link } } : {}) },
    ...(annotations ? { annotations } : {}),
  }))
}

export const title = (value) => ({ title: notionText(value) })
export const richText = (value) => ({ rich_text: notionText(value) })

export const paragraph = (value) => ({
  object: 'block',
  type: 'paragraph',
  paragraph: { rich_text: notionText(value) },
})

export const heading = (value, level = 2) => ({
  object: 'block',
  type: `heading_${level}`,
  [`heading_${level}`]: { rich_text: notionText(value) },
})

export const bullet = (value) => ({
  object: 'block',
  type: 'bulleted_list_item',
  bulleted_list_item: { rich_text: notionText(value) },
})

export const todo = (value, checked = false) => ({
  object: 'block',
  type: 'to_do',
  to_do: { rich_text: notionText(value), checked },
})

export function labeledParagraph(label, value) {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        ...notionText(`${label}: `, {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        }),
        ...notionText(value),
      ],
    },
  }
}

export function callout(value, { emoji = 'ℹ️', color = 'gray_background' } = {}) {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: notionText(value),
      icon: { type: 'emoji', emoji },
      color,
    },
  }
}

export function toggle(value, children) {
  return {
    object: 'block',
    type: 'toggle',
    toggle: { rich_text: notionText(value), children },
  }
}

export function fileBlock(fileUploadId, filename) {
  return {
    object: 'block',
    type: 'file',
    file: {
      type: 'file_upload',
      file_upload: { id: fileUploadId },
      name: filename,
      caption: [],
    },
  }
}

export const divider = () => ({ object: 'block', type: 'divider', divider: {} })
