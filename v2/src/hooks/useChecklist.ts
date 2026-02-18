'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrgStore } from '@/stores/org'

export interface ChecklistItem {
  id: string
  label: string
  description: string
  done: boolean
}

const CHECKLIST_KEY = 'agentflow:checklist'
const CHECKLIST_DISMISSED_KEY = 'agentflow:checklist-dismissed'

const INITIAL_ITEMS: Omit<ChecklistItem, 'done'>[] = [
  { id: 'add-agent', label: 'Add an agent', description: 'Click "+ Add Agent" to create your first AI agent' },
  { id: 'connect', label: 'Connect agents', description: 'Drag between agent handles to create a connection' },
  { id: 'save', label: 'Save your design', description: 'Press Ctrl+S or click Save' },
  { id: 'export', label: 'Export config', description: 'Click Export to generate OpenClaw YAML' },
]

export function useChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [dismissed, setDismissed] = useState(true)
  const { nodes, edges } = useOrgStore()

  // Load state
  useEffect(() => {
    if (typeof window === 'undefined') return
    const d = localStorage.getItem(CHECKLIST_DISMISSED_KEY)
    if (d === 'true') {
      setDismissed(true)
      return
    }
    setDismissed(false)
    const saved = localStorage.getItem(CHECKLIST_KEY)
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch { setItems(INITIAL_ITEMS.map(i => ({ ...i, done: false }))) }
    } else {
      setItems(INITIAL_ITEMS.map(i => ({ ...i, done: false })))
    }
  }, [])

  // Auto-detect completion
  useEffect(() => {
    if (dismissed || items.length === 0) return
    const demoIds = new Set(['coordinator', 'planner', 'developer', 'researcher', 'writer', 'reviewer'])
    const hasCustomAgent = nodes.some(n => n.type === 'agent' && !demoIds.has(n.id))
    const hasConnection = edges.length > 6 // more than demo edges

    const updated = items.map(item => {
      if (item.id === 'add-agent' && hasCustomAgent) return { ...item, done: true }
      if (item.id === 'connect' && hasConnection) return { ...item, done: true }
      return item
    })

    const changed = updated.some((u, i) => u.done !== items[i].done)
    if (changed) {
      setItems(updated)
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated))
    }
  }, [nodes, edges, items, dismissed])

  const complete = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, done: true } : i)
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true')
  }, [])

  const progress = items.length > 0 ? items.filter(i => i.done).length / items.length : 0

  return { items, progress, dismissed, complete, dismiss }
}
