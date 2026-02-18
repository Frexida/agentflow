import { useEffect } from 'react'
import { useGatewayStore } from '@/stores/gateway'
import { useOrgStore } from '@/stores/org'
import type { AgentStatus } from '@/types/org'

function getStatus(activeAt?: string): AgentStatus {
  if (!activeAt) return 'offline'
  const diff = Date.now() - new Date(activeAt).getTime()
  if (diff < 60000) return 'active'
  if (diff < 300000) return 'idle'
  return 'offline'
}

/**
 * Hook: polls Gateway sessions and updates node status indicators
 */
export function useSessionMonitor(enabled: boolean) {
  const { connected, sessions, refreshSessions } = useGatewayStore()
  const { nodes, updateAgent } = useOrgStore()

  // Poll sessions
  useEffect(() => {
    if (!enabled || !connected) return
    refreshSessions()
    const timer = setInterval(refreshSessions, 10000)
    return () => clearInterval(timer)
  }, [enabled, connected, refreshSessions])

  // Update node statuses
  useEffect(() => {
    if (sessions.length === 0) return

    const statusMap = new Map<string, AgentStatus>()
    sessions.forEach((s) => {
      if (s.agentId) {
        const current = statusMap.get(s.agentId)
        const newStatus = getStatus(s.activeAt)
        // Keep the most active status
        if (!current || newStatus === 'active' || (newStatus === 'idle' && current === 'offline')) {
          statusMap.set(s.agentId, newStatus)
        }
      }
    })

    nodes.forEach((node) => {
      const agentId = node.data.agentId
      const status = statusMap.get(agentId)
      if (status && status !== node.data.status) {
        updateAgent(node.id, { status })
      }
    })
  }, [sessions, nodes, updateAgent])
}
