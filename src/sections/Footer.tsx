import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Halftone } from '../components/Halftone'
import { ArrowUpRight, Reveal } from '../components/ui'
import { useI18n } from '../i18n'
import { CONTACT } from '../content'

export function Footer() {
  const { t } = useI18n()

  const investorLinks: [string, string][] = [
    [t.club.title, '#club'],
    [t.ecosystem.title, '#ecosystem'],
    [t.portfolio.title, '#portfolio'],
    [t.faq.title, '#faq'],
  ]

  const contactLinks: [string, string][] = [
    [CONTACT.email, `mailto:${CONTACT.email}`],
    ['Telegram', CONTACT.telegram],
    [`WhatsApp · ${CONTACT.phone}`, CONTACT.whatsapp],
    [CONTACT.phone, `tel:${CONTACT.phone.replace(/\s/g, '')}`],
  ]

  return (
    <footer id="footer" className="relative scroll-mt-20 overflow-hidden bg-oxford text-snow">
      {/* closing CTA — two doors */}
      <div className="relative border-b border-white/10">
        <Halftone
          className="pointer-events-none absolute -top-20 -right-16 w-[30rem] opacity-[0.12]"
          color="var(--color-turquoise)"
          animate={false}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <h2 className="max-w-3xl font-display text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-[3.75rem]">
              {t.footer.ctaTitle}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/apply/investor"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-turquoise px-7 py-4 font-display text-[15.5px] font-semibold text-oxford transition-colors duration-200 hover:bg-cyan"
              >
                {t.footer.ctaInvest} <ArrowUpRight />
              </Link>
              <Link
                to="/apply/founder"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 px-7 py-4 font-display text-[15.5px] font-semibold transition-colors duration-200 hover:border-snow hover:bg-snow hover:text-oxford"
              >
                {t.footer.ctaRaise} <ArrowUpRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* footer proper */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo className="h-8 w-auto text-snow" />
            <p className="mt-6 max-w-xs text-[14.5px] leading-relaxed text-snow/55">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-[12.5px] tracking-[0.14em] text-snow/45 uppercase">
              {t.nav.forInvestors}
            </h3>
            <ul className="mt-5 space-y-3">
              {investorLinks.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-[14.5px] text-snow/70 transition-colors duration-200 hover:text-turquoise"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12.5px] tracking-[0.14em] text-snow/45 uppercase">
              {t.footer.contactsLabel}
            </h3>
            <ul className="mt-5 space-y-3">
              {contactLinks.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="text-[14.5px] break-all text-snow/70 transition-colors duration-200 hover:text-turquoise"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[13px] text-snow/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer.copyright}</p>
          <a href="#" className="transition-colors hover:text-snow">
            {t.footer.privacy}
          </a>
        </div>
      </div>
    </footer>
  )
}
