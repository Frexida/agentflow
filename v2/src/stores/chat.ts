import { create } from 'zustand'
import type { ChatMessage, ChatChannel } from '@/types/gateway'

type ChatMode = 'single' | 'multi'

interface ChatStore {
  // Mode
  mode: ChatMode

  // Single agent mode
  activeSession: string | null
  activeAgentId: string | null
  messages: Map<string, ChatMessage[]>

  // Multi agent mode (channel)
  activeChannel: string | null
  channels: Map<string, ChatChannel>

  // Polling
  polling: boolean
  pollTimer: ReturnType<typeof setInterval> | null

  // Single mode actions
  setActiveSession: (sessionKey: string, agentId: string) => void
  addMessage: (sessionKey: string, msg: ChatMessage) => void
  setMessages: (sessionKey: string, msgs: ChatMessage[]) => void
  clearChat: () => void

  // Multi mode actions
  setMode: (mode: ChatMode) => void
  createChannel: (name: string, agentSessionKeys: string[]) => string
  setActiveChannel: (channelId: string) => void
  addChannelMessage: (channelId: string, msg: ChatMessage) => void
  setChannelMessages: (channelId: string, msgs: ChatMessage[]) => void
  getChannelMessages: (channelId: string) => ChatMessage[]
}

let channelCounter = 0

export const useChatStore = create<ChatStore>((set, get) => ({
  mode: 'single',
  activeSession: null,
  activeAgentId: null,
  messages: new Map(),
  activeChannel: null,
  channels: new Map(),
  polling: false,
  pollTimer: null,

  setActiveSession: (sessionKey, agentId) => {
    set({ activeSession: sessionKey, activeAgentId: agentId, mode: 'single' })
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
    set({
      activeSession: null,
      activeAgentId: null,
      messages: new Map(),
      activeChannel: null,
    })
  },

  setMode: (mode) => set({ mode }),

  createChannel: (name, agentSessionKeys) => {
    const id = `channel-${++channelCounter}-${Date.now()}`
    const channels = new Map(get().channels)
    channels.set(id, {
      id,
      name,
      agents: agentSessionKeys,
      messages: [],
    })
    set({ channels, activeChannel: id, mode: 'multi' })
    return id
  },

  setActiveChannel: (channelId) => {
    set({ activeChannel: channelId, mode: 'multi' })
  },

  addChannelMessage: (channelId, msg) => {
    const channels = new Map(get().channels)
    const channel = channels.get(channelId)
    if (!channel) return
    channels.set(channelId, {
      ...channel,
      messages: [...channel.messages, msg],
    })
    set({ channels })
  },

  setChannelMessages: (channelId, msgs) => {
    const channels = new Map(get().channels)
    const channel = channels.get(channelId)
    if (!channel) return
    channels.set(channelId, {
      ...channel,
      messages: msgs.sort((a, b) => a.timestamp - b.timestamp),
    })
    set({ channels })
  },

  getChannelMessages: (channelId) => {
    const channel = get().channels.get(channelId)
    return channel?.messages || []
  },
}))
