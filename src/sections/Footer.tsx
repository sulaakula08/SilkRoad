import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Halftone } from '../components/Halftone'
import { ArrowUpRight, Reveal } from '../components/ui'

const COLS = [
  {
    h: 'Network',
    links: [
      ['The corridor', '/#corridor'],
      ['Tracks', '/#tracks'],
      ['How it works', '/#process'],
      ['FAQ', '/#faq'],
    ],
  },
  {
    h: 'Apply',
    links: [
      ['Investor intake', '/apply/investor'],
      ['Founder intake', '/apply/founder'],
      ['Angel Academy', '/apply/investor'],
    ],
  },
  {
    h: 'Contact',
    links: [
      ['hello@silkroadangels.com', 'mailto:hello@silkroadangels.com'],
      ['LinkedIn', 'https://linkedin.com'],
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-oxford text-snow">
      {/* closing CTA */}
      <div className="relative border-b border-white/10">
        <Halftone
          className="pointer-events-none absolute -top-20 -right-16 w-[30rem] opacity-[0.12]"
          color="var(--color-turquoise)"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="max-w-3xl font-display text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-[4rem]">
              The corridor is open.
              <span className="text-turquoise"> Pick your side.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/apply/investor"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-turquoise px-7 py-4 font-display text-[15.5px] font-semibold text-oxford transition-colors duration-200 hover:bg-cyan"
              >
                I want to invest <ArrowUpRight />
              </Link>
              <Link
                to="/apply/founder"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 px-7 py-4 font-display text-[15.5px] font-semibold transition-colors duration-200 hover:border-snow hover:bg-snow hover:text-oxford"
              >
                I’m raising <ArrowUpRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* footer proper */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-8 w-auto text-snow" />
            <p className="mt-6 max-w-xs text-[14.5px] leading-relaxed text-snow/50">
              An angel network connecting Central Eurasia with Silicon Valley —
              curated deals, real education, and a community that answers.
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.h}>
              <h3 className="text-[12.5px] tracking-[0.14em] text-snow/50 uppercase">
                {c.h}
              </h3>
              <ul className="mt-5 space-y-3">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link
                        to={href}
                        className="text-[14.5px] text-snow/70 transition-colors duration-200 hover:text-turquoise"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-[14.5px] break-all text-snow/70 transition-colors duration-200 hover:text-turquoise"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[13px] text-snow/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Silkroad Angels. Almaty · Palo Alto.</p>
          <p className="max-w-xl leading-relaxed">
            Nothing here is an offer to sell securities. Private investments are
            illiquid and you can lose everything you put in.
          </p>
        </div>
      </div>
    </footer>
  )
}
