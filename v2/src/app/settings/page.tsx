'use client'

import { useState } from 'react'
import { useGatewayStore } from '@/stores/gateway'

export default function SettingsPage() {
  const { connected, connect, disconnect } = useGatewayStore()
  const [url, setUrl] = useState('ws://localhost:18789')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setError(null)
    setConnecting(true)
    try {
      await connect({ url, token })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Gateway Connection */}
        <section className="bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">OpenClaw Gateway</h2>
            <span className={`px-2 py-0.5 rounded text-xs ${connected ? 'bg-green-600/30 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
              {connected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">WebSocket URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--accent)] rounded px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)]"
                placeholder="ws://localhost:18789"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--accent)] rounded px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)]"
                placeholder="Gateway token..."
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              {connected ? (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600/50 rounded hover:bg-red-500/50 transition text-sm"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting || !url}
                  className="px-4 py-2 bg-[var(--accent)] rounded hover:bg-[var(--accent-bright)] transition text-sm disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>

          {/* Setup Guide */}
          <details className="mt-6 text-sm">
            <summary className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
              Setup Guide
            </summary>
            <div className="mt-3 space-y-2 text-[var(--text-secondary)]">
              <p>1. Ensure OpenClaw Gateway is running</p>
              <p>2. Add AgentFlow&apos;s origin to <code className="text-[var(--accent-bright)]">gateway.allowedOrigins</code></p>
              <p>3. Use the gateway token from your OpenClaw config</p>
              <p>4. For local dev: <code className="text-[var(--accent-bright)]">ws://localhost:18789</code></p>
            </div>
          </details>
        </section>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <a href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
        </div>
      </div>
    </div>
  )
}
