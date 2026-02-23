'use client'

import { usePathname } from 'next/navigation'
import { Component, type ReactNode, type ErrorInfo } from 'react'
import Sidebar from './Sidebar'

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error?.message || 'Unknown error' }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RootErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
          <h1 style={{ color: '#e94560', marginBottom: 16 }}>⚠️ Application Error</h1>
          <p style={{ marginBottom: 16, opacity: 0.8 }}>{this.state.error}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload() }}
            style={{ padding: '8px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLP = pathname === '/'
  const isEditor = pathname?.startsWith('/editor')

  if (isLP) return <RootErrorBoundary>{children}</RootErrorBoundary>

  // Editor: sidebar overlays, content is full-width
  if (isEditor) {
    return (
      <RootErrorBoundary>
        <Sidebar />
        {children}
      </RootErrorBoundary>
    )
  }

  return (
    <RootErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-[200px]">
          {children}
        </main>
      </div>
    </RootErrorBoundary>
  )
}
