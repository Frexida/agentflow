import type { RPCRequest, RPCResponse, GatewaySession, ChatMessage } from '@/types/gateway'

type EventHandler = (...args: unknown[]) => void

export class GatewayClient {
  private ws: WebSocket | null = null
  private url: string
  private token: string
  private rpcId = 0
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  private handlers = new Map<string, Set<EventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          this.emit('connected')
          resolve()
        }

        this.ws.onclose = () => {
          this.emit('disconnected')
          this.scheduleReconnect()
        }

        this.ws.onerror = (e) => {
          this.emit('error', e)
          reject(new Error('WebSocket connection failed'))
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as RPCResponse
            const pending = this.pending.get(data.id)
            if (pending) {
              this.pending.delete(data.id)
              if (data.error) {
                pending.reject(new Error(data.error.message))
              } else {
                pending.resolve(data.result)
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

  async rpc(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.isConnected()) throw new Error('Not connected')

    const id = ++this.rpcId
    const request: RPCRequest = { jsonrpc: '2.0', id, method, params }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`RPC timeout: ${method}`))
      }, 30000)

      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v) },
        reject: (e) => { clearTimeout(timeout); reject(e) },
      })

      this.ws!.send(JSON.stringify(request))
    })
  }

  // Convenience methods
  async sessionsList(opts?: { kinds?: string[] }): Promise<GatewaySession[]> {
    const result = await this.rpc('sessions.list', {
      ...opts,
      includeLastMessage: true,
    }) as { sessions: GatewaySession[] }
    return result.sessions || []
  }

  async chatSend(sessionKey: string, message: string): Promise<void> {
    await this.rpc('chat.send', {
      sessionKey,
      message,
      idempotencyKey: crypto.randomUUID(),
    })
  }

  async chatHistory(sessionKey: string, limit = 20): Promise<ChatMessage[]> {
    const result = await this.rpc('chat.history', {
      sessionKey,
      limit,
    }) as { messages: ChatMessage[] }
    return result.messages || []
  }

  async configGet(): Promise<{ config: string; hash: string }> {
    const result = await this.rpc('config.get') as { raw: string; hash: string }
    return { config: result.raw, hash: result.hash }
  }

  async configApply(raw: string, baseHash: string): Promise<void> {
    await this.rpc('config.apply', { raw, baseHash, reason: 'AgentFlow v2' })
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
