import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { stepsFor, type Field } from './schema'
import { isFieldVisible, routeApplication, type Answers, type Path } from './routing'
import { FieldRow } from './Fields'
import { Outcome } from './Outcome'
import { PathChooser } from './PathChooser'
import { Button, ArrowUpRight, Kicker } from '../components/ui'

const validate = (fields: Field[], a: Answers) => {
  const errs: Record<string, string> = {}
  for (const f of fields) {
    if (f.optional || !isFieldVisible(f.id, a)) continue
    const v = a[f.id]
    const empty = Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim()
    if (empty) {
      errs[f.id] =
        f.type === 'choice'
          ? 'Pick one to continue.'
          : f.type === 'multi'
            ? 'Pick at least one.'
            : 'This one we need.'
    } else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v))) {
      errs[f.id] = 'That address doesn’t look right.'
    }
  }
  return errs
}

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
}

export function Apply() {
  const { path } = useParams<{ path?: string }>()
  const navigate = useNavigate()

  if (path !== 'investor' && path !== 'founder') return <PathChooser />
  return <Wizard key={path} path={path} onRestart={() => navigate('/apply')} />
}

function Wizard({ path, onRestart }: { path: Path; onRestart: () => void }) {
  const steps = useMemo(() => stepsFor(path), [path])
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<Answers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const total = steps.length + 1 // + review
  const isReview = i === steps.length
  const step = steps[i]

  const visibleFields = (s: typeof step) =>
    s.fields.filter((f) => isFieldVisible(f.id, answers))

  const track = useMemo(
    () => (done ? routeApplication(path, answers) : null),
    [done, path, answers],
  )

  const go = (next: number) => {
    if (next > i && !isReview) {
      const errs = validate(visibleFields(step), answers)
      setErrors(errs)
      if (Object.keys(errs).length) {
        document
          .querySelector<HTMLElement>('[data-step-body]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    setDir(next > i ? 1 : -1)
    setI(next)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const set = (id: string) => (v: string | string[]) => {
    setAnswers((a) => ({ ...a, [id]: v }))
    setErrors((e) => {
      if (!e[id]) return e
      const { [id]: _drop, ...rest } = e
      return rest
    })
  }

  if (done && track) {
    return <Outcome track={track} path={path} answers={answers} onRestart={onRestart} />
  }

  const pct = ((i + (isReview ? 1 : 0)) / total) * 100

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-32 pb-28 sm:px-8">
      {/* progress */}
      <div className="mb-10">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-display text-[13px] tracking-[0.14em] text-ink-45 uppercase">
            {path === 'investor' ? 'Investor intake' : 'Founder intake'}
          </span>
          <span className="font-display text-[13px] text-ink-45 tabular-nums">
            {Math.min(i + 1, total)} / {total}
          </span>
        </div>
        <div className="h-px w-full bg-rule">
          <motion.div
            className="h-px bg-turquoise"
            animate={{ width: `${Math.max(pct, 4)}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div data-step-body>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={isReview ? 'review' : step.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            {isReview ? (
              <Review steps={steps} answers={answers} onJump={(n) => go(n)} />
            ) : (
              <>
                <Kicker>{step.n}</Kicker>
                <h1 className="mt-3 font-display text-[2.25rem] leading-[1.1] font-semibold sm:text-h4">
                  {step.title}
                </h1>
                {step.blurb && (
                  <p className="measure mt-3 text-[15.5px] leading-relaxed text-ink-70">
                    {step.blurb}
                  </p>
                )}

                <div className="mt-9 grid gap-6 sm:grid-cols-2">
                  {visibleFields(step).map((f) => (
                    <FieldRow
                      key={f.id}
                      field={f}
                      answers={answers}
                      error={errors[f.id]}
                      onChange={set(f.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-rule pt-6">
        <button
          type="button"
          onClick={() => (i === 0 ? onRestart() : go(i - 1))}
          className="font-display text-[15px] font-medium text-ink-45 transition-colors hover:text-oxford"
        >
          ← {i === 0 ? 'Change path' : 'Back'}
        </button>

        {isReview ? (
          <Button onClick={() => setDone(true)}>
            Submit application <ArrowUpRight />
          </Button>
        ) : (
          <Button onClick={() => go(i + 1)}>
            Continue <ArrowUpRight />
          </Button>
        )}
      </div>
    </div>
  )
}

function Review({
  steps,
  answers,
  onJump,
}: {
  steps: ReturnType<typeof stepsFor>
  answers: Answers
  onJump: (i: number) => void
}) {
  const labelFor = (f: Field, v: string | string[]) => {
    if (!f.options) return String(v)
    const arr = Array.isArray(v) ? v : [v]
    return arr
      .map((x) => f.options!.find((o) => o.value === x)?.label ?? x)
      .join(', ')
  }

  return (
    <>
      <Kicker>Last look</Kicker>
      <h1 className="mt-3 font-display text-[2.25rem] leading-[1.1] font-semibold sm:text-h4">
        Check it over
      </h1>
      <p className="measure mt-3 text-[15.5px] leading-relaxed text-ink-70">
        A person reads this — so it is worth thirty seconds. Click any answer to
        change it.
      </p>

      <dl className="mt-9 divide-y divide-rule border-y border-rule">
        {steps.map((s, si) =>
          s.fields
            .filter((f) => isFieldVisible(f.id, answers) && answers[f.id]?.length)
            .map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-1 gap-1 py-3.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6"
              >
                <dt className="text-[14px] text-ink-45">{f.label}</dt>
                <dd className="flex items-start justify-between gap-4">
                  <span className="text-[15px] font-medium">
                    {labelFor(f, answers[f.id])}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJump(si)}
                    className="shrink-0 text-[13px] text-ink-45 underline underline-offset-4 transition-colors hover:text-oxford"
                  >
                    Edit
                  </button>
                </dd>
              </div>
            )),
        )}
      </dl>
    </>
  )
}
