export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-3xl text-center">
          <div className="text-[var(--accent-bright)] text-sm font-mono mb-4 tracking-widest">OPEN SOURCE · MIT LICENSE</div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Design AI Agent Teams<br />
            <span className="text-[var(--accent-bright)]">Visually</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            Org chart → OpenClaw config in one click.
            No code. No YAML. Just drag, connect, export.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/dashboard" className="px-8 py-3 bg-[var(--accent-bright)] text-white rounded-lg hover:brightness-110 transition font-medium">
              Dashboard
            </a>
            <a href="/editor/new" className="px-8 py-3 border border-[var(--border)] rounded-lg hover:border-[var(--accent-bright)] hover:text-[var(--accent-bright)] transition font-medium">
              New Organization
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--border)] py-16 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-3">◉</div>
            <h3 className="font-semibold mb-2">Design</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Add agents, set roles, models, prompts. Connect with authority & communication links.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">▣</div>
            <h3 className="font-semibold mb-2">Organize</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Group agents into teams. Task-driven structure based on organizational theory.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Deploy</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Export YAML or apply directly to your OpenClaw Gateway. One click.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 px-8 text-center text-xs text-[var(--text-secondary)]">
        <a href="https://github.com/Frexida/agentflow" className="hover:text-[var(--accent-bright)] transition">
          GitHub
        </a>
        <span className="mx-3">·</span>
        Built for <a href="https://openclaw.ai" className="hover:text-[var(--accent-bright)] transition">OpenClaw</a>
      </footer>
    </main>
  )
}
