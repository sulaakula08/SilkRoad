import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Index, Reveal } from '../components/ui'

const STEPS = [
  {
    n: '01',
    t: 'You answer four questions',
    b: 'Not a lead form. The questions branch — what you are asked depends on what you have already said, so nobody types an answer that cannot matter.',
  },
  {
    n: '02',
    t: 'The intake routes you',
    b: 'Accreditation, cheque size and experience decide an investor’s track. Stage and incorporation decide a founder’s. You see the result on submit, not three weeks later.',
  },
  {
    n: '03',
    t: 'A named human reads it',
    b: 'Investor relations, the education team, or a partner — the outcome screen tells you which, and how long they will take.',
  },
  {
    n: '04',
    t: 'You get a written answer',
    b: 'Yes with next steps, or no with reasons. We do not ghost founders and we do not string investors along.',
  },
]

export function Process() {
  const ref = useRef<HTMLDivElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.75', 'end 0.6'],
  })
  const h = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="process" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="2.1" label="How it works" />
        </Reveal>

        <Reveal>
          <h2 className="mt-10 max-w-2xl font-display text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
            Four questions in, a real answer out.
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16 grid gap-0 lg:grid-cols-2 lg:gap-20">
          {/* the rail — fills as you scroll, echoing the logo's travel */}
          <div className="absolute top-0 bottom-0 left-[7px] w-px bg-rule lg:left-1/2 lg:-translate-x-1/2">
            <motion.div
              className="w-px bg-turquoise"
              style={{ height: still ? '100%' : h }}
            />
          </div>

          <ol className="col-span-full space-y-0">
            {STEPS.map((s, i) => (
              <li key={s.n} className="relative">
                <Reveal delay={0.04 * i}>
                  <div
                    className={`relative py-9 pl-10 lg:w-[calc(50%-2.5rem)] lg:pl-0 ${
                      i % 2 ? 'lg:ml-auto lg:pl-12 lg:text-left' : 'lg:pr-12 lg:text-right'
                    }`}
                  >
                    {/* node */}
                    <span
                      className={`absolute top-[42px] left-0 size-4 rounded-full border-2 border-snow bg-turquoise lg:top-[46px] ${
                        i % 2 ? 'lg:-left-[calc(2.5rem+8px)]' : 'lg:right-[calc(-2.5rem-8px)] lg:left-auto'
                      }`}
                    />
                    <span className="font-display text-[13px] text-ink-45 tabular-nums">
                      {s.n}
                    </span>
                    <h3 className="mt-2 font-display text-h6 font-semibold">{s.t}</h3>
                    <p
                      className={`mt-3 text-[15.5px] leading-relaxed text-ink-70 ${
                        i % 2 ? '' : 'lg:ml-auto'
                      } max-w-md`}
                    >
                      {s.b}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
