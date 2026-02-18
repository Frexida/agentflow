'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/stores/org'
import { useGatewayStore } from '@/stores/gateway'
import { graphToConfig, configToGraph } from '@/lib/config-parser'

import { toPng, toSvg } from 'html-to-image'

type Tab = 'export' | 'import' | 'apply' | 'image'

export default function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { nodes, edges, setNodes, setEdges } = useOrgStore()
  const { connected, client } = useGatewayStore()
  const [tab, setTab] = useState<Tab>('export')
  const [yaml, setYaml] = useState('')
  const [importYaml, setImportYaml] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [baseHash, setBaseHash] = useState<string | null>(null)

  useEffect(() => {
    if (open && tab === 'export') {
      setYaml(graphToConfig(nodes, edges))
    }
  }, [open, tab, nodes, edges])

  if (!open) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml)
    setStatus('Copied!')
    setTimeout(() => setStatus(null), 2000)
  }

  const handleImport = () => {
    try {
      const { nodes: newNodes, edges: newEdges } = configToGraph(importYaml)
      if (newNodes.length === 0) {
        setStatus('No agents found in config')
        return
      }
      setNodes(newNodes)
      setEdges(newEdges)
      setStatus(`Imported ${newNodes.length} agents`)
      setTimeout(() => { setStatus(null); onClose() }, 1500)
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Parse failed'}`)
    }
  }

  const handleImportFromGateway = async () => {
    if (!client?.isConnected()) return
    try {
      setStatus('Fetching config...')
      const result = await client.configGet()
      setBaseHash(result.hash)
      const { nodes: newNodes, edges: newEdges } = configToGraph(result.config)
      setNodes(newNodes)
      setEdges(newEdges)
      setStatus(`Imported ${newNodes.length} agents from Gateway`)
      setTimeout(() => { setStatus(null); onClose() }, 1500)
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Failed'}`)
    }
  }

  const handleApply = async () => {
    if (!client?.isConnected()) return
    try {
      setStatus('Fetching current config...')
      const current = await client.configGet()
      const merged = graphToConfig(nodes, edges, current.config)
      setStatus('Applying config...')
      await client.configApply(merged, current.hash)
      setStatus('✅ Config applied! Gateway restarting...')
      setTimeout(() => { setStatus(null); onClose() }, 3000)
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Failed'}`)
    }
  }

  const handleExportImage = async (format: 'png' | 'svg') => {
    const el = document.querySelector('.react-flow') as HTMLElement
    if (!el) { setStatus('Canvas not found'); return }
    try {
      setStatus(`Generating ${format.toUpperCase()}...`)
      const opts = { backgroundColor: '#0a0a0a', quality: 1, pixelRatio: 2 }
      const dataUrl = format === 'png' ? await toPng(el, opts) : await toSvg(el, opts)
      const link = document.createElement('a')
      link.download = `agentflow-org.${format}`
      link.href = dataUrl
      link.click()
      setStatus(`✅ ${format.toUpperCase()} downloaded!`)
      setTimeout(() => setStatus(null), 2000)
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'Export failed'}`)
    }
  }

  const handleExportJSON = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = 'agentflow-org.json'
    link.href = URL.createObjectURL(blob)
    link.click()
    setStatus('✅ JSON downloaded!')
    setTimeout(() => setStatus(null), 2000)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'export', label: '📤 YAML' },
    { key: 'image', label: '🖼️ Image' },
    { key: 'import', label: '📥 Import' },
    { key: 'apply', label: '🚀 Apply' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[var(--surface-elevated)] border border-[var(--accent)] rounded-lg w-[600px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Tabs */}
        <div className="flex border-b border-[var(--accent)]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setStatus(null) }}
              className={`flex-1 px-4 py-3 text-sm transition ${tab === t.key ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {t.label}
            </button>
          ))}
          <button onClick={onClose} className="px-4 py-3 text-[var(--text-secondary)] hover:text-red-400">✕</button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-auto">
          {tab === 'export' && (
            <div>
              <textarea
                value={yaml}
                readOnly
                className="w-full h-64 bg-[var(--surface)] border border-[var(--accent)] rounded p-3 text-sm font-mono text-[var(--text-primary)] resize-none outline-none"
              />
              <div className="mt-3 flex gap-2">
                <button onClick={handleCopy} className="px-4 py-2 bg-[var(--accent)] rounded text-sm hover:bg-[var(--accent-bright)] transition">
                  📋 Copy YAML
                </button>
              </div>
            </div>
          )}

          {tab === 'image' && (
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Export your organization design as an image for presentations and documentation.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleExportImage('png')} className="flex flex-col items-center gap-2 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent-bright)] transition">
                  <span className="text-2xl">🖼️</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">PNG</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">High-res image</span>
                </button>
                <button onClick={() => handleExportImage('svg')} className="flex flex-col items-center gap-2 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent-bright)] transition">
                  <span className="text-2xl">📐</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">SVG</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">Vector / scalable</span>
                </button>
                <button onClick={handleExportJSON} className="flex flex-col items-center gap-2 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent-bright)] transition">
                  <span className="text-2xl">📄</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">JSON</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">Raw data</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'import' && (
            <div>
              <textarea
                value={importYaml}
                onChange={(e) => setImportYaml(e.target.value)}
                className="w-full h-48 bg-[var(--surface)] border border-[var(--accent)] rounded p-3 text-sm font-mono text-[var(--text-primary)] resize-none outline-none"
                placeholder="Paste OpenClaw YAML config here..."
              />
              <div className="mt-3 flex gap-2">
                <button onClick={handleImport} className="px-4 py-2 bg-[var(--accent)] rounded text-sm hover:bg-[var(--accent-bright)] transition">
                  📥 Import from YAML
                </button>
                {connected && (
                  <button onClick={handleImportFromGateway} className="px-4 py-2 bg-green-600/50 rounded text-sm hover:bg-green-500/50 transition">
                    🔗 Import from Gateway
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'apply' && (
            <div>
              {!connected ? (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <p className="text-3xl mb-3">🔌</p>
                  <p>Connect to Gateway first</p>
                  <a href="/settings" className="text-[var(--accent-bright)] text-sm mt-2 inline-block">→ Settings</a>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Apply the current organization design to OpenClaw Gateway.
                    This will update the agents configuration and restart the gateway.
                  </p>
                  <div className="bg-[var(--surface)] rounded p-3 mb-4">
                    <p className="text-sm font-mono">{nodes.length} agents, {edges.length} connections</p>
                  </div>
                  <button onClick={handleApply} className="px-4 py-2 bg-[var(--accent-bright)] rounded text-sm hover:opacity-90 transition">
                    🚀 Apply to Gateway
                  </button>
                </div>
              )}
            </div>
          )}

          {status && (
            <div className={`mt-3 text-sm px-3 py-2 rounded ${status.startsWith('Error') ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
