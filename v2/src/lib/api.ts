const BASE = '/api'

export interface OrgResponse {
  id: string
  name: string
  description?: string
  taskType?: string
  structure: string
  agentCount?: number
  agents?: AgentResponse[]
  edges?: EdgeResponse[]
  groups?: GroupResponse[]
}

export interface AgentResponse {
  id: string
  orgId: string
  agentId: string
  name: string
  role?: string
  model?: string
  icon?: string
  systemPrompt?: string
  positionX: number
  positionY: number
}

export interface EdgeResponse {
  id: string
  orgId: string
  sourceAgent: string
  targetAgent: string
  edgeType: string
  direction: string
  sourcePort?: string
  targetPort?: string
}

export interface GroupResponse {
  id: string
  orgId: string
  name: string
  color?: string
}

export async function fetchOrgs(): Promise<OrgResponse[]> {
  const res = await fetch(`${BASE}/orgs`)
  if (!res.ok) throw new Error('Failed to fetch orgs')
  return res.json()
}

export async function fetchOrg(id: string): Promise<OrgResponse> {
  const res = await fetch(`${BASE}/orgs/${id}`)
  if (!res.ok) throw new Error('Failed to fetch org')
  return res.json()
}

export async function createOrg(name: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/orgs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create org')
  return res.json()
}

export async function saveOrg(id: string, data: {
  name?: string
  agents: { id: string; agentId: string; name: string; role?: string; model?: string; icon?: string; systemPrompt?: string; positionX: number; positionY: number }[]
  edges: { id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string; edgeType?: string; direction?: string }[]
}): Promise<void> {
  const res = await fetch(`${BASE}/orgs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      agents: data.agents,
      edges: data.edges.map(e => ({
        id: e.id,
        sourceAgent: e.source,
        targetAgent: e.target,
        sourcePort: e.sourceHandle,
        targetPort: e.targetHandle,
        edgeType: e.edgeType || 'authority',
        direction: e.direction || 'unidirectional',
      })),
    }),
  })
  if (!res.ok) throw new Error('Failed to save org')
}

export async function deleteOrg(id: string): Promise<void> {
  const res = await fetch(`${BASE}/orgs/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete org')
}
