/**
 * The Silkroad Angels icon (Brand Guideline §2.4) — an arrow built from a
 * 10x10 halftone field. Radius and opacity are measured off the source
 * artwork, so this renders the mark exactly rather than approximating it.
 *
 * Static by design. (Props kept for call-site compatibility.)
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
  /** Accepted for API compatibility; the mark is always static. */
  animate?: boolean
  delay?: number
}

export function Halftone({ className, color = 'var(--color-cyan)' }: Props) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true" fill="none">
      {GRID.map((row, y) =>
        row.map((lvl, x) => {
          const { r, o } = LEVELS[lvl]
          return (
            <circle
              key={`${x}-${y}`}
              cx={PITCH * x + PITCH / 2}
              cy={PITCH * y + PITCH / 2}
              r={r * PITCH}
              fill={color}
              opacity={o}
            />
          )
        }),
      )}
    </svg>
  )
}
