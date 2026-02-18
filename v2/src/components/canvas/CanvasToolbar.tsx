'use client'

import { useCallback, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useOrgStore } from '@/stores/org'
import { autoLayout } from '@/lib/auto-layout'
import type { AgentNodeData } from '@/types/org'
import ExportModal from './ExportModal'
import { saveOrg } from '@/lib/api'

export default function CanvasToolbar() {
  const { nodes, edges, addAgent, addGroup, setNodes, structureMode, setStructureMode } = useOrgStore()
  const { fitView } = useReactFlow()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const orgId = window.location.pathname.split('/').pop() || 'demo'
      await saveOrg(orgId, {
        agents: nodes.map(n => ({
          id: n.id,
          agentId: (n.data as AgentNodeData).agentId,
          name: (n.data as AgentNodeData).name,
          role: (n.data as AgentNodeData).role,
          model: (n.data as AgentNodeData).model,
          icon: (n.data as AgentNodeData).icon,
          systemPrompt: (n.data as AgentNodeData).systemPrompt,
          positionX: n.position.x,
          positionY: n.position.y,
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle || undefined,
          targetHandle: e.targetHandle || undefined,
        })),
      })
      setSaveStatus('✅ Saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch {
      setSaveStatus('❌ Failed')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setSaving(false)
    }
  }, [nodes, edges])

  const handleAddAgent = useCallback(() => {
    if (!newName.trim()) return
    const id = newName.trim().toLowerCase().replace(/\s+/g, '-')
    const data: AgentNodeData = {
      agentId: id,
      name: newName.trim(),
      role: 'worker',
      status: 'offline',
    }
    // Place below existing nodes
    const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0)
    addAgent(data, { x: 200 + Math.random() * 200, y: maxY + 180 })
    setNewName('')
    setAdding(false)
  }, [newName, nodes, addAgent])

  const handleAddGroup = useCallback(() => {
    const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0)
    addGroup('New Group', { x: 100, y: maxY + 200 })
  }, [nodes, addGroup])

  const handleAutoLayout = useCallback(() => {
    const laid = autoLayout(nodes, edges, { direction: 'TB' })
    setNodes(laid)
    setTimeout(() => fitView({ padding: 0.2 }), 50)
  }, [nodes, edges, setNodes, fitView])

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2 })
  }, [fitView])

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      {/* Add Agent */}
      {adding ? (
        <div className="flex items-center gap-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg px-2 py-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddAgent()}
            placeholder="Agent name..."
            className="bg-transparent text-sm text-[var(--text-primary)] outline-none w-32"
            autoFocus
          />
          <button onClick={handleAddAgent} className="text-green-400 hover:text-green-300 text-sm px-1">✓</button>
          <button onClick={() => setAdding(false)} className="text-red-400 hover:text-red-300 text-sm px-1">✕</button>
        </div>
      ) : (
        <ToolButton onClick={() => setAdding(true)} title="Add Agent" highlight>+ Add Agent</ToolButton>
      )}

      {/* Auto Layout */}
      <ToolButton onClick={handleAutoLayout} title="Auto Layout">○ Auto Layout</ToolButton>

      {/* Add Group */}
      <ToolButton onClick={handleAddGroup} title="Add Group">▣ Groups</ToolButton>

      {/* Structure Mode */}
      <ToolButton
        onClick={() => setStructureMode(structureMode === 'tree' ? 'graph' : 'tree')}
        title={`Mode: ${structureMode}`}
        active={structureMode === 'tree'}
      >
        {structureMode === 'tree' ? '△ Tree' : '◉ Graph'}
      </ToolButton>

      {/* Save */}
      <ToolButton onClick={handleSave} title={saving ? 'Saving...' : 'Save'}>Save</ToolButton>

      {/* Export */}
      <ToolButton onClick={() => setExportOpen(true)} title="Export / Import">Export</ToolButton>

      {saveStatus && (
        <span className="text-xs bg-[var(--surface-elevated)] px-2 py-1 rounded border border-[var(--accent)]">
          {saveStatus}
        </span>
      )}

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}

function ToolButton({
  onClick,
  title,
  children,
  active,
  highlight,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        px-3 py-1.5 flex items-center justify-center rounded text-xs font-medium
        transition-all whitespace-nowrap
        focus-visible:outline-2 focus-visible:outline-[var(--accent-bright)] focus-visible:outline-offset-2
        ${highlight
          ? 'bg-[var(--accent-bright)] text-white hover:brightness-110 border border-transparent'
          : active
            ? 'bg-[var(--surface-elevated)] border border-[var(--accent-bright)] text-[var(--accent-bright)]'
            : 'bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-bright)]'
        }
      `}
    >
      {children}
    </button>
  )
}
