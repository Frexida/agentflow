'use client'

import { useReactFlow } from '@xyflow/react'
import { useOrgStore } from '@/stores/org'
import { useGatewayStore } from '@/stores/gateway'
import { useState, useEffect } from 'react'

export default function StatusBar() {
  const { nodes, edges } = useOrgStore()
  const { connected } = useGatewayStore()
  const { getZoom } = useReactFlow()
  const [zoom, setZoom] = useState(100)

  const agentCount = nodes.filter(n => n.type === 'agent').length
  const groupCount = nodes.filter(n => n.type === 'group').length
  const edgeCount = edges.length

  useEffect(() => {
    const interval = setInterval(() => {
      try { setZoom(Math.round(getZoom() * 100)) } catch { /* not mounted */ }
    }, 500)
    return () => clearInterval(interval)
  }, [getZoom])

  return (
    <div className="fixed bottom-0 left-0 right-0 h-7 bg-[var(--surface-elevated)] border-t border-[var(--border)] flex items-center px-3 gap-4 text-xs text-[var(--text-secondary)] z-40 font-mono">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-[var(--text-secondary)]'}`}
        />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      <div className="w-px h-3.5 bg-[var(--border)]" />
      <span>{agentCount} agent{agentCount !== 1 ? 's' : ''}</span>
      {groupCount > 0 && <span>{groupCount} group{groupCount !== 1 ? 's' : ''}</span>}
      <span>{edgeCount} edge{edgeCount !== 1 ? 's' : ''}</span>
      <div className="flex-1" />
      <span>{zoom}%</span>
    </div>
  )
}
