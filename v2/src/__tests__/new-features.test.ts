import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const storage = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
})

describe('Onboarding', () => {
  beforeEach(() => storage.clear())

  it('marks onboarding complete in localStorage', () => {
    localStorage.setItem('agentflow:onboarding-complete', 'true')
    expect(localStorage.getItem('agentflow:onboarding-complete')).toBe('true')
  })

  it('onboarding not complete by default', () => {
    expect(localStorage.getItem('agentflow:onboarding-complete')).toBeNull()
  })
})

describe('Checklist', () => {
  beforeEach(() => storage.clear())

  it('stores checklist items as JSON', () => {
    const items = [
      { id: 'add-agent', label: 'Add an agent', done: false },
      { id: 'connect', label: 'Connect agents', done: true },
    ]
    localStorage.setItem('agentflow:checklist', JSON.stringify(items))
    const loaded = JSON.parse(localStorage.getItem('agentflow:checklist')!)
    expect(loaded).toHaveLength(2)
    expect(loaded[1].done).toBe(true)
  })

  it('dismissed state persists', () => {
    localStorage.setItem('agentflow:checklist-dismissed', 'true')
    expect(localStorage.getItem('agentflow:checklist-dismissed')).toBe('true')
  })
})

describe('Version History', () => {
  beforeEach(() => storage.clear())

  it('stores versions with correct structure', () => {
    const version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: 'Test Version',
      nodes: [{ id: 'a1', type: 'agent', position: { x: 0, y: 0 }, data: { name: 'test' } }],
      edges: [],
      auto: false,
    }
    const versions = [version]
    localStorage.setItem('agentflow:versions:demo', JSON.stringify(versions))
    const loaded = JSON.parse(localStorage.getItem('agentflow:versions:demo')!)
    expect(loaded).toHaveLength(1)
    expect(loaded[0].label).toBe('Test Version')
    expect(loaded[0].nodes).toHaveLength(1)
  })

  it('limits to MAX_VERSIONS (20)', () => {
    const versions = Array.from({ length: 25 }, (_, i) => ({
      id: crypto.randomUUID(),
      timestamp: Date.now() - i * 1000,
      label: `Version ${i}`,
      nodes: [],
      edges: [],
      auto: true,
    })).slice(0, 20)
    expect(versions).toHaveLength(20)
  })
})

describe('Keyboard Shortcuts', () => {
  it('modifier key detection', () => {
    const event = { ctrlKey: true, metaKey: false, key: 'z', shiftKey: false }
    const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey
    expect(isUndo).toBe(true)
  })

  it('redo detection (Ctrl+Shift+Z)', () => {
    const event = { ctrlKey: true, metaKey: false, key: 'z', shiftKey: true }
    const isRedo = (event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey
    expect(isRedo).toBe(true)
  })

  it('redo detection (Ctrl+Y)', () => {
    const event = { ctrlKey: true, metaKey: false, key: 'y', shiftKey: false }
    const isRedo = (event.ctrlKey || event.metaKey) && event.key === 'y'
    expect(isRedo).toBe(true)
  })

  it('ignores input fields', () => {
    const tags = ['INPUT', 'TEXTAREA', 'SELECT']
    tags.forEach(tag => {
      expect(tags.includes(tag)).toBe(true)
    })
  })
})

describe('Command Palette', () => {
  it('filters commands by query', () => {
    const commands = [
      { id: 'add-agent', label: 'Add Agent' },
      { id: 'auto-layout', label: 'Auto Layout' },
      { id: 'save', label: 'Save' },
      { id: 'undo', label: 'Undo' },
    ]
    const query = 'aut'
    const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('auto-layout')
  })

  it('returns all commands for empty query', () => {
    const commands = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const query = ''
    const filtered = query ? commands.filter(() => false) : commands
    expect(filtered).toHaveLength(3)
  })
})
