import { motion, useReducedMotion } from 'framer-motion'
import { IndexDark, Reveal } from '../components/ui'
import { DotField } from '../components/DotField'
import { useI18n } from '../i18n'

/** The Hub's real investment numbers, straight from the deck. Dark spread. */
export function TrackRecord() {
  const { t } = useI18n()
  const still = useReducedMotion()

  return (
    <section
      id="track"
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
        <Reveal>
          <IndexDark n="05" label={t.track.title} />
        </Reveal>

        <div className="mt-10 max-w-2xl">
          <Reveal>
            <h2 className="font-display text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-h2">
              {t.track.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-[16.5px] leading-relaxed text-snow/70">
              {t.track.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {t.track.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={still ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="bg-oxford p-7 sm:p-8"
            >
              <dt className="font-display text-[2.75rem] leading-none font-semibold text-turquoise tabular-nums sm:text-[3.25rem]">
                {s.n}
              </dt>
              <dd className="mt-3 text-[14.5px] leading-relaxed text-snow/65">{s.label}</dd>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 flex items-start gap-3 text-[14px] leading-relaxed text-snow/55">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-turquoise" />
            {t.track.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
