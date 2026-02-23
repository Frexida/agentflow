/**
 * Gateway Proxy — server-side bridge between authenticated users and Gateway
 *
 * POST /api/gateway/proxy — send a frame to Gateway, return response
 * GET  /api/gateway/proxy — SSE stream of Gateway events
 *
 * Auth: Supabase JWT (user must be logged in)
 * Gateway connection: uses GATEWAY_INTERNAL_URL + GATEWAY_INTERNAL_TOKEN env vars
 * → Token never exposed to the browser. No DB↔Fly sync needed.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GATEWAY_URL = process.env.GATEWAY_INTERNAL_URL || ''
const GATEWAY_TOKEN = process.env.GATEWAY_INTERNAL_TOKEN || ''

// Per-user WS connection pool (Vercel serverless = ephemeral, but works for SSE lifetime)
const connections = new Map<string, WebSocket>()

function getGatewayWsUrl(): string {
  // Convert https:// to wss:// if needed
  if (GATEWAY_URL.startsWith('wss://') || GATEWAY_URL.startsWith('ws://')) return GATEWAY_URL
  if (GATEWAY_URL.startsWith('https://')) return GATEWAY_URL.replace('https://', 'wss://')
  if (GATEWAY_URL.startsWith('http://')) return GATEWAY_URL.replace('http://', 'ws://')
  return `wss://${GATEWAY_URL}`
}

function getOrCreateConnection(userId: string): WebSocket {
  const existing = connections.get(userId)
  if (existing && existing.readyState === WebSocket.OPEN) return existing

  if (existing) {
    try { existing.close() } catch { /* ignore */ }
    connections.delete(userId)
  }

  const ws = new WebSocket(getGatewayWsUrl())

  ws.addEventListener('close', () => connections.delete(userId))
  ws.addEventListener('error', () => connections.delete(userId))

  connections.set(userId, ws)
  return ws
}

async function waitForOpen(ws: WebSocket): Promise<void> {
  if (ws.readyState === WebSocket.OPEN) return
  if (ws.readyState !== WebSocket.CONNECTING) throw new Error('WebSocket not connecting')

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000)
    ws.addEventListener('open', () => { clearTimeout(timeout); resolve() }, { once: true })
    ws.addEventListener('error', () => { clearTimeout(timeout); reject(new Error('Connection failed')) }, { once: true })
  })
}

async function ensureHandshake(ws: WebSocket): Promise<void> {
  await waitForOpen(ws)

  // Send connect handshake with token
  const handshakeId = `hs-${Date.now()}`
  ws.send(JSON.stringify({
    type: 'req',
    id: handshakeId,
    method: 'connect',
    params: {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: 'webchat-ui',
        version: '2.0',
        mode: 'ui',
        platform: 'web',
      },
      auth: { token: GATEWAY_TOKEN },
      role: 'operator',
      scopes: ['operator.admin'],
      caps: [],
    },
  }))

  // Wait for handshake response
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Handshake timeout')), 10000)
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        // Accept either connect response or challenge event
        if (data.id === handshakeId || data.event === 'connect.challenge') {
          clearTimeout(timeout)
          ws.removeEventListener('message', handler)
          // If challenge, respond to it
          if (data.event === 'connect.challenge') {
            ws.send(JSON.stringify({
              type: 'req',
              id: `hs2-${Date.now()}`,
              method: 'connect',
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: { id: 'webchat-ui', version: '2.0', mode: 'ui', platform: 'web' },
                auth: { token: GATEWAY_TOKEN },
                role: 'operator',
                scopes: ['operator.admin'],
                caps: [],
              },
            }))
          }
          resolve()
        }
      } catch { /* ignore */ }
    }
    ws.addEventListener('message', handler)
  })
}

// ── Auth helper ──
async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST — send a frame to Gateway, return response
export async function POST(request: NextRequest) {
  try {
    if (!GATEWAY_URL || !GATEWAY_TOKEN) {
      return NextResponse.json({ error: 'Gateway not configured' }, { status: 503 })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const ws = getOrCreateConnection(user.id)
    await ensureHandshake(ws)

    // Send frame
    ws.send(JSON.stringify(body.frame))

    // Wait for matching response
    const response = await new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Response timeout')), 30000)
      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          if (data.id === body.frame.id || (data.type === 'res' && !body.frame.id)) {
            clearTimeout(timeout)
            ws.removeEventListener('message', handler)
            resolve(data)
          }
        } catch { /* ignore */ }
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

// GET — SSE stream of Gateway events
export async function GET() {
  try {
    if (!GATEWAY_URL || !GATEWAY_TOKEN) {
      return NextResponse.json({ error: 'Gateway not configured' }, { status: 503 })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const sendSSE = (data: string) => {
          try { controller.enqueue(encoder.encode(`data: ${data}\n\n`)) } catch { /* closed */ }
        }

        try {
          const ws = getOrCreateConnection(user.id)
          await ensureHandshake(ws)

          sendSSE(JSON.stringify({ type: 'connected' }))

          ws.addEventListener('message', (event) => {
            sendSSE(typeof event.data === 'string' ? event.data : JSON.stringify(event.data))
          })

          ws.addEventListener('close', () => {
            sendSSE(JSON.stringify({ type: 'disconnected' }))
            try { controller.close() } catch { /* already closed */ }
          })

          ws.addEventListener('error', () => {
            sendSSE(JSON.stringify({ type: 'error', message: 'Gateway connection lost' }))
            try { controller.close() } catch { /* already closed */ }
          })
        } catch (err) {
          sendSSE(JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : 'Connection failed' }))
          try { controller.close() } catch { /* already closed */ }
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
