import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, IndexDark, Reveal } from '../components/ui'
import { DotField } from '../components/DotField'

/**
 * Mirrors the tracks in apply/routing.ts. Shown up front deliberately: the
 * applicant should be able to predict their outcome before they start typing.
 */
const SIDES = {
  investor: {
    label: 'For investors',
    lead: 'Three ways in. The form decides which, and it decides it on four answers.',
    cta: { to: '/apply/investor', text: 'Start investor intake' },
    tracks: [
      {
        n: '01',
        name: 'Angel Academy',
        who: 'Not accredited yet, or new to this',
        body: 'Eight weeks on how Valley deals are priced, papered and exited. You read live memos while you learn, then move to the syndicate.',
        meta: 'Cohort of 24 · 8 weeks',
      },
      {
        n: '02',
        name: 'Syndicate',
        who: 'Accredited, want to go deal by deal',
        body: 'Participate through our SPVs with no annual commitment. Each memo arrives, you decide. $5k minimum.',
        meta: 'Per deal · from $5k',
      },
      {
        n: '03',
        name: 'Core Membership',
        who: 'Accredited, experienced, $50k+ cheques',
        body: 'The full pipeline, a seat at screening, co-investment rights alongside Valley leads, and the annual Bay Area programme.',
        meta: 'Annual · by committee',
      },
    ],
  },
  founder: {
    label: 'For founders',
    lead: 'Two answers — stage and structure — decide how your application moves. Including when the answer is no.',
    cta: { to: '/apply/founder', text: 'Start founder intake' },
    tracks: [
      {
        n: '01',
        name: 'Fast track',
        who: 'Seed or A, revenue, US-incorporated',
        body: 'You clear the structural bar, so you skip first screening and go straight to a partner read. Committee meets Thursdays.',
        meta: 'Partner read · 7 days',
      },
      {
        n: '02',
        name: 'Corridor Review',
        who: 'Real traction, incorporated in the region',
        body: 'Most of our angels cannot invest into your entity today. We review the business anyway and put counsel on the flip in parallel.',
        meta: 'Screening + counsel · 10 days',
      },
      {
        n: '03',
        name: 'A straight no',
        who: 'Idea stage, no product yet',
        body: 'We invest from first product on. You get the reading list, our actual memo template, and an open door at monthly office hours.',
        meta: 'Immediate · no waiting',
      },
    ],
  },
} as const

type Side = keyof typeof SIDES

export function Tracks() {
  const [side, setSide] = useState<Side>('investor')
  const s = SIDES[side]

  return (
    <section
      id="tracks"
      className="relative scroll-mt-20 overflow-hidden bg-oxford py-24 text-snow sm:py-32"
    >
      <DotField
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/2 opacity-[0.1]"
        color="var(--color-turquoise)"
        pitch={44}
        radius={4.5}
        fade="left"
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <IndexDark n="2.0" label="Smart routing" />
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <h2 className="max-w-2xl font-display text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
              You should know where you’ll land before you start.
            </h2>
          </Reveal>

          {/* side switch */}
          <Reveal delay={0.1}>
            <div
              role="tablist"
              aria-label="Choose your side"
              className="inline-flex rounded-full border border-white/15 p-1"
            >
              {(Object.keys(SIDES) as Side[]).map((k) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={side === k}
                  onClick={() => setSide(k)}
                  className={`relative rounded-full px-5 py-2.5 font-display text-[14.5px] font-semibold transition-colors duration-200 ${
                    side === k ? 'text-oxford' : 'text-snow/60 hover:text-snow'
                  }`}
                >
                  {side === k && (
                    <motion.span
                      layoutId="side-pill"
                      className="absolute inset-0 rounded-full bg-turquoise"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span className="relative">{SIDES[k].label}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={side}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mt-8 max-w-xl text-[16.5px] leading-relaxed text-snow/65">
              {s.lead}
            </p>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-3">
              {s.tracks.map((t) => (
                <div
                  key={t.name}
                  className="group flex flex-col bg-oxford p-7 transition-colors duration-300 hover:bg-white/[0.04] sm:p-9"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-[13px] text-turquoise tabular-nums">
                      {t.n}
                    </span>
                    <span className="text-[12.5px] tracking-[0.1em] text-snow/50 uppercase">
                      {t.meta}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-h6 font-semibold">{t.name}</h3>
                  <p className="mt-1.5 text-[14px] text-turquoise/90">{t.who}</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-snow/65">
                    {t.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                to={s.cta.to}
                className="group inline-flex items-center gap-2.5 rounded-full bg-turquoise px-7 py-4 font-display text-[15.5px] font-semibold text-oxford transition-colors duration-200 hover:bg-cyan"
              >
                {s.cta.text} <ArrowUpRight />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
