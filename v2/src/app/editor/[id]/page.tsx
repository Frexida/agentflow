'use client'

import { useEffect, useMemo, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
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
import GroupNode from '@/components/canvas/GroupNode'
import CanvasToolbar from '@/components/canvas/CanvasToolbar'
import NodeEditModal from '@/components/canvas/NodeEditModal'
import NodeContextMenu from '@/components/canvas/NodeContextMenu'
import StatusBar from '@/components/canvas/StatusBar'
import SidePanel from '@/components/canvas/SidePanel'
import { useOrgStore } from '@/stores/org'
import { useGatewayStore } from '@/stores/gateway'
import { useSessionMonitor } from '@/lib/session-monitor'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useOnboarding } from '@/hooks/useOnboarding'
import OnboardingTooltip from '@/components/canvas/OnboardingTooltip'
import type { AgentNodeData } from '@/types/org'

const nodeTypes = { agent: AgentNode, group: GroupNode }

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

const edgeStyle = { stroke: '#e94560', strokeWidth: 2, strokeDasharray: '8 4' }
const demoEdges = [
  { id: 'e-ceo-pm', source: 'ceo', target: 'pm-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-ceo-dev', source: 'ceo', target: 'dev-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-ceo-research', source: 'ceo', target: 'research-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-pm-dev', source: 'pm-1', target: 'dev-1', sourceHandle: 'output_2', targetHandle: 'input_2', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-pm-media', source: 'pm-1', target: 'media-1', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-pm-ethics', source: 'pm-1', target: 'ethics-1', sourceHandle: 'output_2', targetHandle: 'input_2', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
]

function EditorCanvas() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect } = useOrgStore()
  const { connected } = useGatewayStore()
  useSessionMonitor(connected)
  const params = useParams()
  const designId = params.id as string
  const { undo, redo } = useKeyboardShortcuts(designId)
  const onboarding = useOnboarding()

  // Listen for toolbar undo/redo button clicks
  useEffect(() => {
    const handleUndo = () => undo()
    const handleRedo = () => redo()
    window.addEventListener('agentflow:undo', handleUndo)
    window.addEventListener('agentflow:redo', handleRedo)
    return () => {
      window.removeEventListener('agentflow:undo', handleUndo)
      window.removeEventListener('agentflow:redo', handleRedo)
    }
  }, [undo, redo])
  const [editNodeId, setEditNodeId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null)
  const [loading, setLoading] = useState(true)

  // Load design from cloud or use demo data
  useEffect(() => {
    async function loadDesign() {
      if (designId && designId !== 'demo' && designId !== 'new') {
        try {
          const res = await fetch(`/api/designs/${designId}`)
          if (res.ok) {
            const { design } = await res.json()
            if (design?.data?.nodes?.length > 0) {
              setNodes(design.data.nodes)
              setEdges(design.data.edges || [])
              setLoading(false)
              return
            }
          }
        } catch {
          // Fall through to demo data
        }
      }
      // Demo data fallback
      if (nodes.length === 0) {
        setNodes(demoNodes)
        setEdges(demoEdges)
      }
      setLoading(false)
    }
    loadDesign()
  }, [designId])

  const memoNodeTypes = useMemo(() => nodeTypes, [])

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'group') return
    setEditNodeId(node.id)
  }, [])

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY })
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
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={() => setContextMenu(null)}
        defaultEdgeOptions={{ style: edgeStyle, animated: true, markerEnd: { type: 'arrowclosed' as never, color: '#e94560' } }}
        fitView
        className="bg-[var(--surface)]"
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#222" />
        <Controls className="!bg-[var(--surface-elevated)] !border-[var(--border)]" />
        <MiniMap style={{ background: '#141414' }} nodeColor="#3a1520" />
        <CanvasToolbar />
      </ReactFlow>
      <NodeEditModal nodeId={editNodeId} onClose={() => setEditNodeId(null)} />
      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      <StatusBar />
      <SidePanel editNodeId={editNodeId} onEditClose={() => setEditNodeId(null)} />
      {onboarding.step && (
        <OnboardingTooltip
          step={onboarding.step}
          currentStep={onboarding.currentStep}
          totalSteps={onboarding.totalSteps}
          onNext={onboarding.next}
          onSkip={onboarding.skip}
        />
      )}
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
