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
import Checklist from '@/components/canvas/Checklist'
import AuthGateModal from '@/components/canvas/AuthGateModal'
import CommandPalette from '@/components/canvas/CommandPalette'
import VersionPanel from '@/components/canvas/VersionPanel'
import type { AgentNodeData } from '@/types/org'

const nodeTypes = { agent: AgentNode, group: GroupNode }

const demoNodes: Node<AgentNodeData>[] = [
  {
    id: 'coordinator',
    type: 'agent',
    position: { x: 300, y: 50 },
    data: { agentId: 'coordinator', name: 'Coordinator', role: 'coordinator', icon: '🎯', status: 'active' },
  },
  {
    id: 'planner',
    type: 'agent',
    position: { x: 50, y: 220 },
    data: { agentId: 'planner', name: 'Planner', role: 'coordinator', icon: '📋', status: 'active', model: 'claude-sonnet-4-20250514' },
  },
  {
    id: 'developer',
    type: 'agent',
    position: { x: 300, y: 220 },
    data: { agentId: 'developer', name: 'Developer', role: 'worker', icon: '⚙️', status: 'active', model: 'claude-sonnet-4-20250514' },
  },
  {
    id: 'researcher',
    type: 'agent',
    position: { x: 550, y: 220 },
    data: { agentId: 'researcher', name: 'Researcher', role: 'worker', icon: '🔬', status: 'idle', model: 'claude-sonnet-4-20250514' },
  },
  {
    id: 'writer',
    type: 'agent',
    position: { x: 50, y: 400 },
    data: { agentId: 'writer', name: 'Writer', role: 'worker', icon: '✍️', status: 'offline' },
  },
  {
    id: 'reviewer',
    type: 'agent',
    position: { x: 550, y: 400 },
    data: { agentId: 'reviewer', name: 'Reviewer', role: 'reviewer', icon: '🔍', status: 'active' },
  },
]

const edgeStyle = { stroke: '#e94560', strokeWidth: 2, strokeDasharray: '8 4' }
const demoEdges = [
  { id: 'e-coord-plan', source: 'coordinator', target: 'planner', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-coord-dev', source: 'coordinator', target: 'developer', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-coord-research', source: 'coordinator', target: 'researcher', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-plan-dev', source: 'planner', target: 'developer', sourceHandle: 'output_2', targetHandle: 'input_2', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-plan-writer', source: 'planner', target: 'writer', sourceHandle: 'output_1', targetHandle: 'input_1', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
  { id: 'e-dev-reviewer', source: 'developer', target: 'reviewer', sourceHandle: 'output_2', targetHandle: 'input_2', animated: true, style: edgeStyle, markerEnd: { type: 'arrowclosed' as const, color: '#e94560' } },
]

function EditorCanvas() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect } = useOrgStore()
  const { connected } = useGatewayStore()
  useSessionMonitor(connected)
  const params = useParams()
  const designId = params.id as string
  const isDemo = designId === 'demo' || designId === 'new'
  const [authGate, setAuthGate] = useState<string | null>(null)
  const { undo, redo } = useKeyboardShortcuts(designId)
  const onboarding = useOnboarding()

  // Listen for toolbar undo/redo button clicks
  useEffect(() => {
    const handleUndo = () => undo()
    const handleRedo = () => redo()
    const handleAuthGate = (e: Event) => setAuthGate((e as CustomEvent).detail || 'save')
    window.addEventListener('agentflow:undo', handleUndo)
    window.addEventListener('agentflow:redo', handleRedo)
    window.addEventListener('agentflow:auth-gate', handleAuthGate)
    return () => {
      window.removeEventListener('agentflow:undo', handleUndo)
      window.removeEventListener('agentflow:redo', handleRedo)
      window.removeEventListener('agentflow:auth-gate', handleAuthGate)
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
      {isDemo && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-[var(--surface-elevated)] border border-[var(--accent-bright)] rounded-lg text-xs text-[var(--text-secondary)] flex items-center gap-3 shadow-lg">
          <span>🎮 Demo mode — designs won&apos;t be saved</span>
          <a href="/login" className="px-3 py-1 bg-[var(--accent-bright)] text-white rounded text-xs font-medium hover:brightness-110 transition">
            Sign in for full access
          </a>
        </div>
      )}
      <CommandPalette />
      <VersionPanel designId={designId} />
      <Checklist />
      <AuthGateModal open={!!authGate} onClose={() => setAuthGate(null)} action={authGate || 'save'} />
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
