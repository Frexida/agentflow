export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AgentFlow v2</h1>
        <p className="text-[var(--text-secondary)]">Visual Agent Organization Designer</p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/dashboard" className="px-6 py-3 bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-bright)] transition">
            Dashboard
          </a>
          <a href="/editor/new" className="px-6 py-3 border border-[var(--accent)] rounded-lg hover:border-[var(--accent-bright)] transition">
            New Organization
          </a>
        </div>
      </div>
    </main>
  )
}
