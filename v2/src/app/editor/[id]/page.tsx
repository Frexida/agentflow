'use client'

import { useEffect, useMemo, useCallback, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import AgentNode from '@/components/canvas/AgentNode'
import CanvasToolbar from '@/components/canvas/CanvasToolbar'
import NodeEditModal from '@/components/canvas/NodeEditModal'
import ChatPanel from '@/components/chat/ChatPanel'
import TimelinePanel from '@/components/canvas/TimelinePanel'
import { useOrgStore } from '@/stores/org'
import { useGatewayStore } from '@/stores/gateway'
import { useSessionMonitor } from '@/lib/session-monitor'
import type { AgentNodeData } from '@/types/org'

const nodeTypes = { agent: AgentNode }

const demoNodes: Node<AgentNodeData>[] = [
  {
    id: 'ceo',
    type: 'agent',
    position: { x: 300, y: 50 },
    data: { agentId: 'ceo', name: 'leith18', role: 'coordinator', icon: '👔', status: 'active' },
  },
  {
    id: 'pm-1',
    type: 'agent',
    position: { x: 50, y: 220 },
    data: { agentId: 'pm-1', name: '鬼畜', role: 'coordinator', icon: '👹', status: 'active', model: 'claude-opus-4-6' },
  },
  {
    id: 'dev-1',
    type: 'agent',
    position: { x: 300, y: 220 },
    data: { agentId: 'dev-1', name: 'nix', role: 'worker', icon: '⚙️', status: 'active', model: 'claude-opus-4-6' },
  },
  {
    id: 'research-1',
    type: 'agent',
    position: { x: 550, y: 220 },
    data: { agentId: 'research-1', name: 'アライ研究員', role: 'worker', icon: '🔬', status: 'idle', model: 'claude-opus-4-6' },
  },
  {
    id: 'media-1',
    type: 'agent',
    position: { x: 50, y: 400 },
    data: { agentId: 'media-1', name: '蓮香', role: 'worker', icon: '📢', status: 'offline' },
  },
  {
    id: 'ethics-1',
    type: 'agent',
    position: { x: 550, y: 400 },
    data: { agentId: 'ethics-1', name: '倫理アンチ', role: 'reviewer', icon: '💀', status: 'active' },
  },
]

const demoEdges = [
  { id: 'e-ceo-pm', source: 'ceo', target: 'pm-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true },
  { id: 'e-ceo-dev', source: 'ceo', target: 'dev-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true },
  { id: 'e-ceo-research', source: 'ceo', target: 'research-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true },
  { id: 'e-pm-dev', source: 'pm-1', target: 'dev-1', sourceHandle: 'output_2', targetHandle: 'input_2', animated: true },
  { id: 'e-pm-media', source: 'pm-1', target: 'media-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true },
  { id: 'e-pm-ethics', source: 'pm-1', target: 'ethics-1', sourceHandle: 'output_2', targetHandle: 'input_2', animated: true, style: { strokeDasharray: '5 5' } },
]

function EditorCanvas() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect } = useOrgStore()
  const { connected } = useGatewayStore()
  useSessionMonitor(connected)
  const [editNodeId, setEditNodeId] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(demoNodes)
      setEdges(demoEdges)
    }
  }, [])

  const memoNodeTypes = useMemo(() => nodeTypes, [])

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setEditNodeId(node.id)
  }, [])

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={memoNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        className="bg-[var(--surface)]"
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
        <Controls className="!bg-[var(--surface-elevated)] !border-[var(--accent)]" />
        <MiniMap style={{ background: '#16213e' }} nodeColor="#0f3460" />
        <CanvasToolbar />
      </ReactFlow>
      <NodeEditModal nodeId={editNodeId} onClose={() => setEditNodeId(null)} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <TimelinePanel open={timelineOpen} onClose={() => setTimelineOpen(false)} />
      {/* Float buttons */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={() => setTimelineOpen(!timelineOpen)}
          className="w-12 h-12 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] flex items-center justify-center text-xl transition shadow-lg"
          title="Timeline"
        >
          📋
        </button>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-bright)] flex items-center justify-center text-xl transition shadow-lg"
          title="Chat"
        >
          💬
        </button>
      </div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  )
}
