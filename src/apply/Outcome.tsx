import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Answers, Path, Track } from './routing'
import { Halftone } from '../components/Halftone'
import { IndexDark } from '../components/ui'
import { useDarkNav } from '../components/navTheme'

export function Outcome({
  track,
  path,
  answers,
  onRestart,
}: {
  track: Track
  path: Path
  answers: Answers
  onRestart: () => void
}) {
  useDarkNav()
  const name = (answers.firstName as string) || 'there'

  return (
    <div className="relative min-h-screen overflow-hidden bg-oxford text-snow">
      <Halftone
        className="pointer-events-none absolute -top-16 -right-24 w-[34rem] opacity-[0.14] sm:-right-10"
        color="var(--color-turquoise)"
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 pt-32 pb-28 sm:px-8">
        <IndexDark n="3.0" label="Routed" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mt-8 text-[16px] text-snow/60">
            Thank you, {name}. Your application is in — here is exactly where it
            went.
          </p>

          <h1 className="mt-5 font-display text-[2.5rem] leading-[1.08] font-semibold text-balance sm:text-h2">
            {track.name}
          </h1>

          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-snow/75">
            {track.summary}
          </p>

          {!track.advancing && (
            <p className="mt-6 max-w-xl rounded-xl border border-cyan/25 bg-cyan/5 px-5 py-4 text-[14.5px] leading-relaxed text-snow/80">
              To be direct: this is a no for now, not a maybe. We would rather
              you spend the next six months building than waiting on us.
            </p>
          )}
        </motion.div>

        {/* what happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14"
        >
          <h2 className="font-display text-[13px] tracking-[0.14em] text-snow/50 uppercase">
            What happens next
          </h2>
          <ol className="mt-6 space-y-0">
            {track.next.map((s, i) => (
              <li
                key={i}
                className="flex gap-5 border-t border-white/10 py-5 last:border-b"
              >
                <span className="mt-0.5 font-display text-[13px] text-turquoise tabular-nums">
                  0{i + 1}
                </span>
                <span className="text-[15.5px] leading-relaxed text-snow/80">{s}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* meta */}
        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2"
        >
          <div className="bg-oxford p-6">
            <dt className="text-[13px] tracking-[0.12em] text-snow/50 uppercase">
              You’ll hear back in
            </dt>
            <dd className="mt-2 font-display text-h6 font-medium">{track.sla}</dd>
          </div>
          <div className="bg-oxford p-6">
            <dt className="text-[13px] tracking-[0.12em] text-snow/50 uppercase">
              Read by
            </dt>
            <dd className="mt-2 font-display text-h6 font-medium">{track.reviewer}</dd>
          </div>
        </motion.dl>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-[14.5px]"
        >
          <Link to="/" className="text-snow/70 transition-colors hover:text-turquoise">
            ← Back to the site
          </Link>
          <button
            onClick={onRestart}
            className="text-snow/70 transition-colors hover:text-turquoise"
          >
            Submit another application
          </button>
          <span className="text-snow/50">
            Reference:{' '}
            <span className="tabular-nums">
              SA-{path === 'investor' ? 'INV' : 'FDR'}-
              {String(Math.abs(hash(JSON.stringify(answers))) % 100000).padStart(5, '0')}
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  )
}

/** Stable, human-quotable reference number from the submitted answers. */
function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}
