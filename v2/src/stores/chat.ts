import { create } from 'zustand'
import type { ChatMessage } from '@/types/gateway'

interface ChatStore {
  activeSession: string | null
  activeAgentId: string | null
  messages: Map<string, ChatMessage[]>
  polling: boolean
  pollTimer: ReturnType<typeof setInterval> | null

  setActiveSession: (sessionKey: string, agentId: string) => void
  addMessage: (sessionKey: string, msg: ChatMessage) => void
  setMessages: (sessionKey: string, msgs: ChatMessage[]) => void
  clearChat: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  activeSession: null,
  activeAgentId: null,
  messages: new Map(),
  polling: false,
  pollTimer: null,

  setActiveSession: (sessionKey, agentId) => {
    set({ activeSession: sessionKey, activeAgentId: agentId })
  },

  addMessage: (sessionKey, msg) => {
    const messages = new Map(get().messages)
    const existing = messages.get(sessionKey) || []
    messages.set(sessionKey, [...existing, msg])
    set({ messages })
  },

  setMessages: (sessionKey, msgs) => {
    const messages = new Map(get().messages)
    messages.set(sessionKey, msgs)
    set({ messages })
  },

  clearChat: () => {
    set({ activeSession: null, activeAgentId: null, messages: new Map() })
  },
}))
