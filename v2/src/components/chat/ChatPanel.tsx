'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useChatStore } from '@/stores/chat'
import { useGatewayStore } from '@/stores/gateway'
import {
  useExternalStoreRuntime,
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
} from '@assistant-ui/react'
import type { ThreadMessageLike } from '@assistant-ui/react'
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

function convertMessage(msg: ChatMessage): ThreadMessageLike {
  return {
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: cleanMessage(msg.content),
    createdAt: msg.timestamp ? new Date(msg.timestamp) : undefined,
  }
}

function SessionSelector() {
  const { connected, sessions } = useGatewayStore()

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
        Select an agent
      </p>
      {sessions.map((s) => (
        <button
          key={s.sessionKey}
          onClick={() =>
            useChatStore.getState().setActiveSession(s.sessionKey, s.agentId || 'unknown')
          }
          className="w-full text-left p-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--accent)]/20 border border-[var(--border)] hover:border-[var(--accent-bright)]/40 text-sm transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-80" />
            <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-bright)]">
              {s.agentId || s.sessionKey}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] ml-4">{s.kind}</span>
        </button>
      ))}
      {sessions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-xs text-[var(--text-secondary)]">
            {connected ? 'No sessions found' : 'Connect to Gateway first'}
          </p>
        </div>
      )}
    </div>
  )
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end mb-3 px-4">
      <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm bg-[var(--accent-bright)] text-white shadow-sm">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start mb-3 px-4">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

function ChatThread() {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto py-4">
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-3xl mb-3">🤖</div>
            <p className="text-sm text-[var(--text-secondary)]">Send a message to start</p>
          </div>
        </ThreadPrimitive.Empty>
      </ThreadPrimitive.Viewport>

      <div className="p-3 border-t border-[var(--border)]">
        <ComposerPrimitive.Root className="flex gap-2">
          <ComposerPrimitive.Input
            placeholder="Message..."
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)] transition-colors resize-none placeholder:text-[var(--text-secondary)]/50"
            autoFocus
          />
          <ComposerPrimitive.Send className="px-4 py-2.5 bg-[var(--accent-bright)] hover:bg-[var(--accent-glow)] rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            ↑
          </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  )
}

function ActiveChat() {
  const { activeSession } = useChatStore()
  const { client } = useGatewayStore()
  const messages = useChatStore((s) => (activeSession ? s.messages.get(activeSession) || [] : []))
  const [isRunning, setIsRunning] = useState(false)

  // Poll for messages
  const pollMessages = useCallback(async () => {
    if (!client?.isConnected() || !activeSession) return
    try {
      const history = await client.chatHistory(activeSession, 30)
      const cleaned: ChatMessage[] = history.map((m: ChatMessage & { content: unknown }) => ({
        ...m,
        content: cleanMessage(m.content),
      }))
      useChatStore.getState().setMessages(activeSession, cleaned)
    } catch {
      // ignore
    }
  }, [client, activeSession])

  useEffect(() => {
    pollMessages()
    const interval = setInterval(pollMessages, 5000)
    return () => clearInterval(interval)
  }, [pollMessages])

  const convertedMessages = useMemo(
    () => messages.map(convertMessage),
    [messages]
  )

  const handleSend = useCallback(
    async (message: { content: ReadonlyArray<{ type: string; text?: string }> }) => {
      if (!client?.isConnected() || !activeSession) return
      const text = message.content
        .filter((p) => p.type === 'text')
        .map((p) => p.text || '')
        .join('\n')
        .trim()
      if (!text) return

      setIsRunning(true)
      try {
        await client.chatSend(activeSession, text)
        // Poll for response
        setTimeout(pollMessages, 1000)
        setTimeout(pollMessages, 3000)
        setTimeout(pollMessages, 6000)
      } catch {
        // ignore
      } finally {
        setTimeout(() => setIsRunning(false), 5000)
      }
    },
    [client, activeSession, pollMessages]
  )

  const runtime = useExternalStoreRuntime({
    messages: convertedMessages,
    isRunning,
    convertMessage: (m) => m,
    onNew: handleSend,
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatThread />
    </AssistantRuntimeProvider>
  )
}

export default function ChatPanel({
  open,
  onClose,
  embedded,
}: {
  open: boolean
  onClose: () => void
  embedded?: boolean
}) {
  const { activeSession, activeAgentId } = useChatStore()

  if (!open) return null

  return (
    <div
      className={
        embedded
          ? 'flex flex-col h-full'
          : 'fixed right-0 top-0 h-screen w-96 bg-[var(--surface-elevated)] border-l border-[var(--border)] flex flex-col z-40 shadow-2xl'
      }
    >
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="font-semibold text-sm">Chat</h3>
            {activeAgentId && (
              <span className="text-xs text-[var(--text-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                {activeAgentId}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--accent-bright)] transition-colors p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeSession ? <ActiveChat /> : <SessionSelector />}
      </div>
    </div>
  )
}
