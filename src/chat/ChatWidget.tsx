import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useChat } from './useChat'
import { GREETING, SUGGESTIONS, CONTACT } from './knowledge'
import { Halftone } from '../components/Halftone'
import { AssistantText } from './AssistantText'
import { useI18n } from '../i18n'

const EASE = [0.16, 1, 0.3, 1] as const

/** Widget chrome copy, per language. */
const UI = {
  ru: {
    title: 'Silkroad Angels',
    status: 'Ассистент · отвечает сразу',
    clear: 'Очистить',
    ready: 'Готовы?',
    invest: 'Инвестировать',
    raise: 'Привлечь инвестиции',
    apply: 'Заявка',
    email: 'Написать',
    placeholder: 'Спросите о клубе…',
    disclaimer: 'ИИ-ассистент — может ошибаться. Не является инвест-советом.',
    aria: 'Ассистент Silkroad Angels',
    ask: 'Спросить',
    close: 'Закрыть',
  },
  en: {
    title: 'Silkroad Angels',
    status: 'Assistant · usually instant',
    clear: 'Clear',
    ready: 'Ready?',
    invest: 'Invest',
    raise: 'Raise',
    apply: 'Apply',
    email: 'Email',
    placeholder: 'Ask anything about the club…',
    disclaimer: 'AI assistant — it can be wrong. Not investment advice.',
    aria: 'Silkroad Angels assistant',
    ask: 'Ask the network',
    close: 'Close',
  },
} as const

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { messages, streaming, error, send, reset } = useChat()
  const [draft, setDraft] = useState('')
  const still = useReducedMotion()
  const navigate = useNavigate()
  const { lang } = useI18n()
  const greeting = GREETING[lang]
  const suggestions = SUGGESTIONS[lang]
  const ui = UI[lang]

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Keep the newest message in view as tokens stream in.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  // Esc closes; focus the input when opening.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => inputRef.current?.focus(), 260)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  const submit = (text: string) => {
    setDraft('')
    void send(text)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(draft)
  }

  const goApply = (path: 'investor' | 'founder') => {
    setOpen(false)
    navigate(`/apply/${path}`)
  }

  const empty = messages.length === 0

  return (
    <>
      {/* Launcher — the brand mark, alive. Hover replays the dot sweep and
          reveals a label; a breathing ring signals it's interactive. */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? ui.close : ui.ask}
        aria-expanded={open}
        initial={still ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="group fixed right-5 bottom-5 z-[70] flex cursor-pointer items-center gap-0 rounded-full bg-oxford py-2 pr-2 pl-2 text-snow shadow-[0_10px_34px_rgba(0,32,63,0.32)] ring-1 ring-white/10 sm:right-7 sm:bottom-7"
      >
        {/* breathing ring */}
        {!still && !open && (
          <motion.span
            aria-hidden
            className="absolute right-2 bottom-2 size-10 rounded-full ring-1 ring-turquoise/60 sm:right-2 sm:bottom-2"
            style={{ transformOrigin: 'center' }}
            animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* label — grows leftward on hover (desktop only) */}
        <span className="hidden max-w-0 overflow-hidden font-display text-[14px] font-semibold whitespace-nowrap opacity-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:max-w-[9rem] group-hover:pr-1 group-hover:pl-3 group-hover:opacity-100 sm:inline">
          {open ? ui.close : ui.ask}
        </span>

        {/* icon disc */}
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/5">
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.svg
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </motion.svg>
            ) : (
              <motion.span
                key="mark"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Static: the whileInView reveal never fired reliably inside a
                    fixed-position button, leaving the dots at opacity 0. */}
                <Halftone className="size-6" color="var(--color-cyan)" animate={false} />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-turquoise ring-2 ring-oxford" />
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Scrim on mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[65] bg-oxford/40 backdrop-blur-[2px] sm:hidden"
            />

            <motion.div
              role="dialog"
              aria-label={ui.aria}
              initial={still ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={still ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="fixed z-[68] flex flex-col overflow-hidden rounded-2xl bg-snow shadow-[0_20px_70px_rgba(0,32,63,0.35)] ring-1 ring-oxford/10 inset-x-4 bottom-24 top-20 sm:inset-x-auto sm:top-auto sm:right-7 sm:bottom-24 sm:h-[min(620px,calc(100vh-8rem))] sm:w-[400px]"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-oxford px-5 py-4 text-snow">
                <Halftone
                  className="pointer-events-none absolute -top-6 -right-4 w-32 opacity-[0.18]"
                  color="var(--color-turquoise)"
                  animate={false}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-white/10">
                      <Halftone className="size-5" color="var(--color-cyan)" animate={false} />
                    </span>
                    <div>
                      <p className="font-display text-[15px] font-semibold">{ui.title}</p>
                      <p className="flex items-center gap-1.5 text-[12px] text-snow/60">
                        <span className="size-1.5 rounded-full bg-turquoise" />
                        {ui.status}
                      </p>
                    </div>
                  </div>
                  {!empty && (
                    <button
                      onClick={reset}
                      className="rounded-full px-2.5 py-1 text-[12px] text-snow/60 transition-colors hover:bg-white/10 hover:text-snow"
                    >
                      {ui.clear}
                    </button>
                  )}
                </div>
              </div>

              {/* Transcript */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
                aria-live="polite"
              >
                {/* Greeting */}
                <Bubble role="assistant">
                  <AssistantText text={greeting} />
                </Bubble>

                {messages.map((m) => (
                  <Bubble key={m.id} role={m.role}>
                    {m.role === 'assistant' ? (
                      <AssistantText text={m.content} onApply={goApply} />
                    ) : (
                      m.content
                    )}
                  </Bubble>
                ))}

                {streaming &&
                  messages[messages.length - 1]?.content === '' && <Typing />}

                {error && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
                    {error}
                  </p>
                )}

                {empty && (
                  <div className="space-y-2 pt-1">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="block w-full rounded-xl border border-rule bg-white px-3.5 py-2.5 text-left text-[14px] text-ink-70 transition-colors hover:border-turquoise hover:text-oxford"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Routing rail — apply + reach a human */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-rule px-4 py-2.5">
                <button
                  onClick={() => goApply('investor')}
                  className="rounded-full bg-oxford/5 px-3 py-1.5 text-[12.5px] font-medium text-oxford transition-colors hover:bg-turquoise hover:text-oxford"
                >
                  {ui.invest}
                </button>
                <button
                  onClick={() => goApply('founder')}
                  className="rounded-full bg-oxford/5 px-3 py-1.5 text-[12.5px] font-medium text-oxford transition-colors hover:bg-turquoise hover:text-oxford"
                >
                  {ui.raise}
                </button>
                <span className="ml-auto flex items-center gap-3">
                  <a
                    href={CONTACT.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] text-ink-45 underline underline-offset-2 transition-colors hover:text-oxford"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={CONTACT.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] text-ink-45 underline underline-offset-2 transition-colors hover:text-oxford"
                  >
                    Telegram
                  </a>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-[12.5px] text-ink-45 underline underline-offset-2 transition-colors hover:text-oxford"
                  >
                    {ui.email}
                  </a>
                </span>
              </div>

              {/* Composer */}
              <form onSubmit={onSubmit} className="border-t border-rule p-3">
                <div className="flex items-end gap-2 rounded-xl border border-rule bg-white px-3 py-2 focus-within:border-turquoise">
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submit(draft)
                      }
                    }}
                    rows={1}
                    placeholder={ui.placeholder}
                    className="max-h-28 flex-1 resize-none bg-transparent py-1 text-[14.5px] text-ink outline-none placeholder:text-ink-45/70"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || streaming}
                    aria-label="Send"
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-oxford text-snow transition-colors hover:bg-turquoise hover:text-oxford disabled:pointer-events-none disabled:opacity-30"
                  >
                    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10h12M10 4l6 6-6 6" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[11px] text-ink-45">{ui.disclaimer}</p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const user = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={user ? 'flex justify-end' : 'flex justify-start'}
    >
      <div
        className={
          user
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-oxford px-4 py-2.5 text-[14.5px] leading-relaxed text-snow'
            : 'max-w-[88%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[14.5px] leading-relaxed text-ink ring-1 ring-rule'
        }
      >
        {children}
      </div>
    </motion.div>
  )
}

function Typing() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3.5 ring-1 ring-rule">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-ink-45"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
