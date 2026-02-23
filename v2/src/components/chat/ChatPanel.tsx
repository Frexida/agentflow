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

// Agent color palette for multi-agent view
const AGENT_COLORS = [
  '#e94560', // red (primary)
  '#00d4aa', // teal
  '#ffa726', // orange
  '#7c4dff', // purple
  '#29b6f6', // blue
  '#66bb6a', // green
  '#ef5350', // coral
  '#ab47bc', // violet
]

function getAgentColor(agentId: string, agents: string[]): string {
  const idx = agents.indexOf(agentId)
  return AGENT_COLORS[idx >= 0 ? idx % AGENT_COLORS.length : 0]
}

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
    metadata: msg.agentId ? { custom: { agentId: msg.agentId } } : undefined,
  }
}

// ── Session / Channel Selector ──────────────────────────────────

function SessionSelector() {
  const { connected, sessions } = useGatewayStore()
  const { createChannel } = useChatStore()
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [multiSelect, setMultiSelect] = useState(false)

  const toggleSession = (key: string) => {
    const next = new Set(selectedSessions)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelectedSessions(next)
  }

  const startMultiChat = () => {
    if (selectedSessions.size < 2) return
    const agents = Array.from(selectedSessions)
    const names = agents
      .map((k) => sessions.find((s) => s.sessionKey === k)?.agentId || k)
      .join(', ')
    createChannel(names, agents)
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
          {multiSelect ? 'Select agents for group chat' : 'Select an agent'}
        </p>
        <button
          onClick={() => {
            setMultiSelect(!multiSelect)
            setSelectedSessions(new Set())
          }}
          className="text-xs px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-bright)]/40 text-[var(--text-secondary)] hover:text-[var(--accent-bright)] transition-all"
        >
          {multiSelect ? '1:1' : '👥 Group'}
        </button>
      </div>

      {sessions.map((s) => (
        <button
          key={s.sessionKey}
          onClick={() => {
            if (multiSelect) {
              toggleSession(s.sessionKey)
            } else {
              useChatStore
                .getState()
                .setActiveSession(s.sessionKey, s.agentId || 'unknown')
            }
          }}
          className={`w-full text-left p-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--accent)]/20 border text-sm transition-all group ${
            multiSelect && selectedSessions.has(s.sessionKey)
              ? 'border-[var(--accent-bright)] bg-[var(--accent)]/10'
              : 'border-[var(--border)] hover:border-[var(--accent-bright)]/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {multiSelect && (
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  selectedSessions.has(s.sessionKey)
                    ? 'bg-[var(--accent-bright)] border-[var(--accent-bright)] text-white'
                    : 'border-[var(--border)]'
                }`}
              >
                {selectedSessions.has(s.sessionKey) && '✓'}
              </div>
            )}
            <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-80" />
            <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-bright)]">
              {s.agentId || s.sessionKey}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] ml-4">
            {s.kind}
          </span>
        </button>
      ))}

      {multiSelect && selectedSessions.size >= 2 && (
        <button
          onClick={startMultiChat}
          className="w-full p-3 rounded-lg bg-[var(--accent-bright)] hover:bg-[var(--accent-glow)] text-white text-sm font-medium transition-colors"
        >
          Start Group Chat ({selectedSessions.size} agents)
        </button>
      )}

      {/* New Chat button — always shown when connected */}
      {connected && (
        <button
          onClick={() => {
            const sessionKey = `agent:assistant:webchat:ui-${Date.now()}`
            useChatStore.getState().setActiveSession(sessionKey, 'assistant')
          }}
          className="w-full p-3 rounded-lg bg-[var(--accent-bright)] hover:bg-[var(--accent-glow)] text-white text-sm font-medium transition-colors"
        >
          💬 New Chat with Assistant
        </button>
      )}

      {sessions.length === 0 && !connected && (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">💬</div>
          <p className="text-xs text-[var(--text-secondary)]">
            Connect to Gateway first
          </p>
        </div>
      )}
    </div>
  )
}

// ── Message Components ──────────────────────────────────────────

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

// ── Multi-agent message (with agent label) ──────────────────────

