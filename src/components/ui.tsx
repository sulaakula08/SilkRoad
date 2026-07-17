import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * The numbered pill from the brand deck (a turquoise dot + section number,
 * e.g. "3.1"). It's the deck's strongest structural device — carried onto the
 * site so sections read as chapters of the same document.
 */
export function Index({ n, label }: { n: string; label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="inline-flex items-center gap-2.5 rounded-full border border-current/15 bg-white/60 py-1.5 pr-4 pl-1.5 backdrop-blur-sm">
        <span className="size-5 rounded-full bg-turquoise ring-1 ring-oxford/20" />
        <span className="font-display text-[15px] font-semibold tracking-tight tabular-nums">
          {n}
        </span>
      </span>
      {label && (
        <span className="text-[13px] tracking-[0.16em] text-ink-45 uppercase">
          {label}
        </span>
      )}
    </div>
  )
}

/** Dark-surface variant of <Index/>. */
export function IndexDark({ n, label }: { n: string; label?: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pr-4 pl-1.5">
        <span className="size-5 rounded-full bg-turquoise" />
        <span className="font-display text-[15px] font-semibold tracking-tight text-snow tabular-nums">
          {n}
        </span>
      </span>
      {label && (
        <span className="text-[13px] tracking-[0.16em] text-snow/50 uppercase">
          {label}
        </span>
      )}
    </div>
  )
}

/**
 * Small caps label with a turquoise dot.
 *
 * Turquoise is only 1.86:1 on Snow Drift, so it can never carry small text on
 * a light ground — it appears as the dot and the ink does the reading.
 */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 font-display text-[13px] tracking-[0.14em] text-ink-70 uppercase">
      <span className="size-1.5 shrink-0 rounded-full bg-turquoise" />
      {children}
    </p>
  )
}

/** Fade + rise on scroll. One shared curve so the whole page moves alike. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const still = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={still ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

type ButtonProps = {
  to?: string
  href?: string
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

const base =
  'group relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 font-display text-[15px] font-semibold tracking-tight transition-[background-color,color,border-color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-40'

const variants = {
  solid: 'bg-oxford text-snow hover:bg-turquoise hover:text-oxford',
  outline:
    'border border-oxford/20 text-oxford hover:border-oxford/0 hover:bg-oxford hover:text-snow',
  ghost: 'text-oxford hover:bg-oxford/5',
}

export function Button({
  to,
  href,
  children,
  variant = 'solid',
  className = '',
  ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`
  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href)
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}

/** Arrow glyph echoing the logo's up-right travel. */
export function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-4 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path
        d="M4 12L12 4M12 4H5.5M12 4v6.5"
        strokeLinecap="square"
        className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
      />
    </svg>
  )
}
