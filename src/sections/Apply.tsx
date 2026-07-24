import { useParams } from 'react-router-dom'
import { Index, Reveal } from '../components/ui'
import { ApplyForm, type Tab } from '../apply/ApplyForm'
import { useI18n } from '../i18n'
import { CONTACT } from '../content'

/** The intake section — lives on the homepage and on /apply. */
export function Apply() {
  const { t } = useI18n()

  return (
    <section id="apply" className="scroll-mt-20 border-b border-rule py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <Reveal>
          <Index n="08" label={t.apply.title} />
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="font-display text-[2.4rem] leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-h2">
                {t.apply.title}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-4 max-w-sm text-[16.5px] leading-relaxed text-ink-70">
                {t.apply.subtitle}
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="mt-8 space-y-2 text-[14.5px]">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="block text-ink-70 underline decoration-turquoise decoration-2 underline-offset-4 transition-colors hover:text-oxford"
                >
                  {CONTACT.email}
                </a>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-70 transition-colors hover:text-oxford"
                >
                  WhatsApp · {CONTACT.phone}
                </a>
                <a
                  href={CONTACT.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-ink-70 transition-colors hover:text-oxford"
                >
                  Telegram
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.06}>
            <ApplyForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Standalone /apply and /apply/:path page — preselects the right tab. */
export function ApplyPage() {
  const { path } = useParams<{ path?: string }>()
  const { t } = useI18n()
  const tab: Tab = path === 'founder' ? 'founder' : 'investor'

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-32 pb-24 sm:px-8">
      <p className="font-display text-[13px] tracking-[0.14em] text-ink-45 uppercase">
        {t.apply.title}
      </p>
      <h1 className="mt-3 font-display text-[2.5rem] leading-[1.08] font-semibold sm:text-h3">
        {t.apply.title}
      </h1>
      <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-70">
        {t.apply.subtitle}
      </p>
      <div className="mt-10">
        <ApplyForm key={tab} initialTab={tab} />
      </div>
    </div>
  )
}
