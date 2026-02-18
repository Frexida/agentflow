'use client'

import { useState } from 'react'
import Link from 'next/link'

interface OrgItem {
  id: string
  name: string
  agentCount: number
  updatedAt: string
}

// TODO: Replace with DB queries
const demoOrgs: OrgItem[] = [
  { id: 'demo', name: 'AgentFlow Team', agentCount: 6, updatedAt: '2026-02-18' },
]

export default function DashboardPage() {
  const [orgs] = useState<OrgItem[]>(demoOrgs)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = () => {
    if (!newName.trim()) return
    // TODO: API call POST /api/orgs
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Organizations</h1>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-bright)] transition text-sm"
          >
            + New Organization
          </button>
        </div>

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

        <div className="grid gap-4">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/editor/${org.id}`}
              className="block p-6 bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] hover:border-[var(--accent-bright)] transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-[var(--accent-bright)] transition">{org.name}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {org.agentCount} agents · Updated {org.updatedAt}
                  </p>
                </div>
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition">→</span>
              </div>
            </Link>
          ))}

          {orgs.length === 0 && (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <p className="text-4xl mb-4">🏗️</p>
              <p>No organizations yet. Create one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
