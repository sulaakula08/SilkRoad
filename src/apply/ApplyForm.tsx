import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { ArrowUpRight } from '../components/ui'

export type Tab = 'investor' | 'founder'

const EASE = [0.16, 1, 0.3, 1] as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Values = Record<string, string>

/**
 * The intake. Two tabs — investor / founder — each with only the basics.
 * Fully bilingual: every label comes from content.ts.
 *
 * NOTE: there is no backend. `onSubmit` just shows the confirmation; wire the
 * values to your CRM/endpoint where marked.
 */
export function ApplyForm({ initialTab = 'investor' }: { initialTab?: Tab }) {
  const { t } = useI18n()
  const a = t.apply
  const [tab, setTab] = useState<Tab>(initialTab)
  const [v, setV] = useState<Values>({})
  const [errors, setErrors] = useState<Values>({})
  const [sent, setSent] = useState(false)

  const set = (k: string) => (val: string) => {
    setV((s) => ({ ...s, [k]: val }))
    setErrors((e) => (e[k] ? { ...e, [k]: '' } : e))
  }

  const switchTab = (next: Tab) => {
    setTab(next)
    setErrors({})
  }

  // required field ids per tab
  const required =
    tab === 'investor'
      ? ['name', 'email', 'phone', 'ticket']
      : ['name', 'email', 'phone', 'company', 'stage']

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Values = {}
    for (const id of required) {
      if (!String(v[id] ?? '').trim()) errs[id] = a.required
    }
    if (v.email && !EMAIL.test(v.email)) errs.email = a.badEmail
    setErrors(errs)
    if (Object.keys(errs).length) return

    // → send `{ tab, ...v }` to your backend here
    setSent(true)
  }

  const reset = () => {
    setV({})
    setErrors({})
    setSent(false)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rule bg-white">
      {/* tabs */}
      <div className="grid grid-cols-2 border-b border-rule" role="tablist">
        {(['investor', 'founder'] as Tab[]).map((k) => {
          const on = tab === k
          return (
            <button
              key={k}
              role="tab"
              aria-selected={on}
              onClick={() => switchTab(k)}
              className={`relative px-5 py-4 font-display text-[15px] font-semibold transition-colors duration-200 ${
                on ? 'text-oxford' : 'text-ink-45 hover:text-oxford'
              }`}
            >
              {k === 'investor' ? a.tabInvestor : a.tabFounder}
              {on && (
                <motion.span
                  layoutId="apply-tab"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-turquoise"
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* No AnimatePresence here on purpose: a keyed exit inside `mode="wait"`
          could leave the previous tab's form mounted. A keyed remount with an
          enter-only animation is simpler and always lands on the right fields. */}
      {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="px-6 py-14 text-center sm:px-10"
          >
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-turquoise/15">
              <svg viewBox="0 0 20 20" className="size-6 text-turquoise" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10.5l4 4 8-8" />
              </svg>
            </span>
            <h3 className="mt-5 font-display text-h5 font-semibold">{a.successTitle}</h3>
            <p className="mx-auto mt-3 max-w-md text-[15.5px] leading-relaxed text-ink-70">
              {a.successBody}
            </p>
            <button
              onClick={reset}
              className="mt-6 font-display text-[14.5px] font-medium text-ink-45 underline underline-offset-4 transition-colors hover:text-oxford"
            >
              {a.again}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key={tab}
            onSubmit={submit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8"
          >
            <Field id="name" label={a.name} v={v} errors={errors} set={set} />
            <Field id="email" label={a.email} type="email" v={v} errors={errors} set={set} />
            <Field id="phone" label={a.phone} placeholder="+7 …" v={v} errors={errors} set={set} />

            {tab === 'investor' ? (
              <Select
                id="ticket"
                label={a.ticket}
                options={a.ticketOptions}
                placeholder={a.select}
                v={v}
                errors={errors}
                set={set}
              />
            ) : (
              <Field id="company" label={a.company} v={v} errors={errors} set={set} />
            )}

            {tab === 'founder' && (
              <>
                <Select
                  id="stage"
                  label={a.stage}
                  options={a.stageOptions}
                  placeholder={a.select}
                  v={v}
                  errors={errors}
                  set={set}
                />
                <Field
                  id="deck"
                  label={a.deck}
                  optional={a.optional}
                  placeholder="https://…"
                  v={v}
                  errors={errors}
                  set={set}
                />
              </>
            )}

            <div className="sm:col-span-2">
              <Label text={a.message} optional={a.optional} />
              <textarea
                rows={3}
                value={v.message ?? ''}
                onChange={(e) => set('message')(e.target.value)}
                className="w-full resize-y rounded-xl border border-rule bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors hover:border-ink-45/50 focus:border-turquoise"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-oxford px-7 py-4 font-display text-[15.5px] font-semibold text-snow transition-colors duration-200 hover:bg-turquoise hover:text-oxford sm:w-auto"
              >
                {a.submit} <ArrowUpRight />
              </button>
            </div>
          </motion.form>
        )}
    </div>
  )
}

function Label({ text, optional }: { text: string; optional?: string }) {
  return (
    <label className="mb-1.5 flex items-baseline gap-2">
      <span className="font-display text-[14.5px] font-medium">{text}</span>
      {optional && <span className="text-[12px] text-ink-45">{optional}</span>}
    </label>
  )
}

type FieldProps = {
  id: string
  label: string
  type?: string
  placeholder?: string
  optional?: string
  v: Values
  errors: Values
  set: (k: string) => (val: string) => void
}

const inputCls =
  'w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-45/60 hover:border-ink-45/50 focus:border-turquoise'

function Field({ id, label, type = 'text', placeholder, optional, v, errors, set }: FieldProps) {
  const bad = !!errors[id]
  return (
    <div>
      <Label text={label} optional={optional} />
      <input
        type={type}
        value={v[id] ?? ''}
        placeholder={placeholder}
        onChange={(e) => set(id)(e.target.value)}
        className={`${inputCls} ${bad ? 'border-red-300' : 'border-rule'}`}
      />
      {bad && <p className="mt-1.5 text-[13px] text-red-600">{errors[id]}</p>}
    </div>
  )
}

function Select({
  id,
  label,
  options,
  placeholder,
  v,
  errors,
  set,
}: FieldProps & { options: string[] }) {
  const bad = !!errors[id]
  return (
    <div>
      <Label text={label} />
      <select
        value={v[id] ?? ''}
        onChange={(e) => set(id)(e.target.value)}
        className={`${inputCls} ${bad ? 'border-red-300' : 'border-rule'} ${
          v[id] ? 'text-ink' : 'text-ink-45/60'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
      {bad && <p className="mt-1.5 text-[13px] text-red-600">{errors[id]}</p>}
    </div>
  )
}
