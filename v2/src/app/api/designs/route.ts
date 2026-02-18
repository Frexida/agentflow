import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/designs — list user's designs
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('designs')
    .select('id, name, updated_at, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[API] GET /designs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ designs: data })
}

// POST /api/designs — create new design
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { name, data: designData } = body

  // Input validation
  if (name !== undefined && (typeof name !== 'string' || name.length > 255)) {
    return NextResponse.json({ error: 'Invalid name (max 255 chars)' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('designs')
    .insert({ user_id: user.id, name: (typeof name === 'string' ? name : 'Untitled'), data: designData || {} })
    .select('id, name, updated_at')
    .single()

  if (error) {
    console.error('[API] POST /designs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ design: data }, { status: 201 })
}
