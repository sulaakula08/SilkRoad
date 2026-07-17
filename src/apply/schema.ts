import type { Path } from './routing'

export type Field = {
  id: string
  label: string
  /** Small print under the label — context, not filler. */
  hint?: string
  type: 'text' | 'email' | 'url' | 'textarea' | 'choice' | 'multi'
  options?: { value: string; label: string; note?: string }[]
  placeholder?: string
  optional?: boolean
  /** Half-width on desktop. */
  half?: boolean
}

export type Step = {
  id: string
  n: string
  title: string
  blurb?: string
  fields: Field[]
}

const CONTACT = (who: string): Field[] => [
  { id: 'firstName', label: 'First name', type: 'text', half: true },
  { id: 'lastName', label: 'Last name', type: 'text', half: true },
  { id: 'email', label: 'Email', type: 'email', half: true },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    type: 'url',
    half: true,
    placeholder: 'linkedin.com/in/…',
    optional: true,
  },
  {
    id: 'country',
    label: `Where are you based?`,
    hint: `We run the corridor between Central Eurasia and the Bay. Knowing where you sit tells us which ${who} applies to you.`,
    type: 'choice',
    options: [
      { value: 'kz', label: 'Kazakhstan' },
      { value: 'uz', label: 'Uzbekistan' },
      { value: 'kg', label: 'Kyrgyzstan' },
      { value: 'az', label: 'Azerbaijan' },
      { value: 'ge', label: 'Georgia' },
      { value: 'am', label: 'Armenia' },
      { value: 'tj-tm', label: 'Tajikistan / Turkmenistan' },
      { value: 'us', label: 'United States' },
      { value: 'other', label: 'Somewhere else' },
    ],
  },
]

export const INVESTOR_STEPS: Step[] = [
  {
    id: 'you',
    n: '1.1',
    title: 'Who you are',
    blurb: 'The basics. Two minutes.',
    fields: CONTACT('structure'),
  },
  {
    id: 'standing',
    n: '1.2',
    title: 'Your standing',
    blurb:
      'This decides which deals are legally open to you. There is a good answer for every case — including “not yet”.',
    fields: [
      {
        id: 'accredited',
        label: 'Are you an accredited investor under SEC Rule 501?',
        hint: 'Broadly: $1M+ net worth excluding your home, or $200k+ income for the last two years ($300k with a spouse). Certain licences also qualify.',
        type: 'choice',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No', note: 'Academy track' },
          { value: 'unsure', label: 'I’m not sure', note: 'We’ll check with you' },
        ],
      },
      {
        id: 'residence',
        label: 'Do you hold residency or a tax number outside your home country?',
        hint: 'Non-accredited investors can still participate through Reg S structures. This tells us which ones are available to you.',
        type: 'choice',
        options: [
          { value: 'us-person', label: 'US person' },
          { value: 'eu-uk', label: 'EU / UK' },
          { value: 'uae-sg', label: 'UAE / Singapore' },
          { value: 'none', label: 'Home country only' },
        ],
      },
      {
        id: 'experience',
        label: 'How many angel cheques have you written?',
        type: 'choice',
        options: [
          { value: 'none', label: 'None yet' },
          { value: '1-5', label: '1–5' },
          { value: '6-20', label: '6–20' },
          { value: '20+', label: '20+' },
        ],
      },
      {
        id: 'ticket',
        label: 'Typical cheque per deal',
        hint: 'Our SPV minimum is $5,000. Nothing here commits you to anything.',
        type: 'choice',
        options: [
          { value: '5-25', label: '$5k – $25k' },
          { value: '25-50', label: '$25k – $50k' },
          { value: '50-100', label: '$50k – $100k' },
          { value: '100+', label: '$100k+' },
        ],
      },
    ],
  },
  {
    id: 'thesis',
    n: '1.3',
    title: 'What you want to back',
    blurb: 'So the memos you receive are ones you would actually read.',
    fields: [
      {
        id: 'sectors',
        label: 'Sectors you follow',
        hint: 'Pick as many as apply.',
        type: 'multi',
        options: [
          { value: 'ai', label: 'AI & infrastructure' },
          { value: 'fintech', label: 'Fintech' },
          { value: 'saas', label: 'B2B software' },
          { value: 'health', label: 'Health & bio' },
          { value: 'climate', label: 'Climate & energy' },
          { value: 'consumer', label: 'Consumer' },
          { value: 'deeptech', label: 'Deep tech' },
          { value: 'logistics', label: 'Logistics & trade' },
        ],
      },
      {
        id: 'involvement',
        label: 'How involved do you want to be?',
        type: 'choice',
        options: [
          { value: 'passive', label: 'Write the cheque, read the updates' },
          { value: 'advisor', label: 'Open doors when it helps' },
          { value: 'active', label: 'Hands-on — intros, hiring, strategy' },
        ],
      },
      {
        id: 'motivation',
        label: 'Why Silkroad Angels, specifically?',
        hint: 'Plain language is fine. We read every one of these.',
        type: 'textarea',
        placeholder:
          'What you are hoping to get out of the network, and what you bring to it.',
        optional: true,
      },
    ],
  },
]

