'use client'

import { useCallback } from 'react'
import { useOrgStore } from '@/stores/org'

interface Props {
  nodeId: string
  x: number
  y: number
  onClose: () => void
}

export default function NodeContextMenu({ nodeId, x, y, onClose }: Props) {
  const { nodes, addToGroup, removeFromGroup, removeAgent, removeGroup } = useOrgStore()

  const node = nodes.find((n) => n.id === nodeId)
  const isGroup = node?.type === 'group'
  const isInGroup = !!node?.parentId
  const groups = nodes.filter((n) => n.type === 'group' && n.id !== nodeId)

  const handleRemove = useCallback(() => {
    if (isGroup) {
      removeGroup(nodeId)
    } else {
      removeAgent(nodeId)
    }
    onClose()
  }, [nodeId, isGroup, removeGroup, removeAgent, onClose])

  const handleAddToGroup = useCallback(
    (groupId: string) => {
      addToGroup(nodeId, groupId)
      onClose()
    },
    [nodeId, addToGroup, onClose]
  )

  const handleRemoveFromGroup = useCallback(() => {
    removeFromGroup(nodeId)
    onClose()
  }, [nodeId, removeFromGroup, onClose])

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-[var(--surface-elevated)] border border-[var(--accent)] rounded-lg shadow-xl py-1 min-w-[180px]"
        style={{ left: x, top: y }}
      >
        {!isGroup && !isInGroup && groups.length > 0 && (
          <>
            <div className="px-3 py-1 text-xs text-[var(--text-secondary)]">Add to Group</div>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => handleAddToGroup(g.id)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--accent)]/20 transition"
              >
                📁 {(g.data as { label?: string }).label || g.id}
              </button>
            ))}
            <div className="border-t border-[var(--accent)] my-1" />
          </>
        )}

        {!isGroup && isInGroup && (
          <>
            <button
              onClick={handleRemoveFromGroup}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--accent)]/20 transition"
            >
              ↩️ Remove from Group
            </button>
            <div className="border-t border-[var(--accent)] my-1" />
          </>
        )}

        <button
          onClick={handleRemove}
          className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          🗑️ Delete {isGroup ? 'Group' : 'Agent'}
        </button>
      </div>
    </>
  )
}
