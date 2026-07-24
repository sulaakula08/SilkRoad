import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CONTENT, type Dict } from './content'

export type Lang = 'ru' | 'en'

const KEY = 'sa-lang'

const Ctx = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: Dict
}>({ lang: 'ru', setLang: () => {}, t: CONTENT.ru })

/**
 * Language state. The club's market is Russian-speaking, so RU is the default;
 * the choice persists across visits. Everything user-facing reads from `t`,
 * which is just CONTENT for the active language.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    return saved === 'en' || saved === 'ru' ? saved : 'ru'
  })

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* private mode — fine, just don't persist */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t: CONTENT[lang] }), [lang, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)

/** The en / ru switch used in the nav. */
export function LangToggle({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { lang, setLang } = useI18n()
  const langs: Lang[] = ['en', 'ru']
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border p-0.5 text-[13px] font-semibold ${
        tone === 'dark' ? 'border-white/15' : 'border-oxford/12'
      }`}
    >
      {langs.map((l) => {
        const on = lang === l
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={on}
            className={`rounded-full px-2.5 py-1 uppercase transition-colors duration-200 ${
              on
                ? 'bg-turquoise text-oxford'
                : tone === 'dark'
                  ? 'text-snow/55 hover:text-snow'
                  : 'text-ink-45 hover:text-oxford'
            }`}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
