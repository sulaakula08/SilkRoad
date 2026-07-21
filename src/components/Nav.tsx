import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { ArrowUpRight } from './ui'
import { useNavTheme } from './navTheme'

const LINKS = [
  { href: '/#corridor', label: 'The corridor' },
  { href: '/#tracks', label: 'Tracks' },
  { href: '/#process', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
]

export function Nav() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const { pathname } = useLocation()
  const { overDark } = useNavTheme()

  /** Transparent over a dark section => invert the nav's contents. */
  const inverted = overDark && !stuck

  useMotionValueEvent(scrollY, 'change', (v) => setStuck(v > 24))
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{
          backgroundColor: stuck ? 'rgba(244,247,242,0.82)' : 'rgba(244,247,242,0)',
          borderColor: stuck ? 'rgba(219,226,220,1)' : 'rgba(219,226,220,0)',
        }}
        transition={{ duration: 0.3 }}
        style={{ borderBottomWidth: 1, backdropFilter: stuck ? 'blur(12px)' : 'none' }}
      >
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-8 px-6 sm:px-8">
          <Link to="/" aria-label="Silkroad Innovation Hub — home" className="shrink-0">
            {/* §2.6: cyan mark on Oxford Blue, turquoise on Snow Drift. */}
            <Logo
              className={`h-7 w-auto transition-colors duration-300 ${
                inverted ? 'text-snow' : 'text-oxford'
              }`}
              style={
                {
                  '--logo-mark': inverted
                    ? 'var(--color-cyan)'
                    : 'var(--color-turquoise)',
                } as React.CSSProperties
              }
            />
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`font-display text-[14.5px] font-medium transition-colors duration-300 ${
                  inverted
                    ? 'text-snow/70 hover:text-snow'
                    : 'text-ink-70 hover:text-oxford'
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/apply"
              className={`group hidden rounded-full px-5 py-2.5 font-display text-[14.5px] font-semibold transition-colors duration-300 sm:inline-flex sm:items-center sm:gap-2 ${
                inverted
                  ? 'bg-turquoise text-oxford hover:bg-cyan'
                  : 'bg-oxford text-snow hover:bg-turquoise hover:text-oxford'
              }`}
            >
              Apply <ArrowUpRight />
            </Link>

            <button
              onClick={() => setOpen((o) => !o)}
              className={`grid size-10 place-items-center md:hidden ${
                inverted && !open ? 'text-snow' : 'text-oxford'
              }`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span className="relative block h-3 w-5">
                <motion.span
                  className="absolute left-0 block h-[1.5px] w-5 bg-current"
                  animate={open ? { top: 5.5, rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.span
                  className="absolute left-0 block h-[1.5px] w-5 bg-current"
                  animate={open ? { top: 5.5, rotate: -45 } : { top: 11, rotate: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-snow pt-[72px] md:hidden"
          >
            <div className="flex flex-col px-6 pt-8">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  onClick={() => setOpen(false)}
                  className="border-b border-rule py-5 font-display text-h5 font-medium"
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Link
                  to="/apply"
                  className="mt-8 flex items-center justify-center gap-2 rounded-full bg-oxford px-6 py-4 font-display text-[16px] font-semibold text-snow"
                >
                  Apply <ArrowUpRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
