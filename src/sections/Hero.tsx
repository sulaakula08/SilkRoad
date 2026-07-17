import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Halftone } from '../components/Halftone'
import { DotField } from '../components/DotField'
import { ArrowUpRight } from '../components/ui'
import { useDarkNav } from '../components/navTheme'

const line = {
  hidden: { opacity: 0, y: '0.4em' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] },
  }),
}

export function Hero() {
  const still = useReducedMotion()
  useDarkNav()

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
            <motion.p
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3 font-display text-[13px] tracking-[0.16em] text-turquoise uppercase"
            >
              <span className="size-1.5 rounded-full bg-turquoise" />
              Almaty · Tashkent · Baku · Palo Alto
            </motion.p>

            <h1 className="mt-7 font-display text-[3rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-[4.5rem] lg:text-[5.25rem]">
              {['Central Eurasia', 'backs the Valley.'].map((l, i) => (
                <motion.span
                  key={l}
                  custom={i}
                  variants={line}
                  initial={still ? false : 'hidden'}
                  animate="show"
                  className="block overflow-hidden"
                >
                  <span className={i === 1 ? 'text-turquoise' : undefined}>{l}</span>
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={still ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-xl text-[17px] leading-relaxed text-snow/70 sm:text-[18px]"
            >
              We give investors from Almaty to Baku a way into Silicon Valley
              rounds that have already been screened — and we give founders in
              the corridor a way to the capital. One network, running in both
              directions.
            </motion.p>

            <motion.div
              initial={still ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                to="/apply/investor"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-turquoise px-7 py-4 font-display text-[15.5px] font-semibold text-oxford transition-colors duration-200 hover:bg-cyan"
              >
                I want to invest <ArrowUpRight />
              </Link>
              <Link
                to="/apply/founder"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 px-7 py-4 font-display text-[15.5px] font-semibold text-snow transition-colors duration-200 hover:border-snow hover:bg-snow hover:text-oxford"
              >
                I’m raising <ArrowUpRight />
              </Link>
            </motion.div>

            <motion.p
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-6 text-[13.5px] text-snow/50"
            >
              Three minutes. No account, no call booked, no “we’ll be in touch”.
            </motion.p>
          </div>

          <div className="hidden lg:block">
            <Halftone className="ml-auto w-full max-w-[22rem]" delay={0.3} />
          </div>
        </div>
      </div>

      {/* Ticker of hard numbers — grounded, not decorative. */}
      <div className="relative border-t border-white/10">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-6 sm:px-8 lg:grid-cols-4">
          {[
            ['$41M', 'deployed since 2021'],
            ['112', 'angels in the network'],
            ['64', 'Valley companies backed'],
            ['9', 'countries in the corridor'],
          ].map(([n, l], i) => (
            <motion.div
              key={l}
              initial={still ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="px-2 py-8 first:pl-0 sm:px-6 sm:py-10"
            >
              <dt className="font-display text-[2rem] font-semibold text-snow tabular-nums sm:text-[2.5rem]">
                {n}
              </dt>
              <dd className="mt-1 text-[13.5px] text-snow/50">{l}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}
