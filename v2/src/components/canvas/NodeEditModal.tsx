'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/stores/org'
import type { AgentNodeData, AgentRole } from '@/types/org'

const roles: { value: AgentRole; label: string }[] = [
  { value: 'coordinator', label: '🎯 Coordinator' },
  { value: 'worker', label: '⚙️ Worker' },
  { value: 'reviewer', label: '🔍 Reviewer' },
  { value: 'custom', label: '✏️ Custom' },
]

const icons = ['🤖', '👔', '👹', '⚙️', '🔬', '📢', '💀', '🧠', '🎨', '📊', '🛡️', '🔧']

interface Props {
  nodeId: string | null
  onClose: () => void
}

export default function NodeEditModal({ nodeId, onClose }: Props) {
  const { nodes, updateAgent, removeAgent } = useOrgStore()
  const node = nodes.find((n) => n.id === nodeId)

  const [name, setName] = useState('')
  const [agentId, setAgentId] = useState('')
  const [role, setRole] = useState<AgentRole>('worker')
  const [model, setModel] = useState('')
  const [icon, setIcon] = useState('🤖')
  const [systemPrompt, setSystemPrompt] = useState('')

  useEffect(() => {
    if (node) {
      const d = node.data as AgentNodeData
      setName(d.name || '')
      setAgentId(d.agentId || '')
      setRole((d.role as AgentRole) || 'worker')
      setModel(d.model || '')
      setIcon(d.icon || '🤖')
      setSystemPrompt(d.systemPrompt || '')
    }
  }, [node])

  if (!nodeId || !node) return null

  const handleSave = () => {
    updateAgent(nodeId, { name, agentId, role, model, icon, systemPrompt })
    onClose()
  }

  const handleDelete = () => {
    removeAgent(nodeId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[var(--surface-elevated)] border border-[var(--accent)] rounded-lg w-[480px] max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--accent)]">
          <h2 className="font-semibold">Edit Agent</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-red-400">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Icon */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">Icon</label>
            <div className="flex gap-1 flex-wrap">
              {icons.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-lg transition ${icon === i ? 'bg-[var(--accent-bright)]/30 ring-1 ring-[var(--accent-bright)]' : 'hover:bg-[var(--accent)]/30'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <Field label="Display Name" value={name} onChange={setName} />

          {/* Agent ID */}
          <Field label="Agent ID" value={agentId} onChange={setAgentId} placeholder="e.g. pm-1, dev-1" />

          {/* Role */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Role</label>
            <div className="flex gap-2 flex-wrap">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`px-3 py-1.5 rounded text-sm transition ${role === r.value ? 'bg-[var(--accent-bright)]/30 text-[var(--accent-bright)] ring-1 ring-[var(--accent-bright)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <Field label="Model" value={model} onChange={setModel} placeholder="e.g. claude-opus-4-6" />

          {/* System Prompt */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-24 bg-[var(--surface)] border border-[var(--accent)] rounded px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)] resize-none font-mono"
              placeholder="Optional system prompt..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--accent)]">
          <button onClick={handleDelete} className="px-3 py-1.5 text-red-400 hover:bg-red-900/20 rounded text-sm transition">
            🗑️ Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 bg-[var(--accent)] rounded text-sm hover:bg-[var(--accent-bright)] transition">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm text-[var(--text-secondary)] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--surface)] border border-[var(--accent)] rounded px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)]"
        placeholder={placeholder}
      />
    </div>
  )
}
