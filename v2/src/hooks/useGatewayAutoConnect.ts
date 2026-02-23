'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useGatewayStore } from '@/stores/gateway'

const RETRY_DELAYS = [2000, 5000, 10000]

/**
 * Auto-connect to Gateway via server-side proxy.
 * No URL/token needed — the proxy handles auth.
 */
export function useGatewayAutoConnect() {
  const { connected, connect } = useGatewayStore()
  const retryCount = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const attemptConnect = useCallback(async () => {
    if (useGatewayStore.getState().connected) return

    try {
      // Check if gateway exists and is running
      const res = await fetch('/api/gateway')
      if (!res.ok) { scheduleRetry(); return }
      const { gateway } = await res.json()
      if (!gateway || (gateway.status !== 'started' && gateway.status !== 'running')) return

      await connect()
      retryCount.current = 0
    } catch {
      scheduleRetry()
    }
  }, [connect])

  function scheduleRetry() {
    if (retryCount.current >= RETRY_DELAYS.length) return
    const delay = RETRY_DELAYS[retryCount.current] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]
    retryCount.current++
    timerRef.current = setTimeout(() => attemptConnect(), delay)
  }

  useEffect(() => {
    if (!connected) {
      retryCount.current = 0
      attemptConnect()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [connected, attemptConnect])
}
