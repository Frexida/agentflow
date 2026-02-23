import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGateway, stopGateway, startGateway, destroyGateway, getGateway, getGatewayUrl } from '@/lib/fly'
import { decrypt } from '@/lib/crypto'
import crypto from 'crypto'

// GET — get user's gateway status
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: gw, error: gwError } = await supabase
      .from('gateways')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('GET /api/gateway debug:', { userId: user.id, gw: !!gw, gwError: gwError?.message })

    if (!gw) return NextResponse.json({ gateway: null })

    // Get live status from Fly.io
    let status = gw.status
    try {
      const machine = await getGateway(gw.machine_id)
      status = machine.state
    } catch { /* use cached status */ }

    return NextResponse.json({
      gateway: {
        id: gw.id,
        status,
        region: gw.region,
        url: getGatewayUrl(gw.machine_name),
        token: gw.gateway_token,
        created_at: gw.created_at,
      },
    })
  } catch (err) {
    console.error('GET /api/gateway error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST — provision or control gateway
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body // "create" | "start" | "stop" | "restart"

    if (action === 'create') {
      // Check if already has a gateway
      const { data: existing } = await supabase
        .from('gateways')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Gateway already exists' }, { status: 409 })
      }

      // Get user's API keys
      const { data: keys } = await supabase
        .from('api_keys')
        .select('provider, encrypted_key')
        .eq('user_id', user.id)

      const anthropicKey = keys?.find(k => k.provider === 'anthropic')
      const openaiKey = keys?.find(k => k.provider === 'openai')

      if (!anthropicKey) {
        return NextResponse.json({ error: 'Anthropic API key required. Add it in Settings.' }, { status: 400 })
      }

      // Generate gateway token
      const gatewayToken = crypto.randomBytes(24).toString('hex')

      // Create Fly.io machine
      const machine = await createGateway({
        userId: user.id,
        anthropicKey: decrypt(anthropicKey.encrypted_key),
        openaiKey: openaiKey ? decrypt(openaiKey.encrypted_key) : undefined,
        gatewayToken,
        region: body.region || 'nrt',
      })

      // Save to DB
      await supabase.from('gateways').insert({
        user_id: user.id,
        machine_id: machine.id,
        machine_name: machine.name,
        region: machine.region,
        gateway_token: gatewayToken,
        status: 'started',
      })

      return NextResponse.json({
        gateway: {
          id: machine.id,
          status: 'started',
          region: machine.region,
          url: getGatewayUrl(machine.name),
          token: gatewayToken,
        },
      })
    }

    // Get existing gateway
    const { data: gw } = await supabase
      .from('gateways')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!gw) return NextResponse.json({ error: 'No gateway found' }, { status: 404 })

    if (action === 'start') {
      await startGateway(gw.machine_id)
      await supabase.from('gateways').update({ status: 'started' }).eq('id', gw.id)
      return NextResponse.json({ success: true, status: 'started' })
    }

    if (action === 'stop') {
      await stopGateway(gw.machine_id)
      await supabase.from('gateways').update({ status: 'stopped' }).eq('id', gw.id)
      return NextResponse.json({ success: true, status: 'stopped' })
    }

    if (action === 'restart') {
      await stopGateway(gw.machine_id)
      await startGateway(gw.machine_id)
      await supabase.from('gateways').update({ status: 'started' }).eq('id', gw.id)
      return NextResponse.json({ success: true, status: 'started' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/gateway error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE — destroy gateway
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: gw } = await supabase
      .from('gateways')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!gw) return NextResponse.json({ error: 'No gateway found' }, { status: 404 })

    try {
      await destroyGateway(gw.machine_id)
    } catch {
      // Machine may already be destroyed — continue to clean up DB record
      console.warn(`Failed to destroy Fly machine ${gw.machine_id}, cleaning up DB anyway`)
    }
    await supabase.from('gateways').delete().eq('id', gw.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/gateway error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
