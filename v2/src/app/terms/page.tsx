import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — AgentFlow',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">Last updated: February 19, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">1. About AgentFlow</h2>
            <p>
              AgentFlow (&quot;the Service&quot;) is a visual AI agent organization designer operated by Frexida (&quot;we&quot;, &quot;us&quot;).
              The Service allows you to design multi-agent team structures and export configurations for OpenClaw.
            </p>
            <p className="mt-2">
              This Terms of Service applies to the hosted service at{' '}
              <a href="https://agentflow.frexida.com" className="text-[var(--accent-bright)] hover:underline">agentflow.frexida.com</a>.
              If you self-host AgentFlow using the open source code, only the{' '}
              <a href="https://opensource.org/licenses/MIT" className="text-[var(--accent-bright)] hover:underline" target="_blank" rel="noopener">MIT License</a>{' '}
              applies — not this Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">2. Acceptance</h2>
            <p>
              By accessing or using AgentFlow, you agree to these terms. If you don&apos;t agree, please don&apos;t use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">3. Accounts</h2>
            <p>
              You can use the editor without an account. Signing in (via GitHub) enables cloud save and additional features.
              You&apos;re responsible for your account security. We use Supabase for authentication and don&apos;t store passwords.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">4. Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Local data</strong> stays in your browser (localStorage). We don&apos;t access it.</li>
              <li><strong>Cloud data</strong> (designs saved after sign-in) is stored in Supabase with Row Level Security. Only you can access your designs.</li>
              <li><strong>API keys</strong> you provide (Anthropic, OpenAI) are encrypted at rest (AES-256-GCM) and used solely to run your Cloud Gateway. We never log or share them.</li>
              <li>You can delete your data at any time from Settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">5. Cloud Gateway &amp; API Key Usage</h2>
            <p>
              The Cloud Gateway feature provisions an OpenClaw instance on Fly.io using your API keys.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>You are solely responsible for all costs incurred with your AI provider</strong> (Anthropic, OpenAI, etc.),
                including charges resulting from agent behavior such as excessive API calls, loops, or unintended usage patterns.
              </li>
              <li>
                We strongly recommend setting <strong>usage limits and spending caps</strong> directly with your AI provider
                before using Cloud Gateway.
              </li>
              <li>
                AgentFlow does not monitor, throttle, or guarantee control over the volume of API calls
                made by agents running on your Gateway.
              </li>
              <li>
                We may suspend or terminate Gateway instances that are idle for extended periods or that
                violate these terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">6. Acceptable Use</h2>
            <p>Don&apos;t use AgentFlow to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Abuse, overload, or disrupt the Service or its infrastructure</li>
              <li>Attempt to access other users&apos; data</li>
              <li>Use automated tools to scrape or abuse the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">7. Pricing &amp; Payments</h2>
            <p>
              The editor is free and open source (MIT). Paid plans (Pro, Team) provide additional features like cloud save and collaboration.
              Payments are processed through Stripe. You can cancel anytime — access continues until the end of your billing period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">8. Open Source &amp; Self-Hosting</h2>
            <p>
              AgentFlow&apos;s source code is available under the MIT License at{' '}
              <a href="https://github.com/Frexida/agentflow" className="text-[var(--accent-bright)] hover:underline" target="_blank" rel="noopener">
                github.com/Frexida/agentflow
              </a>.
              Self-hosting is permitted and encouraged. When self-hosted, this Terms of Service does not apply;
              only the MIT License governs your use of the source code.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">9. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranty of any kind. We do not guarantee uptime,
              data preservation, or fitness for any particular purpose.
            </p>
            <p className="mt-2">
              The Service depends on third-party infrastructure (Supabase, Vercel, Fly.io, Stripe) and
              AI providers (Anthropic, OpenAI). We are not responsible for outages, changes, or issues
              caused by these third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Frexida shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the Service,
              including but not limited to costs incurred through third-party AI providers.
            </p>
            <p className="mt-2">
              Nothing in these terms excludes or limits liability that cannot be excluded or limited under
              applicable law, including the Consumer Contract Act of Japan (消費者契約法) where applicable.
              In cases where mandatory consumer protection laws apply, our liability shall be limited to
              the minimum extent permitted by such laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">11. Changes</h2>
            <p>
              We may update these terms. Continued use after changes constitutes acceptance.
              Material changes will be announced via the Service or GitHub.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">12. Governing Law &amp; Jurisdiction</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of Japan.
              Any disputes arising from or relating to these terms or the Service shall be subject to the
              exclusive jurisdiction of the Tokyo District Court (東京地方裁判所) as the court of first instance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">13. Contact</h2>
            <p>
              Questions? Open an issue on{' '}
              <a href="https://github.com/Frexida/agentflow" className="text-[var(--accent-bright)] hover:underline" target="_blank" rel="noopener">
                GitHub
              </a>{' '}
              or reach us on{' '}
              <a href="https://discord.com/invite/clawd" className="text-[var(--accent-bright)] hover:underline" target="_blank" rel="noopener">
                Discord
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
