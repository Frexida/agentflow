import Link from 'next/link'

const features = [
  {
    icon: '🎨',
    title: 'Visual Org Designer',
    desc: 'Drag-and-drop agent nodes, draw connections, see your entire AI organization in real time. No YAML editing.',
  },
  {
    icon: '⌘',
    title: 'Power User Ready',
    desc: 'Command palette (Cmd+K), keyboard shortcuts, undo/redo, version history. Built for speed.',
  },
  {
    icon: '🔗',
    title: 'Gateway Integration',
    desc: 'Connect to OpenClaw Gateway directly. Import configs, apply changes, chat with agents — all from the editor.',
  },
  {
    icon: '📤',
    title: 'Multi-Format Export',
    desc: 'Export as OpenClaw YAML, PNG, SVG, or JSON. Ready for deployment or presentations.',
  },
  {
    icon: '🏗️',
    title: 'Task-Driven Design',
    desc: 'Based on Thompson\'s (1967) task interdependence model. Independent, sequential, or reciprocal — the tool guides your structure.',
  },
  {
    icon: '☁️',
    title: 'Cloud + Self-Host',
    desc: 'Sign in to save designs to the cloud, or self-host with SQLite. Your data, your choice.',
  },
]

const stats = [
  { value: '6', label: 'Agent roles' },
  { value: '∞', label: 'Organizations' },
  { value: '<1min', label: 'To first export' },
  { value: 'MIT', label: 'License' },
]

