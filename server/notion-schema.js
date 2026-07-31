export const NOTION_VERSION = '2026-03-11'

const option = (name, color = 'default') => ({ name, color })

export const INVESTOR_STATUSES = [
  option('New', 'blue'),
  option('Reviewing', 'yellow'),
  option('Contacted', 'purple'),
  option('Qualified', 'green'),
  option('Joined', 'green'),
  option('On Hold', 'orange'),
  option('Rejected', 'red'),
  option('Archived', 'gray'),
]

export const FOUNDER_STATUSES = [
  option('New', 'blue'),
  option('Reviewing', 'yellow'),
  option('Contacted', 'purple'),
  option('Due Diligence', 'orange'),
  option('On Hold', 'orange'),
  option('Waitlisted', 'yellow'),
  option('Working Together', 'green'),
  option('Rejected', 'red'),
  option('Archived', 'gray'),
]

const languageOptions = [option('RU', 'blue'), option('EN', 'purple')]
const stageOptions = [
  option('Idea / prototype', 'gray'),
  option('Pre-seed', 'blue'),
  option('Seed', 'green'),
  option('Series A', 'purple'),
]

export const INVESTOR_SCHEMA = {
  Name: { title: {} },
  Email: { email: {} },
  Phone: { phone_number: {} },
  'Cheque Size': {
    select: {
      options: [
        option('$10k – $25k', 'blue'),
        option('$25k – $50k', 'green'),
        option('$50k – $100k', 'purple'),
        option('$100k+', 'orange'),
      ],
    },
  },
  Message: { rich_text: {} },
  Language: { select: { options: languageOptions } },
  Status: { select: { options: INVESTOR_STATUSES } },
  'Submitted At': { date: {} },
}
export const FOUNDER_SCHEMA = {
  Company: { title: {} },
  'Founder Name': { rich_text: {} },
  Email: { email: {} },
  Phone: { phone_number: {} },
  Stage: { select: { options: stageOptions } },
  'Deck URL': { url: {} },
  'Deck File': { files: {} },
  Language: { select: { options: languageOptions } },
  'AI Score': { number: { format: 'number' } },
  'AI Verdict': {
    select: {
      options: [
        option('Strong', 'green'),
        option('Promising', 'blue'),
        option('Early', 'yellow'),
        option('Weak', 'red'),
      ],
    },
  },
  Status: { select: { options: FOUNDER_STATUSES } },
  'Submitted At': { date: {} },
}
