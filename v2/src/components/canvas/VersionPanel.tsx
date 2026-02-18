'use client'

import { useState } from 'react'
import { useVersionHistory } from '@/hooks/useVersionHistory'

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function VersionPanel({ designId }: { designId: string }) {
  const { versions, saveVersion, restoreVersion, deleteVersion, renameVersion } = useVersionHistory(designId)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [saveLabel, setSaveLabel] = useState('')
  const [showSave, setShowSave] = useState(false)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-40 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-bright)] transition"
        title="Version History"
      >
        📜 Versions {versions.length > 0 && `(${versions.length})`}
      </button>

      {open && (
        <div className="fixed top-14 right-4 z-40 w-72 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">📜 Version History</span>
            <div className="flex gap-1">
              <button
                onClick={() => setShowSave(!showSave)}
                className="text-[10px] px-2 py-0.5 bg-[var(--accent-bright)] text-white rounded hover:brightness-110"
              >
                + Save
              </button>
              <button onClick={() => setOpen(false)} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-1">✕</button>
            </div>
          </div>

          {/* Save input */}
          {showSave && (
            <div className="px-3 py-2 border-b border-[var(--border)] flex gap-1">
              <input
                type="text"
                value={saveLabel}
                onChange={e => setSaveLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    saveVersion(saveLabel || undefined)
                    setSaveLabel('')
                    setShowSave(false)
                  }
                }}
                placeholder="Version label (optional)"
                className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none"
                autoFocus
              />
              <button
                onClick={() => { saveVersion(saveLabel || undefined); setSaveLabel(''); setShowSave(false) }}
                className="text-xs text-green-400 hover:text-green-300 px-1"
              >✓</button>
            </div>
          )}

          {/* Version list */}
          <div className="max-h-[400px] overflow-y-auto">
            {versions.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-[var(--text-secondary)]">
                No versions yet. Click + Save to create one.
              </div>
            )}
            {versions.map(v => (
              <div key={v.id} className="px-3 py-2 border-b border-[var(--border)] hover:bg-[var(--surface)] group">
                {editingId === v.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { renameVersion(v.id, editLabel); setEditingId(null) }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-1 py-0.5 text-xs text-[var(--text-primary)] outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[140px]">
                        {v.label}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">{timeAgo(v.timestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {v.nodes.length} agents · {v.edges.length} edges
                        {v.auto && ' · auto'}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => restoreVersion(v.id)} className="text-[10px] text-[var(--accent-bright)] hover:underline">Restore</button>
                        <button onClick={() => { setEditingId(v.id); setEditLabel(v.label) }} className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">✏️</button>
                        <button onClick={() => deleteVersion(v.id)} className="text-[10px] text-red-400 hover:text-red-300">🗑</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
