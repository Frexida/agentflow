import { create } from 'zustand'
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import type { AgentNodeData, AgentEdgeData, GroupNodeData, OrgMetadata, TaskType, StructureMode } from '@/types/org'

// Union type for all node data
type AnyNodeData = AgentNodeData | GroupNodeData

interface OrgStore {
  // Metadata
  currentOrg: OrgMetadata | null
  setCurrentOrg: (org: OrgMetadata | null) => void

  // React Flow state
  nodes: Node<AnyNodeData>[]
  edges: Edge<AgentEdgeData>[]
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge<AgentEdgeData>[]) => void

  // React Flow callbacks
  onNodesChange: (changes: NodeChange<Node<AnyNodeData>>[]) => void
  onEdgesChange: (changes: EdgeChange<Edge<AgentEdgeData>>[]) => void
  onConnect: (connection: Connection) => void

  // Node operations
  addAgent: (data: AgentNodeData, position: { x: number; y: number }) => void
  removeAgent: (nodeId: string) => void
  updateAgent: (nodeId: string, data: Partial<AgentNodeData>) => void

  // Group operations
  addGroup: (label: string, position: { x: number; y: number }, color?: string) => void
  removeGroup: (groupId: string) => void
  addToGroup: (nodeId: string, groupId: string) => void
  removeFromGroup: (nodeId: string) => void

  // Canvas mode
  structureMode: StructureMode
  setStructureMode: (mode: StructureMode) => void
}

export const useOrgStore = create<OrgStore>((set, get) => ({
  currentOrg: null,
  setCurrentOrg: (org) => set({ currentOrg: org }),

  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes: nodes as Node<AgentNodeData>[] }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),

  addAgent: (data, position) => {
    const id = data.agentId || `agent-${Date.now()}`
    const newNode: Node<AgentNodeData> = {
      id,
      type: 'agent',
      position,
      data,
    }
    set({ nodes: [...get().nodes, newNode] })
  },

  removeAgent: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })
  },

  updateAgent: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })
  },

  addGroup: (label, position, color) => {
    const id = `group-${Date.now()}`
    const newNode: Node<GroupNodeData> = {
      id,
      type: 'group',
      position,
      data: { label, color: color || '#0f3460' },
      style: { width: 400, height: 300 },
    }
    set({ nodes: [...get().nodes, newNode] })
  },

  removeGroup: (groupId) => {
    // Unparent children first
    const updated = get().nodes.map((n) =>
      n.parentId === groupId ? { ...n, parentId: undefined, position: { x: n.position.x + 50, y: n.position.y + 50 } } : n
    )
    set({ nodes: updated.filter((n) => n.id !== groupId) })
  },

  addToGroup: (nodeId, groupId) => {
    const group = get().nodes.find((n) => n.id === groupId)
    if (!group) return
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              parentId: groupId,
              extent: 'parent' as const,
              position: {
                x: n.position.x - group.position.x,
                y: n.position.y - group.position.y,
              },
            }
          : n
      ),
    })
  },

  removeFromGroup: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId)
    const parent = node?.parentId ? get().nodes.find((n) => n.id === node.parentId) : null
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              parentId: undefined,
              extent: undefined,
              position: parent
                ? { x: n.position.x + parent.position.x, y: n.position.y + parent.position.y }
                : n.position,
            }
          : n
      ),
    })
  },

  structureMode: 'graph',
  setStructureMode: (mode) => set({ structureMode: mode }),
}))
