import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/**
 * The Silkroad Angels icon (Brand Guideline §2.4) — an arrow built from a
 * 10x10 halftone field. Radius and opacity are measured off the source
 * artwork, so this renders the mark exactly rather than approximating it.
 *
 * "The arrow formed from dots represents the expansion and scalability of
 *  ideas, as well as the digital nature of innovation." — §2.1
 *
 * Motion: the dots pop in along the arrow's own diagonal (bottom-left →
 * arrowhead) with a slight overshoot, then settle into a slow shimmer that
 * rides the same diagonal, so the mark keeps feeling alive without pulling
 * focus. Fully static when `animate` is false or reduced-motion is on.
 */

/** Six discrete dot states. r is a fraction of the 1-unit cell pitch. */
const LEVELS = [
  { r: 0.166, o: 0.6 },
  { r: 0.254, o: 0.7 },
  { r: 0.254, o: 0.8 },
  { r: 0.284, o: 0.9 },
  { r: 0.313, o: 1.0 },
  { r: 0.342, o: 1.0 },
] as const

const GRID = [
  [0, 0, 0, 5, 5, 5, 5, 5, 5, 5],
  [0, 0, 4, 4, 4, 4, 4, 4, 4, 5],
  [0, 3, 3, 3, 3, 3, 3, 3, 4, 5],
  [2, 2, 2, 2, 2, 2, 2, 3, 4, 5],
  [0, 0, 0, 0, 0, 1, 2, 3, 4, 5],
  [0, 0, 0, 0, 0, 0, 2, 3, 4, 5],
  [0, 0, 0, 0, 0, 0, 2, 3, 4, 5],
  [0, 0, 0, 0, 0, 0, 2, 3, 4, 0],
  [0, 0, 0, 0, 0, 0, 2, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
] as const

const PITCH = 48
const SIZE = PITCH * 10

/** How long the whole pop-in takes, in seconds. */
const SWEEP = 0.7
const POP = 0.55

type Props = {
  className?: string
  color?: string
  animate?: boolean
  delay?: number
}

export function Halftone({
  className,
  color = 'var(--color-cyan)',
  animate = true,
  delay = 0,
}: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8%' })
  const reduced = useReducedMotion()
  const still = reduced || !animate

  // Once the pop-in has finished, hand over to the idle shimmer.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (still || !inView) return
    const t = setTimeout(
      () => setSettled(true),
      (delay + SWEEP + POP + 0.3) * 1000,
    )
    return () => clearTimeout(t)
  }, [still, inView, delay])

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {GRID.map((row, y) =>
        row.map((lvl, x) => {
          const { r, o } = LEVELS[lvl]
          // Phase along the arrow's travel: bottom-left (0) → arrowhead (1).
          const travel = (x + (9 - y)) / 18

          const cx = PITCH * x + PITCH / 2
          const cy = PITCH * y + PITCH / 2

          if (still) {
            return (
              <circle key={`${x}-${y}`} cx={cx} cy={cy} r={r * PITCH} fill={color} opacity={o} />
            )
          }

          return (
            <motion.circle
              key={`${x}-${y}`}
              cx={cx}
              cy={cy}
              r={r * PITCH}
              fill={color}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={
                settled
                  ? // idle: a slow wave riding the same diagonal
                    { opacity: [o, o * 0.55, o], scale: [1, 0.9, 1] }
                  : inView
                    ? // pop in with a little overshoot
                      { opacity: [0, o, o], scale: [0, 1.22, 1] }
                    : { opacity: 0, scale: 0 }
              }
              transition={
                settled
                  ? {
                      duration: 2.8,
                      repeat: Infinity,
                      repeatDelay: 1.4,
                      delay: travel * 1.1,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: POP,
                      delay: delay + travel * SWEEP,
                      times: [0, 0.62, 1],
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            />
          )
        }),
      )}
    </svg>
  )
}
