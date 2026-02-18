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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ designs: data })
}

// POST /api/designs — create new design
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, data: designData } = body

  const { data, error } = await supabase
    .from('designs')
    .insert({ user_id: user.id, name: name || 'Untitled', data: designData || {} })
    .select('id, name, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ design: data }, { status: 201 })
}
