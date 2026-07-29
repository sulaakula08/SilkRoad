import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Halftone } from '../components/Halftone'
import { DotField } from '../components/DotField'
import { ArrowUpRight } from '../components/ui'
import { useDarkNav } from '../components/navTheme'
import { useI18n } from '../i18n'

const line = {
  hidden: { opacity: 0, y: '0.45em' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.14 + i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

export function Hero() {
  const still = useReducedMotion()
  const { t } = useI18n()
  useDarkNav()

  const titleLines = t.hero.title.split('\n')

  return (
    <section className="relative overflow-hidden bg-oxford text-snow">
      <DotField
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[65%] opacity-[0.16]"
        color="var(--color-turquoise)"
        pitch={44}
        radius={4.5}
        fade="right"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-36 pb-20 sm:px-8 sm:pt-44 sm:pb-28">
        <div className="grid gap-16 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            {/* backed-by badge (replaces the old city list) */}
            <motion.p
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pr-4 pl-2 font-display text-[13px] font-medium text-snow/80"
            >
              <span className="grid size-5 place-items-center rounded-full bg-turquoise/15">
                <span className="size-1.5 rounded-full bg-turquoise" />
              </span>
              {t.hero.badge}
            </motion.p>

            <h1 className="mt-7 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-[4rem] lg:text-[4.6rem]">
              {titleLines.map((l, i) => (
                <motion.span
                  key={l}
                  custom={i}
                  variants={line}
                  initial={still ? false : 'hidden'}
                  animate="show"
                  className="block overflow-hidden"
                >
                  <span className={i === titleLines.length - 1 ? 'text-turquoise' : undefined}>
                    {l}
                  </span>
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={still ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-lg text-[17px] leading-relaxed text-snow/70 sm:text-[18px]"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={still ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.56, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/apply/investor"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-turquoise px-8 py-4 font-display text-[15.5px] font-semibold text-oxford transition-colors duration-200 hover:bg-cyan"
              >
                {t.hero.cta} <ArrowUpRight />
              </Link>
              <a
                href="#club"
                className="font-display text-[15px] font-medium text-snow/70 transition-colors hover:text-snow"
              >
                {t.hero.scroll} ↓
              </a>
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <Halftone className="ml-auto w-full max-w-[22rem]" delay={0.3} />
          </div>
        </div>
      </div>

    </section>
  )
}
