import { ArrowUpRight, Reveal } from '../components/ui'
import { Halftone } from '../components/Halftone'
import { useI18n } from '../i18n'
import { CONTACT } from '../content'

/** The three headline reasons to join, plus the Innovation Hub provenance. */
export function Value() {
  const { t } = useI18n()

  return (
    <section className="border-b border-rule py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-3">
          {t.value.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07} className="h-full">
              <div className="flex h-full flex-col bg-snow p-7 transition-colors duration-300 hover:bg-white sm:p-8">
                <span className="font-display text-[14px] text-turquoise tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="mt-5 font-display text-[1.35rem] leading-tight font-semibold">
                  {item.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-70">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Innovation Hub provenance — links out to the parent organisation */}
        <Reveal delay={0.1}>
          <a
            href={CONTACT.hub}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 flex flex-col items-start gap-5 overflow-hidden rounded-2xl bg-oxford p-7 text-snow ring-1 ring-transparent transition-[box-shadow] duration-300 hover:ring-turquoise/50 sm:flex-row sm:items-center sm:gap-8 sm:p-8"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/5">
              <Halftone className="size-9" color="var(--color-cyan)" animate={false} />
            </span>
            <div className="flex-1">
              <h3 className="flex items-center gap-2 font-display text-h6 font-semibold">
                {t.value.hubTitle}
                <ArrowUpRight className="size-4 text-turquoise transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </h3>
              <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-snow/70">
                {t.value.hubBody}
              </p>
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
