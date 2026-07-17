import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Index, Reveal } from '../components/ui'

const QA = [
  {
    q: 'I’m not an accredited investor. Is that the end of it?',
    a: 'No — it changes which door you come through. US private rounds are legally closed to non-accredited investors, so we route you to the Angel Academy instead: eight weeks on how these deals actually work, with read access to live memos. Most of our syndicate came through it.',
  },
  {
    q: 'What does it cost to join?',
    a: 'The syndicate is free to join; we charge carry on deals you choose to enter, disclosed on every memo before you commit. Core membership is an annual fee. The Academy has a cohort fee, credited back against your first SPV allocation.',
  },
  {
    q: 'We’re incorporated in Kazakhstan. Can your angels invest?',
    a: 'Not into that entity, in most cases — it is a structuring constraint, not a judgement on your company. If your metrics clear our bar we review you anyway and put corridor counsel on a Delaware flip in parallel. Six to ten weeks, typically.',
  },
  {
    q: 'How curated is “curated”?',
    a: 'Roughly 2% of what reaches screening goes out as a memo. Every deal has a Valley lead we can reference, a written memo from a partner, and a named committee member who argued for it.',
  },
  {
    q: 'What happens to my data?',
    a: 'The intake goes to the reviewer named on your outcome screen and nowhere else. We do not sell lists and we do not put you on a drip campaign. One email from a person, and a way to reply to them.',
  },
  {
    q: 'How long until I hear back?',
    a: 'Between immediate and ten business days, depending on where you route. The exact number is on your outcome screen the moment you submit — not a guess afterwards.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Index n="4.0" label="Questions" />
            </Reveal>
            <Reveal>
              <h2 className="mt-8 font-display text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h3">
                The things people actually ask.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-5 max-w-sm text-[15.5px] leading-relaxed text-ink-70">
                If yours isn’t here,{' '}
                <a
                  href="mailto:hello@silkroadangels.com"
                  className="text-oxford underline decoration-turquoise decoration-2 underline-offset-4 transition-[text-decoration-color] hover:decoration-oxford"
                >
                  write to us
                </a>
                . A person replies.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <ul className="border-t border-rule">
              {QA.map((item, i) => {
                const on = open === i
                return (
                  <li key={item.q} className="border-b border-rule">
                    <button
                      onClick={() => setOpen(on ? null : i)}
                      aria-expanded={on}
                      className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span
                        className={`font-display text-[17px] leading-snug font-medium transition-colors duration-200 sm:text-[18px] ${
                          on ? 'text-oxford' : 'text-ink-70 group-hover:text-oxford'
                        }`}
                      >
                        {item.q}
                      </span>
                      <span className="relative mt-1.5 grid size-5 shrink-0 place-items-center">
                        <span className="absolute h-px w-3.5 bg-current" />
                        <motion.span
                          className="absolute h-px w-3.5 bg-current"
                          animate={{ rotate: on ? 0 : 90 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-xl pr-10 pb-7 text-[15.5px] leading-relaxed text-ink-70">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
