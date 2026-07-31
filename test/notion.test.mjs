import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeSubmission, saveApplication, SubmissionError } from '../server/notion.js'

const originalFetch = globalThis.fetch

test.afterEach(() => {
  globalThis.fetch = originalFetch
  delete process.env.NOTION_TOKEN
  delete process.env.NOTION_INVESTORS_DATA_SOURCE_ID
  delete process.env.NOTION_FOUNDERS_DATA_SOURCE_ID
})

test('normalizes investor fields and writes the investor data source', async () => {
  process.env.NOTION_TOKEN = 'test-token'
  process.env.NOTION_INVESTORS_DATA_SOURCE_ID = 'investors-source'

  let request
  globalThis.fetch = async (url, init) => {
    request = { url, init }
    return new Response(JSON.stringify({ id: 'investor-page' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const application = normalizeSubmission({
    tab: 'investor',
    lang: 'ru',
    values: {
      name: ' Ada Lovelace ',
      email: 'ADA@EXAMPLE.COM',
      phone: '+7 700 000 00 00',
      ticket: '$25k – $50k',
      message: 'Interested in AI deals.',
    },
  })
  const page = await saveApplication(application)

  assert.equal(page.id, 'investor-page')
  assert.equal(request.url, 'https://api.notion.com/v1/pages')
  const body = JSON.parse(request.init.body)
  assert.equal(body.parent.data_source_id, 'investors-source')
  assert.equal(body.properties.Name.title[0].text.content, 'Ada Lovelace')
  assert.equal(body.properties.Email.email, 'ada@example.com')
  assert.equal(body.properties.Status.select.name, 'New')
  assert.equal(body.properties.Language.select.name, 'RU')
})

test('keeps founder AI columns compact and puts the full report in the page', async () => {
  process.env.NOTION_TOKEN = 'test-token'
  process.env.NOTION_FOUNDERS_DATA_SOURCE_ID = 'founders-source'

  let requestBody
  globalThis.fetch = async (_url, init) => {
    requestBody = JSON.parse(init.body)
    return new Response(JSON.stringify({ id: 'founder-page' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const application = normalizeSubmission({
    tab: 'founder',
    lang: 'en',
    values: {
      name: 'Grace Hopper',
      email: 'grace@example.com',
      phone: '+1 555 0100',
      company: 'Compiler Labs',
      stage: 'Seed',
      description: 'An AI compiler company with paid pilots.',
      deck: 'https://example.com/deck.pdf',
    },
    screening: {
      score: 82,
      verdict: 'strong',
      summary: 'Strong technical team with early commercial proof.',
      stage: 'Seed',
      sectors: ['AI & infrastructure'],
      strengths: ['Paid pilots'],
      flags: ['Show retention'],
      matchedTheses: ['AI-native products'],
    },
  })
  const result = await saveApplication(application)

  assert.equal(result.page.id, 'founder-page')
  assert.equal(requestBody.parent.data_source_id, 'founders-source')
  assert.equal(requestBody.properties['AI Score'].number, 82)
  assert.equal(requestBody.properties['AI Verdict'].select.name, 'Strong')
  assert.equal(requestBody.properties['AI Summary'], undefined)
  assert.equal(requestBody.properties.Description, undefined)
  const pageText = JSON.stringify(requestBody.children)
  assert.match(pageText, /AI Screening Report/)
  assert.match(pageText, /Strong technical team/)
  assert.match(pageText, /Paid pilots/)
  assert.match(pageText, /Show retention/)
})

test('rejects invalid submissions before calling Notion', () => {
  assert.throws(
    () =>
      normalizeSubmission({
        tab: 'investor',
        values: { name: 'Test', email: 'not-an-email', phone: '1', ticket: '$10k – $25k' },
      }),
    (error) => error instanceof SubmissionError && error.code === 'VALIDATION_ERROR',
  )
})
