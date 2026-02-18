'use client'

import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const initialNodes: Node[] = [
  {
    id: 'ceo',
    type: 'default',
    position: { x: 300, y: 50 },
    data: { label: 'CEO (leith18)' },
    style: { background: '#16213e', color: '#e0e0e0', border: '1px solid #0f3460' },
  },
  {
    id: 'pm-1',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { label: 'PM (鬼畜)' },
    style: { background: '#16213e', color: '#e0e0e0', border: '1px solid #0f3460' },
  },
  {
    id: 'dev-1',
    type: 'default',
    position: { x: 300, y: 200 },
    data: { label: 'Dev (nix)' },
    style: { background: '#16213e', color: '#e0e0e0', border: '1px solid #0f3460' },
  },
  {
    id: 'research-1',
    type: 'default',
    position: { x: 500, y: 200 },
    data: { label: 'Research (アライ)' },
    style: { background: '#16213e', color: '#e0e0e0', border: '1px solid #0f3460' },
  },
]

const initialEdges: Edge[] = [
  { id: 'e-ceo-pm', source: 'ceo', target: 'pm-1', animated: true },
  { id: 'e-ceo-dev', source: 'ceo', target: 'dev-1', animated: true },
  { id: 'e-ceo-research', source: 'ceo', target: 'research-1', animated: true },
]

export default function EditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-[var(--surface)]"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
        <Controls />
        <MiniMap
          style={{ background: '#16213e' }}
          nodeColor="#0f3460"
        />
      </ReactFlow>
    </div>
  )
}
