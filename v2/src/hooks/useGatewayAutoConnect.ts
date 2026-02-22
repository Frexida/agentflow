'use client'

import { useEffect, useRef } from 'react'
import { useGatewayStore } from '@/stores/gateway'

/**
 * Auto-connect to Gateway if a running instance exists.
 * Used on pages that need Gateway (e.g. Editor) so the connection
 * persists across navigation without requiring Settings page visit.
 */
export function useGatewayAutoConnect() {
  const { connected, connect } = useGatewayStore()
  const attempted = useRef(false)

  useEffect(() => {
    if (connected || attempted.current) return
    attempted.current = true

    async function autoConnect() {
      try {
        const res = await fetch('/api/gateway')
        if (!res.ok) return
        const { gateway } = await res.json()
        if (gateway && (gateway.status === 'started' || gateway.status === 'running')) {
          await connect({ url: gateway.url, token: gateway.token })
        }
      } catch {
        // Not logged in or no gateway — ignore
      }
    }

    autoConnect()
  }, [connected, connect])
}