export const FOUNDER_STEPS: Step[] = [
  {
    id: 'you',
    n: '2.1',
    title: 'You and the company',
    blurb: 'The basics. Two minutes.',
    fields: [
      ...CONTACT('pipeline'),
      { id: 'company', label: 'Company name', type: 'text', half: true },
      {
        id: 'website',
        label: 'Website',
        type: 'url',
        half: true,
        placeholder: 'yourcompany.com',
      },
      {
        id: 'oneLiner',
        label: 'What do you do?',
        hint: 'One sentence. If it takes three, it takes three — but try for one.',
        type: 'text',
        placeholder: 'We help ___ do ___ so they can ___.',
      },
    ],
  },
  {
    id: 'round',
    n: '2.2',
    title: 'Stage and structure',
    blurb:
      'Two questions decide almost everything about how your application moves.',
    fields: [
      {
        id: 'stage',
        label: 'Where are you?',
        type: 'choice',
        options: [
          { value: 'idea', label: 'Idea or prototype', note: 'No product yet' },
          { value: 'pre-seed', label: 'Pre-seed', note: 'Product live, early users' },
          { value: 'seed', label: 'Seed', note: 'Revenue, finding repeatability' },
          { value: 'series-a', label: 'Series A', note: 'Scaling a known motion' },
        ],
      },
      {
        id: 'incorporation',
        label: 'Where is the company incorporated?',
        hint: 'Most of our angels can only invest into a US entity. If you are not there yet, that is normal and fixable.',
        type: 'choice',
        options: [
          { value: 'us', label: 'Delaware / US' },
          { value: 'region', label: 'In the region' },
          { value: 'other', label: 'Elsewhere' },
          { value: 'none', label: 'Not incorporated yet' },
        ],
      },
      {
        id: 'flip',
        label: 'Are you open to a US flip?',
        hint: 'A Delaware holding structure over your existing entity. Typically 6–10 weeks. We introduce counsel who have done it in your jurisdiction.',
        type: 'choice',
        options: [
          { value: 'yes', label: 'Yes, if the round justifies it' },
          { value: 'done', label: 'Already in progress' },
          { value: 'no', label: 'No — we intend to stay local' },
          { value: 'unsure', label: 'Need to understand it first' },
        ],
      },
      {
        id: 'raising',
        label: 'How much are you raising?',
        type: 'choice',
        options: [
          { value: 'sub-500', label: 'Under $500k' },
          { value: '500-1500', label: '$500k – $1.5M' },
          { value: '1500-4000', label: '$1.5M – $4M' },
          { value: '4000+', label: '$4M+' },
          { value: 'not-raising', label: 'Not raising right now' },
        ],
      },
    ],
  },
  {
    id: 'traction',
    n: '2.3',
    title: 'The evidence',
    // Idea-stage founders never see the metric fields, so this line has to
    // read sensibly with or without them.
    blurb:
      'What you have so far, as it is today. Rounded is fine; optimistic is not — we check.',
    fields: [
      {
        id: 'revenue',
        label: 'Annual recurring revenue',
        type: 'choice',
        options: [
          { value: 'pre-revenue', label: 'Pre-revenue' },
          { value: 'sub-100', label: 'Under $100k' },
          { value: '100-500', label: '$100k – $500k' },
          { value: '500-2000', label: '$500k – $2M' },
          { value: '2000+', label: '$2M+' },
        ],
      },
      {
        id: 'traction',
        label: 'What is the strongest number you have?',
        hint: 'Growth rate, retention, pipeline, a signed LOI — whatever you would lead with.',
        type: 'textarea',
        placeholder:
          'e.g. 14% month-on-month for 7 months; 91% logo retention; $340k of signed pilots.',
      },
      {
        id: 'deck',
        label: 'Link to your deck or data room',
        type: 'url',
        placeholder: 'A link we can open without requesting access.',
        optional: true,
      },
      {
        id: 'sectors',
        label: 'Sector',
        type: 'multi',
        options: [
          { value: 'ai', label: 'AI & infrastructure' },
          { value: 'fintech', label: 'Fintech' },
          { value: 'saas', label: 'B2B software' },
          { value: 'health', label: 'Health & bio' },
          { value: 'climate', label: 'Climate & energy' },
          { value: 'consumer', label: 'Consumer' },
          { value: 'deeptech', label: 'Deep tech' },
          { value: 'logistics', label: 'Logistics & trade' },
        ],
      },
    ],
  },
]

export const stepsFor = (p: Path): Step[] =>
  p === 'investor' ? INVESTOR_STEPS : FOUNDER_STEPS
