import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — AgentFlow',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">Last updated: February 19, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account info:</strong> Email and GitHub profile (via OAuth). No passwords stored.</li>
              <li><strong>Designs:</strong> Organization designs you save to the cloud.</li>
              <li><strong>API keys:</strong> Encrypted at rest (AES-256-GCM). Used only to run your Cloud Gateway.</li>
              <li><strong>Usage data:</strong> Basic analytics (page views, feature usage) via Vercel Analytics. No personal tracking.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">What we don&apos;t do</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We don&apos;t sell your data</li>
              <li>We don&apos;t share your data with third parties (except infrastructure: Supabase, Vercel, Fly.io, Stripe)</li>
              <li>We don&apos;t log your API keys or AI conversations</li>
              <li>We don&apos;t use your data to train AI models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Data storage</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Local-only mode:</strong> All data stays in your browser. Nothing sent to our servers.</li>
              <li><strong>Cloud mode:</strong> Data stored in Supabase (PostgreSQL) with Row Level Security.</li>
              <li><strong>Gateway:</strong> Runs on Fly.io in the region you choose. Destroyed when you stop it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Your rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Export all your data at any time</li>
              <li>Delete your account and all associated data</li>
              <li>Self-host the entire application (MIT License)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Cookies</h2>
            <p>
              We use essential cookies for authentication (Supabase session). No tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Contact</h2>
            <p>
              Questions about privacy? Open an issue on{' '}
              <a href="https://github.com/Frexida/agentflow" className="text-[var(--accent-bright)] hover:underline" target="_blank" rel="noopener">
                GitHub
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
