'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useGatewayStore } from '@/stores/gateway'

const RETRY_DELAYS = [2000, 5000, 10000] // ms — exponential-ish backoff

/**
 * Auto-connect to Gateway if a running instance exists.
 * Retries on transient failures (502, network errors).
 * Re-attempts when gateway status changes (e.g. reconnected via Settings).
 */
export function useGatewayAutoConnect() {
  const { connected, connect } = useGatewayStore()
  const retryCount = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const attemptConnect = useCallback(async () => {
    if (useGatewayStore.getState().connected) return

    try {
      const res = await fetch('/api/gateway')
      if (!res.ok) {
        scheduleRetry()
        return
      }
      const { gateway } = await res.json()
      if (gateway && (gateway.status === 'started' || gateway.status === 'running')) {
        await connect({ url: gateway.url, token: gateway.token })
        retryCount.current = 0 // reset on success
      }
    } catch {
      scheduleRetry()
    }
  }, [connect])

  function scheduleRetry() {
    if (retryCount.current >= RETRY_DELAYS.length) return // give up after max retries
    const delay = RETRY_DELAYS[retryCount.current] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]
    retryCount.current++
    timerRef.current = setTimeout(() => attemptConnect(), delay)
  }

  // Initial mount attempt
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
