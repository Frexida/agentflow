'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGatewayStore } from '@/stores/gateway'

type GatewayInfo = {
  id: string
  status: string
  region: string
  url: string
  token: string
}

export default function SettingsPage() {
  const { connected, connect, disconnect } = useGatewayStore()
  const [mode, setMode] = useState<'saas' | 'selfhost'>('saas')
  const [url, setUrl] = useState('ws://localhost:18789')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [gateway, setGateway] = useState<GatewayInfo | null>(null)
  const [provisioning, setProvisioning] = useState(false)
  const [gwLoading, setGwLoading] = useState(true)

  // Check existing gateway on mount
  const fetchGateway = useCallback(async () => {
    try {
      const res = await fetch('/api/gateway')
      if (res.ok) {
        const { gateway: gw } = await res.json()
        setGateway(gw)
        // Auto-connect if gateway exists and running
        if (gw && (gw.status === 'started' || gw.status === 'running') && !connected) {
          try {
            await connect({ url: gw.url, token: gw.token })
          } catch { /* ignore auto-connect failures */ }
        }
      }
    } catch { /* not logged in or error */ }
    setGwLoading(false)
  }, [connected, connect])

  useEffect(() => { fetchGateway() }, [fetchGateway])

  // SaaS: Auto-provision gateway
  const handleProvision = async () => {
    setError(null)
    setProvisioning(true)
    try {
      const res = await fetch('/api/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create gateway')
      setGateway(data.gateway)
      // Wait a moment for gateway to boot, then connect
      setTimeout(async () => {
        try {
          await connect({ url: data.gateway.url, token: data.gateway.token })
        } catch (e) {
          setError('Gateway started but connection failed. It may need a few seconds to boot.')
        }
        setProvisioning(false)
      }, 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Provisioning failed')
      setProvisioning(false)
    }
  }

  const handleDestroyGateway = async () => {
    try {
      disconnect()
      await fetch('/api/gateway', { method: 'DELETE' })
      setGateway(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to destroy gateway')
    }
  }

  // Self-host: manual connect
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
        <section aria-labelledby="gateway-heading" className="bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="gateway-heading" className="text-lg font-semibold">Gateway</h2>
            <span className={`px-2 py-0.5 rounded text-xs ${connected ? 'bg-green-600/30 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
              {connected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('saas')}
              className={`px-3 py-1.5 rounded text-xs transition ${mode === 'saas' ? 'bg-[var(--accent-bright)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              ☁️ Cloud (Automatic)
            </button>
            <button
              onClick={() => setMode('selfhost')}
              className={`px-3 py-1.5 rounded text-xs transition ${mode === 'selfhost' ? 'bg-[var(--accent-bright)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              🖥️ Self-Host
            </button>
          </div>

          {mode === 'saas' ? (
            /* SaaS Mode — Automatic Gateway */
            <div className="space-y-4">
              {gwLoading ? (
                <p className="text-sm text-[var(--text-secondary)]">Checking gateway status...</p>
              ) : gateway ? (
                <div className="space-y-3">
                  <div className="bg-[var(--surface)] rounded p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Status</span>
                      <span className={gateway.status === 'started' || gateway.status === 'running' ? 'text-green-400' : 'text-yellow-400'}>
                        {gateway.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Region</span>
                      <span>{gateway.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">URL</span>
                      <span className="font-mono text-xs">{gateway.url}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {connected ? (
                      <button onClick={disconnect} className="px-4 py-2 bg-red-600/50 rounded hover:bg-red-500/50 transition text-sm">
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => connect({ url: gateway.url, token: gateway.token })}
                        className="px-4 py-2 bg-[var(--accent)] rounded hover:bg-[var(--accent-bright)] transition text-sm"
                      >
                        Reconnect
                      </button>
                    )}
                    <button onClick={handleDestroyGateway} className="px-4 py-2 text-red-400 border border-red-600/30 rounded hover:bg-red-900/20 transition text-sm">
                      Destroy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Save your API key below, then start your cloud gateway with one click.
                  </p>
                  <button
                    onClick={handleProvision}
                    disabled={provisioning}
                    className="w-full px-4 py-3 bg-[var(--accent-bright)] rounded hover:bg-[var(--accent-glow)] transition text-sm font-semibold disabled:opacity-50"
                  >
                    {provisioning ? '⏳ Starting Gateway...' : '🚀 Start Cloud Gateway'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Self-Host Mode — Manual Connection */
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
              <div className="flex gap-2">
                {connected ? (
                  <button onClick={disconnect} className="px-4 py-2 bg-red-600/50 rounded hover:bg-red-500/50 transition text-sm">
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
              <details className="text-sm">
                <summary className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                  Setup Guide
                </summary>
                <div className="mt-3 space-y-2 text-[var(--text-secondary)]">
                  <p>1. Ensure OpenClaw Gateway is running</p>
                  <p>2. Add AgentFlow&apos;s origin to <code className="text-[var(--accent-bright)]">gateway.controlUi.allowedOrigins</code></p>
                  <p>3. Use the gateway token from your OpenClaw config</p>
                  <p>4. For local dev: <code className="text-[var(--accent-bright)]">ws://localhost:18789</code></p>
                </div>
              </details>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-400 text-sm bg-red-900/20 rounded px-3 py-2">
              {error}
            </div>
          )}
        </section>

        {/* API Keys */}
        <section className="mt-6 bg-[var(--surface-elevated)] rounded-lg border border-[var(--accent)] p-6">
          <h2 className="text-lg font-semibold mb-1">API Keys</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Your keys are encrypted and stored securely. Used to power your AI agents.
          </p>
          <ApiKeyInput
            label="Anthropic API Key"
            placeholder="sk-ant-api03-..."
            storageKey="agentflow:anthropic-key"
            validatePrefix="sk-ant-"
          />
          <ApiKeyInput
            label="OpenAI API Key"
            placeholder="sk-..."
            storageKey="agentflow:openai-key"
            validatePrefix="sk-"
            optional
          />
          <div className="mt-4 p-3 bg-[var(--surface)] rounded text-xs text-[var(--text-secondary)]">
            <p className="mb-1">💡 <strong>Bring Your Own Key</strong> — use your own API keys for direct billing from the provider.</p>
            <p>Or skip this and use AgentFlow credits (coming soon).</p>
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <a href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
        </div>
      </div>
    </div>
  )
}

function ApiKeyInput({ label, placeholder, storageKey, validatePrefix, optional }: {
  label: string
  placeholder: string
  storageKey: string
  validatePrefix: string
  optional?: boolean
}) {
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const provider = storageKey.includes('anthropic') ? 'anthropic' : 'openai'
  const [keyPrefix, setKeyPrefix] = useState('')

  useEffect(() => {
    // Check cloud first, fallback to localStorage
    fetch('/api/keys').then(r => r.json()).then(({ keys }) => {
      const match = keys?.find((k: { provider: string }) => k.provider === provider)
      if (match) { setHasKey(true); setSaved(true); setKeyPrefix(match.key_prefix) }
      else {
        const local = localStorage.getItem(storageKey)
        if (local) { setHasKey(true); setSaved(true); setKeyPrefix(local.substring(0, 10) + '...') }
      }
    }).catch(() => {
      const local = localStorage.getItem(storageKey)
      if (local) { setHasKey(true); setSaved(true); setKeyPrefix(local.substring(0, 10) + '...') }
    })
  }, [storageKey, provider])

  const handleSave = async () => {
    setError(null)
    if (!value.trim()) {
      if (optional) { handleRemove(); return }
      setError('Key is required'); return
    }
    if (!value.startsWith(validatePrefix)) {
      setError(`Key should start with ${validatePrefix}`); return
    }
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: value }),
      })
      if (res.ok) {
        const { key_prefix: kp } = await res.json()
        setKeyPrefix(kp); setHasKey(true); setSaved(true); setValue('')
        localStorage.removeItem(storageKey) // migrate away from localStorage
      } else {
        // Fallback to localStorage
        localStorage.setItem(storageKey, value)
        setKeyPrefix(value.substring(0, 10) + '...')
        setHasKey(true); setSaved(true); setValue('')
      }
    } catch {
      localStorage.setItem(storageKey, value)
      setKeyPrefix(value.substring(0, 10) + '...')
      setHasKey(true); setSaved(true); setValue('')
    }
  }

  const handleRemove = async () => {
    try { await fetch(`/api/keys?provider=${provider}`, { method: 'DELETE' }) } catch {}
    localStorage.removeItem(storageKey)
    setHasKey(false); setSaved(false); setValue(''); setKeyPrefix('')
  }

  return (
    <div className="mb-4">
      <label className="block text-sm text-[var(--text-secondary)] mb-1">
        {label} {optional && <span className="text-[var(--text-secondary)]/50">(optional)</span>}
      </label>
      {hasKey && saved ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[var(--surface)] border border-green-600/30 rounded px-3 py-2 text-sm text-green-400 flex items-center gap-2">
            <span>✅</span>
            <span>Key saved</span>
            <span className="text-[var(--text-secondary)] text-xs ml-auto font-mono">{keyPrefix || '••••••••'}</span>
          </div>
          <button onClick={handleRemove} className="px-3 py-2 text-xs text-red-400 hover:text-red-300 border border-[var(--border)] rounded">
            Remove
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-[var(--surface)] border border-[var(--accent)] rounded px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-bright)] pr-10"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]"
            >
              {visible ? '🙈' : '👁'}
            </button>
          </div>
          <button onClick={handleSave} className="px-4 py-2 bg-[var(--accent)] rounded hover:bg-[var(--accent-bright)] transition text-sm">
            Save
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
