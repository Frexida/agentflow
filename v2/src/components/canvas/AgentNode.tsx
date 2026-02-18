'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { AgentNodeData } from '@/types/org'

type AgentNode = Node<AgentNodeData>

const statusColors: Record<string, string> = {
  active: '#22c55e',
  idle: '#eab308',
  offline: '#6b7280',
}

function AgentNodeComponent({ data, selected }: NodeProps<AgentNode>) {
  const status = data.status || 'offline'
  const icon = data.icon || '🤖'

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg min-w-[160px]
        bg-[var(--surface-elevated)] border
        ${selected ? 'border-[var(--accent-bright)] shadow-lg shadow-[var(--accent-bright)]/20' : 'border-[var(--accent)]'}
        transition-all duration-200
      `}
    >
      {/* Ports */}
      <Handle type="target" position={Position.Top} id="input_1"
        className="!w-3 !h-3 !bg-[var(--accent)] !border-[var(--accent-bright)]" />
      <Handle type="target" position={Position.Left} id="input_2"
        className="!w-3 !h-3 !bg-[var(--accent)] !border-[var(--accent-bright)]" />
      <Handle type="source" position={Position.Bottom} id="output_1"
        className="!w-3 !h-3 !bg-[var(--accent)] !border-[var(--accent-bright)]" />
      <Handle type="source" position={Position.Right} id="output_2"
        className="!w-3 !h-3 !bg-[var(--accent)] !border-[var(--accent-bright)]" />

      {/* Status dot */}
      <div
        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: statusColors[status] }}
        title={status}
      />

      {/* Content */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{data.name}</div>
          {data.role && (
            <div className="text-xs text-[var(--text-secondary)] truncate">{data.role}</div>
          )}
          {data.model && (
            <div className="text-[10px] text-[var(--text-secondary)] opacity-60 truncate">{data.model}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(AgentNodeComponent)
