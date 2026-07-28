import { motion, useReducedMotion } from 'framer-motion'
import { DotField } from '../components/DotField'
import { IndexDark, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/**
 * Central Asia ecosystem radar.
 *
 * Every number on this board is taken from a named public source and carries a
 * link to it — nothing here is simulated or extrapolated. The board is a
 * manually curated snapshot: when a new report lands, update the constants
 * below and bump ASOF / the `asOf` string in content.ts.
 *
 * Primary source: "Startups and Venture Capital in Central Asia 2026",
 * RISE Research (presented at CEVF 2026, Tashkent).
 */

type Cc = 'KZ' | 'UZ' | 'KG' | 'TJ' | 'TM'
type Sk = 'fintech' | 'ai' | 'health' | 'logistics' | 'agri' | 'ecommerce' | 'deeptech' | 'edtech'

/** Named sources, referenced by key from every data row. */
const SOURCES = {
  rise: {
    label: 'RISE Research — Startups & Venture Capital in Central Asia 2026',
    url: 'https://rise.com.kz/reports/vc-central-asia-2026',
  },
  uzdaily: {
    label: 'UzDaily — Central Asia venture market hits US$320M in 2025',
    url: 'https://www.uzdaily.uz/en/central-asia-venture-market-hits-us320m-in-2025/',
  },
  timesca: {
    label: 'The Times of Central Asia — Kazakhstan startups and international investors',
    url: 'https://timesca.com/how-a-new-generation-of-startups-from-kazakhstan-attracted-international-investors/',
  },
  astanatimes: {
    label: 'The Astana Times — Kazakh startup secures $50M for video creation',
    url: 'https://astanatimes.com/2025/09/kazakh-startup-secures-50-million-to-drive-innovation-in-video-creation/',
  },
  techcrunch: {
    label: 'TechCrunch — Uzbekistan unicorn Uzum Series A',
    url: 'https://techcrunch.com/2024/03/25/uzbekistan-unicorn-uzum-series-a-funding',
  },
  akchabar: {
    label: 'Akchabar — Venture deals in Kyrgyzstan reached $1.7M in 2024',
    url: 'https://www.akchabar.kg/en/news/obem-venchurnikh-sdelok-v-kirgizstane-dostig-17-mln-v-2024-godu-vcrtoudrolotcoan',
  },
} as const

type SrcKey = keyof typeof SOURCES

/** Headline figures. `note` keys index r.kpiNotes. */
const KPIS: { value: string; src: SrcKey }[] = [
  { value: '$320M', src: 'rise' },
  { value: '$209M', src: 'rise' },
  { value: '$33.8M', src: 'rise' },
  { value: '61%', src: 'uzdaily' },
]

/** amount is in $M for the year given; share is % of the $320M regional total. */
const COUNTRIES: { cc: Cc; amount: number | null; year: number; share: number; src?: SrcKey }[] = [
  { cc: 'KZ', amount: 209, year: 2025, share: 65, src: 'rise' },
  { cc: 'UZ', amount: 33.8, year: 2025, share: 11, src: 'rise' },
  { cc: 'KG', amount: 1.7, year: 2024, share: 1, src: 'akchabar' },
  { cc: 'TJ', amount: null, year: 2025, share: 0 },
  { cc: 'TM', amount: null, year: 2025, share: 0 },
]

/** Real, publicly announced rounds. amount in $M. */
type Deal = {
  co: string
  cc: Cc
  stage: { ru: string; en: string }
  sector: Sk
  amount: number
  when: { ru: string; en: string }
  src: SrcKey
}

const DEALS: Deal[] = [
  {
    co: 'Higgsfield AI',
    cc: 'KZ',
    stage: { ru: 'Series A + расширение', en: 'Series A + extension' },
    sector: 'ai',
    amount: 130,
    when: { ru: 'сен 2025 — янв 2026', en: 'Sep 2025 – Jan 2026' },
    src: 'astanatimes',
  },
  {
    co: 'Uzum',
    cc: 'UZ',
    stage: { ru: 'Рост', en: 'Growth' },
    sector: 'fintech',
    amount: 65.5,
    when: { ru: '2025', en: '2025' },
    src: 'uzdaily',
  },
  {
    co: 'Uzum',
    cc: 'UZ',
    stage: { ru: 'Series A', en: 'Series A' },
    sector: 'ecommerce',
    amount: 52,
    when: { ru: 'мар 2024', en: 'Mar 2024' },
    src: 'techcrunch',
  },
  {
    co: 'Codiplay',
    cc: 'KZ',
    stage: { ru: 'Series A', en: 'Series A' },
    sector: 'edtech',
    amount: 9,
    when: { ru: 'янв 2025', en: 'Jan 2025' },
    src: 'timesca',
  },
]

type CityMap = Record<
  'astana' | 'tashkent' | 'almaty' | 'bishkek' | 'paloalto' | 'sanfrancisco',
  string
>

/** Confirmed events with published dates. m is a 0-based month index. */
const EVENTS: {
  day: string
  m: number
  year: number
  city: keyof CityMap
  cc?: Cc
  country?: { ru: string; en: string }
  name: string
  url: string
}[] = [
  {
    day: '1–3',
    m: 9,
    year: 2026,
    city: 'astana',
    cc: 'KZ',
    name: 'AI & Digital Bridge 2026',
    url: 'https://digitalbridge.ai/en/',
  },
  {
    day: '13–15',
    m: 9,
    year: 2026,
    city: 'sanfrancisco',
    country: { ru: 'США', en: 'USA' },
    name: 'TechCrunch Disrupt 2026',
    url: 'https://techcrunch.com/events/techcrunch-disrupt/',
  },
  {
    day: '3',
    m: 3,
    year: 2026,
    city: 'tashkent',
    cc: 'UZ',
    name: 'Central Eurasian Venture Forum (5th)',
    url: 'https://ventureforum.asia/',
  },
]

const fmtAmt = (m: number) => `$${m % 1 === 0 ? m : m.toFixed(1)}M`

export function Radar() {
  const { t, lang } = useI18n()
  const r = t.radar
  const still = useReducedMotion()

  return (
    <section
      id="radar"
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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-4 shrink-0 text-turquoise"
              >
                <path d="M12 3l7.5 4v5c0 4.4-3.1 8.4-7.5 9.5C7.6 20.4 4.5 16.4 4.5 12V7z" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] text-snow/60">{r.asOf}</span>
            </div>
          </Reveal>
        </div>

        {/* KPI row */}
        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-4">
          {r.kpis.map((label, i) => (
            <Reveal key={label} delay={i * 0.06} className="h-full">
              <div className="h-full bg-oxford px-6 py-7">
                <div className="font-display text-[2rem] font-semibold tabular-nums sm:text-[2.5rem]">
                  {KPIS[i].value}
                </div>
                <div className="mt-1 text-[13px] text-snow/60">{label}</div>
                <div className="mt-2 text-[12px] leading-snug text-snow/40">{r.kpiNotes[i]}</div>
                <SrcLink k={KPIS[i].src} />
              </div>
            </Reveal>
          ))}
        </div>

        {/* body: countries + disclosed rounds */}
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
                      {c.amount === null ? (
                        <span className="text-[12.5px] text-snow/35">{r.noData}</span>
                      ) : (
                        <span className="flex items-center gap-2 text-[13px] tabular-nums text-snow/55">
                          <span className="text-snow/85">${c.amount}M</span>
                          <span className="text-snow/40">{c.year}</span>
                        </span>
                      )}
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
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      {/* Share is only meaningful against the 2025 regional
                          total, so it is hidden for off-year figures (KG). */}
                      <span className="text-[11.5px] text-snow/35">
                        {c.share > 0 && c.year === 2025 ? `${c.share}% ${r.shareOf}` : ''}
                      </span>
                      {c.src && <SrcLink k={c.src} inline />}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* largest disclosed rounds */}
          <Reveal delay={0.06} className="h-full">
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <h3 className="font-display text-[15px] font-semibold text-snow/80">{r.feedTitle}</h3>
              <p className="mt-1.5 text-[12.5px] text-snow/40">{r.feedNote}</p>
              <ul className="mt-4 flex flex-col">
                {DEALS.map((d, i) => (
                  <li
                    key={`${d.co}-${i}`}
                    className="flex items-center gap-3 border-b border-white/8 py-3 last:border-0"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-turquoise/12 font-display text-[13px] font-semibold text-turquoise">
                      {d.co.slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={SOURCES[d.src].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-display text-[14.5px] font-medium underline-offset-4 hover:underline"
                        >
                          {d.co}
                        </a>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-snow/60">
                          {d.cc}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-snow/50">
                        {d.stage[lang]} · {r.sectors[d.sector]} · {d.when[lang]}
                      </div>
                    </div>
                    <span className="shrink-0 font-display text-[15px] font-semibold tabular-nums text-turquoise">
                      {fmtAmt(d.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* key events */}
        <Reveal delay={0.05}>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <h3 className="font-display text-[15px] font-semibold text-snow/80">{r.eventsTitle}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EVENTS.map((e) => (
                <a
                  key={e.name}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-white/8 bg-oxford/40 p-4 transition-colors duration-300 hover:border-turquoise/40"
                >
                  <div className="grid shrink-0 place-items-center rounded-lg bg-white/[0.06] px-3 py-2 text-center">
                    <span className="font-display text-[16px] leading-none font-semibold tabular-nums">
                      {e.day}
                    </span>
                    <span className="mt-0.5 text-[11px] tracking-wide text-snow/50 uppercase">
                      {r.months[e.m]} {String(e.year).slice(2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[14.5px] font-medium">{e.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-snow/50">
                      {r.cities[e.city]} · {e.cc ? r.countries[e.cc] : e.country![lang]}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* sources */}
        <Reveal delay={0.05}>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <h3 className="font-display text-[15px] font-semibold text-snow/80">
              {r.sourcesTitle}
            </h3>
            <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {(Object.keys(SOURCES) as SrcKey[]).map((k, i) => (
                <li key={k} className="flex gap-2.5 text-[12.5px] leading-snug text-snow/50">
                  <span className="tabular-nums text-snow/30">{i + 1}.</span>
                  <a
                    href={SOURCES[k].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 transition-colors hover:text-turquoise hover:underline"
                  >
                    {SOURCES[k].label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <p className="mt-6 max-w-3xl text-[12.5px] leading-relaxed text-snow/40">{r.note}</p>
      </div>
    </section>
  )
}

/** Small "source ↗" link that keeps every figure one click from its origin. */
function SrcLink({ k, inline }: { k: SrcKey; inline?: boolean }) {
  return (
    <a
      href={SOURCES[k].url}
      target="_blank"
      rel="noopener noreferrer"
      title={SOURCES[k].label}
      className={`inline-flex items-center gap-1 text-[11.5px] text-snow/35 underline-offset-4 transition-colors hover:text-turquoise hover:underline ${
        inline ? '' : 'mt-3'
      }`}
    >
      {SOURCES[k].label.split(' — ')[0]}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3">
        <path d="M6 10l4-4M6.5 6H10v3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
