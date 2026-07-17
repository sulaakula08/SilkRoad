import { motion } from 'framer-motion'
import type { Field } from './schema'
import type { Answers } from './routing'

type Props = {
  field: Field
  value: string | string[] | undefined
  error?: string
  onChange: (v: string | string[]) => void
}

const inputCls =
  'w-full rounded-xl border border-rule bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-45/70 transition-colors duration-150 hover:border-ink-45/50 focus:border-turquoise focus:outline-none'

export function FieldControl({ field, value, error, onChange }: Props) {
  const invalid = !!error

  if (field.type === 'choice' || field.type === 'multi') {
    const multi = field.type === 'multi'
    const selected = (v: string) =>
      multi ? ((value as string[]) ?? []).includes(v) : value === v

    const toggle = (v: string) => {
      if (!multi) return onChange(v)
      const cur = (value as string[]) ?? []
      onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
    }

    return (
      <div className={`grid gap-2 ${multi ? 'sm:grid-cols-2' : ''}`}>
        {field.options!.map((o) => {
          const on = selected(o.value)
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              aria-pressed={on}
              className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150 ${
                on
                  ? 'border-turquoise bg-turquoise/8'
                  : `bg-white hover:border-ink-45/50 ${invalid ? 'border-red-300' : 'border-rule'}`
              }`}
            >
              <span
                className={`grid shrink-0 place-items-center border transition-colors duration-150 ${
                  multi ? 'size-[18px] rounded-[5px]' : 'size-[18px] rounded-full'
                } ${on ? 'border-turquoise bg-turquoise' : 'border-ink-45/45'}`}
              >
                {on &&
                  (multi ? (
                    <svg viewBox="0 0 12 12" className="size-3 text-oxford" fill="none">
                      <path
                        d="M2.5 6.2 5 8.6 9.5 3.6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <motion.span
                      layoutId={`dot-${field.id}`}
                      className="size-1.5 rounded-full bg-oxford"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] leading-tight font-medium">
                  {o.label}
                </span>
                {o.note && (
                  <span className="mt-0.5 block text-[13px] leading-tight text-ink-45">
                    {o.note}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        rows={4}
        value={(value as string) ?? ''}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-y ${invalid ? 'border-red-300' : ''}`}
      />
    )
  }

  return (
    <input
      type={field.type === 'url' ? 'text' : field.type}
      value={(value as string) ?? ''}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} ${invalid ? 'border-red-300' : ''}`}
    />
  )
}

export function FieldRow({
  field,
  answers,
  error,
  onChange,
}: {
  field: Field
  answers: Answers
  error?: string
  onChange: (v: string | string[]) => void
}) {
  return (
    <div className={field.half ? 'sm:col-span-1' : 'sm:col-span-2'}>
      <label className="mb-1.5 flex items-baseline gap-2">
        <span className="font-display text-[15px] font-medium">{field.label}</span>
        {field.optional && (
          <span className="text-[12px] text-ink-45">optional</span>
        )}
      </label>
      {field.hint && (
        <p className="mb-2.5 max-w-lg text-[13.5px] leading-relaxed text-ink-70">
          {field.hint}
        </p>
      )}
      <FieldControl
        field={field}
        value={answers[field.id]}
        error={error}
        onChange={onChange}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-[13px] text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
