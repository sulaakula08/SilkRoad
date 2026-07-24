# Silkroad Angels Club

Marketing site for the Silkroad Angels Club — a private angel-investor club at
the Silkroad Innovation Hub. Fully bilingual (RU default / EN), with an AI
assistant and a multi-step application flow.

**Bilingual:** all homepage copy lives in [src/content.ts](src/content.ts) as
`CONTENT.ru` / `CONTENT.en` (identical shapes). The `en / ru` toggle and the
`useI18n()` hook are in [src/i18n.tsx](src/i18n.tsx); the choice persists in
`localStorage`. To edit copy, edit `content.ts` — nothing else.

**Homepage sections** (in `src/sections/`): Hero → Value → Advantages → Club →
Ecosystem → Team → Portfolio → Process → Faq → Footer. Team photos and
portfolio/fund logos are neutral placeholders (monograms / "Logotype" tiles) —
drop in real assets in `Team.tsx` and `Portfolio.tsx`. Social links are `#`.

**Known follow-up:** the application flow under `/apply` is still English-only —
translating the form schema (`src/apply/schema.ts`) into `content.ts` is the
next i18n step.

---

## The application flow

Investors and founders apply through one intake that routes them to a named
track, a named reviewer and a stated turnaround — shown on screen the moment
they submit. The homepage CTAs point to `/apply/investor`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

React 18 · Vite 6 · Tailwind 4 · Framer Motion 11 · React Router 6.

## Where things are

| Path | What it is |
| --- | --- |
| `src/apply/routing.ts` | **The routing rules.** Ordered, first match wins. |
| `src/apply/schema.ts` | The questions, per path. |
| `src/apply/Apply.tsx` | The wizard: steps, validation, review. |
| `src/apply/Outcome.tsx` | The result screen. |
| `src/components/Halftone.tsx` | The icon (§2.4), rebuilt from measured geometry. |
| `src/components/Logo.tsx` | The horizontal lockup (§2.2), extracted outlines. |
| `src/index.css` | Brand tokens. |

## Smart routing

The intake branches twice: once on **path**, then on the answers within it.

**Investors** route on accreditation → experience → cheque size:

| Condition | Track |
| --- | --- |
| Not accredited, or unsure | Angel Academy |
| Accredited, no experience *or* $5–25k | Syndicate — Observer |
| Accredited, $50k+ | Core Membership |
| Otherwise | Syndicate — Member |

**Founders** route on stage → revenue → incorporation:

| Condition | Track |
| --- | --- |
| Idea stage | Too early — for now |
| Seed/A + revenue + US-incorporated | Fast track |
| Revenue, not US-incorporated | Corridor Review |
| Otherwise | Standard review |

Questions also hide themselves when they cannot apply — cheque size is never
asked of someone heading to the Academy, metrics are never asked of an
idea-stage company. That logic is `isFieldVisible`, in the same file.

Rules live apart from the components on purpose: the investment team should be
able to read and change who goes where without touching React.

The routing rules and questions live in `src/apply/` and are independent of the
homepage marketing copy in `src/content.ts`.

## Brand

Everything is transcribed from *Silkroad Angels Brand Guideline. 2025* — the
section numbers in code comments (§2.4, §3.3, §4.2) point back to it.

**Colours** (§4.2) — Turquoise `#08CCC3` (60%), Oxford Blue `#00203F` (20%),
Snow Drift `#F4F7F2` (15%), Fluorescent Cyan `#00F7EB` (5%).

Two constraints the guideline implies but does not state, both found by
measuring contrast:

- **Turquoise is 1.86:1 on Snow Drift.** It cannot carry text on a light
  ground — on light it appears as a dot, a rule or a fill, and Oxford does the
  reading. On Oxford it is 8.16:1 and used freely.
- **Cyan is reserved for dark grounds** (§2.6). The mark is cyan on Oxford,
  turquoise on Snow Drift; the nav swaps them as it crosses sections.

All text meets WCAG AA. `--color-ink-45` is set to the lightest tint that still
clears 4.5:1, because it carries 13px labels.

**Type** (§3.1) — Inter for body, as the guideline specifies.

> **Atyp Display is not licensed in this repo.** It is the specified display
> face; [General Sans](https://fontshare.com/fonts/general-sans) stands in for
> it — a near metric match. Drop in the licensed files and the
> `--font-display` stack in `src/index.css` picks Atyp up first with no other
> changes.

**Assets** — the logo and icon were extracted from the guideline PDF's vector
artwork rather than redrawn:

- `Logo.tsx` holds the real outlines. The `ANGELS` half is `currentColor` and
  the mark reads `--logo-mark`, so one file serves both colourways.
- `Halftone.tsx` is the icon rebuilt from its measured 10×10 grid — every dot
  radius and opacity is taken from the source, so it renders the mark exactly
  while staying animatable. It is the same geometry in the hero, the outcome
  screen and the favicon.

## Notes

- Motion runs on one curve (`cubic-bezier(0.16, 1, 0.3, 1)`) and respects
  `prefers-reduced-motion` throughout.
- **The form does not submit anywhere.** `Apply.tsx` computes the track and
  renders it; wire `routeApplication`'s result to your backend at the
  `setDone(true)` call. The reference number is derived from the answers and is
  display-only — issue a real one server-side.
- Copy is placeholder where it states facts we cannot verify — the hero
  metrics ($41M, 112 angels, 64 companies, 9 countries), fees, SLAs and the
  Academy cohort details all need confirming before launch.

## Assistant (AI chatbot)

A floating assistant (bottom-right, every page) consults visitors, answers FAQs
from the site's own facts, and routes serious inquiries to the intake or the
team. Powered by Google Gemini.

### Setup

```bash
cp .env.example .env.local
# put your key in .env.local — get one at https://aistudio.google.com/apikey
npm run dev
```

The key **must** be an AI Studio API key (it starts with `AIza`). It is read
only by the server-side proxy and is never sent to the browser.

### How it's wired (and why)

The site is a static bundle, so a key in client code would ship to every
visitor. Instead:

| Piece | Role |
| --- | --- |
| `api/chat.js` | Server-side proxy. Holds the key, calls Gemini, streams the reply back as SSE. Runs as a Vercel Node function in prod, and as Vite middleware in dev (`vite.config.ts`) — same file both ways. |
| `src/chat/knowledge.ts` | The system prompt — everything the bot may state as fact, transcribed from the site. **Keep it in sync with the sections and `routing.ts`.** |
| `src/chat/useChat.ts` | Client hook: posts the transcript, reads the SSE stream token by token. |
| `src/chat/ChatWidget.tsx` | The launcher + panel. |
| `src/chat/AssistantText.tsx` | Renders replies as React nodes (no `innerHTML`), linkifies URLs/emails and routes `/apply` links in-app. |

**The key is never committed** — `.gitignore` blocks `.env*` (except
`.env.example`), and the build is checked to contain no key.

### Guardrails

The bot is instructed to give no personalised financial/legal advice, invent no
fees/metrics/deals, promise no acceptances, and hand off to `/apply` or the team
(`buildunicorns@silkroadinnovationhub.com`, Telegram) for anything real. The
panel also shows persistent **Invest / Raise / Telegram / Email** actions, so
routing works even if a visitor never types.

### Deploy

`vercel.json` rewrites all non-`/api` routes to `index.html` (SPA) and lets
Vercel serve `api/chat.js` as a function. Set `GEMINI_API_KEY` in the host's
environment — never in the repo. Any host with Node serverless functions works;
the proxy is a plain `(req, res)` handler.

# SilkRoad
