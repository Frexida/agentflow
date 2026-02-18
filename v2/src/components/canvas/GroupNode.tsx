'use client'

import { memo, useCallback, useState } from 'react'
import { NodeResizer, type NodeProps, type Node } from '@xyflow/react'
import type { GroupNodeData } from '@/types/org'

type GroupNode = Node<GroupNodeData>

function GroupNodeComponent({ data, selected }: NodeProps<GroupNode>) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(data.label || 'Group')
  const color = data.color || '#3a1520'

  const handleDoubleClick = useCallback(() => {
    setEditing(true)
  }, [])

  const handleBlur = useCallback(() => {
    setEditing(false)
    // Update via store would need a callback prop — for now just local state
  }, [])

  return (
    <div
      className="w-full h-full rounded-xl"
      style={{
        backgroundColor: `${color}20`,
        border: `2px ${selected ? 'solid' : 'dashed'} ${color}80`,
        minWidth: 200,
        minHeight: 150,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        minWidth={200}
        minHeight={150}
        isVisible={selected}
        lineClassName="!border-[var(--accent-bright)]"
        handleClassName="!w-3 !h-3 !bg-[var(--accent-bright)] !border-[var(--accent)]"
      />
      <div className="px-3 py-2">
        {editing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="bg-transparent text-sm font-semibold outline-none border-b border-[var(--accent)]"
            style={{ color: color }}
            autoFocus
          />
        ) : (
          <div
            className="text-sm font-semibold opacity-80"
            style={{ color: color }}
          >
            📁 {data.label || 'Group'}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(GroupNodeComponent)
