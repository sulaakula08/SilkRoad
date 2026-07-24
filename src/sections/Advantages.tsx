import { Index, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/** Why angel investing at all — four upside cards. */
export function Advantages() {
  const { t } = useI18n()

  return (
    <section className="border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="01" label={t.advantages.title} />
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              {t.advantages.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:pt-2">
            <p className="measure text-[16.5px] leading-relaxed text-ink-70">
              {t.advantages.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {t.advantages.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-rule bg-white p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-turquoise sm:p-8">
                <div className="mb-5 h-px w-8 bg-turquoise transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16" />
                <h3 className="font-display text-[1.3rem] font-semibold">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-70">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
