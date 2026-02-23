import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

// No-auth mode: in-memory store (survives hot-reloads via globalThis)
interface Design {
  id: string
  name: string
  data: unknown
  created_at: string
  updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __designs: Map<string, Design> | undefined
}
if (!globalThis.__designs) globalThis.__designs = new Map()
const store = globalThis.__designs

// GET /api/designs — list all designs (no auth)
export async function GET() {
  const list = [...store.values()].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
  return NextResponse.json({
    designs: list.map(({ id, name, updated_at, created_at }) => ({
      id, name, updated_at, created_at,
    })),
  })
}

// POST /api/designs — create new design (no auth)
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { name, data: designData } = body
  if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
    return NextResponse.json({ error: 'Invalid name (max 255 chars)' }, { status: 400 })
  }
  const now = new Date().toISOString()
  const design: Design = {
    id: randomUUID(),
    name: typeof name === 'string' ? name : 'Untitled',
    data: designData ?? {},
    created_at: now,
    updated_at: now,
  }
  store.set(design.id, design)
  return NextResponse.json(
    { design: { id: design.id, name: design.name, updated_at: design.updated_at } },
    { status: 201 }
  )
}
