import { Index, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/** The team — portrait cards with name + role, as in the deck's "Our team". */
export function Team() {
  const { t } = useI18n()

  return (
    <section id="team" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="06" label={t.team.title} />
        </Reveal>

        <div className="mt-10 max-w-2xl">
          <Reveal>
            <h2 className="font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              {t.team.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-70">
              {t.team.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.team.members.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <figure className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-oxford ring-1 ring-rule">
                <img
                  src={m.photo}
                  alt={m.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
                {/* name plate */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-oxford via-oxford/70 to-transparent px-5 pt-16 pb-5">
                  <figcaption>
                    <p className="font-display text-[1.15rem] leading-tight font-semibold text-snow">
                      {m.name}
                    </p>
                    <p className="mt-0.5 text-[14px] text-turquoise">{m.role}</p>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
