import { create } from 'zustand'
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import type { AgentNodeData, AgentEdgeData, OrgMetadata, TaskType, StructureMode } from '@/types/org'

interface OrgStore {
  // Metadata
  currentOrg: OrgMetadata | null
  setCurrentOrg: (org: OrgMetadata | null) => void

  // React Flow state
  nodes: Node<AgentNodeData>[]
  edges: Edge<AgentEdgeData>[]
  setNodes: (nodes: Node<AgentNodeData>[]) => void
  setEdges: (edges: Edge<AgentEdgeData>[]) => void

  // React Flow callbacks
  onNodesChange: (changes: NodeChange<Node<AgentNodeData>>[]) => void
  onEdgesChange: (changes: EdgeChange<Edge<AgentEdgeData>>[]) => void
  onConnect: (connection: Connection) => void

  // Node operations
  addAgent: (data: AgentNodeData, position: { x: number; y: number }) => void
  removeAgent: (nodeId: string) => void
  updateAgent: (nodeId: string, data: Partial<AgentNodeData>) => void

  // Canvas mode
  structureMode: StructureMode
  setStructureMode: (mode: StructureMode) => void
}

export const useOrgStore = create<OrgStore>((set, get) => ({
  currentOrg: null,
  setCurrentOrg: (org) => set({ currentOrg: org }),

  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
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

  structureMode: 'graph',
  setStructureMode: (mode) => set({ structureMode: mode }),
}))
