/**
 * Intake routing.
 *
 * Every applicant lands in exactly one track. The rules below are ordered —
 * the first match wins — so the logic stays readable and auditable by the
 * investment team rather than hiding inside form components.
 */

export type Path = 'investor' | 'founder'

export type Answers = Record<string, string | string[]>

export type Track = {
  id: string
  /** Track name shown to the applicant. */
  name: string
  /** One line: what this track actually is. */
  summary: string
  /** Honest description of what happens after submit. */
  next: string[]
  /** Expected time to a human reply. */
  sla: string
  /** Who reads it. */
  reviewer: string
  /** false = we are not moving forward now; say so plainly. */
  advancing: boolean
}

type Rule = {
  when: (a: Answers) => boolean
  track: Track
}

const get = (a: Answers, k: string) => (a[k] as string) ?? ''
const has = (a: Answers, k: string, v: string) =>
  Array.isArray(a[k]) ? (a[k] as string[]).includes(v) : a[k] === v

/* ---------------------------------- investors --------------------------- */

const INVESTOR_RULES: Rule[] = [
  {
    // Not accredited (or unsure) — they legally cannot join US deals yet.
    // This is an education-first track, not a rejection.
    when: (a) => get(a, 'accredited') !== 'yes',
    track: {
      id: 'academy',
      name: 'Angel Academy — Cohort 07',
      summary:
        'An eight-week programme on how Silicon Valley deals are actually priced, papered and exited. You join deals from the syndicate once accreditation is in place.',
      next: [
        'A member of the education team confirms your seat and sends the cohort calendar.',
        'You are added to the deal memos list — read-only — so you can follow live rounds while you learn.',
        'On completion we revisit your accreditation status and move you to the syndicate.',
      ],
      sla: '3 business days',
      reviewer: 'Education team',
      advancing: true,
    },
  },
  {
    // Accredited, but new to angel investing or writing small cheques.
    when: (a) =>
      get(a, 'experience') === 'none' ||
      get(a, 'ticket') === '5-25',
    track: {
      id: 'syndicate',
      name: 'Syndicate — Observer',
      summary:
        'Deal-by-deal participation through our SPVs. No annual commitment: you see each memo and choose whether to write a cheque.',
      next: [
        'We open your syndicate profile and you receive the next deal memo.',
        'A 20-minute onboarding call covers SPV mechanics, fees and carry.',
        'You can move to Core membership after two completed allocations.',
      ],
      sla: '5 business days',
      reviewer: 'Investor relations',
      advancing: true,
    },
  },
  {
    // Accredited, experienced, meaningful cheque — the full membership.
    when: (a) => ['50-100', '100+'].includes(get(a, 'ticket')),
    track: {
      id: 'core',
      name: 'Core Membership',
      summary:
        'Full access to the curated pipeline, the screening committee, co-investment rights alongside Valley leads, and the annual Bay Area programme.',
      next: [
        'Two members of the investment committee review your profile.',
        'A 45-minute call to align on thesis, sectors and allocation.',
        'Membership agreement and onboarding into the deal room.',
      ],
      sla: '5 business days',
      reviewer: 'Investment committee',
      advancing: true,
    },
  },
  {
    when: () => true,
    track: {
      id: 'syndicate-std',
      name: 'Syndicate — Member',
      summary:
        'Deal-by-deal participation through our SPVs, with access to the full memo archive and the quarterly LP sessions.',
      next: [
        'Investor relations confirms your profile and sends the current pipeline.',
        'A 20-minute onboarding call covers SPV mechanics, fees and carry.',
      ],
      sla: '5 business days',
      reviewer: 'Investor relations',
      advancing: true,
    },
  },
]

/* ---------------------------------- founders ---------------------------- */

const FOUNDER_RULES: Rule[] = [
  {
    // No product and no incorporation — we would be reviewing an idea.
    when: (a) => get(a, 'stage') === 'idea',
    track: {
      id: 'too-early',
      name: 'Too early for us — for now',
      summary:
        'We invest from first product onward. We would rather tell you that today than leave you waiting on a maybe.',
      next: [
        'You get our pre-seed reading list and the memo template our committee actually uses.',
        'You are added to the founder list — office hours run monthly and are open.',
        'Come back when you have a product in users’ hands. Reply to that email and it reaches us directly.',
      ],
      sla: 'Immediate',
      reviewer: 'Automated — no committee review',
      advancing: false,
    },
  },
  {
    // Live round, real traction, papered properly — fast track.
    when: (a) =>
      ['seed', 'series-a'].includes(get(a, 'stage')) &&
      get(a, 'revenue') !== 'pre-revenue' &&
      get(a, 'incorporation') === 'us',
    track: {
      id: 'fast-track',
      name: 'Screening Committee — Fast track',
      summary:
        'You clear our structural bar, so you skip first screening and go straight to a partner read.',
      next: [
        'A partner reads your deck and metrics within the week.',
        'If there is a fit, a 30-minute call — then a memo to the full committee.',
        'Committee meets Thursdays. A decision either way, in writing, with reasons.',
      ],
      sla: '7 business days',
      reviewer: 'Partner + screening committee',
      advancing: true,
    },
  },
  {
    // Traction but not US-incorporated — solvable, and we help.
    when: (a) =>
      get(a, 'revenue') !== 'pre-revenue' && get(a, 'incorporation') !== 'us',
    track: {
      id: 'corridor',
      name: 'Corridor Review',
      summary:
        'Built in the region, raising from the Valley. Most of our angels cannot invest into your current entity — that is a structuring problem, not a company problem, and it is one we have solved before.',
      next: [
        'Screening reviews the business on its own merits first.',
        'In parallel, our corridor counsel walks you through a Delaware flip — cost, timeline and tax.',
        'If both land, you go to committee as a fast-track company.',
      ],
      sla: '10 business days',
      reviewer: 'Screening + corridor counsel',
      advancing: true,
    },
  },
  {
    when: () => true,
    track: {
      id: 'standard',
      name: 'Screening Committee — Standard review',
      summary:
        'The full read: product, team, market and the round you are putting together.',
      next: [
        'Two screeners read your material and score it against our rubric.',
        'If it advances, a 30-minute founder call.',
        'A written decision either way. We do not ghost founders.',
      ],
      sla: '10 business days',
      reviewer: 'Screening committee',
      advancing: true,
    },
  },
]

export function routeApplication(path: Path, answers: Answers): Track {
  const rules = path === 'investor' ? INVESTOR_RULES : FOUNDER_RULES
  return rules.find((r) => r.when(answers))!.track
}

/**
 * Conditional questions. Returns true when a field should be asked at all,
 * given what's been answered so far.
 */
export function isFieldVisible(id: string, a: Answers): boolean {
  switch (id) {
    // Only worth asking where they sit once we know they can't join US deals
    // yet. Unanswered is not the same as "not accredited" — don't ask early.
    case 'residence':
      return ['no', 'unsure'].includes(get(a, 'accredited'))
    // Cheque size is meaningless if they're heading to the Academy.
    case 'ticket':
      return get(a, 'accredited') === 'yes'
    // Ask about a flip only when they aren't already US-incorporated.
    case 'flip':
      return !!get(a, 'incorporation') && get(a, 'incorporation') !== 'us'
    // An idea-stage company has no metrics to report.
    case 'revenue':
    case 'traction':
      return !!get(a, 'stage') && get(a, 'stage') !== 'idea'
    case 'raising':
      return get(a, 'stage') !== 'idea'
    default:
      return true
  }
}

export { get as answer, has }
