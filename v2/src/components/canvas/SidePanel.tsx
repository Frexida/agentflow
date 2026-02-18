'use client'

import { useState } from 'react'
import ChatPanel from '@/components/chat/ChatPanel'
import TimelinePanel from '@/components/canvas/TimelinePanel'

type Tab = 'edit' | 'chat' | 'timeline'

interface SidePanelProps {
  editNodeId: string | null
  onEditClose: () => void
}

export default function SidePanel({ editNodeId, onEditClose }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('edit')
  const [collapsed, setCollapsed] = useState(true)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'edit', label: 'Edit', icon: '✏️' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'timeline', label: 'Timeline', icon: '📋' },
  ]

  const handleTabClick = (tab: Tab) => {
    if (activeTab === tab && !collapsed) {
      setCollapsed(true)
    } else {
      setActiveTab(tab)
      setCollapsed(false)
    }
  }

  // Auto-open edit tab when a node is selected
  if (editNodeId && collapsed) {
    setCollapsed(false)
    setActiveTab('edit')
  }

  return (
    <>
      {/* Tab bar — fixed right side */}
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-40 flex flex-col bg-[var(--surface-elevated)] border-l border-[var(--border)] rounded-l-lg overflow-hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`w-11 h-11 flex items-center justify-center text-base transition ${
              activeTab === tab.id && !collapsed
                ? 'bg-[var(--accent)] text-[var(--accent-bright)]'
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {!collapsed && (
        <div className="fixed top-0 right-11 w-80 h-full bg-[var(--surface-elevated)] border-l border-[var(--border)] z-30 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <button
              onClick={() => setCollapsed(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-lg"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'edit' && (
              <div className="p-4">
                {editNodeId ? (
                  <p className="text-sm text-[var(--text-secondary)]">Editing node: {editNodeId}</p>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">Double-click a node to edit</p>
                )}
              </div>
            )}
            {activeTab === 'chat' && (
              <ChatPanel open={true} onClose={() => setCollapsed(true)} embedded />
            )}
            {activeTab === 'timeline' && (
              <TimelinePanel open={true} onClose={() => setCollapsed(true)} embedded />
            )}
          </div>
        </div>
      )}
    </>
  )
}
