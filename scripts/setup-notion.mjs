import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FOUNDER_SCHEMA, INVESTOR_SCHEMA, NOTION_VERSION } from '../server/notion-schema.js'

function loadEnvFile(pathname) {
  if (!existsSync(pathname)) return
  const text = readFileSync(pathname, 'utf8')
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] ||= value
  }
}

loadEnvFile(resolve('.env.local'))
loadEnvFile(resolve('.env'))

if (!process.argv.includes('--confirm')) {
  console.error('This creates two databases in Notion. Re-run with: npm run notion:setup -- --confirm')
  process.exit(1)
}

const token = process.env.NOTION_TOKEN
const parentPageId = process.env.NOTION_PARENT_PAGE_ID
if (!token || !parentPageId) {
  console.error('Set NOTION_TOKEN and NOTION_PARENT_PAGE_ID in .env.local first.')
  process.exit(1)
}

async function notion(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || `Notion request failed (${response.status})`)
  return data
}

async function createDatabase(name, description, properties) {
  const database = await notion('/databases', {
    method: 'POST',
    body: {
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: name } }],
      description: [{ type: 'text', text: { content: description } }],
      is_inline: false,
      initial_data_source: { properties },
    },
  })
  const fullDatabase = database.data_sources?.length ? database : await notion(`/databases/${database.id}`)
  const dataSourceId = fullDatabase.data_sources?.[0]?.id
  if (!dataSourceId) throw new Error(`Notion created ${name}, but did not return its data source ID.`)
  return { databaseId: database.id, dataSourceId }
}

console.log('Creating Silkroad application databases…')
const investors = await createDatabase(
  'Silkroad — Investor Applications',
  'Investor applications submitted through the Silkroad Angels website.',
  INVESTOR_SCHEMA,
)
const founders = await createDatabase(
  'Silkroad — Founder Applications',
  'Founder applications, pitch decks, and AI screening reports from the Silkroad Angels website.',
  FOUNDER_SCHEMA,
)

console.log('\nAdd these values to .env.local and Vercel:')
console.log(`NOTION_INVESTORS_DATA_SOURCE_ID=${investors.dataSourceId}`)
console.log(`NOTION_FOUNDERS_DATA_SOURCE_ID=${founders.dataSourceId}`)
console.log('\nDatabase IDs (for reference):')
console.log(`Investors: ${investors.databaseId}`)
console.log(`Founders: ${founders.databaseId}`)
