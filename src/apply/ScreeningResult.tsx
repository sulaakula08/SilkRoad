import { motion } from 'framer-motion'
import { useI18n } from '../i18n'

export type Screening = {
  sectors: string[]
  stage: string
  score: number
  verdict: 'strong' | 'promising' | 'early' | 'weak'
  summary: string
  strengths: string[]
  flags: string[]
  matchedTheses: string[]
  recommendation: string
  rationale: string
}

const EASE = [0.16, 1, 0.3, 1] as const

/* Bilingual display maps for the model's English enums. */
const UI = {
  en: {
    kicker: 'AI pre-screen',
    fit: 'Investability',
    tags: 'Auto-tagged',
    stage: 'Stage',
    strengths: 'Strengths',
    flags: 'To verify',
    match: 'Thesis match',
    rec: 'Recommended track',
    human: 'This is an automated pre-screen, not a decision. A partner reviews every application.',
    verdict: { strong: 'Strong fit', promising: 'Promising', early: 'Early', weak: 'Not yet' },
  },
  ru: {
    kicker: 'ИИ-предскрининг',
    fit: 'Инвестиционный потенциал',
    tags: 'Авто-теги',
    stage: 'Стадия',
    strengths: 'Сильные стороны',
    flags: 'Проверить',
    match: 'Совпадение с фокусом',
    rec: 'Рекомендованный трек',
    human: 'Это автоматический предскрининг, а не решение. Каждую заявку смотрит партнёр.',
    verdict: { strong: 'Сильное совпадение', promising: 'Перспективно', early: 'Рано', weak: 'Пока нет' },
  },
} as const

const SECTOR_RU: Record<string, string> = {
  'AI & infrastructure': 'ИИ и инфраструктура',
  Fintech: 'Финтех',
  'B2B software': 'B2B-софт',
  'Health & bio': 'Здоровье и био',
  'Climate & energy': 'Климат и энергетика',
  Consumer: 'Потребительский',
  'Deep tech': 'Deep tech',
  'Logistics & trade': 'Логистика и торговля',
  Other: 'Другое',
}
const STAGE_RU: Record<string, string> = {
  Idea: 'Идея',
  'Pre-seed': 'Pre-seed',
  Seed: 'Seed',
  'Series A': 'Series A',
}
const TRACK_RU: Record<string, string> = {
  'Fast track': 'Быстрый трек',
  'Standard review': 'Стандартное рассмотрение',
  'Corridor review': 'Корридорное рассмотрение',
  'Too early': 'Слишком рано',
}
const THESIS_RU: Record<string, string> = {
  'AI-native products': 'ИИ-продукты',
  'B2B SaaS with revenue': 'B2B SaaS с выручкой',
  'Deep tech / frontier': 'Deep tech / фронтир',
  'Fintech & financial infrastructure': 'Финтех и фин. инфраструктура',
  'Healthcare & bio': 'Здравоохранение и био',
  'Climate & energy': 'Климат и энергетика',
  'Consumer & marketplaces': 'Потребительский и маркетплейсы',
}

const scoreColor = (s: number) =>
  s >= 80 ? 'var(--color-turquoise)' : s >= 60 ? '#3bb2c9' : s >= 40 ? '#e0a24a' : '#d9756a'

export function ScreeningResult({
  data,
  onReset,
  resetLabel,
}: {
  data: Screening
  onReset: () => void
  resetLabel: string
}) {
  const { lang } = useI18n()
  const u = UI[lang]
  const tr = (map: Record<string, string>, v: string) => (lang === 'ru' ? map[v] ?? v : v)
  const col = scoreColor(data.score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="p-6 sm:p-8"
    >
      {/* header: score dial + verdict */}
      <div className="flex items-center gap-5">
        <Dial score={data.score} color={col} />
        <div>
          <p className="font-display text-[12px] tracking-[0.14em] text-turquoise uppercase">
            {u.kicker}
          </p>
          <p className="mt-1 font-display text-h6 font-semibold">{u.verdict[data.verdict]}</p>
          <p className="text-[13px] text-ink-45">{u.fit}</p>
        </div>
      </div>

      <p className="mt-5 text-[15.5px] leading-relaxed text-ink-70">{data.summary}</p>

      {/* tags */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] text-ink-45">{u.tags}:</span>
        <Tag>{tr(STAGE_RU, data.stage)}</Tag>
        {data.sectors.map((s) => (
          <Tag key={s} accent>
            {tr(SECTOR_RU, s)}
          </Tag>
        ))}
      </div>

      {/* strengths + flags */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {data.strengths.length > 0 && (
          <Panel title={u.strengths} tone="good">
            {data.strengths.map((s, i) => (
              <Item key={i} tone="good">
                {s}
              </Item>
            ))}
          </Panel>
        )}
        {data.flags.length > 0 && (
          <Panel title={u.flags} tone="warn">
            {data.flags.map((s, i) => (
              <Item key={i} tone="warn">
                {s}
              </Item>
            ))}
          </Panel>
        )}
      </div>

      {/* recommendation + thesis match */}
      <div className="mt-6 rounded-xl border border-rule bg-snow px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div>
            <p className="text-[12px] tracking-[0.1em] text-ink-45 uppercase">{u.rec}</p>
            <p className="mt-0.5 font-display text-[16px] font-semibold">
              {tr(TRACK_RU, data.recommendation)}
            </p>
          </div>
          {data.matchedTheses.length > 0 && (
            <div className="text-right">
              <p className="text-[12px] tracking-[0.1em] text-ink-45 uppercase">{u.match}</p>
              <div className="mt-1 flex flex-wrap justify-end gap-1.5">
                {data.matchedTheses.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-oxford/6 px-2.5 py-1 text-[12px] font-medium text-oxford"
                  >
                    {tr(THESIS_RU, t)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 border-t border-rule pt-3 text-[13.5px] leading-relaxed text-ink-70">
          {data.rationale}
        </p>
      </div>

      <p className="mt-5 text-[12.5px] leading-relaxed text-ink-45">{u.human}</p>

      <button
        onClick={onReset}
        className="mt-5 font-display text-[14px] font-medium text-ink-45 underline underline-offset-4 transition-colors hover:text-oxford"
      >
        {resetLabel}
      </button>
    </motion.div>
  )
}

function Dial({ score, color }: { score: number; color: string }) {
  const R = 26
  const C = 2 * Math.PI * R
  return (
    <div className="relative grid size-[72px] shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="size-[72px] -rotate-90">
        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--color-rule)" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - score / 100) }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        />
      </svg>
      <span className="absolute font-display text-[19px] font-semibold tabular-nums">{score}</span>
    </div>
  )
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[13px] font-medium ${
        accent ? 'bg-turquoise/12 text-oxford' : 'border border-rule text-ink-70'
      }`}
    >
      {children}
    </span>
  )
}

function Panel({
  title,
  tone,
  children,
}: {
  title: string
  tone: 'good' | 'warn'
  children: React.ReactNode
}) {
  return (
    <div>
      <p
        className={`text-[12px] font-semibold tracking-[0.08em] uppercase ${
          tone === 'good' ? 'text-turquoise' : 'text-amber-600'
        }`}
      >
        {title}
      </p>
      <ul className="mt-2.5 space-y-1.5">{children}</ul>
    </div>
  )
}

function Item({ tone, children }: { tone: 'good' | 'warn'; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[14px] leading-snug text-ink-70">
      <span
        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
          tone === 'good' ? 'bg-turquoise' : 'bg-amber-500'
        }`}
      />
      {children}
    </li>
  )
}
