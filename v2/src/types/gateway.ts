export interface GatewayConfig {
  url: string
  token: string
}

export interface GatewaySession {
  sessionKey: string
  agentId?: string
  kind: string
  status: string
  activeAt?: string
  lastMessage?: ChatMessage
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface RPCRequest {
  jsonrpc: '2.0'
  id: number
  method: string
  params?: Record<string, unknown>
}

export interface RPCResponse {
  jsonrpc: '2.0'
  id: number
  result?: unknown
  error?: { code: number; message: string }
}
