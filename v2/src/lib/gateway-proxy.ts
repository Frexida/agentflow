/**
 * Gateway Proxy Client
 *
 * Replaces direct WebSocket connection to Gateway.
 * Routes all traffic through /api/gateway/proxy (server-side proxy)
 * so the browser never needs the Gateway token.
 *
 * Implements the same interface as GatewayClient for drop-in use.
 */

import type { GatewaySession, ChatMessage } from '@/types/gateway'

type EventHandler = (...args: unknown[]) => void

export class GatewayProxyClient {
  private eventSource: EventSource | null = null
  private handlers = new Map<string, Set<EventHandler>>()
  private _connected = false
  private _requestId = 0

  isConnected(): boolean {
    return this._connected
  }

  /** Start SSE stream from proxy */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect()

      this.eventSource = new EventSource('/api/gateway/proxy')
      let resolved = false

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'connected') {
            this._connected = true
            this.emit('connected')
            if (!resolved) { resolved = true; resolve() }
            return
          }

          if (data.type === 'disconnected') {
            this._connected = false
            this.emit('disconnected')
            return
          }

          if (data.type === 'error') {
            this._connected = false
            this.emit('disconnected')
            if (!resolved) { resolved = true; reject(new Error(data.message || 'Connection error')) }
            return
          }

          // Forward gateway events
          if (data.type === 'event') {
            this.emit('event', data)
          }

          // Forward all messages for general listeners
          this.emit('message', data)
        } catch {
          // ignore parse errors
        }
      }

      this.eventSource.onerror = () => {
        // SSE auto-reconnects on error. Only reject if we never connected.
        if (!resolved) {
          resolved = true
          reject(new Error('SSE connection failed'))
        }
        // If we were connected, mark as disconnected but let EventSource retry
        if (this._connected) {
          this._connected = false
          this.emit('disconnected')
        }
      }

      // Timeout after 10s
      setTimeout(() => {
        if (!resolved) { resolved = true; reject(new Error('Connection timeout')) }
      }, 10000)
    })
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this._connected = false
  }

  /** Send a request through the HTTP proxy and get response */
  async request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const id = `proxy-${++this._requestId}`
    const frame = { type: 'req', id, method, params }

    const res = await fetch('/api/gateway/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err.error || `Proxy error ${res.status}`)
    }

    const { response } = await res.json()

    if (response?.ok === false) {
      throw new Error(response?.error?.message || 'Request failed')
    }

    return response?.payload || response
  }

  // ── Convenience methods (same as GatewayClient) ──

  async sessionsList(): Promise<GatewaySession[]> {
    const result = await this.request('sessions.list', {
      includeLastMessage: true,
    }) as { sessions: Array<Record<string, unknown>> }
    return (result.sessions || []).map(s => ({
      ...s,
      sessionKey: (s.key as string) || '',
    })) as unknown as GatewaySession[]
  }

  async chatSend(sessionKey: string, message: string): Promise<void> {
    await this.request('chat.send', {
      sessionKey,
      message,
    })
  }

  async chatHistory(sessionKey: string, limit = 20): Promise<ChatMessage[]> {
    try {
      const result = await this.request('chat.history', {
        sessionKey,
        limit,
      }) as { messages: ChatMessage[] }
      return Array.isArray(result?.messages) ? result.messages : []
    } catch {
      return [] // session may not exist yet
    }
  }

  async configGet(): Promise<{ config: string; hash: string }> {
    const result = await this.request('config.get') as { raw: string; hash: string }
    return { config: result.raw, hash: result.hash }
  }

  async configApply(raw: string, baseHash: string): Promise<void> {
    await this.request('config.apply', { raw, baseHash })
  }

  // ── Event emitter ──

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
}
