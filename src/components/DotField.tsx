import { useId } from 'react'

/**
 * The dot lattice used across the brand deck's dark spreads (§ cover, 2.2–2.4).
 * A plain <pattern> tiled behind content and faded with a mask, so it never
 * competes with type. Purely decorative.
 */
export function DotField({
  className,
  color = 'var(--color-turquoise)',
  pitch = 48,
  radius = 5,
  fade = 'right',
}: {
  className?: string
  color?: string
  pitch?: number
  radius?: number
  fade?: 'right' | 'left' | 'bottom' | 'none'
}) {
  const id = useId()
  const grad =
    fade === 'none'
      ? null
      : {
          right: { x1: '0', y1: '0', x2: '1', y2: '0' },
          left: { x1: '1', y1: '0', x2: '0', y2: '0' },
          bottom: { x1: '0', y1: '0', x2: '0', y2: '1' },
        }[fade]

  return (
    <svg className={className} aria-hidden="true">
      <defs>
        <pattern
          id={`p${id}`}
          width={pitch}
          height={pitch}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={pitch / 2} cy={pitch / 2} r={radius} fill={color} />
        </pattern>
        {grad && (
          <linearGradient id={`g${id}`} {...grad}>
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.55" stopColor="white" stopOpacity="0.55" />
            <stop offset="1" stopColor="white" stopOpacity="1" />
          </linearGradient>
        )}
        {grad && (
          <mask id={`m${id}`}>
            <rect width="100%" height="100%" fill={`url(#g${id})`} />
          </mask>
        )}
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#p${id})`}
        mask={grad ? `url(#m${id})` : undefined}
      />
    </svg>
  )
}
