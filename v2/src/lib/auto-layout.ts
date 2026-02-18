import type { Node, Edge } from '@xyflow/react'

interface LayoutOptions {
  direction?: 'TB' | 'LR'
  spacingX?: number
  spacingY?: number
}

/**
 * Simple tree-based auto layout (no external dependency).
 * For proper dagre layout, install dagre package later.
 */
export function autoLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const { direction = 'TB', spacingX = 250, spacingY = 180 } = options

  // Build adjacency (parent → children)
  const children = new Map<string, string[]>()
  const hasParent = new Set<string>()

  edges.forEach((e) => {
    if (!children.has(e.source)) children.set(e.source, [])
    children.get(e.source)!.push(e.target)
    hasParent.add(e.target)
  })

  // Find roots (no parent)
  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id)
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0].id)
  }

  // BFS to assign levels
  const levels = new Map<string, number>()
  const queue = roots.map((id) => ({ id, level: 0 }))
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, level } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    levels.set(id, level)

    const kids = children.get(id) || []
    kids.forEach((kid) => {
      if (!visited.has(kid)) {
        queue.push({ id: kid, level: level + 1 })
      }
    })
  }

  // Nodes not in tree get placed at bottom
  nodes.forEach((n) => {
    if (!levels.has(n.id)) {
      levels.set(n.id, (Math.max(...levels.values()) || 0) + 1)
    }
  })

  // Group by level
  const byLevel = new Map<number, string[]>()
  levels.forEach((level, id) => {
    if (!byLevel.has(level)) byLevel.set(level, [])
    byLevel.get(level)!.push(id)
  })

  // Assign positions
  const positions = new Map<string, { x: number; y: number }>()
  byLevel.forEach((ids, level) => {
    const totalWidth = (ids.length - 1) * spacingX
    const startX = -totalWidth / 2

    ids.forEach((id, i) => {
      if (direction === 'TB') {
        positions.set(id, { x: startX + i * spacingX + 400, y: level * spacingY + 50 })
      } else {
        positions.set(id, { x: level * spacingX + 50, y: startX + i * spacingY + 300 })
      }
    })
  })

  return nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) || n.position,
  }))
}
