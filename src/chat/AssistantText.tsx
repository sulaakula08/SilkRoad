import { Fragment, type ReactNode } from 'react'

/**
 * Renders the model's plain-text reply safely. No dangerouslySetInnerHTML —
 * everything is React nodes, so nothing the model emits can inject markup.
 *
 * Handles the small set of things Gemini actually produces here:
 *   • paragraphs and single line breaks
 *   • - / • bullet lines
 *   • **bold**
 *   • links: markdown [text](url), bare http(s) URLs, emails, and internal
 *     /apply paths (which route in-app instead of reloading)
 */
export function AssistantText({
  text,
  onApply,
}: {
  text: string
  onApply?: (path: 'investor' | 'founder') => void
}) {
  const blocks = text.split(/\n{2,}/)
  return (
    <div className="space-y-2.5">
      {blocks.map((block, bi) => {
        const lines = block.split('\n')
        const isList = lines.every((l) => /^\s*[-•]\s+/.test(l)) && lines.length > 0
        if (isList) {
          return (
            <ul key={bi} className="space-y-1.5">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-turquoise" />
                  <span>{inline(l.replace(/^\s*[-•]\s+/, ''), onApply)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {inline(l, onApply)}
                {li < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

const linkCls =
  'font-medium text-oxford underline decoration-turquoise decoration-2 underline-offset-2 hover:decoration-oxford'

// One combined matcher: markdown link | bare URL | email | /apply path.
const PATTERN =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)|([\w.+-]+@[\w-]+\.[\w.-]+)|(\/apply(?:\/(?:investor|founder))?)/g

function inline(
  text: string,
  onApply?: (path: 'investor' | 'founder') => void,
): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  PATTERN.lastIndex = 0

  while ((m = PATTERN.exec(text))) {
    if (m.index > last) out.push(bold(text.slice(last, m.index), k++))
    const [, mdText, mdUrl, bareUrl, email, applyPath] = m

    if (mdUrl) {
      out.push(
        <a key={k++} href={mdUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {mdText}
        </a>,
      )
    } else if (bareUrl) {
      out.push(
        <a key={k++} href={bareUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {bareUrl.replace(/^https?:\/\//, '')}
        </a>,
      )
    } else if (email) {
      out.push(
        <a key={k++} href={`mailto:${email}`} className={linkCls}>
          {email}
        </a>,
      )
    } else if (applyPath) {
      const side = applyPath.endsWith('founder')
        ? 'founder'
        : applyPath.endsWith('investor')
          ? 'investor'
          : null
      out.push(
        <button
          key={k++}
          type="button"
          onClick={() => (side && onApply ? onApply(side) : (window.location.href = applyPath))}
          className={`${linkCls} cursor-pointer`}
        >
          {applyPath}
        </button>,
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(bold(text.slice(last), k++))
  return out
}

/** Resolve **bold** within a plain run. */
function bold(text: string, key: number): ReactNode {
  if (!text.includes('**')) return <Fragment key={key}>{text}</Fragment>
  const parts = text.split(/\*\*([^*]+)\*\*/g)
  return (
    <Fragment key={key}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-oxford">
            {p}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </Fragment>
  )
}
