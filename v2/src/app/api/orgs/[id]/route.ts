import { NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/orgs/:id — get org with agents and edges
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [org] = await db.select().from(schema.orgs).where(eq(schema.orgs.id, id))
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const agents = await db.select().from(schema.agents).where(eq(schema.agents.orgId, id))
  const edges = await db.select().from(schema.edges).where(eq(schema.edges.orgId, id))
  const groups = await db.select().from(schema.groups).where(eq(schema.groups.orgId, id))
  
  return NextResponse.json({ ...org, agents, edges, groups })
}

// PUT /api/orgs/:id — save org (full replace of agents/edges)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  // Update org metadata
  await db.update(schema.orgs).set({
    name: body.name,
    description: body.description,
    taskType: body.taskType,
    structure: body.structure,
    updatedAt: new Date(),
  }).where(eq(schema.orgs.id, id))
  
  // Replace agents
  await db.delete(schema.agents).where(eq(schema.agents.orgId, id))
  if (body.agents?.length) {
    await db.insert(schema.agents).values(
      body.agents.map((a: Record<string, unknown>) => ({
        id: a.id as string || crypto.randomUUID(),
        orgId: id,
        agentId: a.agentId as string,
        name: a.name as string,
        role: a.role as string,
        model: a.model as string,
        icon: a.icon as string,
        systemPrompt: a.systemPrompt as string,
        positionX: a.positionX as number,
        positionY: a.positionY as number,
        configJson: a.configJson ? JSON.stringify(a.configJson) : null,
      }))
    )
  }
  
  // Replace edges
  await db.delete(schema.edges).where(eq(schema.edges.orgId, id))
  if (body.edges?.length) {
    await db.insert(schema.edges).values(
      body.edges.map((e: Record<string, unknown>) => ({
        id: e.id as string || crypto.randomUUID(),
        orgId: id,
        sourceAgent: e.sourceAgent as string || e.source as string,
        targetAgent: e.targetAgent as string || e.target as string,
        edgeType: e.edgeType as string || 'authority',
        direction: e.direction as string || 'unidirectional',
        sourcePort: e.sourcePort as string || e.sourceHandle as string,
        targetPort: e.targetPort as string || e.targetHandle as string,
      }))
    )
  }
  
  return NextResponse.json({ success: true })
}

// DELETE /api/orgs/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(schema.orgs).where(eq(schema.orgs.id, id))
  return NextResponse.json({ success: true })
}
