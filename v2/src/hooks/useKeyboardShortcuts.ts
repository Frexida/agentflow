'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useOrgStore } from '@/stores/org'

interface UndoRedoState {
  nodes: ReturnType<typeof useOrgStore.getState>['nodes']
  edges: ReturnType<typeof useOrgStore.getState>['edges']
}

const MAX_HISTORY = 50

export function useKeyboardShortcuts(designId: string) {
  const { getNodes, setNodes: rfSetNodes } = useReactFlow()
  const { nodes, edges, setNodes, setEdges } = useOrgStore()
  const undoStack = useRef<UndoRedoState[]>([])
  const redoStack = useRef<UndoRedoState[]>([])
  const lastSnapshot = useRef<string>('')

  // Take snapshot for undo (debounced by content)
  const pushUndo = useCallback(() => {
    const state = useOrgStore.getState()
    const snap = JSON.stringify({ nodes: state.nodes, edges: state.edges })
    if (snap === lastSnapshot.current) return
    lastSnapshot.current = snap
    undoStack.current.push({ nodes: structuredClone(state.nodes), edges: structuredClone(state.edges) })
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = []
  }, [])

  // Snapshot on meaningful changes
  useEffect(() => {
    const snap = JSON.stringify({ nodes, edges })
    if (snap !== lastSnapshot.current && lastSnapshot.current !== '') {
      // Debounce: only push after settling
      const timer = setTimeout(() => pushUndo(), 300)
      return () => clearTimeout(timer)
    }
    if (lastSnapshot.current === '') {
      lastSnapshot.current = snap
    }
  }, [nodes, edges, pushUndo])

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    const state = useOrgStore.getState()
    redoStack.current.push({ nodes: structuredClone(state.nodes), edges: structuredClone(state.edges) })
    const prev = undoStack.current.pop()!
    lastSnapshot.current = JSON.stringify(prev)
    setNodes(prev.nodes)
    setEdges(prev.edges)
  }, [setNodes, setEdges])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    const state = useOrgStore.getState()
    undoStack.current.push({ nodes: structuredClone(state.nodes), edges: structuredClone(state.edges) })
    const next = redoStack.current.pop()!
    lastSnapshot.current = JSON.stringify(next)
    setNodes(next.nodes)
    setEdges(next.edges)
  }, [setNodes, setEdges])

  const save = useCallback(async () => {
    if (!designId || designId === 'demo' || designId === 'new') return
    const state = useOrgStore.getState()
    try {
      await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { nodes: state.nodes, edges: state.edges } }),
      })
    } catch (err) {
      console.error('Save failed:', err)
    }
  }, [designId])

  const duplicateSelected = useCallback(() => {
    const state = useOrgStore.getState()
    const selected = state.nodes.filter((n) => n.selected)
    if (selected.length === 0) return
    pushUndo()
    const newNodes = selected.map((n) => ({
      ...structuredClone(n),
      id: `${n.id}-copy-${Date.now()}`,
      position: { x: n.position.x + 50, y: n.position.y + 50 },
      selected: false,
    }))
    setNodes([...state.nodes.map((n) => ({ ...n, selected: false })), ...newNodes])
  }, [setNodes, pushUndo])

  const selectAll = useCallback(() => {
    const state = useOrgStore.getState()
    setNodes(state.nodes.map((n) => ({ ...n, selected: true })))
  }, [setNodes])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement)?.isContentEditable) return

      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+Z: Undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((ctrl && e.key === 'y') || (ctrl && e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl+S: Save
      if (ctrl && e.key === 's') {
        e.preventDefault()
        save()
        return
      }

      // Ctrl+D: Duplicate
      if (ctrl && e.key === 'd') {
        e.preventDefault()
        duplicateSelected()
        return
      }

      // Ctrl+A: Select All
      if (ctrl && e.key === 'a') {
        e.preventDefault()
        selectAll()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, save, duplicateSelected, selectAll])

  return { undo, redo, canUndo: undoStack.current.length > 0, canRedo: redoStack.current.length > 0 }
}