function MultiAgentMessage({
  msg,
  agents,
  sessions: gwSessions,
}: {
  msg: ChatMessage
  agents: string[]
  sessions: { sessionKey: string; agentId?: string }[]
}) {
  const agentName =
    gwSessions.find((s) => s.sessionKey === msg.sessionKey)?.agentId ||
    msg.agentId ||
    'Agent'
  const color = getAgentColor(msg.sessionKey || '', agents)

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end mb-3 px-4">
        <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm bg-[var(--accent-bright)] text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-3 px-4">
      <div className="flex gap-2 max-w-[85%]">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
          style={{ backgroundColor: color }}
        >
          {agentName.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="text-xs font-medium mb-1 block" style={{ color }}>
            {agentName}
          </span>
          <div className="rounded-2xl rounded-tl-md px-4 py-2.5 text-sm bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm">
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Chat Thread (assistant-ui powered) ──────────────────────────

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
            <p className="text-sm text-[var(--text-secondary)]">
              Send a message to start
            </p>
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

// ── Single Agent Chat ───────────────────────────────────────────

function SingleAgentChat() {
  const { activeSession } = useChatStore()
  const { client } = useGatewayStore()
  const messages = useChatStore((s) =>
    activeSession ? s.messages.get(activeSession) || [] : []
  )
  const [isRunning, setIsRunning] = useState(false)

  const pollMessages = useCallback(async () => {
    if (!client?.isConnected() || !activeSession) return
    try {
      const history = await client.chatHistory(activeSession, 30)
      const cleaned: ChatMessage[] = history.map(
        (m: ChatMessage & { content: unknown }) => ({
          ...m,
          content: cleanMessage(m.content),
        })
      )
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
    async (message: {
      content: ReadonlyArray<{ type: string; text?: string }>
    }) => {
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

// ── Multi Agent Chat (Discord-style) ────────────────────────────

function MultiAgentChat() {
  const { activeChannel, channels } = useChatStore()
  const { client, sessions: gwSessions } = useGatewayStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollTop = node.scrollHeight
  }, [])

  const channel = activeChannel ? channels.get(activeChannel) : null
  const messages = channel?.messages || []

  // Poll all agents in the channel
  const pollAll = useCallback(async () => {
    if (!client?.isConnected() || !channel) return
    const allMessages: ChatMessage[] = []

    for (const sessionKey of channel.agents) {
      try {
        const history = await client.chatHistory(sessionKey, 30)
        const agentId =
          gwSessions.find((s) => s.sessionKey === sessionKey)?.agentId ||
          sessionKey

        for (const m of history) {
          allMessages.push({
            role: m.role,
            content: cleanMessage(m.content),
            timestamp: m.timestamp,
            agentId: m.role === 'assistant' ? agentId : undefined,
            sessionKey: m.role === 'assistant' ? sessionKey : undefined,
          })
        }
      } catch {
        // ignore individual agent errors
      }
    }

    // Sort by timestamp, dedupe user messages (sent to all agents)
    allMessages.sort((a, b) => a.timestamp - b.timestamp)

    // Dedupe user messages that are within 2s of each other
    const deduped: ChatMessage[] = []
    let lastUserTs = 0
    let lastUserContent = ''
    for (const msg of allMessages) {
      if (msg.role === 'user') {
        if (
          msg.content === lastUserContent &&
          Math.abs(msg.timestamp - lastUserTs) < 2000
        ) {
          continue // skip duplicate broadcast
        }
        lastUserTs = msg.timestamp
        lastUserContent = msg.content
      }
      deduped.push(msg)
    }

    if (activeChannel) {
      useChatStore.getState().setChannelMessages(activeChannel, deduped)
    }
  }, [client, channel, activeChannel, gwSessions])

  useEffect(() => {
    pollAll()
    const interval = setInterval(pollAll, 5000)
    return () => clearInterval(interval)
  }, [pollAll])

  // Broadcast send to all agents
  const handleSend = async () => {
    if (!input.trim() || !client?.isConnected() || !channel) return
    setSending(true)
    try {
      // Send to ALL agents in the channel simultaneously
      await Promise.allSettled(
        channel.agents.map((sessionKey) =>
          client.chatSend(sessionKey, input.trim())
        )
      )
      setInput('')
      setTimeout(pollAll, 1000)
      setTimeout(pollAll, 3000)
      setTimeout(pollAll, 6000)
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  if (!channel) return null

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            👥
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {channel.name}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            {channel.agents.length} agents
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
        {messages.map((msg, i) => (
          <MultiAgentMessage
            key={`${msg.timestamp}-${msg.agentId}-${i}`}
            msg={msg}
            agents={channel.agents}
            sessions={gwSessions}
          />
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-3xl mb-3">👥</div>
            <p className="text-sm text-[var(--text-secondary)]">
              Group chat with {channel.agents.length} agents
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Your message will be sent to all agents simultaneously
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message ${channel.agents.length} agents...`}
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)] transition-colors placeholder:text-[var(--text-secondary)]/50"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 bg-[var(--accent-bright)] hover:bg-[var(--accent-glow)] rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {sending ? '...' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ChatPanel ──────────────────────────────────────────────

export default function ChatPanel({
  open,
  onClose,
  embedded,
}: {
  open: boolean
  onClose: () => void
  embedded?: boolean
}) {
  const { mode, activeSession, activeAgentId, activeChannel, channels } =
    useChatStore()
  const channel = activeChannel ? channels.get(activeChannel) : null

  if (!open) return null

  const hasActiveChat =
    (mode === 'single' && activeSession) ||
    (mode === 'multi' && activeChannel)

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
            {mode === 'single' && activeAgentId && (
              <span className="text-xs text-[var(--text-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                {activeAgentId}
              </span>
            )}
            {mode === 'multi' && channel && (
              <span className="text-xs text-[var(--text-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                👥 {channel.agents.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasActiveChat && (
              <button
                onClick={() => useChatStore.getState().clearChat()}
                className="text-[var(--text-secondary)] hover:text-[var(--accent-bright)] transition-colors p-1 text-xs"
                title="Back to sessions"
              >
                ←
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-bright)] transition-colors p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!hasActiveChat && <SessionSelector />}
        {mode === 'single' && activeSession && <SingleAgentChat />}
        {mode === 'multi' && activeChannel && <MultiAgentChat />}
      </div>
    </div>
  )
}
