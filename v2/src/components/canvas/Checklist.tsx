'use client'

import { useChecklist } from '@/hooks/useChecklist'

export default function Checklist() {
  const { items, progress, dismissed, complete, dismiss } = useChecklist()

  if (dismissed || items.length === 0) return null

  const allDone = items.every(i => i.done)

  return (
    <div className="fixed bottom-16 right-4 z-50 w-72 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">🚀 Quick Start</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {allDone ? 'All done!' : `${items.filter(i => i.done).length}/${items.length} completed`}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--surface)]">
        <div
          className="h-full bg-[var(--accent-bright)] transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Items */}
      <div className="px-4 py-2 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.done && complete(item.id)}
            className={`w-full text-left flex items-start gap-2 py-1.5 group ${
              item.done ? 'opacity-60' : ''
            }`}
          >
            <span className={`mt-0.5 text-sm ${
              item.done
                ? 'text-green-400'
                : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-bright)]'
            }`}>
              {item.done ? '✓' : '○'}
            </span>
            <div>
              <p className={`text-xs font-medium ${
                item.done
                  ? 'text-[var(--text-secondary)] line-through'
                  : 'text-[var(--text-primary)]'
              }`}>
                {item.label}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] leading-tight">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {allDone && (
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <button
            onClick={dismiss}
            className="w-full py-1.5 bg-[var(--accent-bright)] text-white text-xs font-medium rounded hover:brightness-110"
          >
            Let&apos;s go! 🎉
          </button>
        </div>
      )}
    </div>
  )
}
