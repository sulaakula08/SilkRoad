import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { useI18n } from '../i18n'

/**
 * Back-to-top button. Sits above the chat launcher (which owns the bottom-right
 * corner), and only appears once you're a screen or so down the page.
 */
export function ScrollTop() {
  const [show, setShow] = useState(false)
  const { scrollY } = useScroll()
  const { lang } = useI18n()

  useMotionValueEvent(scrollY, 'change', (v) => setShow(v > 700))

  const label = lang === 'ru' ? 'Наверх' : 'Back to top'

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={label}
          title={label}
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed right-5 bottom-24 z-[69] grid size-11 cursor-pointer place-items-center rounded-full border border-oxford/12 bg-snow/90 text-oxford shadow-[0_6px_20px_rgba(0,32,63,0.14)] backdrop-blur-sm transition-colors hover:bg-oxford hover:text-snow sm:right-7 sm:bottom-28"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
