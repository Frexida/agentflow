'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGatewayStore } from '@/stores/gateway'

interface TimelineEntry {
  id: string
  agentId: string
  action: string
  timestamp: number
  detail?: string
}

const agentColors: Record<string, string> = {
  'pm-1': '#e94560',
  'dev-1': '#22c55e',
  'research-1': '#3b82f6',
  'media-1': '#a855f7',
  'ethics-1': '#f59e0b',
  'ceo': '#06b6d4',
}

function getColor(agentId: string): string {
  return agentColors[agentId] || '#6b7280'
}

export default function TimelinePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sessions, connected, refreshSessions } = useGatewayStore()
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const buildEntries = useCallback(() => {
    const newEntries: TimelineEntry[] = sessions.map((s) => ({
      id: s.sessionKey,
      agentId: s.agentId || 'unknown',
      action: s.status === 'active' ? 'active' : s.status,
      timestamp: s.activeAt ? new Date(s.activeAt).getTime() : Date.now(),
      detail: s.lastMessage?.content?.slice(0, 80),
    }))
    newEntries.sort((a, b) => b.timestamp - a.timestamp)
    setEntries(newEntries.slice(0, 50))
  }, [sessions])

  useEffect(() => {
    if (open && connected) {
      refreshSessions()
      const timer = setInterval(refreshSessions, 10000)
      return () => clearInterval(timer)
    }
  }, [open, connected, refreshSessions])

  useEffect(() => {
    buildEntries()
  }, [sessions, buildEntries])

  const filtered = filter ? entries.filter((e) => e.agentId === filter) : entries
  const agents = [...new Set(entries.map((e) => e.agentId))]

  if (!open) return null

  return (
    <div className="fixed left-0 bottom-0 w-full h-64 bg-[var(--surface-elevated)] border-t border-[var(--accent)] z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--accent)]">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">📋 Timeline</h3>
          {/* Agent filter chips */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilter(null)}
              className={`px-2 py-0.5 rounded text-xs transition ${!filter ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              All
            </button>
            {agents.map((a) => (
              <button
                key={a}
                onClick={() => setFilter(filter === a ? null : a)}
                className={`px-2 py-0.5 rounded text-xs transition ${filter === a ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                style={filter === a ? { backgroundColor: getColor(a) } : {}}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-red-400 text-sm">✕</button>
      </div>

      {/* Entries */}
      <div ref={scrollRef} className="flex-1 overflow-auto font-mono text-xs p-2 space-y-0.5">
        {filtered.map((entry) => (
          <div key={entry.id + entry.timestamp} className="flex items-start gap-2 hover:bg-[var(--surface)]/50 px-2 py-1 rounded">
            <span className="text-[var(--text-secondary)] shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span
              className="shrink-0 font-semibold w-24 truncate"
              style={{ color: getColor(entry.agentId) }}
            >
              {entry.agentId}
            </span>
            <span className="text-[var(--text-secondary)]">{entry.action}</span>
            {entry.detail && (
              <span className="text-[var(--text-primary)] truncate">{entry.detail}</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-[var(--text-secondary)] py-8">
            {connected ? 'No activity yet' : 'Connect to Gateway to see timeline'}
          </p>
        )}
      </div>
    </div>
  )
}
