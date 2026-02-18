import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'

// GET — list user's keys (masked)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: keys } = await supabase
      .from('api_keys')
      .select('id, provider, key_prefix, updated_at')
      .eq('user_id', user.id)

    return NextResponse.json({ keys: keys || [] })
  } catch (err) {
    console.error('GET /api/keys error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST — save or update a key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { provider, key } = body

    if (!provider || !key) {
      return NextResponse.json({ error: 'provider and key required' }, { status: 400 })
    }
    if (!['anthropic', 'openai'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Validate key format
    if (provider === 'anthropic' && !key.startsWith('sk-ant-')) {
      return NextResponse.json({ error: 'Invalid Anthropic key format' }, { status: 400 })
    }
    if (provider === 'openai' && !key.startsWith('sk-')) {
      return NextResponse.json({ error: 'Invalid OpenAI key format' }, { status: 400 })
    }

    const encrypted_key = encrypt(key)
    const key_prefix = key.substring(0, 10) + '...'

    // Upsert
    const { error } = await supabase
      .from('api_keys')
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key,
        key_prefix,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })

    if (error) {
      console.error('Upsert key error:', error)
      return NextResponse.json({ error: 'Failed to save key' }, { status: 500 })
    }

    return NextResponse.json({ success: true, key_prefix })
  } catch (err) {
    console.error('POST /api/keys error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE — remove a key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    if (!provider) return NextResponse.json({ error: 'provider required' }, { status: 400 })

    await supabase
      .from('api_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/keys error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
