'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '@/stores/chat'
import { useGatewayStore } from '@/stores/gateway'
import type { ChatMessage } from '@/types/gateway'

function cleanMessage(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('\n')
      .replace(/\[(?:message_id|envelope|openclaw)[^\]]*\]/g, '')
      .trim()
  }
  return String(content)
}

export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeSession, activeAgentId, messages, setMessages } = useChatStore()
  const { client, connected, sessions } = useGatewayStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentMessages = activeSession ? (messages.get(activeSession) || []) : []

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentMessages.length])

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!client?.isConnected() || !activeSession) return
    try {
      const history = await client.chatHistory(activeSession, 30)
      const cleaned: ChatMessage[] = history.map((m: ChatMessage & { content: unknown }) => ({
        ...m,
        content: cleanMessage(m.content),
      }))
      setMessages(activeSession, cleaned)
    } catch {
      // ignore
    }
  }, [client, activeSession, setMessages])

  useEffect(() => {
    if (open && activeSession) {
      pollMessages()
      pollRef.current = setInterval(pollMessages, 5000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, activeSession, pollMessages])

  const handleSend = async () => {
    if (!input.trim() || !client?.isConnected() || !activeSession) return
    setSending(true)
    try {
      await client.chatSend(activeSession, input.trim())
      setInput('')
      // Poll immediately for response
      setTimeout(pollMessages, 1000)
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-[var(--surface-elevated)] border-l border-[var(--accent)] flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--accent)]">
        <div>
          <h3 className="font-semibold text-sm">Chat</h3>
          {activeAgentId && <span className="text-xs text-[var(--text-secondary)]">{activeAgentId}</span>}
        </div>
        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-red-400">✕</button>
      </div>

      {/* Session selector */}
      {!activeSession && (
        <div className="p-3 space-y-2">
          <p className="text-xs text-[var(--text-secondary)]">Select an agent session:</p>
          {sessions.map((s) => (
            <button
              key={s.sessionKey}
              onClick={() => useChatStore.getState().setActiveSession(s.sessionKey, s.agentId || 'unknown')}
              className="w-full text-left p-2 rounded bg-[var(--surface)] hover:bg-[var(--accent)]/30 text-sm transition"
            >
              <span className="font-medium">{s.agentId || s.sessionKey}</span>
              <span className="text-xs text-[var(--text-secondary)] ml-2">{s.kind}</span>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-[var(--text-secondary)]">
              {connected ? 'No sessions found' : 'Connect to Gateway first'}
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      {activeSession && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-3">
            {currentMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface)] text-[var(--text-primary)]'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            {currentMessages.length === 0 && (
              <p className="text-center text-xs text-[var(--text-secondary)] py-8">No messages yet</p>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--accent)]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Message..."
                className="flex-1 bg-[var(--surface)] border border-[var(--accent)] rounded px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)]"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="px-3 py-2 bg-[var(--accent)] rounded text-sm hover:bg-[var(--accent-bright)] transition disabled:opacity-50"
              >
                {sending ? '...' : '→'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
