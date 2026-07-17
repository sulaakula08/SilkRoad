import { motion, useReducedMotion } from 'framer-motion'

/**
 * The Silkroad Angels icon (Brand Guideline §2.4) — an arrow built from a
 * 10x10 halftone field. Radius and opacity are measured off the source
 * artwork, so this renders the mark exactly rather than approximating it.
 *
 * "The arrow formed from dots represents the expansion and scalability of
 *  ideas, as well as the digital nature of innovation." — §2.1
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

type Props = {
  className?: string
  color?: string
  /** Dots resolve along the arrow's travel — down-left to up-right. */
  animate?: boolean
  delay?: number
}

export function Halftone({
  className,
  color = 'var(--color-cyan)',
  animate = true,
  delay = 0,
}: Props) {
  const still = useReducedMotion() || !animate

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {GRID.map((row, y) =>
        row.map((lvl, x) => {
          const { r, o } = LEVELS[lvl]
          // Sweep origin: bottom-left corner, travelling toward the arrowhead.
          const travel = (x + (9 - y)) / 18
          return (
            <motion.circle
              key={`${x}-${y}`}
              cx={PITCH * x + PITCH / 2}
              cy={PITCH * y + PITCH / 2}
              r={r * PITCH}
              fill={color}
              initial={still ? false : { opacity: 0, scale: 0.2 }}
              whileInView={still ? undefined : { opacity: o, scale: 1 }}
              animate={still ? { opacity: o, scale: 1 } : undefined}
              viewport={{ once: true, margin: '-10%' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              transition={{
                duration: 0.5,
                delay: delay + travel * 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          )
        }),
      )}
    </svg>
  )
}
