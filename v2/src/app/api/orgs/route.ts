import { NextResponse } from 'next/server'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'

// GET /api/orgs — list all orgs
export async function GET() {
  const orgs = await db.select().from(schema.orgs)
  
  // Count agents per org
  const result = await Promise.all(
    orgs.map(async (org) => {
      const agents = await db.select().from(schema.agents).where(eq(schema.agents.orgId, org.id))
      return { ...org, agentCount: agents.length }
    })
  )
  
  return NextResponse.json(result)
}

// POST /api/orgs — create org
export async function POST(req: Request) {
  const body = await req.json()
  const id = crypto.randomUUID()
  
  await db.insert(schema.orgs).values({
    id,
    name: body.name || 'New Organization',
    description: body.description,
    taskType: body.taskType,
    structure: body.structure || 'graph',
  })
  
  return NextResponse.json({ id, name: body.name }, { status: 201 })
}
