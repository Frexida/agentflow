'use client'

import React from 'react'

interface State {
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { error: null, errorInfo: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, background: '#1a0000', border: '1px solid #e94560', borderRadius: 8, margin: 8 }}>
          <p style={{ color: '#e94560', fontWeight: 'bold', marginBottom: 8 }}>⚠️ Render Error</p>
          <pre style={{ color: '#ff9999', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.message}
          </pre>
          {this.state.errorInfo && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ color: '#888', cursor: 'pointer', fontSize: 12 }}>Stack</summary>
              <pre style={{ color: '#666', fontSize: 10, whiteSpace: 'pre-wrap', marginTop: 4 }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ error: null, errorInfo: null })}
            style={{ marginTop: 8, padding: '4px 12px', background: '#e94560', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
