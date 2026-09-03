import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev-only: mount the same /api/chat handler used in production as Vite
 * middleware, so `npm run dev` exercises the real proxy. The key is read from
 * Vite's .env files into process.env here (server side) — it is never exposed to the
 * client, because it is not prefixed VITE_ and only this Node code reads it.
 */
function serverApi(env: Record<string, string>): PluginOption {
  // Make the server-side vars visible to the handlers via process.env.
  process.env.ANTHROPIC_API_KEY ||= env.ANTHROPIC_API_KEY || ''
  process.env.ANTHROPIC_MODEL ||= env.ANTHROPIC_MODEL || ''
  process.env.ANTHROPIC_SCREEN_MODEL ||= env.ANTHROPIC_SCREEN_MODEL || ''
  process.env.NOTION_TOKEN ||= env.NOTION_TOKEN || ''
  process.env.NOTION_INVESTORS_DATA_SOURCE_ID ||= env.NOTION_INVESTORS_DATA_SOURCE_ID || ''
  process.env.NOTION_FOUNDERS_DATA_SOURCE_ID ||= env.NOTION_FOUNDERS_DATA_SOURCE_ID || ''
  process.env.BLOB_READ_WRITE_TOKEN ||= env.BLOB_READ_WRITE_TOKEN || ''
  process.env.TELEGRAM_BOT_TOKEN ||= env.TELEGRAM_BOT_TOKEN || ''
  process.env.TELEGRAM_CHAT_ID ||= env.TELEGRAM_CHAT_ID || ''
  process.env.RESEND_API_KEY ||= env.RESEND_API_KEY || ''
  process.env.APPLICATION_EMAIL_FROM ||= env.APPLICATION_EMAIL_FROM || ''
  process.env.FOUNDER_REPLY_EMAIL ||= env.FOUNDER_REPLY_EMAIL || ''
  process.env.FOUNDER_REPLY_SIGNING_SECRET ||= env.FOUNDER_REPLY_SIGNING_SECRET || ''
  process.env.RESEND_WEBHOOK_SECRET ||= env.RESEND_WEBHOOK_SECRET || ''
  process.env.ANTHROPIC_REPLY_MODEL ||= env.ANTHROPIC_REPLY_MODEL || ''

  return {
    name: 'silkroad-server-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        const { chatHandler } = await server.ssrLoadModule('/api/chat.js')
        await chatHandler(req, res)
      })
      server.middlewares.use('/api/screen', async (req, res) => {
        const { screenHandler } = await server.ssrLoadModule('/api/screen.js')
        await screenHandler(req, res)
      })
      server.middlewares.use('/api/deck-upload', async (req, res) => {
        const { deckUploadHandler } = await server.ssrLoadModule('/api/deck-upload.js')
        await deckUploadHandler(req, res)
      })
      server.middlewares.use('/api/submissions', async (req, res) => {
        const { submissionsHandler } = await server.ssrLoadModule('/api/submissions.js')
        await submissionsHandler(req, res)
      })
      server.middlewares.use('/api/resend-inbound', async (req, res) => {
        const { resendInboundHandler } = await server.ssrLoadModule('/api/resend-inbound.js')
        await resendInboundHandler(req, res)
      })
      server.middlewares.use('/api/blob-cleanup', async (req, res) => {
        const { blobCleanupHandler } = await server.ssrLoadModule('/api/blob-cleanup.js')
        await blobCleanupHandler(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // '' prefix => load ALL vars (not just VITE_), for the server middleware.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), serverApi(env)],
  }
})
