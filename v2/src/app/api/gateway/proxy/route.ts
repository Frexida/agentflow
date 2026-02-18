/**
 * WSS Proxy — bridges HTTPS frontend to user's Gateway WebSocket
 * 
 * Solves Mixed Content issue: browser (HTTPS) can't connect to ws://
 * This proxy connects to the Fly.io Gateway via WSS on the server side.
 * 
 * POST /api/gateway/proxy — send a frame to user's gateway
 * GET /api/gateway/proxy — SSE stream of gateway events
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// In-memory connection pool (per-instance, not shared across Vercel functions)
// For production, use a proper connection manager or Fly.io internal networking
const connections = new Map<string, WebSocket>()

function getOrCreateConnection(url: string, token: string, userId: string): WebSocket {
  const existing = connections.get(userId)
  if (existing && existing.readyState === WebSocket.OPEN) {
    return existing
  }

  // Clean up old connection
  if (existing) {
    try { existing.close() } catch { /* ignore */ }
    connections.delete(userId)
  }

  const ws = new WebSocket(url)
  
  // Send handshake on open
  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({
      type: 'req',
      id: 'handshake-1',
      method: 'connect',
      params: {
        client: {
          id: 'agentflow-proxy',
          mode: 'ui',
        },
        token,
        minProtocol: 3,
        maxProtocol: 3,
      },
    }))
  })

  ws.addEventListener('close', () => {
    connections.delete(userId)
  })

  ws.addEventListener('error', () => {
    connections.delete(userId)
  })

  connections.set(userId, ws)
  return ws
}

// POST — send a frame to user's gateway
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user's gateway info
    const { data: gw } = await supabase
      .from('gateways')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!gw) return NextResponse.json({ error: 'No gateway found' }, { status: 404 })

    const gatewayUrl = `wss://${gw.machine_name}.${process.env.FLY_APP_NAME || 'agentflow-gateways'}.fly.dev`
    const body = await request.json()

    // Create connection and send frame
    const ws = getOrCreateConnection(gatewayUrl, gw.gateway_token, user.id)

    // Wait for connection if not yet open
    if (ws.readyState === WebSocket.CONNECTING) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000)
        ws.addEventListener('open', () => { clearTimeout(timeout); resolve() }, { once: true })
        ws.addEventListener('error', () => { clearTimeout(timeout); reject(new Error('Connection failed')) }, { once: true })
      })
    }

    if (ws.readyState !== WebSocket.OPEN) {
      return NextResponse.json({ error: 'Gateway not connected' }, { status: 502 })
    }

    // Send the frame
    ws.send(JSON.stringify(body.frame))

    // Wait for response (simple req/res matching)
    const response = await new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Response timeout')), 30000)
      
      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          // Match response to request by id
          if (data.id === body.frame.id || data.type === 'res') {
            clearTimeout(timeout)
            ws.removeEventListener('message', handler)
            resolve(data)
          }
        } catch { /* ignore parse errors */ }
      }
      
      ws.addEventListener('message', handler)
    })

    return NextResponse.json({ response })
  } catch (err) {
    console.error('POST /api/gateway/proxy error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — SSE stream of gateway events
export async function GET() {
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

    const gatewayUrl = `wss://${gw.machine_name}.${process.env.FLY_APP_NAME || 'agentflow-gateways'}.fly.dev`

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const ws = getOrCreateConnection(gatewayUrl, gw.gateway_token, user.id)

        const sendSSE = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        // Forward gateway messages as SSE events
        const messageHandler = (event: MessageEvent) => {
          sendSSE(typeof event.data === 'string' ? event.data : JSON.stringify(event.data))
        }

        const closeHandler = () => {
          sendSSE(JSON.stringify({ type: 'disconnected' }))
          controller.close()
        }

        const errorHandler = () => {
          sendSSE(JSON.stringify({ type: 'error', message: 'Gateway connection lost' }))
          controller.close()
        }

        ws.addEventListener('message', messageHandler)
        ws.addEventListener('close', closeHandler)
        ws.addEventListener('error', errorHandler)

        // Send initial connected event
        if (ws.readyState === WebSocket.OPEN) {
          sendSSE(JSON.stringify({ type: 'connected' }))
        } else {
          ws.addEventListener('open', () => {
            sendSSE(JSON.stringify({ type: 'connected' }))
          }, { once: true })
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('GET /api/gateway/proxy error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