const steps = [
  { num: '01', title: 'Design', desc: 'Add agents, set roles and models. Drag to arrange your hierarchy.' },
  { num: '02', title: 'Connect', desc: 'Draw authority, communication, and review links between agents.' },
  { num: '03', title: 'Configure', desc: 'Set system prompts, personalities, tool profiles for each agent.' },
  { num: '04', title: 'Deploy', desc: 'Export YAML or apply directly to OpenClaw Gateway. Done.' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent-bright)] text-xl font-bold">🔀</span>
            <span className="font-semibold text-[var(--text-primary)]">AgentFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Features</a>
            <a href="#how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">How it works</a>
            <a href="#pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Pricing</a>
            <a href="https://github.com/Frexida/agentflow" target="_blank" rel="noopener" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">GitHub</a>
            <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Sign in</Link>
            <Link href="/dashboard" className="px-4 py-1.5 bg-[var(--accent-bright)] text-white rounded-lg text-sm font-medium hover:brightness-110 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--text-secondary)] mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Open Source · MIT License
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
            Design AI Agent Organizations<br />
            <span className="bg-gradient-to-r from-[var(--accent-bright)] to-[var(--accent-glow)] bg-clip-text text-transparent">
              Visually
            </span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
            The visual organization designer for <a href="https://openclaw.ai" className="text-[var(--accent-bright)] hover:underline">OpenClaw</a>.
            Drag, connect, export — your agent team is live in minutes. Not hours.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/editor/demo" className="px-8 py-3.5 bg-[var(--accent-bright)] text-white rounded-lg hover:brightness-110 transition font-semibold text-lg shadow-lg shadow-[var(--accent-bright)]/20">
              Try the Editor →
            </Link>
            <Link href="/dashboard" className="px-8 py-3.5 border border-[var(--border)] rounded-lg hover:border-[var(--accent-bright)] hover:text-[var(--accent-bright)] transition font-semibold text-lg">
              Dashboard
            </Link>
          </div>

          {/* Editor Preview */}
          <div className="relative max-w-4xl mx-auto rounded-xl border border-[var(--border)] overflow-hidden shadow-2xl shadow-black/50">
            <div className="h-8 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-[var(--text-secondary)] font-mono">agentflow — editor</span>
            </div>
            <div className="bg-[var(--surface)] p-8 min-h-[350px] flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 max-w-lg">
                {/* Mock org chart */}
                <div className="col-span-3 flex justify-center">
                  <div className="px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--accent-bright)] rounded-lg text-center">
                    <div className="text-lg mb-1">👔</div>
                    <div className="text-xs font-medium">CEO</div>
                    <div className="text-[10px] text-[var(--accent-bright)]">coordinator</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-center">
                    <div className="text-lg mb-1">👹</div>
                    <div className="text-xs font-medium">PM</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">coordinator</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-center">
                    <div className="text-lg mb-1">⚙️</div>
                    <div className="text-xs font-medium">Dev</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">worker</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-center">
                    <div className="text-lg mb-1">🔬</div>
                    <div className="text-xs font-medium">Research</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">worker</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8 px-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-[var(--accent-bright)] mb-1">{s.value}</div>
              <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to design agent teams</h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Built by an AI agent team, for AI agent teams. From org chart to production config in one workflow.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent-bright)]/50 transition group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent-bright)] transition">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">From idea to deployment in 4 steps</h2>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="text-4xl font-bold text-[var(--accent-bright)]/20 mb-3">{s.num}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-[var(--text-secondary)]">Start free. Scale when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-6 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl">
              <h3 className="font-semibold mb-1">Free</h3>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li>✓ Unlimited local designs</li>
                <li>✓ All editor features</li>
                <li>✓ YAML/PNG/SVG export</li>
                <li>✓ Self-host option</li>
              </ul>
            </div>
            {/* Pro */}
            <div className="p-6 bg-[var(--surface-elevated)] border-2 border-[var(--accent-bright)] rounded-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--accent-bright)] text-white text-xs rounded-full font-medium">
                Popular
              </div>
              <h3 className="font-semibold mb-1">Pro</h3>
              <div className="text-3xl font-bold mb-4">$19<span className="text-sm font-normal text-[var(--text-secondary)]">/mo</span></div>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li>✓ Everything in Free</li>
                <li>✓ Cloud save</li>
                <li>✓ Version history</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            {/* Team */}
            <div className="p-6 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl">
              <h3 className="font-semibold mb-1">Team</h3>
              <div className="text-3xl font-bold mb-4">$49<span className="text-sm font-normal text-[var(--text-secondary)]">/mo</span></div>
              <ul className="text-sm text-[var(--text-secondary)] space-y-2">
                <li>✓ Everything in Pro</li>
                <li>✓ Real-time collaboration</li>
                <li>✓ Team management</li>
                <li>✓ Shared templates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to design your agent organization?</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join the growing community of AI architects building the future of multi-agent systems.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/editor/demo" className="px-8 py-3.5 bg-[var(--accent-bright)] text-white rounded-lg hover:brightness-110 transition font-semibold shadow-lg shadow-[var(--accent-bright)]/20">
              Try AgentFlow Free →
            </Link>
            <a href="https://github.com/Frexida/agentflow" target="_blank" rel="noopener" className="px-8 py-3.5 border border-[var(--border)] rounded-lg hover:border-[var(--accent-bright)] transition font-semibold flex items-center gap-2">
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[var(--accent-bright)] text-xl font-bold">🔀</span>
              <span className="font-semibold">AgentFlow</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Visual organization designer for AI agent teams. Built for OpenClaw.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/editor/demo" className="hover:text-[var(--accent-bright)] transition">Editor</Link>
              <Link href="/dashboard" className="hover:text-[var(--accent-bright)] transition">Dashboard</Link>
              <a href="#pricing" className="hover:text-[var(--accent-bright)] transition">Pricing</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <a href="https://github.com/Frexida/agentflow" target="_blank" rel="noopener" className="hover:text-[var(--accent-bright)] transition">GitHub</a>
              <a href="https://openclaw.ai" target="_blank" rel="noopener" className="hover:text-[var(--accent-bright)] transition">OpenClaw</a>
              <a href="https://docs.openclaw.ai" target="_blank" rel="noopener" className="hover:text-[var(--accent-bright)] transition">Docs</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <a href="https://dev.to/mtdnot_9442010c0f26a0df93/we-built-a-visual-org-designer-for-ai-agent-teams-heres-what-we-learned-5hh" target="_blank" rel="noopener" className="hover:text-[var(--accent-bright)] transition">Blog</a>
              <a href="https://discord.com/invite/clawd" target="_blank" rel="noopener" className="hover:text-[var(--accent-bright)] transition">Community</a>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
          © {new Date().getFullYear()} Frexida. MIT License.
        </div>
      </footer>
    </main>
  )
}
