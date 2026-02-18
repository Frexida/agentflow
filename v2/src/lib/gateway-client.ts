/**
 * OpenClaw Gateway WebSocket Client
 * Protocol: event-based frames (type: "req"/"res"/"event")
 * NOT JSON-RPC 2.0
 */

import type { GatewaySession, ChatMessage } from '@/types/gateway'

type EventHandler = (...args: unknown[]) => void

interface ReqFrame {
  type: 'req'
  id: string
  method: string
  params?: Record<string, unknown>
}

interface ResFrame {
  type: 'res'
  id: string
  ok: boolean
  payload?: Record<string, unknown>
  error?: { code: string; message: string }
}

interface EventFrame {
  type: 'event'
  event: string
  payload?: Record<string, unknown>
  seq?: number
}

type Frame = ResFrame | EventFrame

export class GatewayClient {
  private ws: WebSocket | null = null
  private url: string
  private token: string
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  private handlers = new Map<string, Set<EventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private connectNonce: string | null = null

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          // Wait for connect.challenge before resolving
        }

        this.ws.onclose = () => {
          this.emit('disconnected')
          this.scheduleReconnect()
        }

        this.ws.onerror = () => {
          reject(new Error('WebSocket connection failed'))
        }

        this.ws.onmessage = (event) => {
          try {
            const frame = JSON.parse(event.data as string) as Frame

            // Handle events
            if (frame.type === 'event') {
              const evt = frame as EventFrame
              if (evt.event === 'connect.challenge') {
                this.connectNonce = (evt.payload?.nonce as string) || null
                this.sendConnect().then(() => {
                  this.emit('connected')
                  resolve()
                }).catch(reject)
                return
              }
              this.emit('event', evt)
              return
            }

            // Handle responses
            if (frame.type === 'res') {
              const res = frame as ResFrame
              const p = this.pending.get(res.id)
              if (p) {
                this.pending.delete(res.id)
                if (res.ok) {
                  p.resolve(res.payload || {})
                } else {
                  p.reject(new Error(res.error?.message || 'Unknown error'))
                }
              }
            }
          } catch {
            // ignore parse errors
          }
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  private async sendConnect(): Promise<void> {
    return this.request('connect', {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: 'webchat-ui',
        version: '2.0',
        mode: 'ui',
        platform: 'web',
      },
      auth: { token: this.token },
      role: 'operator',
      scopes: ['operator.admin'],
      caps: [],
    }) as Promise<void>
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  async request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) throw new Error('Not connected')

    const id = crypto.randomUUID()
    const frame: ReqFrame = { type: 'req', id, method, params }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Request timeout: ${method}`))
      }, 30000)

      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v) },
        reject: (e) => { clearTimeout(timeout); reject(e) },
      })

      this.ws!.send(JSON.stringify(frame))
    })
  }

  // Convenience methods
  async sessionsList(): Promise<GatewaySession[]> {
    const result = await this.request('sessions.list', {
      includeLastMessage: true,
    }) as { sessions: Array<Record<string, unknown>> }
    // Gateway returns 'key', our type uses 'sessionKey'
    return (result.sessions || []).map(s => ({
      ...s,
      sessionKey: (s.key as string) || '',
    })) as unknown as GatewaySession[]
  }

  async chatSend(sessionKey: string, message: string): Promise<void> {
    await this.request('chat.send', {
      sessionKey,
      message,
      idempotencyKey: crypto.randomUUID(),
    })
  }

  async chatHistory(sessionKey: string, limit = 20): Promise<ChatMessage[]> {
    const result = await this.request('chat.history', {
      sessionKey,
      limit,
    }) as { messages: ChatMessage[] }
    return result.messages || []
  }

  async configGet(): Promise<{ config: string; hash: string }> {
    const result = await this.request('config.get') as { raw: string; hash: string }
    return { config: result.raw, hash: result.hash }
  }

  async configApply(raw: string, baseHash: string): Promise<void> {
    await this.request('config.apply', { raw, baseHash })
  }

  // Event emitter
  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler)
  }

  private emit(event: string, ...args: unknown[]) {
    this.handlers.get(event)?.forEach((h) => h(...args))
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(() => {})
    }, 5000)
  }
}
