export type TaskType = 'independent' | 'sequential' | 'reciprocal'
export type StructureMode = 'tree' | 'graph'
export type EdgeType = 'authority' | 'communication' | 'review'
export type Direction = 'unidirectional' | 'bidirectional'
export type PortId = 'input_1' | 'input_2' | 'output_1' | 'output_2'
export type AgentRole = 'coordinator' | 'worker' | 'reviewer' | 'custom'
export type AgentStatus = 'active' | 'idle' | 'offline'

export interface OrgMetadata {
  id: string
  name: string
  description?: string
  taskType?: TaskType
  structure: StructureMode
  createdAt: string
  updatedAt: string
}

export interface AgentNodeData extends Record<string, unknown> {
  agentId: string
  name: string
  role?: AgentRole
  model?: string
  systemPrompt?: string
  status?: AgentStatus
  icon?: string
}

export interface AgentEdgeData extends Record<string, unknown> {
  edgeType: EdgeType
  direction: Direction
}
