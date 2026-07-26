import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Dev-only: mount the same /api/chat handler used in production as Vite
 * middleware, so `npm run dev` exercises the real proxy. The key is read from
 * .env.local into process.env here (server side) — it is never exposed to the
 * client, because it is not prefixed VITE_ and only this Node code reads it.
 */
function serverApi(env: Record<string, string>): PluginOption {
  // Make the server-side vars visible to the handlers via process.env.
  process.env.GEMINI_API_KEY ||= env.GEMINI_API_KEY || ''
  process.env.GEMINI_MODEL ||= env.GEMINI_MODEL || ''

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
