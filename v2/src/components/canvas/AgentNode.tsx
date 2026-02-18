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
        relative px-4 py-3 rounded-lg min-w-[200px]
        bg-[var(--surface-elevated)] border
        ${selected ? 'border-[var(--accent-bright)] shadow-lg shadow-[var(--accent-bright)]/20' : 'border-[var(--border)]'}
        transition-all duration-200
      `}
    >
      {/* Ports */}
      <Handle type="target" position={Position.Top} id="input_1"
        className="!w-3 !h-3 !bg-[#444] !border-[#666]" />
      <Handle type="target" position={Position.Left} id="input_2"
        className="!w-3 !h-3 !bg-[#444] !border-[#666]" />
      <Handle type="source" position={Position.Bottom} id="output_1"
        className="!w-3 !h-3 !bg-[#444] !border-[#666]" />
      <Handle type="source" position={Position.Right} id="output_2"
        className="!w-3 !h-3 !bg-[#444] !border-[#666]" />

      {/* Status dot */}
      <div
        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: statusColors[status] }}
        title={status}
      />

      {/* Header: icon + name */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold text-sm truncate">{data.name}</span>
      </div>

      {/* Agent ID */}
      <div className="text-xs text-[var(--text-secondary)] mb-2">{data.agentId}</div>

      {/* Model badge */}
      {data.model && (
        <div className="inline-block px-2 py-0.5 rounded text-[11px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] mb-1">
          {data.model}
        </div>
      )}

      {/* Last activity placeholder */}
      <div className="text-[10px] text-[var(--text-secondary)] opacity-50 mt-1">
        last: --:--:--
      </div>
    </div>
  )
}

export default memo(AgentNodeComponent)
