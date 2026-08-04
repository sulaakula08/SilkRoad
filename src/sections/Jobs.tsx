import { useEffect, useState } from 'react'
import { Index, Reveal, ArrowUpRight } from '../components/ui'
import { PORTFOLIO } from '../content'
import { useI18n } from '../i18n'

/**
 * Open roles at portfolio companies.
 *
 * Nothing here is authored by us: every role and count comes from the
 * company's own job board. Where the board exposes a public API (Ashby, which
 * sends `access-control-allow-origin: *`) we fetch it in the browser, so the
 * numbers are current by construction and cannot go stale. Boards without an
 * API get a plain link out — deliberately with no number attached, rather than
 * a hand-counted figure that would quietly rot.
 *
 * To add a company: give it an entry below keyed by its portfolio slug, so the
 * card reuses the logo and name already in PORTFOLIO.
 */

type Board = {
  slug: string // matches a PORTFOLIO slug → reuses its logo + name
  careers: string // official careers page
  ashby?: string // Ashby board id, when the company uses Ashby
}

const BOARDS: Board[] = [
  { slug: 'higgsfield', careers: 'https://jobs.ashbyhq.com/higgsfieldai', ashby: 'higgsfieldai' },
  { slug: 'alma', careers: 'https://jobs.ashbyhq.com/tryalma', ashby: 'tryalma' },
  { slug: 'deepinfra', careers: 'https://jobs.gem.com/deep-infra' },
  { slug: 'numeo', careers: 'https://numeo.ai/careers' },
  { slug: 'datatruck', careers: 'https://www.datatruck.io/careers' },
]

type Role = { company: string; title: string; location: string; url: string }
type Live = { counts: Record<string, number>; roles: Role[] }

const byslug = (s: string) => PORTFOLIO.find((c) => c.slug === s)
const logoOf = (s: string) => byslug(s)?.logo ?? `/portfolio/${s}.png`

/** Pull live postings from every Ashby board we know about. */
async function fetchLive(): Promise<Live> {
  const withApi = BOARDS.filter((b) => b.ashby)
  const results = await Promise.all(
    withApi.map(async (b) => {
      try {
        const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${b.ashby}`)
        if (!r.ok) return null
        const j = (await r.json()) as { jobs?: { title: string; location: string; jobUrl: string }[] }
        return { board: b, jobs: j.jobs ?? [] }
      } catch {
        return null // a board being down must never break the section
      }
    }),
  )

  const counts: Record<string, number> = {}
  const roles: Role[] = []
  for (const res of results) {
    if (!res) continue
    counts[res.board.slug] = res.jobs.length
    const name = byslug(res.board.slug)?.name ?? res.board.slug
    for (const j of res.jobs.slice(0, 3)) {
      roles.push({ company: name, title: j.title, location: j.location, url: j.jobUrl })
    }
  }
  return { counts, roles }
}

export function Jobs() {
  const { t } = useI18n()
  const j = t.jobs
  const [live, setLive] = useState<Live | null>(null)

  useEffect(() => {
    let alive = true
    fetchLive().then((d) => alive && setLive(d))
    return () => {
      alive = false
    }
  }, [])

  return (
    <section id="jobs" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="08" label={j.title} />
        </Reveal>

        <div className="mt-10 max-w-2xl">
          <Reveal>
            <h2 className="font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              {j.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-70">{j.subtitle}</p>
          </Reveal>
        </div>

        {/* company boards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BOARDS.map((b, i) => {
            const c = byslug(b.slug)
            const n = live?.counts[b.slug]
            return (
              <Reveal key={b.slug} delay={i * 0.06}>
                <a
                  href={b.careers}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-2xl border border-rule bg-white p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-turquoise hover:shadow-[0_16px_40px_rgba(0,32,63,0.08)]"
                >
                  <div className="flex w-full items-center py-1.5 h-14 overflow-hidden">
                    <img
                      src={logoOf(b.slug)}
                      alt={c?.name ?? b.slug}
                      loading="lazy"
                      className="h-full w-[88%] object-contain object-left"
                    />
                  </div>

                  <div className="mt-auto pt-5">
                    <h3 className="font-display text-[1.05rem] font-semibold">{c?.name}</h3>
                    <p className="mt-1 text-[13.5px] leading-snug text-ink-70">{c?.tag}</p>
                    <span className="mt-3 inline-flex items-center gap-1 font-display text-[12.5px] font-medium text-turquoise">
                      {/* a number only where it is fetched live */}
                      {typeof n === 'number' ? `${n} ${j.openRoles}` : j.viewRoles}
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </a>
              </Reveal>
            )
          })}
        </div>

        {/* a sample of live postings */}
        {live && live.roles.length > 0 && (
          <Reveal delay={0.06}>
            <div className="mt-10 rounded-2xl border border-rule bg-snow p-6 sm:p-7">
              <h3 className="font-display text-[15px] font-semibold text-ink-70">{j.featured}</h3>
              <ul className="mt-4 flex flex-col">
                {live.roles.slice(0, 6).map((r) => (
                  <li key={r.url} className="border-b border-rule py-3 last:border-0">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-wrap items-baseline gap-x-3 gap-y-1"
                    >
                      <span className="font-display text-[15px] font-medium transition-colors group-hover:text-turquoise">
                        {r.title}
                      </span>
                      <span className="rounded-full bg-oxford/6 px-2.5 py-0.5 text-[12px] font-medium text-oxford">
                        {r.company}
                      </span>
                      <span className="text-[13px] text-ink-45">{r.location}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        <p className="mt-6 max-w-3xl text-[12.5px] leading-relaxed text-ink-45">{j.note}</p>
      </div>
    </section>
  )
}
