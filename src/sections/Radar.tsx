import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { DotField } from '../components/DotField'
import { IndexDark, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/**
 * Central Asia ecosystem radar — a live board of funding activity and events.
 *
 * The data below is an illustrative sample (invented startups, not real rounds)
 * so the board can demonstrate real-time behaviour without misrepresenting any
 * company. To go truly live, replace POOL / COUNTRIES / EVENTS with a feed and
 * keep the same shapes — the UI is source-agnostic.
 */

type Cc = 'KZ' | 'UZ' | 'KG' | 'TJ' | 'TM'
type Sk = 'fintech' | 'ai' | 'health' | 'logistics' | 'agri' | 'ecommerce' | 'deeptech' | 'edtech'

/** amount is in $M. */
type Deal = { co: string; cc: Cc; stage: string; sector: Sk; amount: number }

const POOL: Deal[] = [
  { co: 'Qazdata', cc: 'KZ', stage: 'Series A', sector: 'ai', amount: 8.5 },
  { co: 'TashPay', cc: 'UZ', stage: 'Series B', sector: 'fintech', amount: 22 },
  { co: 'Steppe Labs', cc: 'KZ', stage: 'Seed', sector: 'deeptech', amount: 3.2 },
  { co: 'Aral Health', cc: 'UZ', stage: 'Series A', sector: 'health', amount: 6.4 },
  { co: 'Bishkek Bio', cc: 'KG', stage: 'Seed', sector: 'agri', amount: 1.8 },
  { co: 'SilkLogix', cc: 'KZ', stage: 'Growth', sector: 'logistics', amount: 14 },
  { co: 'Dala Foods', cc: 'KZ', stage: 'Series A', sector: 'ecommerce', amount: 9 },
  { co: 'Pamir Pay', cc: 'TJ', stage: 'Seed', sector: 'fintech', amount: 2.1 },
  { co: 'Turan Cloud', cc: 'UZ', stage: 'Series A', sector: 'deeptech', amount: 7.5 },
  { co: 'OtaGo', cc: 'KZ', stage: 'Pre-seed', sector: 'edtech', amount: 0.6 },
  { co: 'Amu Robotics', cc: 'TM', stage: 'Seed', sector: 'ai', amount: 2.6 },
  { co: 'Nomad Mart', cc: 'KG', stage: 'Seed', sector: 'ecommerce', amount: 1.4 },
]

const COUNTRIES: { cc: Cc; share: number; amount: number; qoq: number }[] = [
  { cc: 'KZ', share: 47, amount: 101, qoq: 12 },
  { cc: 'UZ', share: 31, amount: 66, qoq: 24 },
  { cc: 'KG', share: 11, amount: 24, qoq: 8 },
  { cc: 'TJ', share: 7, amount: 15, qoq: 5 },
  { cc: 'TM', share: 4, amount: 8, qoq: 2 },
]

const EVENTS: { day: number; m: number; city: keyof CityMap; cc: Cc; name: { ru: string; en: string } }[] = [
  { day: 29, m: 7, city: 'bishkek', cc: 'KG', name: { ru: 'Bishkek Founders Meetup', en: 'Bishkek Founders Meetup' } },
  { day: 18, m: 8, city: 'astana', cc: 'KZ', name: { ru: 'Astana Startup Summit', en: 'Astana Startup Summit' } },
  { day: 2, m: 9, city: 'tashkent', cc: 'UZ', name: { ru: 'Tashkent Tech Week', en: 'Tashkent Tech Week' } },
  { day: 12, m: 10, city: 'almaty', cc: 'KZ', name: { ru: 'Central Asia Venture Forum', en: 'Central Asia Venture Forum' } },
  { day: 5, m: 11, city: 'paloalto', cc: 'KZ', name: { ru: 'Silkroad Venture Summit', en: 'Silkroad Venture Summit' } },
]

type CityMap = Record<'astana' | 'tashkent' | 'almaty' | 'bishkek' | 'paloalto', string>

const KPI_BASE = [214, 138, 1240, 46] // capital $M · rounds · startups · events
const INJECT_MS = 6000

const fmtAmt = (m: number) => (m >= 1 ? `$${m % 1 === 0 ? m : m.toFixed(1)}M` : `$${Math.round(m * 1000)}K`)

/** Ease-out count-up, gated on visibility; respects reduced motion. */
function useCountUp(target: number, run: boolean, dur = 1300) {
  const still = useReducedMotion()
  const [val, setVal] = useState(still ? target : 0)
  useEffect(() => {
    if (still) return setVal(target)
    if (!run) return
    const steps = 40
    let i = 0
    const iv = setInterval(() => {
      i += 1
      const p = Math.min(1, i / steps)
      setVal(target * (1 - Math.pow(1 - p, 3)))
      if (p >= 1) clearInterval(iv)
    }, dur / steps)
    return () => clearInterval(iv)
  }, [target, run, dur, still])
  return val
}

type Row = Deal & { key: number; age: number }

export function Radar() {
  const { t, lang } = useI18n()
  const r = t.radar
  const still = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15%' })
  // Prefer the scroll trigger, but never sit dead: arm after a beat regardless
  // (covers above-the-fold views and environments where IO never fires).
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), 1400)
    return () => clearTimeout(id)
  }, [])
  const active = inView || armed

  const [feed, setFeed] = useState<Row[]>(() =>
    [POOL[1], POOL[5], POOL[3], POOL[8]].map((d, i) => ({ ...d, key: i, age: 90 + i * 150 })),
  )
  const [secs, setSecs] = useState(3)
  const [extraRounds, setExtraRounds] = useState(0)
  const [extraCapital, setExtraCapital] = useState(0)

  // One clock: age the feed + the "updated Ns ago" header.
  useEffect(() => {
    if (still || !active) return
    const iv = setInterval(() => {
      setSecs((s) => s + 1)
      setFeed((f) => f.map((it) => ({ ...it, age: it.age + 1 })))
    }, 1000)
    return () => clearInterval(iv)
  }, [still, active])

  // Inject a new deal on a cadence to make the board feel alive.
  useEffect(() => {
    if (still || !active) return
    let i = 0
    const iv = setInterval(() => {
      const d = POOL[i % POOL.length]
      i += 1
      setFeed((f) => [{ ...d, key: Date.now() + i, age: 0 }, ...f].slice(0, 6))
      setSecs(0)
      setExtraRounds((n) => n + 1)
      setExtraCapital((c) => c + d.amount)
    }, INJECT_MS)
    return () => clearInterval(iv)
  }, [still, active])

  const cap = useCountUp(KPI_BASE[0], active) + extraCapital
  const rounds = useCountUp(KPI_BASE[1], active) + extraRounds
  const startups = useCountUp(KPI_BASE[2], active)
  const events = useCountUp(KPI_BASE[3], active)

  const kpiVals = [
    `$${Math.round(cap)}M`,
    `${Math.round(rounds)}`,
    Math.round(startups).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US'),
    `${Math.round(events)}`,
  ]

  const ageLabel = (sec: number) => {
    if (sec < 8) return r.justNow
    if (sec < 60) return lang === 'ru' ? `${sec} сек назад` : `${sec}s ago`
    const m = Math.floor(sec / 60)
    if (m < 60) return lang === 'ru' ? `${m} мин назад` : `${m}m ago`
    return lang === 'ru' ? `${Math.floor(m / 60)} ч назад` : `${Math.floor(m / 60)}h ago`
  }

  return (
    <section
      id="radar"
      ref={ref}
      className="relative scroll-mt-20 overflow-hidden border-b border-white/10 bg-oxford py-24 text-snow sm:py-32"
    >
      <DotField
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 opacity-[0.10]"
        color="var(--color-turquoise)"
        pitch={44}
        radius={4.5}
        fade="right"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <IndexDark n={r.index} label={r.label} />
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-8 max-w-2xl font-display text-[2.4rem] leading-[1.06] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
                {r.title}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-snow/65">{r.subtitle}</p>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5">
              <span className="relative flex size-2.5">
                {!still && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-turquoise/70" />
                )}
                <span className="relative inline-flex size-2.5 rounded-full bg-turquoise" />
              </span>
              <span className="font-display text-[13px] font-semibold tracking-[0.14em]">{r.live}</span>
              <span className="h-3.5 w-px bg-white/15" />
              <span className="text-[13px] text-snow/55 tabular-nums">
                {r.updated} {ageLabel(secs)}
              </span>
            </div>
          </Reveal>
        </div>

        {/* KPI row */}
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-4">
          {r.kpis.map((label, i) => (
            <Reveal key={label} delay={i * 0.06} className="h-full">
              <div className="h-full bg-oxford px-6 py-7">
                <div className="font-display text-[2rem] font-semibold tabular-nums sm:text-[2.5rem]">
                  {kpiVals[i]}
                </div>
                <div className="mt-1 text-[13px] text-snow/50">{label}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* body: countries + live feed */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* funding by country */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <h3 className="font-display text-[15px] font-semibold text-snow/80">
                {r.countriesTitle}
              </h3>
              <ul className="mt-6 space-y-5">
                {COUNTRIES.map((c, i) => (
                  <li key={c.cc}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2.5">
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-display text-[11px] font-semibold tracking-wide text-snow/70">
                          {c.cc}
                        </span>
                        <span className="text-[14.5px] text-snow/85">{r.countries[c.cc]}</span>
                      </span>
                      <span className="flex items-center gap-2 text-[13px] tabular-nums text-snow/55">
                        <span className="text-snow/85">${c.amount}M</span>
                        <span className="text-turquoise">↑{c.qoq}% {r.qoq}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-turquoise"
                        initial={still ? false : { width: 0 }}
                        whileInView={{ width: `${c.share}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* live deal feed */}
          <Reveal delay={0.06} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[15px] font-semibold text-snow/80">{r.feedTitle}</h3>
                <span className="size-1.5 animate-pulse rounded-full bg-turquoise" />
              </div>
              <ul className="mt-5 flex flex-col">
                <AnimatePresence initial={false}>
                  {feed.map((d) => (
                    <motion.li
                      key={d.key}
                      layout={!still}
                      initial={still ? false : { opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3 border-b border-white/8 py-3 last:border-0"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-turquoise/12 font-display text-[13px] font-semibold text-turquoise">
                        {d.co.slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-display text-[14.5px] font-medium">{d.co}</span>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-snow/60">
                            {d.cc}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-[12.5px] text-snow/50">
                          {d.stage} · {r.sectors[d.sector]} · {ageLabel(d.age)}
                        </div>
                      </div>
                      <span className="shrink-0 font-display text-[15px] font-semibold tabular-nums text-turquoise">
                        {fmtAmt(d.amount)}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </Reveal>
        </div>

        {/* upcoming events */}
        <Reveal delay={0.05}>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <h3 className="font-display text-[15px] font-semibold text-snow/80">{r.eventsTitle}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EVENTS.map((e) => (
                <div
                  key={e.name.en}
                  className="group flex items-center gap-4 rounded-xl border border-white/8 bg-oxford/40 p-4 transition-colors duration-300 hover:border-turquoise/40"
                >
                  <div className="grid shrink-0 place-items-center rounded-lg bg-white/[0.06] px-3 py-2 text-center">
                    <span className="font-display text-[18px] font-semibold leading-none tabular-nums">
                      {e.day}
                    </span>
                    <span className="mt-0.5 text-[11px] tracking-wide text-snow/50 uppercase">
                      {r.months[e.m]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[14.5px] font-medium">{e.name[lang]}</p>
                    <p className="mt-0.5 text-[12.5px] text-snow/50">
                      {r.cities[e.city]} · {r.countries[e.cc]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-[12.5px] text-snow/40">{r.note}</p>
      </div>
    </section>
  )
}
