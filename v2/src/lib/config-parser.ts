import type { Node, Edge } from '@xyflow/react'
import type { AgentNodeData, AgentEdgeData } from '@/types/org'
import jsYaml from 'js-yaml'

interface OpenClawAgent {
  name?: string
  model?: string
  systemPrompt?: string
  workspace?: string
  subagents?: {
    allowAgents?: string[]
  }
  [key: string]: unknown
}

interface OpenClawConfig {
  agents?: {
    list?: OpenClawAgent[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * OpenClaw YAML config → React Flow nodes + edges
 */
export function configToGraph(yamlString: string): {
  nodes: Node<AgentNodeData>[]
  edges: Edge<AgentEdgeData>[]
} {
  const config = jsYaml.load(yamlString) as OpenClawConfig
  const nodes: Node<AgentNodeData>[] = []
  const edges: Edge<AgentEdgeData>[] = []

  if (!config?.agents?.list) return { nodes, edges }

  const agentList = config.agents.list
  const SPACING_X = 250
  const SPACING_Y = 180

  // Create nodes
  agentList.forEach((agent: OpenClawAgent & { id?: string }, index: number) => {
    const id = agent.id || `agent-${index}`
    const col = index % 4
    const row = Math.floor(index / 4)

    nodes.push({
      id,
      type: 'agent',
      position: { x: col * SPACING_X + 50, y: row * SPACING_Y + 50 },
      data: {
        agentId: id,
        name: agent.name || id,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        status: 'offline',
      },
    })
  })

  // Create edges from allowAgents
  agentList.forEach((agent: OpenClawAgent & { id?: string }, index: number) => {
    const sourceId = agent.id || `agent-${index}`
    const allowAgents = agent.subagents?.allowAgents || []

    allowAgents.forEach((targetId: string) => {
      const targetExists = nodes.some((n) => n.id === targetId)
      if (targetExists) {
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'output_1',
          targetHandle: 'input_1',
          animated: true,
          data: {
            edgeType: 'authority',
            direction: 'unidirectional',
          },
        })
      }
    })
  })

  return { nodes, edges }
}

/**
 * React Flow nodes + edges → OpenClaw YAML config (agents section only)
 */
export function graphToConfig(
  nodes: Node[],
  edges: Edge[],
  existingYaml?: string
): string {
  // Parse existing config to preserve non-agent sections
  let config: Record<string, unknown> = {}
  if (existingYaml) {
    try {
      config = (jsYaml.load(existingYaml) as Record<string, unknown>) || {}
    } catch {
      // start fresh
    }
  }

  // Filter to agent nodes only
  const agentNodes = nodes.filter((n) => n.type === 'agent' || !n.type)

  // Build agents list
  const agentsList = agentNodes.map((node) => {
    const data = node.data
    const outEdges = edges.filter((e) => e.source === node.id)
    const allowAgents = outEdges
      .filter((e) => !e.data || e.data.edgeType === 'authority')
      .map((e) => e.target)

    const agent: Record<string, unknown> = {
      id: data.agentId,
      name: data.name,
    }
    if (data.model) agent.model = data.model
    if (data.systemPrompt) agent.systemPrompt = data.systemPrompt
    if (allowAgents.length > 0) {
      agent.subagents = { allowAgents }
    }
    return agent
  })

  // Merge: only replace agents section
  config.agents = { ...((config.agents as Record<string, unknown>) || {}), list: agentsList }

  return jsYaml.dump(config, { lineWidth: 120, noRefs: true })
}
