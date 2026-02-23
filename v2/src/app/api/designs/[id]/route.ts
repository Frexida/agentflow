import { NextResponse } from 'next/server'

// No-auth mode: in-memory store (shared with route.ts via globalThis)
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/designs/:id
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const design = store.get(id)
  if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ design })
}

// PUT /api/designs/:id
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  const design = store.get(id)
  if (!design) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length > 255) {
      return NextResponse.json({ error: 'Invalid name (max 255 chars)' }, { status: 400 })
    }
    design.name = body.name
  }
  if (body.data !== undefined) design.data = body.data
  design.updated_at = new Date().toISOString()
  store.set(id, design)
  return NextResponse.json({ design: { id: design.id, name: design.name, updated_at: design.updated_at } })
}

// DELETE /api/designs/:id
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  if (!store.has(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  store.delete(id)
  return NextResponse.json({ ok: true })
}
