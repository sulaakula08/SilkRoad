import { useCallback, useRef, useState } from 'react'
import { SYSTEM_PROMPT } from './knowledge'

export type Role = 'user' | 'assistant'
export type Message = { id: string; role: Role; content: string }

let counter = 0
const id = () => `m${Date.now()}_${counter++}`

/**
 * Chat state + streaming. Posts the transcript to /api/chat and reads the
 * Server-Sent Events back, appending tokens to the last assistant message as
 * they arrive. The API key lives only on the server; this never sees it.
 */
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim()
      if (!clean || streaming) return
      setError(null)

      const userMsg: Message = { id: id(), role: 'user', content: clean }
      const assistantId = id()

      // Snapshot the history we're actually sending (state updates are async).
      const outgoing = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }))

      setMessages((m) => [
        ...m,
        userMsg,
        { id: assistantId, role: 'assistant', content: '' },
      ])
      setStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: outgoing, system: SYSTEM_PROMPT }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          const detail = await res.json().catch(() => null)
          throw new Error(detail?.error || 'The assistant is unavailable right now.')
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let got = false

        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const t = line.trim()
            if (!t.startsWith('data:')) continue
            const data = t.slice(5).trim()
            if (!data || data === '[DONE]') continue
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              got = true
              setMessages((m) =>
                m.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + parsed.text }
                    : msg,
                ),
              )
            }
          }
        }

        if (!got) throw new Error('The assistant didn’t respond. Please try again.')
      } catch (e) {
        const aborted = e instanceof DOMException && e.name === 'AbortError'
        if (!aborted) {
          setError(e instanceof Error ? e.message : 'Something went wrong.')
        }
        // Drop the empty assistant bubble on failure so the UI isn't stuck blank.
        setMessages((m) =>
          m.filter((msg) => !(msg.id === assistantId && msg.content === '')),
        )
      } finally {
        setStreaming(false)
        abortRef.current = null
      }
    },
    [messages, streaming],
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
  }, [])

  return { messages, streaming, error, send, reset }
}
