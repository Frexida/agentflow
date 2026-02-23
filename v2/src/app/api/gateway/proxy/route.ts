/**
 * Gateway Proxy — server-side bridge between authenticated users and Gateway
 *
 * POST /api/gateway/proxy — send a frame to Gateway, return response (fresh WS per request)
 * GET  /api/gateway/proxy — SSE stream of Gateway events (long-lived WS)
 *
 * Auth: Supabase JWT (user must be logged in)
 * Gateway connection: uses GATEWAY_INTERNAL_URL + GATEWAY_INTERNAL_TOKEN env vars
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import WebSocket from 'ws'

export const runtime = 'nodejs'
export const maxDuration = 60 // Vercel Pro: up to 60s for SSE

const GATEWAY_URL = process.env.GATEWAY_INTERNAL_URL || ''
const GATEWAY_TOKEN = process.env.GATEWAY_INTERNAL_TOKEN || ''

function getGatewayWsUrl(): string {
  if (GATEWAY_URL.startsWith('wss://') || GATEWAY_URL.startsWith('ws://')) return GATEWAY_URL
  if (GATEWAY_URL.startsWith('https://')) return GATEWAY_URL.replace('https://', 'wss://')
  if (GATEWAY_URL.startsWith('http://')) return GATEWAY_URL.replace('http://', 'ws://')
  return `wss://${GATEWAY_URL}`
}

const WS_OPTIONS = {
  headers: { 'Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://agentflow.frexida.com' },
}

const CONNECT_PARAMS = {
  minProtocol: 3,
  maxProtocol: 3,
  client: { id: 'webchat-ui', version: '2.0', mode: 'ui', platform: 'web' },
  auth: { token: GATEWAY_TOKEN },
  role: 'operator',
  scopes: ['operator.admin', 'operator.write', 'operator.read'],
  caps: [],
}

/**
 * Create a fresh WS, handshake, and return the ready connection.
 * Caller is responsible for closing it.
 */
function createReadyConnection(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(getGatewayWsUrl(), WS_OPTIONS)
    const timeout = setTimeout(() => {
      ws.close()
      reject(new Error('Connection timeout'))
    }, 15000)

    let handshakeSent = false

    ws.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    ws.on('open', () => {
      // Send connect handshake immediately
      const hsId = `hs-${Date.now()}`
      ws.send(JSON.stringify({
        type: 'req',
        id: hsId,
        method: 'connect',
        params: CONNECT_PARAMS,
      }))
      handshakeSent = true
    })

    ws.on('message', (raw: WebSocket.RawData) => {
      if (!handshakeSent) return
      try {
        const data = JSON.parse(raw.toString())

        // Handle challenge event — re-send connect
        if (data.type === 'event' && data.event === 'connect.challenge') {
          ws.send(JSON.stringify({
            type: 'req',
            id: `hs2-${Date.now()}`,
            method: 'connect',
            params: CONNECT_PARAMS,
          }))
          return
        }

        // Handle connect response (success or res with ok)
        if (data.type === 'res') {
          clearTimeout(timeout)
          if (data.ok === false) {
            ws.close()
            reject(new Error(data.error?.message || 'Handshake rejected'))
          } else {
            resolve(ws)
          }
        }
      } catch { /* ignore parse errors */ }
    })
  })
}

// ── Auth helper ──
async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST — send a frame to Gateway (fresh WS per request)
export async function POST(request: NextRequest) {
  let ws: WebSocket | null = null
  try {
    if (!GATEWAY_URL || !GATEWAY_TOKEN) {
      return NextResponse.json({ error: 'Gateway not configured' }, { status: 503 })
    }

    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    ws = await createReadyConnection()

    // Send the frame
    ws.send(JSON.stringify(body.frame))

    // Wait for matching response
    const response = await new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Response timeout')), 30000)
      ws!.on('message', (raw: WebSocket.RawData) => {
        try {
          const data = JSON.parse(raw.toString())
          if (data.id === body.frame.id) {
            clearTimeout(timeout)
            resolve(data)
          }
        } catch { /* ignore */ }
      })
    })

    return NextResponse.json({ response })
  } catch (err) {
    console.error('POST /api/gateway/proxy error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (ws) try { ws.close() } catch { /* ignore */ }
  }
}

// GET — SSE stream of Gateway events (long-lived WS)
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
          const ws = await createReadyConnection()

          sendSSE(JSON.stringify({ type: 'connected' }))

          ws.on('message', (raw: WebSocket.RawData) => {
            sendSSE(raw.toString())
          })

          ws.on('close', () => {
            sendSSE(JSON.stringify({ type: 'disconnected' }))
            try { controller.close() } catch { /* already closed */ }
          })

          ws.on('error', () => {
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
