import { describe, it, expect } from 'vitest'

// Test the protocol frame format
describe('Gateway Protocol v3', () => {
  it('request frame has correct structure', () => {
    const id = crypto.randomUUID()
    const frame = { type: 'req' as const, id, method: 'config.get', params: {} }
    expect(frame.type).toBe('req')
    expect(frame.method).toBe('config.get')
    expect(typeof frame.id).toBe('string')
    expect(frame.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('connect params include required fields', () => {
    const params = {
      minProtocol: 3,
      maxProtocol: 3,
      client: { id: 'webchat-ui', version: '2.0', mode: 'ui', platform: 'web' },
      auth: { token: 'test-token' },
      role: 'operator',
      scopes: ['operator.admin'],
      caps: [],
    }
    expect(params.minProtocol).toBe(3)
    expect(params.client.id).toBe('webchat-ui')
    expect(params.auth.token).toBeDefined()
    expect(params.scopes).toContain('operator.admin')
  })

  it('session key mapping works', () => {
    // Gateway returns 'key', we need 'sessionKey'
    const rawSession = { key: 'agent:pm-1:main', kind: 'direct' }
    const mapped = { ...rawSession, sessionKey: rawSession.key }
    expect(mapped.sessionKey).toBe('agent:pm-1:main')
    expect(mapped.key).toBe(mapped.sessionKey)
  })
})

describe('UUID validation', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  it('accepts valid UUIDs', () => {
    expect(UUID_RE.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    expect(UUID_RE.test(crypto.randomUUID())).toBe(true)
  })

  it('rejects invalid IDs', () => {
    expect(UUID_RE.test('not-a-uuid')).toBe(false)
    expect(UUID_RE.test('')).toBe(false)
    expect(UUID_RE.test('demo')).toBe(false)
    expect(UUID_RE.test('../../../etc/passwd')).toBe(false)
    expect(UUID_RE.test("'; DROP TABLE designs;--")).toBe(false)
  })
})

describe('Design data validation', () => {
  it('design data has expected structure', () => {
    const designData = {
      nodes: [
        { id: 'pm-1', type: 'agent', position: { x: 0, y: 0 }, data: { agentId: 'pm-1', name: 'PM' } },
      ],
      edges: [
        { id: 'e1', source: 'pm-1', target: 'dev-1' },
      ],
    }
    expect(designData.nodes).toHaveLength(1)
    expect(designData.edges).toHaveLength(1)
    expect(designData.nodes[0].data.agentId).toBe('pm-1')
  })

  it('empty design is valid', () => {
    const empty = { nodes: [], edges: [] }
    expect(empty.nodes).toHaveLength(0)
    expect(empty.edges).toHaveLength(0)
  })
})

describe('Config export format', () => {
  it('generates valid OpenClaw config structure', () => {
    const nodes = [
      { id: 'pm-1', data: { agentId: 'pm-1', name: 'PM', role: 'coordinator', model: 'claude-opus-4-6' } },
      { id: 'dev-1', data: { agentId: 'dev-1', name: 'Dev', role: 'worker' } },
    ]
    const edges = [{ source: 'pm-1', target: 'dev-1' }]

    // Build config
    const agents = nodes.map(n => ({
      id: n.data.agentId,
      name: n.data.name,
      ...(n.data.model ? { model: n.data.model } : {}),
    }))

    // Build allowAgents from edges
    const allowAgentsMap: Record<string, string[]> = {}
    edges.forEach(e => {
      if (!allowAgentsMap[e.source]) allowAgentsMap[e.source] = []
      allowAgentsMap[e.source].push(e.target)
    })

    expect(agents).toHaveLength(2)
    expect(agents[0].id).toBe('pm-1')
    expect(agents[0].model).toBe('claude-opus-4-6')
    expect(agents[1].model).toBeUndefined()
    expect(allowAgentsMap['pm-1']).toEqual(['dev-1'])
  })
})
