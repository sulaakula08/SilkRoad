import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Index, Reveal } from '../components/ui'
import { useI18n } from '../i18n'

/** FAQ accordion + a "book a call" prompt. */
export function Faq() {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Index n="09" label={t.faq.title} />
            </Reveal>
            <Reveal>
              <h2 className="mt-8 font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h3">
                {t.faq.title}
              </h2>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <ul className="border-t border-rule">
              {t.faq.items.map((item, i) => {
                const on = open === i
                return (
                  <li key={item.q} className="border-b border-rule">
                    <button
                      onClick={() => setOpen(on ? null : i)}
                      aria-expanded={on}
                      className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span
                        className={`font-display text-[17px] leading-snug font-medium transition-colors duration-200 sm:text-[18px] ${
                          on ? 'text-oxford' : 'text-ink-70 group-hover:text-oxford'
                        }`}
                      >
                        {item.q}
                      </span>
                      <span className="relative mt-1.5 grid size-5 shrink-0 place-items-center">
                        <span className="absolute h-px w-3.5 bg-current" />
                        <motion.span
                          className="absolute h-px w-3.5 bg-current"
                          animate={{ rotate: on ? 0 : 90 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pr-10 pb-7 text-[15.5px] leading-relaxed text-ink-70">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
