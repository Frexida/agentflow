'use client'

import { useState, useCallback, useEffect } from 'react'
import { useOrgStore } from '@/stores/org'

export interface Version {
  id: string
  timestamp: number
  label: string
  nodes: any[]
  edges: any[]
  auto: boolean
}

const STORAGE_KEY = 'agentflow:versions'
const MAX_VERSIONS = 20

export function useVersionHistory(designId: string) {
  const [versions, setVersions] = useState<Version[]>([])
  const { nodes, edges, setNodes, setEdges } = useOrgStore()

  // Load
  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `${STORAGE_KEY}:${designId}`
    try {
      const saved = localStorage.getItem(key)
      if (saved) setVersions(JSON.parse(saved))
    } catch {}
  }, [designId])

  const persist = useCallback((v: Version[]) => {
    setVersions(v)
    try { localStorage.setItem(`${STORAGE_KEY}:${designId}`, JSON.stringify(v)) } catch {}
  }, [designId])

  const saveVersion = useCallback((label?: string) => {
    const state = useOrgStore.getState()
    const version: Version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: label || `Version ${versions.length + 1}`,
      nodes: structuredClone(state.nodes),
      edges: structuredClone(state.edges),
      auto: !label,
    }
    const updated = [version, ...versions].slice(0, MAX_VERSIONS)
    persist(updated)
    return version
  }, [versions, persist])

  const restoreVersion = useCallback((id: string) => {
    const version = versions.find(v => v.id === id)
    if (!version) return
    // Auto-save current state before restoring
    const state = useOrgStore.getState()
    const backup: Version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: `Before restore (auto)`,
      nodes: structuredClone(state.nodes),
      edges: structuredClone(state.edges),
      auto: true,
    }
    const updated = [backup, ...versions].slice(0, MAX_VERSIONS)
    persist(updated)
    setNodes(version.nodes)
    setEdges(version.edges)
  }, [versions, persist, setNodes, setEdges])

  const deleteVersion = useCallback((id: string) => {
    persist(versions.filter(v => v.id !== id))
  }, [versions, persist])

  const renameVersion = useCallback((id: string, label: string) => {
    persist(versions.map(v => v.id === id ? { ...v, label } : v))
  }, [versions, persist])

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useOrgStore.getState()
      if (state.nodes.length === 0) return
      saveVersion()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [saveVersion])

  return { versions, saveVersion, restoreVersion, deleteVersion, renameVersion }
}
