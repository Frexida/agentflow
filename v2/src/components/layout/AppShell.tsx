'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLP = pathname === '/'
  const isEditor = pathname?.startsWith('/editor')

  if (isLP) return <>{children}</>

  // Editor: sidebar overlays, content is full-width
  if (isEditor) {
    return (
      <>
        <Sidebar />
        {children}
      </>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[200px]">
        {children}
      </main>
    </div>
  )
}
