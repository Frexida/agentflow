import { create } from 'zustand'
import { GatewayProxyClient } from '@/lib/gateway-proxy'
import type { GatewaySession } from '@/types/gateway'

interface GatewayStore {
  connected: boolean
  client: GatewayProxyClient | null
  configHash: string | null
  sessions: GatewaySession[]

  connect: () => Promise<void>
  disconnect: () => void
  refreshSessions: () => Promise<void>
  refreshConfig: () => Promise<{ config: string; hash: string } | null>
}

export const useGatewayStore = create<GatewayStore>((set, get) => ({
  connected: false,
  client: null,
  configHash: null,
  sessions: [],

  connect: async () => {
    const existing = get().client
    if (existing) existing.disconnect()

    const client = new GatewayProxyClient()

    client.on('connected', () => set({ connected: true }))
    client.on('disconnected', () => set({ connected: false }))

    await client.connect()
    set({ client, connected: true })
  },

  disconnect: () => {
    const { client } = get()
    if (client) client.disconnect()
    set({ client: null, connected: false, sessions: [], configHash: null })
  },

  refreshSessions: async () => {
    const { client } = get()
    if (!client?.isConnected()) return
    try {
      const sessions = await client.sessionsList()
      set({ sessions })
    } catch {
      // ignore
    }
  },

  refreshConfig: async () => {
    const { client } = get()
    if (!client?.isConnected()) return null
    try {
      const result = await client.configGet()
      set({ configHash: result.hash })
      return result
    } catch {
      return null
    }
  },
}))
