import { create } from 'zustand'
import type { GatewaySession } from '@/types/gateway'

interface AgentStats {
  agentId: string
  sessionCount: number
  lastActive: string | null
  status: 'active' | 'idle' | 'offline'
}

interface SessionsStore {
  sessions: GatewaySession[]
  agentStats: AgentStats[]
  totalSessions: number
  activeSessions: number

  setSessions: (sessions: GatewaySession[]) => void
}

function computeStats(sessions: GatewaySession[]): {
  agentStats: AgentStats[]
  totalSessions: number
  activeSessions: number
} {
  const byAgent = new Map<string, GatewaySession[]>()
  sessions.forEach((s) => {
    const id = s.agentId || 'unknown'
    if (!byAgent.has(id)) byAgent.set(id, [])
    byAgent.get(id)!.push(s)
  })

  const now = Date.now()
  const agentStats: AgentStats[] = [...byAgent.entries()].map(([agentId, agentSessions]) => {
    const latest = agentSessions.reduce((best, s) => {
      const t = s.activeAt ? new Date(s.activeAt).getTime() : 0
      return t > best ? t : best
    }, 0)

    const diff = latest ? now - latest : Infinity
    const status = diff < 60000 ? 'active' : diff < 300000 ? 'idle' : 'offline'

    return {
      agentId,
      sessionCount: agentSessions.length,
      lastActive: latest ? new Date(latest).toISOString() : null,
      status,
    }
  })

  agentStats.sort((a, b) => {
    const order = { active: 0, idle: 1, offline: 2 }
    return order[a.status] - order[b.status]
  })

  return {
    agentStats,
    totalSessions: sessions.length,
    activeSessions: agentStats.filter((a) => a.status === 'active').length,
  }
}

export const useSessionsStore = create<SessionsStore>((set) => ({
  sessions: [],
  agentStats: [],
  totalSessions: 0,
  activeSessions: 0,

  setSessions: (sessions) => {
    const stats = computeStats(sessions)
    set({ sessions, ...stats })
  },
}))
