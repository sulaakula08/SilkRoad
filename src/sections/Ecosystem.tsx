import { Link } from 'react-router-dom'
import { ArrowUpRight, Index, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/** The three pillars of the Silkroad ecosystem. */
export function Ecosystem() {
  const { t } = useI18n()

  return (
    <section id="ecosystem" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="04" label={t.ecosystem.title} />
        </Reveal>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2 className="max-w-2xl font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              {t.ecosystem.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="measure text-[16px] leading-relaxed text-ink-70">
              {t.ecosystem.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {t.ecosystem.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.07}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-white transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-turquoise">
                {/* dark tile header carrying the mark motif */}
                <div className="relative flex h-36 items-end overflow-hidden bg-oxford p-6">
                  <span className="font-display text-[15px] font-semibold text-snow">
                    {item.name}
                  </span>
                  <span className="absolute -top-8 -right-6 size-32 rounded-full bg-turquoise/10 blur-xl transition-opacity duration-300 group-hover:opacity-60" />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-[15px] leading-relaxed text-ink-70">{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <Link
              to="/apply/investor"
              className="group inline-flex items-center gap-2.5 rounded-full bg-oxford px-7 py-4 font-display text-[15.5px] font-semibold text-snow transition-colors duration-200 hover:bg-turquoise hover:text-oxford"
            >
              {t.ecosystem.cta} <ArrowUpRight />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
