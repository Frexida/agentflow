'use client'

interface Props {
  open: boolean
  onClose: () => void
  action: string // "save" | "chat" | "connect"
}

const messages: Record<string, { title: string; desc: string }> = {
  save: {
    title: 'Save your design to the cloud',
    desc: 'Sign in to save your organization design and access it from anywhere.',
  },
  chat: {
    title: 'Chat with your agents',
    desc: 'Sign in to connect to your OpenClaw Gateway and chat with agents in real time.',
  },
  connect: {
    title: 'Connect to Gateway',
    desc: 'Sign in to connect AgentFlow to your OpenClaw Gateway for live agent management.',
  },
}

export default function AuthGateModal({ open, onClose, action }: Props) {
  if (!open) return null

  const msg = messages[action] || messages.save

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl w-[400px] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{msg.title}</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{msg.desc}</p>
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--accent-bright)] text-white rounded-lg font-medium hover:brightness-110 transition"
          >
            Sign in with GitHub
          </a>
          <a
            href="/signup"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-bright)] transition"
          >
            Create account
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          Continue without saving
        </button>
      </div>
    </div>
  )
}
