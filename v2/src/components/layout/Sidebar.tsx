'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGatewayStore } from '@/stores/gateway'

const navItems = [
  { href: '/dashboard', icon: '◫', label: 'Dashboard' },
  { href: '/editor/demo', icon: '◉', label: 'Editor' },
  { href: '/settings', icon: '⚙', label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { connected } = useGatewayStore()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        bg-[#0d0d0d] border-r border-[var(--border)]
        flex flex-col transition-all duration-200
        ${collapsed ? 'w-[52px]' : 'w-[200px]'}
      `}
    >
      {/* Logo */}
      <div className="px-3 py-4 flex items-center gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[var(--accent-bright)] font-bold text-lg hover:opacity-80 transition"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          ◆
        </button>
        {!collapsed && (
          <Link href="/" className="font-semibold text-sm tracking-wide text-[var(--text-primary)] hover:text-[var(--accent-bright)] transition">
            AgentFlow
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 mx-1 rounded-md text-sm transition-all
                ${isActive
                  ? 'bg-[var(--accent)]/30 text-[var(--accent-bright)] border-l-2 border-[var(--accent-bright)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }
              `}
              title={item.label}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Gateway status */}
      <div className={`px-3 py-3 border-t border-[var(--border)] text-xs ${connected ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-600'}`} />
          {!collapsed && (
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          )}
        </div>
      </div>
    </aside>
  )
}
