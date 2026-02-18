'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGatewayStore } from '@/stores/gateway'
import { useSessionsStore } from '@/stores/sessions'
import { createClient } from '@/lib/supabase/client'

interface Design {
  id: string
  name: string
  updated_at: string
  created_at: string
}

const statusIcons = { active: '🟢', idle: '🟡', offline: '⚫' }

export default function DashboardPage() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const router = useRouter()
  const { connected, refreshSessions } = useGatewayStore()
  const { agentStats, totalSessions, activeSessions } = useSessionsStore()

  // Fetch designs from cloud
  useEffect(() => {
    async function fetchDesigns() {
      const res = await fetch('/api/designs')
      if (res.ok) {
        const { designs } = await res.json()
        setDesigns(designs || [])
      }
      setLoading(false)
    }
    fetchDesigns()
  }, [])

  const syncSessions = useCallback(async () => {
    if (!connected) return
    await refreshSessions()
    const sessions = useGatewayStore.getState().sessions
    useSessionsStore.getState().setSessions(sessions)
  }, [connected, refreshSessions])

  useEffect(() => {
    syncSessions()
    const timer = setInterval(syncSessions, 10000)
    return () => clearInterval(timer)
  }, [syncSessions])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), data: { nodes: [], edges: [] } }),
    })
    if (res.ok) {
      const { design } = await res.json()
      setNewName('')
      setCreating(false)
      router.push(`/editor/${design.id}`)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Sign Out
            </button>
            <Link href="/settings" className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
              ⚙️ Settings
            </Link>
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-bright)] transition text-sm"
            >
              + New Organization
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Designs" value={designs.length} icon="📐" />
          <StatCard label="Active Agents" value={activeSessions} icon="🟢" />
          <StatCard label="Total Sessions" value={totalSessions} icon="📊" />
          <StatCard
            label="Gateway"
            value={connected ? 'Connected' : 'Disconnected'}
            icon={connected ? '🔌' : '⚡'}
            highlight={connected}
          />
        </div>

        {/* Agent Status Table */}
        {agentStats.length > 0 && (
          <div className="bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] mb-8">
            <div className="px-4 py-3 border-b border-[var(--accent)]">
              <h2 className="font-semibold text-sm">Agent Status</h2>
            </div>
            <div className="divide-y divide-[var(--accent)]/30">
              {agentStats.map((agent) => (
                <div key={agent.agentId} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span>{statusIcons[agent.status]}</span>
                    <span className="font-medium text-sm">{agent.agentId}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-[var(--text-secondary)]">
                    <span>{agent.sessionCount} session{agent.sessionCount !== 1 ? 's' : ''}</span>
                    <span>{agent.lastActive ? timeAgo(agent.lastActive) : 'never'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create org */}
        {creating && (
          <div className="mb-6 p-4 bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Organization name..."
              className="flex-1 bg-transparent text-[var(--text-primary)] outline-none border-b border-[var(--accent)] px-2 py-1"
              autoFocus
            />
            <button onClick={handleCreate} className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-500">Create</button>
            <button onClick={() => setCreating(false)} className="px-3 py-1 bg-red-600/50 rounded text-sm hover:bg-red-500/50">Cancel</button>
          </div>
        )}

        {/* Design List */}
        <h2 className="font-semibold mb-4">Your Designs</h2>
        {loading ? (
          <p className="text-[var(--text-secondary)]">Loading...</p>
        ) : designs.length === 0 ? (
          <div className="text-center py-12 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border)]">
            <p className="text-[var(--text-secondary)] mb-4">No designs yet</p>
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 bg-[var(--accent-bright)] rounded-lg hover:bg-[var(--accent-glow)] transition text-sm"
            >
              Create your first organization
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {designs.map((design) => (
              <Link
                key={design.id}
                href={`/editor/${design.id}`}
                className="block p-6 bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] hover:border-[var(--accent-bright)] transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-[var(--accent-bright)] transition">{design.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Updated {timeAgo(design.updated_at)}
                    </p>
                  </div>
                  <span className="text-2xl opacity-50 group-hover:opacity-100 transition">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string | number; icon: string; highlight?: boolean }) {
  return (
    <div className={`bg-[var(--surface-elevated)] rounded-lg border p-4 ${highlight ? 'border-green-500/50' : 'border-[var(--accent)]'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-[var(--text-secondary)] mt-1">{label}</div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}
