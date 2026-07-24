import { Index, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/** The five principles the club is run by. */
export function Values() {
  const { t } = useI18n()

  return (
    <section className="border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="03" label={t.values.title} />
        </Reveal>

        <div className="mt-10 max-w-2xl">
          <Reveal>
            <h2 className="font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              {t.values.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-70">
              {t.values.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {t.values.items.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05} className="h-full">
              <div className="group h-full bg-snow p-6 transition-colors duration-300 hover:bg-white">
                <div className="mb-5 h-px w-8 bg-turquoise transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16" />
                <h3 className="font-display text-[17px] font-semibold">{v.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-70">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
