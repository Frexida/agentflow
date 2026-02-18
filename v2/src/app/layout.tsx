import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/AppShell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'AgentFlow — Visual AI Agent Organization Designer',
  description: 'Design AI agent teams visually. Drag-and-drop org chart editor with OpenClaw config export. Open source.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'AgentFlow — Design AI Agent Organizations Visually',
    description: 'The visual organization designer for OpenClaw. Drag, connect, export — your agent team is live in minutes.',
    images: [{ url: '/logo.png', width: 512, height: 512 }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AgentFlow — Visual AI Agent Organization Designer',
    description: 'Design AI agent teams visually. Open source.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
