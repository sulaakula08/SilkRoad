import { Link } from 'react-router-dom'
import { ArrowUpRight, IndexDark, Reveal } from '../components/ui'
import { DotField } from '../components/DotField'
import { useI18n } from '../i18n'

/** What membership actually gives you — the nine-benefit grid. */
export function Club() {
  const { t } = useI18n()

  return (
    <section
      id="club"
      className="relative scroll-mt-20 overflow-hidden bg-oxford py-24 text-snow sm:py-32"
    >
      <DotField
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 opacity-[0.1]"
        color="var(--color-turquoise)"
        pitch={44}
        radius={4.5}
        fade="right"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <IndexDark n="02" label={t.club.kicker} />
            </Reveal>
            <Reveal>
              <h2 className="mt-8 font-display text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-h2">
                {t.club.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="lg:pt-4">
            <div className="space-y-4 text-[16px] leading-relaxed text-snow/70">
              <p>{t.club.body1}</p>
              <p>{t.club.body2}</p>
            </div>
            <Reveal delay={0.16}>
              <Link
                to="/apply/investor"
                className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-turquoise px-7 py-3.5 font-display text-[15px] font-semibold text-oxford transition-colors duration-200 hover:bg-cyan"
              >
                {t.club.cta} <ArrowUpRight />
              </Link>
            </Reveal>
          </Reveal>
        </div>

        {/* benefits */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {t.club.benefits.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.05} className="h-full">
              <div className="group flex h-full flex-col bg-oxford p-6 transition-colors duration-300 hover:bg-white/[0.04] sm:p-7">
                <span className="font-display text-[12.5px] text-turquoise tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-[1.15rem] leading-tight font-semibold">
                  {b.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-snow/65">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
