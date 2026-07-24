import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Index, Reveal, ArrowUpRight } from '../components/ui'
import { PORTFOLIO, type Company } from '../content'
import { useI18n } from '../i18n'

const EASE = [0.16, 1, 0.3, 1] as const
const FEATURED = 4

const visitHref = (c: Company) =>
  c.url ?? `https://www.google.com/search?q=${encodeURIComponent(c.name + ' startup')}`

function Card({ c, featured }: { c: Company; featured?: boolean }) {
  const { t } = useI18n()
  return (
    <a
      href={visitHref(c)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-2xl border border-rule bg-white p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-turquoise hover:shadow-[0_16px_40px_rgba(0,32,63,0.08)]"
    >
      {/* logo */}
      <div
        className={`flex items-center ${
          featured ? 'h-20' : 'h-14'
        } justify-start overflow-hidden`}
      >
        <img
          src={`/portfolio/${c.slug}.png`}
          alt={c.name}
          loading="lazy"
          className="max-h-full w-auto max-w-[70%] object-contain object-left"
        />
      </div>

      <div className="mt-auto pt-5">
        <h3 className="font-display text-[1.05rem] font-semibold">{c.name}</h3>
        <p className="mt-1 text-[13.5px] leading-snug text-ink-70">{c.tag}</p>
        <span className="mt-3 inline-flex items-center gap-1 font-display text-[12.5px] font-medium text-turquoise">
          {t.portfolio.visit}
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </a>
  )
}

export function Portfolio() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const featured = PORTFOLIO.slice(0, FEATURED)
  const rest = PORTFOLIO.slice(FEATURED)

  return (
    <section id="portfolio" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="07" label={t.portfolio.title} />
        </Reveal>

        <div className="mt-10 max-w-2xl">
          <Reveal>
            <h2 className="font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              {t.portfolio.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-[16.5px] leading-relaxed text-ink-70">
              {t.portfolio.subtitle}
            </p>
          </Reveal>
        </div>

        {/* featured 4 */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <Card c={c} featured />
            </Reveal>
          ))}
        </div>

        {/* the rest */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {rest.map((c) => (
                  <Card key={c.slug} c={c} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="group inline-flex items-center gap-2.5 rounded-full border border-oxford/20 px-7 py-3.5 font-display text-[15px] font-semibold text-oxford transition-colors duration-200 hover:border-oxford hover:bg-oxford hover:text-snow"
          >
            {open ? t.portfolio.showLess : `${t.portfolio.readMore} (${rest.length})`}
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </motion.span>
          </button>
        </div>
      </div>
    </section>
  )
}
