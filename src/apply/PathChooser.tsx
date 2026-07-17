import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Halftone } from '../components/Halftone'
import { ArrowUpRight, Index } from '../components/ui'

const DOORS = [
  {
    to: '/apply/investor',
    kicker: '01',
    title: 'I want to invest',
    body: 'You have capital and you want Valley deal flow that has already been through a screen. Four questions decide whether you start in the syndicate, the membership, or the Academy.',
    points: ['Accreditation check', 'Cheque size and cadence', 'Sectors you follow'],
    time: '≈ 3 minutes',
  },
  {
    to: '/apply/founder',
    kicker: '02',
    title: 'I’m raising',
    body: 'You are building something and you want the corridor open in both directions. Stage and structure decide whether you go to fast track, corridor review, or a straight “not yet”.',
    points: ['Stage and round', 'Incorporation and flip', 'The strongest number you have'],
    time: '≈ 4 minutes',
  },
]

export function PathChooser() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-32 pb-28 sm:px-8">
      <Index n="0.0" label="Intake" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <h1 className="font-display text-[2.75rem] leading-[1.08] font-semibold sm:text-h2">
            Two doors.
            <br />
            <span className="text-ink-45">One corridor.</span>
          </h1>
          <p className="measure mt-5 text-[16.5px] leading-relaxed text-ink-70">
            Everything after this question is different — the form, the reviewer,
            the timeline, the answer you get back. So pick the door that is
            actually yours. You can switch at any point without losing what you
            typed.
          </p>
        </div>
        <Halftone className="ml-auto hidden w-40 lg:block" color="var(--color-turquoise)" />
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {DOORS.map((d, i) => (
          <motion.div
            key={d.to}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={d.to}
              className="group flex h-full flex-col rounded-2xl border border-rule bg-white p-7 transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-turquoise sm:p-9"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-[13px] tracking-[0.14em] text-ink-45 tabular-nums">
                  {d.kicker}
                </span>
                <span className="grid size-9 place-items-center rounded-full border border-rule text-ink-45 transition-colors duration-300 group-hover:border-oxford group-hover:bg-oxford group-hover:text-snow">
                  <ArrowUpRight />
                </span>
              </div>

              <h2 className="mt-6 font-display text-h5 font-semibold">{d.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-70">{d.body}</p>

              <ul className="mt-6 space-y-2 border-t border-rule pt-5">
                {d.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-[14px]">
                    <span className="size-1.5 rounded-full bg-turquoise" />
                    {p}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-[13px] text-ink-45">{d.time}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-10 max-w-xl text-[14px] leading-relaxed text-ink-45">
        Both, somehow? Founders who are also angels are common here — start with
        the founder form and say so in the last field. We will link the two
        profiles.
      </p>
    </div>
  )
}
