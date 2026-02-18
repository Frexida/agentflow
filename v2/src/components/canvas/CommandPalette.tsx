'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useOrgStore } from '@/stores/org'
import { autoLayout } from '@/lib/auto-layout'

interface Command {
  id: string
  label: string
  shortcut?: string
  category: 'action' | 'navigation' | 'agent'
  action: () => void
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { fitView } = useReactFlow()
  const { nodes, edges, setNodes, addAgent, setStructureMode, structureMode } = useOrgStore()

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      {
        id: 'add-agent',
        label: 'Add Agent',
        category: 'action',
        action: () => {
          const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0)
          addAgent(
            { agentId: `agent-${Date.now()}`, name: 'New Agent', role: 'worker', status: 'offline' },
            { x: 200 + Math.random() * 200, y: maxY + 180 }
          )
        },
      },
      {
        id: 'auto-layout',
        label: 'Auto Layout',
        category: 'action',
        action: () => {
          const laid = autoLayout(nodes, edges, { direction: 'TB' })
          setNodes(laid)
          setTimeout(() => fitView({ padding: 0.2 }), 50)
        },
      },
      {
        id: 'fit-view',
        label: 'Fit View',
        category: 'action',
        action: () => fitView({ padding: 0.2 }),
      },
      {
        id: 'toggle-mode',
        label: `Switch to ${structureMode === 'tree' ? 'Graph' : 'Tree'} Mode`,
        category: 'action',
        action: () => setStructureMode(structureMode === 'tree' ? 'graph' : 'tree'),
      },
      {
        id: 'save',
        label: 'Save',
        shortcut: 'Ctrl+S',
        category: 'action',
        action: () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true })),
      },
      {
        id: 'undo',
        label: 'Undo',
        shortcut: 'Ctrl+Z',
        category: 'action',
        action: () => window.dispatchEvent(new CustomEvent('agentflow:undo')),
      },
      {
        id: 'redo',
        label: 'Redo',
        shortcut: 'Ctrl+Y',
        category: 'action',
        action: () => window.dispatchEvent(new CustomEvent('agentflow:redo')),
      },
      {
        id: 'select-all',
        label: 'Select All',
        shortcut: 'Ctrl+A',
        category: 'action',
        action: () => setNodes(nodes.map(n => ({ ...n, selected: true }))),
      },
    ]

    // Add agent navigation commands
    nodes.filter(n => n.type === 'agent').forEach(n => {
      cmds.push({
        id: `goto-${n.id}`,
        label: `Go to: ${(n.data as { name?: string }).name || n.id}`,
        category: 'agent',
        action: () => {
          fitView({ nodes: [n], padding: 1, duration: 300 })
        },
      })
    })

    return cmds
  }, [nodes, edges, structureMode, addAgent, setNodes, setStructureMode, fitView])

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(c => c.label.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const execute = useCallback((cmd: Command) => {
    cmd.action()
    setOpen(false)
    setQuery('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      execute(filtered[selectedIndex])
    }
  }, [filtered, selectedIndex, execute])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[9990] bg-black/50" onClick={() => setOpen(false)} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[9991] w-[480px] bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
          <span className="text-[var(--text-secondary)] text-sm">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
          <kbd className="text-[10px] text-[var(--text-secondary)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-[var(--text-secondary)]">
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => execute(cmd)}
              className={`w-full px-4 py-2 flex items-center justify-between text-left transition-colors ${
                i === selectedIndex
                  ? 'bg-[var(--accent)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider opacity-50 w-12">
                  {cmd.category === 'agent' ? '👤' : '⚡'}
                </span>
                <span className="text-sm">{cmd.label}</span>
              </div>
              {cmd.shortcut && (
                <kbd className="text-[10px] text-[var(--text-secondary)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
