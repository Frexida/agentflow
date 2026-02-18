/**
 * Gateway Proxy Client
 * 
 * Wraps the WSS proxy API to provide a WebSocket-like interface
 * for the frontend. Solves Mixed Content (HTTPS → ws://) by
 * routing through our server-side proxy.
 * 
 * Usage:
 *   const gw = new GatewayProxy()
 *   gw.onMessage = (data) => console.log(data)
 *   await gw.connect()
 *   await gw.send({ type: 'req', id: '1', method: 'getSessions', params: {} })
 */

type MessageHandler = (data: Record<string, unknown>) => void

export class GatewayProxy {
  private eventSource: EventSource | null = null
  private _connected = false
  private _requestId = 0

  onMessage: MessageHandler | null = null
  onConnect: (() => void) | null = null
  onDisconnect: (() => void) | null = null
  onError: ((error: string) => void) | null = null

  get connected(): boolean {
    return this._connected
  }

  /** Start SSE stream from proxy */
  connect(): void {
    this.disconnect()

    this.eventSource = new EventSource('/api/gateway/proxy')

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'connected') {
          this._connected = true
          this.onConnect?.()
          return
        }

        if (data.type === 'disconnected' || data.type === 'error') {
          this._connected = false
          if (data.type === 'error') {
            this.onError?.(data.message || 'Connection error')
          }
          this.onDisconnect?.()
          return
        }

        this.onMessage?.(data)
      } catch {
        // ignore parse errors
      }
    }

    this.eventSource.onerror = () => {
      this._connected = false
      this.onError?.('SSE connection lost')
      this.onDisconnect?.()
    }
  }

  /** Send a frame through the proxy */
  async send(frame: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await fetch('/api/gateway/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || `Proxy error ${res.status}`)
    }

    const { response } = await res.json()
    return response
  }

  /** Send a request and get response */
  async request(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const id = `proxy-${++this._requestId}`
    const response = await this.send({
      type: 'req',
      id,
      method,
      params,
    })
    return response
  }

  /** Disconnect SSE stream */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this._connected = false
  }
}

// Singleton for app-wide use
let instance: GatewayProxy | null = null

export function getGatewayProxy(): GatewayProxy {
  if (!instance) {
    instance = new GatewayProxy()
  }
  return instance
}
