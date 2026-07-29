import { CONTACT } from '../content'

/**
 * The club's contact channels as a single row of icon buttons.
 *
 * One definition, used by the footer and the apply page, so a channel can
 * never drift between them. WhatsApp and Telegram both resolve to CONTACT's
 * one phone number; the number itself is shown once, under the row, rather
 * than tacked onto a label.
 */

type Tone = 'dark' | 'light'

const CHANNELS = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    href: () => CONTACT.whatsapp,
    path: 'M12.04 2A9.9 9.9 0 0 0 2.13 11.9c0 1.75.46 3.46 1.33 4.97L2.05 22l5.26-1.38a9.9 9.9 0 0 0 4.73 1.2h.01a9.9 9.9 0 0 0 9.9-9.9A9.9 9.9 0 0 0 12.04 2zm5.8 14.06c-.24.68-1.4 1.3-1.95 1.34-.5.04-.99.22-3.35-.7-2.82-1.11-4.6-3.99-4.74-4.18-.14-.19-1.13-1.5-1.13-2.87s.72-2.03.97-2.31c.25-.28.55-.35.73-.35l.53.01c.17 0 .4-.06.62.48l.85 2.06c.07.14.12.31.02.5-.1.19-.15.3-.29.47l-.44.5c-.14.14-.29.3-.12.59.17.28.74 1.22 1.59 1.98 1.09.97 2 1.28 2.29 1.42.28.14.45.12.61-.07l.88-1.02c.2-.24.37-.18.62-.09l1.77.84c.26.12.43.19.5.29.06.1.06.58-.18 1.26z',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    href: () => CONTACT.telegram,
    path: 'M11.94 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.64 6.86-1.55 7.32c-.12.52-.42.65-.85.4l-2.36-1.74-1.14 1.1c-.13.12-.23.23-.47.23l.17-2.4 4.38-3.96c.19-.17-.04-.26-.3-.09l-5.41 3.41-2.33-.73c-.5-.16-.51-.51.11-.75l9.1-3.51c.42-.15.79.1.65.72z',
  },
  {
    key: 'email',
    label: 'Email',
    href: () => `mailto:${CONTACT.email}`,
    path: 'M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5zm2.2.5 6.8 5.1L18.8 6zM19 8.2l-6.4 4.8a1 1 0 0 1-1.2 0L5 8.2V18h14z',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: () => CONTACT.linkedin,
    path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95C21.4 8.75 22 11.1 22 14.2V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z',
  },
] as const

const TONES: Record<Tone, string> = {
  dark: 'border-white/15 text-snow/75 hover:border-turquoise hover:bg-turquoise hover:text-oxford',
  light: 'border-rule text-ink-70 hover:border-oxford hover:bg-oxford hover:text-snow',
}

export function ContactButtons({
  tone = 'dark',
  className = '',
}: {
  tone?: Tone
  className?: string
}) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {CHANNELS.map((c) => {
        const href = c.href()
        return (
          <a
            key={c.key}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            aria-label={c.label}
            title={c.label}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-display text-[13.5px] font-medium transition-colors duration-200 ${TONES[tone]}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0">
              <path d={c.path} />
            </svg>
            {c.label}
          </a>
        )
      })}
    </div>
  )
}
